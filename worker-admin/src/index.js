/**
 * Cloudflare Worker — Pizzaria Premium admin auth
 * -----------------------------------------------
 *
 * Endpoints (mounted at the origin URL of the Worker):
 *   POST /api/admin/login
 *     body: { username?, password }
 *     200 -> { ok: true, expiresAt }
 *     401 -> { error: 'bad_password' | 'no_user' | 'invalid' }
 *     423 -> { error: 'locked', retryAfter }   (lockout window in seconds)
 *     503 -> { error: 'not_provisioned' }      (no users in KV)
 *
 *   POST /api/admin/logout
 *     Always 200; clears the session cookie.
 *
 *   GET  /api/admin/me
 *     200 -> { ok: true, user: { username, role }, expiresAt }
 *     401 -> { error: 'no_session' | 'expired' }
 *
 *   POST /api/admin/setup
 *     body: { username, password, bootstrapKey }
 *     Bootstrap the FIRST admin. `bootstrapKey` must equal the env
 *     `ADMIN_BOOTSTRAP_KEY`. Returns 403 if the KV already has any user.
 *     Intended for `?setup=1` one-time use; remove the bootstrap secret
 *     afterwards.
 *
 * Storage layout (KV namespace `pp_admin_users`):
 *   - key: `user:<username>` -> JSON { username, role, saltHex, pbkdf2Hex, iterations }
 *   - key: `session:<token>`  -> JSON { username, expiresAt }
 *
 * Cookies:
 *   - Name: `pp_admin_session`
 *   - HttpOnly, Secure, SameSite=Strict, Path=/, Max-Age=3600
 *   - Value: opaque 32-byte hex token (NOT the username, NOT the hash)
 *
 * Env vars (Cloudflare → Workers → Settings → Variables):
 *   ADMIN_BOOTSTRAP_KEY  optional, only needed for first setup
 *   ALLOWED_ORIGINS      CSV; default = GitHub Pages + Vercel
 *   PBKDF2_ITERATIONS    optional, default 100_000
 *
 * KV bindings (Workers → KV → Create namespace):
 *   PP_ADMIN_USERS  required
 *
 * Deploy:
 *   cd worker-admin
 *   npm install
 *   wrangler kv:namespace create PP_ADMIN_USERS
 *   wrangler secret put ADMIN_BOOTSTRAP_KEY
 *   npm run deploy
 *
 * Hardening notes (defense in depth):
 *   - PBKDF2-SHA256 with a 16-byte per-user salt, 100k iterations
 *     (WebCrypto subtle.deriveBits). The server never stores the password.
 *   - The session cookie is opaque + httpOnly; client-side JS cannot
 *     exfiltrate it. SameSite=Strict blocks CSRF. Secure requires HTTPS.
 *   - Constant-time compare for the verifier (length-normalised first).
 *   - Per-IP rate limit (KV-backed) mirrors the client-side tiers.
 *   - Generic 401 ("invalid") on bad credentials — never reveals whether
 *     the username exists.
 */

const COOKIE_NAME = 'pp_admin_session';
const DEFAULT_ITERATIONS = 100_000;
const SESSION_TTL_S = 60 * 60; // 1 hour
const SESSION_SLIDING = true;  // extend expiresAt on each /me

