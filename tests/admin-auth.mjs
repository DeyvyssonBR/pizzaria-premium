// tests/admin-auth.mjs
//
// Pure logic extracted (parity) from the inline <script> in
// D:/PaperClip/admin.html (admin auth: pepper/verifier, rate-limit lockout,
// inactivity timeout). Exercised under Vitest with an injected storage
// adapter and crypto fallback so there is no DOM dependency.

// ---------- Constants (parity with admin.html) ----------
export const ADMIN_PEPPER_KEY = 'pp_admin_pepper';
export const ADMIN_VERIFIER_KEY = 'pp_admin_verifier';
export const ADMIN_MIGRATION_KEY = 'pp_admin_migrated_from_legacy';
export const ADMIN_SESSION_FLAG = 'admin_logged';
export const ADMIN_LOGIN_ATTEMPTS_KEY = 'pp_admin_login_attempts';
const ADMIN_ACTIVITY_KEY = 'admin_session_started';
const ADMIN_AUTH_VERSION = 'v16';

export const PEPPER_LEN = 32; // PP_ADMIN_PEPPER_BYTES

export const RATE_FAIL_THRESHOLD_LV1 = 5;
export const RATE_FAIL_THRESHOLD_LV2 = 10;
export const RATE_FAIL_THRESHOLD_LV3 = 15;

export const RATE_LOCKOUT_LV1_MS = 60 * 1000;
export const RATE_LOCKOUT_LV2_MS = 5 * 60 * 1000;
export const RATE_LOCKOUT_LV3_MS = 30 * 60 * 1000;

export const RATE_WINDOW_MS = 60 * 1000;

export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

const LOCKOUT_TIERS = [
  { fails: RATE_FAIL_THRESHOLD_LV1, ms: RATE_LOCKOUT_LV1_MS },
  { fails: RATE_FAIL_THRESHOLD_LV2, ms: RATE_LOCKOUT_LV2_MS },
  { fails: RATE_FAIL_THRESHOLD_LV3, ms: RATE_LOCKOUT_LV3_MS }
];

const LEGACY_PASSWORDS = new Set(['admin', 'admin123']);

// ---------- Storage adapter ----------
// In production the code reads/writes localStorage / sessionStorage.
// In tests we accept a Map-like object so the suite has no DOM dependency.
export function makeStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _map: map
  };
}

export function makeSessionStorage(initial) {
  return makeStorage(initial);
}

// ---------- Crypto helpers ----------
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', enc);
    return bytesToHex(digest);
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(Buffer.from(enc)).digest('hex');
}

function genPepper(bytes, rng) {
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) arr[i] = Math.floor(rng() * 256);
  return bytesToHex(arr);
}

// ---------- Constant-time comparison ----------
export function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- First-run detection ----------
export function isFirstRun(ls) {
  return !ls.getItem(ADMIN_PEPPER_KEY) || !ls.getItem(ADMIN_VERIFIER_KEY);
}

// ---------- Attempt / lockout state ----------
function loadAttempts(ss) {
  const raw = ss.getItem(ADMIN_LOGIN_ATTEMPTS_KEY);
  if (!raw) return { fails: 0, lockedUntil: null, lastFailAt: null };
  try {
    const p = JSON.parse(raw);
    return {
      fails: Number(p.fails) || 0,
      lockedUntil: p.lockedUntil ? Number(p.lockedUntil) : null,
      lastFailAt: p.lastFailAt ? Number(p.lastFailAt) : null
    };
  } catch (e) {
    return { fails: 0, lockedUntil: null, lastFailAt: null };
  }
}

function saveAttempts(ss, state) {
  ss.setItem(ADMIN_LOGIN_ATTEMPTS_KEY, JSON.stringify(state));
}

export function clearAttempts(ss) {
  ss.removeItem(ADMIN_LOGIN_ATTEMPTS_KEY);
}

export function getLockoutState(ss, now) {
  const s = loadAttempts(ss);
  if (s.lockedUntil && s.lockedUntil > now) {
    return { locked: true, until: s.lockedUntil, fails: s.fails };
  }
  return { locked: false, until: null, fails: s.fails };
}

