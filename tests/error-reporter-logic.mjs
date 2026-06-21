// tests/error-reporter-logic.mjs
//
// Pure logic extracted (parity) from D:/PaperClip/assets/js/analytics.js so it
// can be exercised under Vitest in a Node environment. If these tests fail
// after a change to analytics.js, the parity file needs to be re-synced.
//
// The function bodies are 1:1 with the production code (same control flow,
// same constants, same edge cases). The browser-only dependencies
// (crypto.subtle, navigator) are replaced by injected parameters.

// ---------- Configuration (parity with analytics.js) ----------
export const APP_VERSION = 'pizzaria-premium-2026.12-errors';

// Error-reporter knobs. All in milliseconds.
export const DEDUPE_WINDOW_MS = 5_000;      // same fingerprint within this window = 1 send
export const RATE_LIMIT_MAX = 20;           // max error events in
export const RATE_LIMIT_WINDOW_MS = 60_000; //  this rolling window
export const MAX_STACK_FRAMES = 5;
const MAX_FP_FILE_LEN = 80;

// ---------- Privacy allowlist ----------
// Event names and stringified prop keys are limited to this allowlist.
export const ALLOWED_EVENTS = new Set([
  'page_view',
  'cart_open',
  'cart_step_view',
  'checkout_start',
  'order_complete',
  'runtime_error',
  'unhandled_rejection'
]);

export const ALLOWED_PROP_KEYS = new Set([
  'step',
  'cart_size',
  'cart_total_brl',
  'order_id',
  'order_total_brl',
  'payment_method',
  // Error payload (PII-safe)
  'error_kind',
  'error_class',
  'error_msg_hash',
  'error_msg_len',
  'error_fingerprint',
  'error_path',
  'error_line',
  'error_col',
  'error_stack_head',
  'ua_class',
  'app_version',
  'online'
]);

function isAllowedKey(k) {
  return ALLOWED_PROP_KEYS.has(k);
}

export function sanitize(name, props) {
  if (!ALLOWED_EVENTS.has(name)) {
    return null;
  }
  const safe = {};
  if (props && typeof props === 'object') {
    for (const k of Object.keys(props)) {
      if (!isAllowedKey(k)) {
        continue;
      }
      let v = props[k];
      if (Array.isArray(v)) {
        v = v.map(function (e) {
          if (typeof e === 'string') return e.slice(0, 200);
          if (typeof e === 'number') return Math.round(e * 100) / 100;
          return String(e).slice(0, 200);
        });
      } else if (typeof v === 'string') {
        v = v.slice(0, 200);
      } else if (typeof v === 'number') {
        v = Math.round(v * 100) / 100;
      } else if (typeof v === 'boolean') {
        // keep
      } else {
        v = String(v).slice(0, 200);
      }
      safe[k] = v;
    }
  }
  return safe;
}