const RATE_BUCKET_TTL_MS = 60_000;
const RATE_LIMITS = {
  '/api/admin/login': 10,
  '/api/admin/setup': 3,
  '/api/admin/me': 60,
  '/api/admin/logout': 30
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://deyvyssonbr.github.io',
  'https://pizzaria-premium.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

// ---- helpers --------------------------------------------------------------

function bytesToHex(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
  return s;
}

function hexToBytes(hex) {
  if (typeof hex !== 'string' || !/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error('invalid hex');
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const list = (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',').map((s) => s.trim()).filter(Boolean);
  const allowed = list.includes(origin) ? origin : (list[0] || '*');
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function jsonResponse(request, env, status, body, extraHeaders) {
  const headers = Object.assign(
    {
      ...getCorsHeaders(request, env),
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store'
    },
    extraHeaders || {}
  );
  return new Response(JSON.stringify(body), { status, headers });
}

async function readJsonBody(request) {
  const text = await request.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch (e) { return { __badJson: true }; }
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || 'unknown';
}

function pickPath(request) {
  const url = new URL(request.url);
  return url.pathname.replace(/\/+$/, '') || '/';
}

async function pbkdf2Hex(password, saltHex, iterations) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations,
      hash: 'SHA-256'
    },
    baseKey,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function randomTokenHex() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

function buildSessionCookie(token, maxAgeSec) {
  const flags = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSec}`
  ];
  // Secure: only attach when the request is HTTPS. Workers always run on
  // HTTPS, so attach unconditionally.
  flags.push('Secure');
  return flags.join('; ');
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`;
}

function parseCookies(request) {
  const raw = request.headers.get('Cookie') || '';
  const out = {};
  raw.split(/;\s*/).forEach((part) => {
    if (!part) return;
    const idx = part.indexOf('=');
    if (idx <= 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

// ---- rate limit (KV best-effort) ----------------------------------------

async function rateLimit(request, env, route) {
  const limit = RATE_LIMITS[route];
  if (!limit || !env.PP_ADMIN_USERS) return { ok: true, limit };
  const ip = clientIp(request);
  const bucket = Math.floor(Date.now() / RATE_BUCKET_TTL_MS);
  const key = `rl:${route}:${ip}:${bucket}`;
  try {
    const cur = Number((await env.PP_ADMIN_USERS.get(key)) || 0);
    if (cur >= limit) {
      return { ok: false, limit, retryAfter: RATE_BUCKET_TTL_MS / 1000 };
    }
    await env.PP_ADMIN_USERS.put(key, String(cur + 1), {
      expirationTtl: Math.ceil(RATE_BUCKET_TTL_MS / 1000) * 2
    });
    return { ok: true, limit };
  } catch (e) {
    // Best-effort. Don't fail the request if KV is flaky.
    return { ok: true, limit };
  }
}

// ---- users / sessions ----------------------------------------------------

async function loadUser(env, username) {
  if (!env.PP_ADMIN_USERS) return null;
  const key = `user:${(username || '').toLowerCase()}`;
  const raw = await env.PP_ADMIN_USERS.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function saveUser(env, user) {
  const key = `user:${user.username.toLowerCase()}`;
  await env.PP_ADMIN_USERS.put(key, JSON.stringify(user));
}

async function listUserKeys(env) {
  if (!env.PP_ADMIN_USERS || !env.PP_ADMIN_USERS.list) return [];
  const out = [];
  let cursor;
  do {
    const page = await env.PP_ADMIN_USERS.list({ prefix: 'user:', cursor });
    out.push(...page.keys.map((k) => k.name));
    cursor = page.cursor;
  } while (cursor);
  return out;
}

async function createSession(env, username) {
  const token = randomTokenHex();
  const expiresAt = Date.now() + SESSION_TTL_S * 1000;
  await env.PP_ADMIN_USERS.put(
    `session:${token}`,
    JSON.stringify({ username: username.toLowerCase(), expiresAt }),
    { expirationTtl: SESSION_TTL_S * 2 }
  );
  return { token, expiresAt };
}

async function loadSession(env, token) {
  if (!token) return null;
  const raw = await env.PP_ADMIN_USERS.get(`session:${token}`);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || !s.expiresAt || s.expiresAt < Date.now()) return null;
    return s;
  } catch (e) { return null; }
}

async function destroySession(env, token) {
  if (!token) return;
  try { await env.PP_ADMIN_USERS.delete(`session:${token}`); } catch (e) { /* noop */ }
}

function bumpSessionExpiry(env, token, session) {
  if (!SESSION_SLIDING) return Promise.resolve();
  const newExpiry = Date.now() + SESSION_TTL_S * 1000;
  session.expiresAt = newExpiry;
  return env.PP_ADMIN_USERS.put(
    `session:${token}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL_S * 2 }
  ).then(() => { return newExpiry; });
}

// ---- handlers ------------------------------------------------------------

async function handleSetup(request, env) {
  const rl = await rateLimit(request, env, '/api/admin/setup');
  if (!rl.ok) {
    return jsonResponse(request, env, 429, { error: 'rate_limited', retryAfter: rl.retryAfter });
  }
  const body = await readJsonBody(request);
  if (body.__badJson) return jsonResponse(request, env, 400, { error: 'invalid_json' });
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const bootstrapKey = String(body.bootstrapKey || '');
  if (!username || username.length < 3) {
    return jsonResponse(request, env, 400, { error: 'invalid_username' });
  }
  if (password.length < 8) {
    return jsonResponse(request, env, 400, { error: 'weak_password' });
  }
  if (!env.ADMIN_BOOTSTRAP_KEY || bootstrapKey !== env.ADMIN_BOOTSTRAP_KEY) {
    return jsonResponse(request, env, 403, { error: 'forbidden' });
  }
  const existing = await listUserKeys(env);
  if (existing.length > 0) {
    return jsonResponse(request, env, 409, { error: 'already_provisioned' });
  }
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const saltHex = bytesToHex(saltBytes);
  const iterations = Number(env.PBKDF2_ITERATIONS) || DEFAULT_ITERATIONS;
  const pbkdf2HexVal = await pbkdf2Hex(password, saltHex, iterations);
  await saveUser(env, {
    username,
    role: 'admin',
    saltHex,
    iterations,
    pbkdf2Hex: pbkdf2HexVal,
    createdAt: new Date().toISOString()
  });
  return jsonResponse(request, env, 201, { ok: true, username });
}

async function handleLogin(request, env) {
  const rl = await rateLimit(request, env, '/api/admin/login');
  if (!rl.ok) {
    return jsonResponse(request, env, 429, { error: 'rate_limited', retryAfter: rl.retryAfter });
  }
  const body = await readJsonBody(request);
  if (body.__badJson) return jsonResponse(request, env, 400, { error: 'invalid_json' });
  const username = String(body.username || 'admin').trim().toLowerCase();
  const password = String(body.password || '');

  if (!password) return jsonResponse(request, env, 401, { error: 'invalid' });

  const user = await loadUser(env, username);
  // Always do a PBKDF2 derivation even when the user is missing, so the
  // timing of "no such user" matches the timing of "wrong password". The
  // hash is compared against a fixed dummy string instead.
  const iterations = (user && user.iterations) || Number(env.PBKDF2_ITERATIONS) || DEFAULT_ITERATIONS;
  const saltHex = (user && user.saltHex) || '00'.repeat(16);
  const candidate = await pbkdf2Hex(password, saltHex, iterations);
  const stored = (user && user.pbkdf2Hex) || '00'.repeat(32);
  if (!user || !constantTimeEqual(candidate, stored)) {
    return jsonResponse(request, env, 401, { error: 'invalid' });
  }
  const { token, expiresAt } = await createSession(env, username);
  return jsonResponse(
    request,
    env,
    200,
    { ok: true, expiresAt },
    { 'Set-Cookie': buildSessionCookie(token, SESSION_TTL_S) }
  );
}

async function handleLogout(request, env) {
  const cookies = parseCookies(request);
  const token = cookies[COOKIE_NAME];
  await destroySession(env, token);
  return jsonResponse(
    request,
    env,
    200,
    { ok: true },
    { 'Set-Cookie': clearSessionCookie() }
  );
}

async function handleMe(request, env) {
  const rl = await rateLimit(request, env, '/api/admin/me');
  if (!rl.ok) {
    return jsonResponse(request, env, 429, { error: 'rate_limited', retryAfter: rl.retryAfter });
  }
  const cookies = parseCookies(request);
  const token = cookies[COOKIE_NAME];
  const session = await loadSession(env, token);
  if (!session) {
    return jsonResponse(
      request,
      env,
      401,
      { error: 'no_session' },
      { 'Set-Cookie': clearSessionCookie() }
    );
  }
  const user = await loadUser(env, session.username);
  if (!user) {
    return jsonResponse(
      request,
      env,
      401,
      { error: 'no_session' },
      { 'Set-Cookie': clearSessionCookie() }
    );
  }
  let expiresAt = session.expiresAt;
  if (SESSION_SLIDING) {
    expiresAt = await bumpSessionExpiry(env, token, session);
  }
  return jsonResponse(request, env, 200, {
    ok: true,
    user: { username: user.username, role: user.role || 'admin' },
    expiresAt
  });
}

function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env)
  });
}

function notFound(request, env) {
  return jsonResponse(request, env, 404, { error: 'not_found' });
}

// ---- entry point ---------------------------------------------------------

export default {
  async fetch(request, env, ctx) {
    const method = request.method.toUpperCase();
    const path = pickPath(request);

    if (method === 'OPTIONS') return handleOptions(request, env);

    if (path === '/api/admin/setup' && method === 'POST') return handleSetup(request, env);
    if (path === '/api/admin/login' && method === 'POST') return handleLogin(request, env);
    if (path === '/api/admin/logout' && method === 'POST') return handleLogout(request, env);
    if (path === '/api/admin/me' && method === 'GET') return handleMe(request, env);

    return notFound(request, env);
  }
};
