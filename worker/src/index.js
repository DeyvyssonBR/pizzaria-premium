/**
 * Cloudflare Worker — backend seguro para Pix via Mercado Pago.
 *
 * Endpoints
 *  - POST /api/mp/create-pix
 *      body: { amount: number, external_ref: string, description?: string,
 *              payer?: { first_name?, last_name?, email? } }
 *      200 : { payment_id, status, qr_code, qr_code_base64, expiration_date }
 *      4xx : { error }
 *
 *  - POST /api/mp/webhook
 *      Mercado Pago envia { type|topic, data: { id }, ... }.
 *      Validamos a assinatura `x-signature` (HMAC-SHA256 do manifesto
 *      `id:<id>;request-id:<x-request-id>;ts:<ts>;`) com `MP_WEBHOOK_SECRET`.
 *      Depois buscamos `/v1/payments/{id}` no MP (poll-after-webhook é a
 *      fonte de verdade) e gravamos no KV `MP_TX`.
 *
 *  - GET /api/mp/payment-status?ref=<payment_id|external_ref>
 *      200: { payment_id, status, status_detail, external_ref, amount, updated_at }
 *      404: { error: "not_found" }
 *
 * Variáveis de ambiente (em Cloudflare → Workers → Settings → Variables):
 *   MP_ACCESS_TOKEN     obrigatório
 *   MP_WEBHOOK_SECRET   obrigatório
 *   ALLOWED_ORIGINS     CSV (opcional, default no código)
 *   MP_ENV              "sandbox" para forçar credenciais de teste
 *
 * Bindings:
 *   MP_TX (KV)          obrigatório
 */

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

const DEFAULT_ALLOWED_ORIGINS = [
  'https://deyvyssonbr.github.io',
  'https://pizzaria-premium.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const RATE_BUCKET_TTL_MS = 60_000;
const RATE_LIMITS = {
  '/api/mp/create-pix': 30,   // checkout: ~30 req/min por IP
  '/api/mp/webhook': 200,     // MP pode mandar rajadas
  '/api/mp/payment-status': 120
};

// ---- helpers --------------------------------------------------------------

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const list = (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',').map((s) => s.trim()).filter(Boolean);
  const allowed = list.includes(origin) ? origin : (list[0] || '*');
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
    'Vary': 'Origin'
  };
}

function jsonResponse(request, env, status, body) {
  const headers = {
    ...getCorsHeaders(request, env),
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store'
  };
  return new Response(JSON.stringify(body), { status, headers });
}

function rateLimit(request, env, key) {
  const limit = RATE_LIMITS[key];
  if (!limit || !env.RATE_LIMIT) return { ok: true };
  // KV-based shared rate limit (best-effort, ~10s lag é aceitável)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bucket = `rl:${key}:${ip}`;
  // Não temos helper async-sync; fazemos read + parse manual.
  return env.RATE_LIMIT.get(bucket).then((raw) => {
    const now = Date.now();
    let arr = [];
    try { arr = raw ? JSON.parse(raw) : []; } catch { arr = []; }
    arr = arr.filter((t) => now - t < RATE_BUCKET_TTL_MS);
    if (arr.length >= limit) {
      return { ok: false, retryAfterMs: RATE_BUCKET_TTL_MS - (now - arr[0]) };
    }
    arr.push(now);
    return env.RATE_LIMIT.put(bucket, JSON.stringify(arr), { expirationTtl: 60 })
      .then(() => ({ ok: true, remaining: limit - arr.length }));
  });
}

function badRequest(request, env, message) {
  return jsonResponse(request, env, 400, { error: message });
}

function methodNotAllowed(request, env) {
  return jsonResponse(request, env, 405, { error: 'Method not allowed' });
}

async function readJsonBody(request) {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function brazilianBrl(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLen).trim();
}

function extractSignatureHeader(header) {
  if (!header || typeof header !== 'string') return { ts: null, v1: null };
  const out = { ts: null, v1: null };
  header.split(',').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === 'ts') out.ts = v;
    else if (k === 'v1') out.v1 = v;
  });
  return out;
}

async function verifyMpSignature({ secret, signatureHeader, manifest }) {
  if (!secret) return { ok: false, reason: 'no_secret' };
  if (!signatureHeader) return { ok: false, reason: 'no_signature' };
  const { ts, v1 } = extractSignatureHeader(signatureHeader);
  if (!v1) return { ok: false, reason: 'malformed_signature' };
  if (ts) {
    const tsNum = parseInt(ts, 10);
    if (!Number.isFinite(tsNum)) return { ok: false, reason: 'bad_ts' };
    const drift = Math.abs(Date.now() - tsNum * 1000);
    if (drift > REPLAY_WINDOW_MS) return { ok: false, reason: 'ts_out_of_range' };
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(manifest));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (expected.length !== v1.length) return { ok: false, reason: 'mismatch' };
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return { ok: mismatch === 0, reason: mismatch === 0 ? null : 'mismatch' };
}