// ---------- Crypto helper (sha256Hex16) ----------
// SHA-256 via SubtleCrypto when injected; falls back to a non-crypto
// FNV-1a fingerprint that expands to the same 16-hex-char width.
// The fallback is the default path under Node test (no browser crypto.subtle),
// matching the production catch branch so tests can compare hashes directly.
export async function sha256Hex16(str, opts) {
  opts = opts || {};
  // When a SubtleCrypto-like digest is injected, use it (browser path).
  if (opts.subtleDigest) {
    try {
      const data = new TextEncoder().encode(String(str));
      const buf = await opts.subtleDigest('SHA-256', data);
      const bytes = new Uint8Array(buf);
      let hex = '';
      for (let i = 0; i < 8 && i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    } catch (e) {
      // fall through to FNV-1a
    }
  }
  // FNV-1a fallback (parity with the production catch branch).
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= s.charCodeAt(s.length - 1 - i);
    h2 = Math.imul(h2, 0x811c9dc5) >>> 0;
  }
  let hex = '';
  for (let i = 0; i < 4; i++) hex += ((h1 >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
  for (let i = 0; i < 4; i++) hex += ((h2 >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
  return hex;
}

// ---------- UA classifier ----------
export function classifyUA(ua) {
  const s = String(ua || '');
  let device = 'desktop';
  if (/iPad|Tablet/.test(s)) device = 'tablet';
  else if (/Mobi|Android.*Mobile|iPhone|iPod/.test(s)) device = 'mobile';

  let browser = 'other';
  if (/Edg\//.test(s)) browser = 'edge';
  else if (/OPR\//.test(s) || /Opera/.test(s)) browser = 'opera';
  else if (/Firefox\//.test(s)) browser = 'firefox';
  else if (/Chrome\//.test(s) && !/Chromium\//.test(s)) browser = 'chrome';
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = 'safari';
  else if (/SamsungBrowser\//.test(s)) browser = 'samsung';

  return device + ':' + browser;
}

// ---------- Stack redactor ----------
export function redactStack(stack, maxFrames) {
  if (maxFrames === undefined) maxFrames = MAX_STACK_FRAMES;
  if (!stack) return [];
  const lines = String(stack).split(/\r?\n/).slice(0, maxFrames * 2);
  const out = [];
  const seen = new Set();
  for (const line of lines) {
    const m = line.match(/(?:at\s+.*?\s+\()?(?:(https?:[^\s)]+)|([^)\s]+))(?::(\d+))(?::(\d+))?\)?/);
    if (!m) continue;
    const file = m[1] || m[2] || '';
    const ln = m[3] || '0';
    const col = m[4] || '0';
    if (!file) continue;
    const last = file.split('/').pop().split('?')[0].slice(0, MAX_FP_FILE_LEN);
    const tok = last + ':' + ln + ':' + col;
    if (seen.has(tok)) continue;
    seen.add(tok);
    out.push(tok);
    if (out.length >= maxFrames) break;
  }
  return out;
}

// ---------- First frame path ----------
export function firstFramePath(stack) {
  if (!stack) return '';
  const head = String(stack).split(/\r?\n/)[0] || '';
  const m = head.match(/(https?:[^\s)]+|[^)\s]+)(?::\d+)(?::\d+)?/);
  if (!m) return '';
  return m[1].split('?')[0];
}

// ---------- Normalize thrown value ----------
export function normalizeThrown(thrown) {
  if (!thrown) return { name: '', message: '', stack: '' };
  if (thrown instanceof Error) {
    return {
      name: String(thrown.name || 'Error').slice(0, 60),
      message: String(thrown.message || '').slice(0, 500),
      stack: String(thrown.stack || '')
    };
  }
  if (typeof thrown === 'object') {
    return {
      name: String(thrown.name || 'Object').slice(0, 60),
      message: String(thrown.message || thrown.reason || '').slice(0, 500),
      stack: String(thrown.stack || '')
    };
  }
  return {
    name: 'Value',
    message: String(thrown).slice(0, 500),
    stack: ''
  };
}

// ---------- Build error payload ----------
export async function buildErrorPayload(kind, info, opts) {
  opts = opts || {};
  const name = info.name;
  const message = info.message;
  const stack = info.stack;
  const filename = info.filename;
  const lineno = info.lineno;
  const colno = info.colno;

  const trimmedMsg = String(message || '').trim();
  const headPath = firstFramePath(stack) || filename || '';
  const headFile = headPath ? headPath.split('/').pop().split('?')[0].slice(0, MAX_FP_FILE_LEN) : '';
  const fpSource = (name || 'Error') + '|' + trimmedMsg + '|' + headFile;
  const shaOpts = opts.subtleDigest ? { subtleDigest: opts.subtleDigest } : {};
  const fpPromise = sha256Hex16(fpSource, shaOpts);
  const msgHashPromise = sha256Hex16(trimmedMsg, shaOpts);
  const fp = await fpPromise;
  const msgHash = await msgHashPromise;

  return {
    error_kind: kind,
    error_class: name || '',
    error_msg_hash: msgHash,
    error_msg_len: Math.min(999, trimmedMsg.length),
    error_fingerprint: fp,
    error_path: headFile,
    error_line: Math.min(100000, Number(lineno) || 0),
    error_col: Math.min(100000, Number(colno) || 0),
    error_stack_head: redactStack(stack, MAX_STACK_FRAMES),
    ua_class: classifyUA(opts.userAgent),
    app_version: APP_VERSION,
    online: !!opts.online
  };
}

// ---------- Reporter state (dedupe + rate limit) ----------
export function createReporterState() {
  return {
    recentFingerprints: {},
    recentSendTimes: []
  };
}

function pruneFingerprints(state, now) {
  for (const k of Object.keys(state.recentFingerprints)) {
    if (now - state.recentFingerprints[k] > DEDUPE_WINDOW_MS) {
      delete state.recentFingerprints[k];
    }
  }
}

function pruneSendTimes(state, now) {
  while (state.recentSendTimes.length && now - state.recentSendTimes[0] > RATE_LIMIT_WINDOW_MS) {
    state.recentSendTimes.shift();
  }
}

export function isOverRate(state, now) {
  pruneSendTimes(state, now);
  return state.recentSendTimes.length >= RATE_LIMIT_MAX;
}

export function shouldSend(state, payload, now) {
  const fp = payload && payload.error_fingerprint;
  // Dedupe check
  pruneFingerprints(state, now);
  if (fp && state.recentFingerprints[fp] != null &&
      now - state.recentFingerprints[fp] < DEDUPE_WINDOW_MS) {
    return false; // deduped — rate counter NOT affected
  }
  // Rate limit check
  pruneSendTimes(state, now);
  if (state.recentSendTimes.length >= RATE_LIMIT_MAX) {
    return false; // over rate
  }
  // Record
  if (fp) state.recentFingerprints[fp] = now;
  state.recentSendTimes.push(now);
  return true;
}