function bumpFailure(ss, now) {
  const s = loadAttempts(ss);
  s.fails = (s.fails || 0) + 1;
  s.lastFailAt = now;
  let lockMs = 0;
  for (const t of LOCKOUT_TIERS) {
    if (s.fails >= t.fails) lockMs = t.ms;
  }
  s.lockedUntil = lockMs > 0 ? now + lockMs : null;
  saveAttempts(ss, s);
  return s;
}

// ---------- Setup password ----------
export async function setupAdminPassword(ls, password, opts) {
  opts = opts || {};
  if (typeof password !== 'string' || password.length < 4) {
    throw new Error('Senha precisa ter pelo menos 4 caracteres.');
  }
  const rng = opts.rng || Math.random;
  const pepper = genPepper(PEPPER_LEN, rng);
  const verifier = await sha256Hex(pepper + ':' + password);
  ls.setItem(ADMIN_PEPPER_KEY, pepper);
  ls.setItem(ADMIN_VERIFIER_KEY, verifier);
  return { pepper, verifier };
}

// ---------- Login ----------
export async function tryAdminLogin(ls, ss, password, opts) {
  opts = opts || {};
  const now = typeof opts.now === 'function' ? opts.now() : Date.now();

  if (isFirstRun(ls)) return { ok: false, reason: 'no_setup' };
  const pepper = ls.getItem(ADMIN_PEPPER_KEY);
  const stored = ls.getItem(ADMIN_VERIFIER_KEY);
  if (!pepper || !stored) return { ok: false, reason: 'no_setup' };

  const lock = getLockoutState(ss, now);
  if (lock.locked) {
    bumpFailure(ss, now);
    return { ok: false, reason: 'locked', until: lock.until };
  }

  const attempt = await sha256Hex(pepper + ':' + (password || ''));
  if (constantTimeEqual(attempt, stored)) {
    ss.setItem(ADMIN_SESSION_FLAG, 'true');
    ss.setItem(ADMIN_ACTIVITY_KEY, String(now));
    clearAttempts(ss);
    return { ok: true, sessionStartedAt: now };
  }

  bumpFailure(ss, now);
  return { ok: false, reason: 'bad_password' };
}

// ---------- Legacy migration ----------
export async function migrateLegacyIfNeeded(ls, ss, password, opts) {
  opts = opts || {};
  if (!LEGACY_PASSWORDS.has(password)) return { migrated: false };
  if (!isFirstRun(ls)) return { migrated: false };

  const now = typeof opts.now === 'function' ? opts.now() : Date.now();
  const rng = opts.rng || Math.random;
  const pepper = genPepper(PEPPER_LEN, rng);
  const verifier = await sha256Hex(pepper + ':' + password);
  ls.setItem(ADMIN_PEPPER_KEY, pepper);
  ls.setItem(ADMIN_VERIFIER_KEY, verifier);
  ls.setItem(ADMIN_MIGRATION_KEY, JSON.stringify({
    migratedAt: now,
    from: 'admin_legacy_placeholder',
    version: ADMIN_AUTH_VERSION
  }));
  return { migrated: true };
}

// ---------- Reset ----------
export function resetAdminAuth(ls) {
  ls.removeItem(ADMIN_PEPPER_KEY);
  ls.removeItem(ADMIN_VERIFIER_KEY);
  ls.removeItem(ADMIN_MIGRATION_KEY);
}

// ---------- Logout ----------
export function adminLogout(ss) {
  ss.removeItem(ADMIN_SESSION_FLAG);
  ss.removeItem(ADMIN_ACTIVITY_KEY);
  ss.removeItem(ADMIN_LOGIN_ATTEMPTS_KEY);
}

// ---------- Session activity ----------
export function isSessionActive(ss, now, lastActivityAt) {
  if (ss.getItem(ADMIN_SESSION_FLAG) !== 'true') return false;
  if (lastActivityAt == null) return false;
  if (now - lastActivityAt >= INACTIVITY_TIMEOUT_MS) return false;
  return true;
}

export function touchActivity(ss, now) {
  ss.setItem(ADMIN_ACTIVITY_KEY, String(now));
}