async function safeKvGet(env, key) {
  if (!env.MP_TX) return null;
  try {
    const raw = await env.MP_TX.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function safeKvPut(env, key, value, ttlSeconds) {
  if (!env.MP_TX) return false;
  try {
    await env.MP_TX.put(key, JSON.stringify(value), {
      expirationTtl: ttlSeconds || 7 * 24 * 60 * 60
    });
    return true;
  } catch {
    return false;
  }
}

// ---- Mercado Pago calls ---------------------------------------------------

async function mpFetch(env, path, init = {}) {
  if (!env.MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN not configured');
  }
  const base = env.MP_ENV === 'sandbox'
    ? 'https://api.mercadopago.com/sandbox'
    : 'https://api.mercadopago.com';
  const url = base + path;
  const headers = {
    'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'pizzaria-premium-mp-worker/1.0',
    'X-Idempotency-Key': init.idempotencyKey || crypto.randomUUID()
  };
  const res = await fetch(url, {
    method: init.method || 'POST',
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* keep null */ }
  return { ok: res.ok, status: res.status, json, raw: text };
}

// ---- endpoints ------------------------------------------------------------

async function createPix(request, env) {
  if (request.method !== 'POST') return methodNotAllowed(request, env);
  const body = await readJsonBody(request);
  if (body === null) return badRequest(request, env, 'invalid_json');

  const amount = brazilianBrl(body.amount);
  if (amount === null) {
    return badRequest(request, env, 'amount must be a positive number');
  }
  const externalRef = sanitizeText(body.external_ref, 64);
  if (!externalRef) {
    return badRequest(request, env, 'external_ref is required');
  }
  const description = sanitizeText(body.description, 120) || 'Pedido Pizzaria Premium';
  const payer = body.payer && typeof body.payer === 'object' ? body.payer : {};
  const firstName = sanitizeText(payer.first_name, 60) || 'Cliente';
  const lastName = sanitizeText(payer.last_name, 60) || 'Pizzaria Premium';
  const email = sanitizeText(payer.email, 120);

  // Idempotência: se já temos um payment_id pra esse external_ref, devolvemos o mesmo.
  const cacheKey = `ref:${externalRef}`;
  const cached = await safeKvGet(env, cacheKey);
  if (cached && cached.payment_id) {
    return jsonResponse(request, env, 200, {
      payment_id: cached.payment_id,
      status: cached.status || 'pending',
      qr_code: cached.qr_code || null,
      qr_code_base64: cached.qr_code_base64 || null,
      expiration_date: cached.expiration_date || null,
      reused: true
    });
  }

  const idempotencyKey = `pp-${externalRef}`;
  const mpBody = {
    transaction_amount: amount,
    description,
    payment_method_id: 'pix',
    payer: {
      first_name: firstName,
      last_name: lastName,
      ...(email ? { email } : {})
    },
    external_reference: externalRef,
    statement_descriptor: 'PIZZARIA PREMIUM',
    notification_url: `${new URL(request.url).origin}/api/mp/webhook`
  };

  const resp = await mpFetch(env, '/v1/payments', {
    method: 'POST',
    body: mpBody,
    idempotencyKey
  });

  if (!resp.ok) {
    const message = resp.json && (resp.json.message || resp.json.error) || 'mercado_pago_error';
    return jsonResponse(request, env, 502, {
      error: 'mp_create_pix_failed',
      status: resp.status,
      message
    });
  }

  const tx = resp.json.point_of_interaction && resp.json.point_of_interaction.transaction_data;
  const qrCode = tx ? (tx.qr_code || null) : null;
  const qrBase64 = tx ? (tx.qr_code_base64 || null) : null;

  const record = {
    payment_id: resp.json.id,
    status: resp.json.status || 'pending',
    status_detail: resp.json.status_detail || null,
    external_ref: externalRef,
    amount,
    description,
    qr_code: qrCode,
    qr_code_base64: qrBase64,
    expiration_date: tx ? tx.expiration_date || null : null,
    payer_email: email || null,
    created_at: nowIso(),
    updated_at: nowIso()
  };

  await safeKvPut(env, `tx:${resp.json.id}`, record);
  await safeKvPut(env, cacheKey, record);

  return jsonResponse(request, env, 200, {
    payment_id: record.payment_id,
    status: record.status,
    qr_code: qrCode,
    qr_code_base64: qrBase64,
    expiration_date: record.expiration_date
  });
}

async function paymentStatus(request, env) {
  if (request.method !== 'GET') return methodNotAllowed(request, env);
  const url = new URL(request.url);
  const ref = sanitizeText(url.searchParams.get('ref'), 80);
  if (!ref) return badRequest(request, env, 'ref is required');

  // ref pode ser payment_id numérico (ex: 12345678901) ou external_ref.
  let key;
  if (/^\d{6,}$/.test(ref)) key = `tx:${ref}`;
  else key = `ref:${ref}`;

  const record = await safeKvGet(env, key);
  if (!record) {
    return jsonResponse(request, env, 404, { error: 'not_found' });
  }

  // Devolve apenas o que o front precisa (sem payment_method_id completo, sem PII de payer).
  return jsonResponse(request, env, 200, {
    payment_id: record.payment_id,
    status: record.status,
    status_detail: record.status_detail,
    external_ref: record.external_ref,
    amount: record.amount,
    expiration_date: record.expiration_date,
    updated_at: record.updated_at
  });
}

async function webhook(request, env) {
  if (request.method !== 'POST') return methodNotAllowed(request, env);

  // MP pode enviar application/json ou application/x-www-form-urlencoded.
  const ct = request.headers.get('Content-Type') || '';
  let body = {};
  if (ct.includes('application/json')) {
    body = (await readJsonBody(request)) || {};
  } else {
    const text = await request.text();
    const params = new URLSearchParams(text);
    for (const [k, v] of params.entries()) body[k] = v;
    if (body.data && typeof body.data === 'string') {
      try { body.data = JSON.parse(body.data); } catch { /* keep */ }
    }
  }

  const dataId = body.data && body.data.id ? String(body.data.id)
                : body.id ? String(body.id) : '';
  const topic = body.type || body.topic || '';
  const action = body.action || '';
  const isPayment = topic === 'payment' || action.startsWith('payment.');

  const secret = env.MP_WEBHOOK_SECRET || '';
  const signatureHeader = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const tsHeader = extractSignatureHeader(signatureHeader).ts || '';
  const manifest = `id:${dataId};request-id:${requestId};ts:${tsHeader};`;

  const sig = await verifyMpSignature({ secret, signatureHeader, manifest });
  if (!sig.ok) {
    console.warn('[mp-webhook] signature_rejected', { reason: sig.reason, topic, action });
    return jsonResponse(request, env, 401, { error: 'invalid_signature' });
  }

  if (!isPayment || !dataId) {
    // 200 mesmo assim — MP só quer ack. Log mínimo.
    console.log('[mp-webhook] ignored', JSON.stringify({ topic, action, hasDataId: Boolean(dataId) }));
    return jsonResponse(request, env, 200, { received: true, processed: false });
  }

  // Poll-after-webhook: fonte de verdade é a API.
  const lookup = await mpFetch(env, `/v1/payments/${dataId}`, { method: 'GET' });
  if (!lookup.ok) {
    console.error('[mp-webhook] mp_lookup_failed', JSON.stringify({ payment_id: dataId, status: lookup.status, body: lookup.raw }));
    return jsonResponse(request, env, 502, { error: 'mp_lookup_failed' });
  }

  const p = lookup.json;
  const txData = p.point_of_interaction && p.point_of_interaction.transaction_data;
  const record = {
    payment_id: p.id,
    status: p.status,
    status_detail: p.status_detail,
    external_ref: p.external_reference || null,
    amount: p.transaction_amount,
    description: p.description,
    qr_code: txData ? txData.qr_code : null,
    qr_code_base64: txData ? txData.qr_code_base64 : null,
    expiration_date: txData ? txData.expiration_date : null,
    date_approved: p.date_approved,
    updated_at: nowIso()
  };
  await safeKvPut(env, `tx:${record.payment_id}`, record);
  if (record.external_ref) {
    await safeKvPut(env, `ref:${record.external_ref}`, record);
  }

  console.log('[mp-webhook] processed', JSON.stringify({
    payment_id: record.payment_id,
    status: record.status,
    external_ref: record.external_ref
  }));
  return jsonResponse(request, env, 200, { received: true, processed: true });
}

// ---- entry ----------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(request, env) });
    }

    // Rate limit (best-effort; degrada se RATE_LIMIT não estiver bindado)
    const rateKey = RATE_LIMITS[path] ? path : null;
    if (rateKey) {
      const r = await rateLimit(request, env, rateKey);
      if (!r.ok) {
        return new Response(JSON.stringify({ error: 'rate_limited' }), {
          status: 429,
          headers: {
            ...getCorsHeaders(request, env),
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((r.retryAfterMs || 1000) / 1000))
          }
        });
      }
    }

    if (path === '/api/mp/create-pix') return createPix(request, env);
    if (path === '/api/mp/webhook') return webhook(request, env);
    if (path === '/api/mp/payment-status') return paymentStatus(request, env);

    return jsonResponse(request, env, 404, { error: 'not_found' });
  }
};
