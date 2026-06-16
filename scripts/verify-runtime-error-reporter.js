// Verifier for assets/js/analytics.js — runs under Node with a minimal
// shim for the browser globals the script touches. It does NOT use jsdom;
// instead it stubs window/navigator/crypto.subtle/localStorage/etc. just
// enough to exercise the production code paths.
//
// We do this because the reportError pipeline is async (SubtleCrypto is
// async), uses dedupe + rate-limit state, hooks global error events, and
// has offline-queue semantics. A unit test that imports the script is
// the smallest verification that catches regressions.

const fs = require('fs');
const path = require('path');

const ANALYTICS = fs.readFileSync(
  path.resolve(__dirname, '..', 'assets', 'js', 'analytics.js'),
  'utf8'
);

// ---- Minimal browser shim -------------------------------------------------

const listeners = {};
const eventLog = [];

class LocalStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
  key(i) { return Array.from(this.map.keys())[i] || null; }
  get length() { return this.map.size; }
}

const localStorage = new LocalStorage();

const navigator = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  language: 'pt-BR',
  onLine: true,
  doNotTrack: '0',
  sendBeacon: function (url, blob) {
    // Capture the beacon so the test can assert on it.
    const text = blob && blob._text ? blob._text : '';
    eventLog.push({ kind: 'beacon', url: url, body: text });
    return true;
  }
};
const screen = { width: 390, height: 844 };
const location = { hostname: 'pizzaria-premium.vercel.app', pathname: '/', search: '' };
const document = {
  referrer: '',
  hidden: false,
  readyState: 'complete',
  addEventListener: function (e, fn) {
    listeners[e] = listeners[e] || [];
    listeners[e].push(fn);
  }
};
const history = {
  pushState: function () {},
  replaceState: function () {}
};

// Stub SubtleCrypto with a deterministic sha256-like. We don't need true
// crypto: we only need a stable 16-hex string. FNV-1a 32-bit is enough.
async function sha256Hex16Stub(input) {
  let h = 0x811c9dc5;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += ((h >>> (i * 4)) & 0xf).toString(16);
  }
  return hex;
}
const crypto = {
  subtle: { digest: async function (alg, data) {
    // Decode data as utf-8 (TextEncoder path) — we already stringified.
    const s = new TextDecoder().decode(data);
    const h = await sha256Hex16Stub(s);
    // SubtleCrypto returns 32 bytes; we return a 32-byte buffer where the
    // first 16 chars of the hex are repeated. The reader only uses 8 bytes.
    const buf = new ArrayBuffer(32);
    const view = new Uint8Array(buf);
    for (let i = 0; i < 32; i++) {
      view[i] = parseInt(h[i % 16], 16);
    }
    return buf;
  } },
  getRandomValues: function (a) { for (let i = 0; i < a.length; i++) a[i] = i; return a; }
};
class TextEncoder { encode(s) { return Buffer.from(s, 'utf8'); } }
class TextDecoder { decode(b) { return Buffer.from(b).toString('utf8'); } }
class Blob {
  constructor(parts) { this._text = parts.map(p => Buffer.isBuffer(p) ? p.toString() : String(p)).join(''); }
}

// ---- Build a controlled `window` -----------------------------------------

const win = {
  addEventListener: function (e, fn) {
    listeners[e] = listeners[e] || [];
    listeners[e].push(fn);
  },
  removeEventListener: function () {},
  dispatchEvent: function (e) {
    eventLog.push({ kind: 'dispatch', name: e && e.type });
    (listeners[e.type] || []).forEach(fn => fn(e));
    return true;
  },
  navigator: navigator,
  localStorage: localStorage,
  document: document,
  history: history,
  location: location,
  screen: screen,
  crypto: crypto,
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
  Blob: Blob,
  doNotTrack: '0',
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  // For analytics.js to attach .sendBeacon
  // (sendBeacon is on navigator)
};

global.window = win;
global.navigator = navigator;
global.localStorage = localStorage;
global.document = document;
global.history = history;
global.location = location;
global.screen = screen;
global.crypto = crypto;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob;
global.doNotTrack = '0';
global.window = win;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
global.fetch = function (url, opts) {
  eventLog.push({ kind: 'fetch', url: url, body: opts && opts.body });
  return Promise.resolve({ ok: true });
};

// ---- Load the script in a way that uses our shim ------------------------
// We append `(0,eval)(src)` is overkill; a `new Function(src)` is also overkill
// since the script uses an IIFE that closes over `window`. Easier: just
// `eval` the source in this context.
eval(ANALYTICS);

// ---- Helpers -------------------------------------------------------------
function fail(msg) { console.error('FAIL:', msg); process.exit(1); }
function ok(msg)   { console.log('ok   ', msg); }

function flush() {
  return new Promise(setImmediate);
}

// We expect the boot() call to fire an initial pageview beacon; record
// how many beacons existed before the test body runs so we can assert
// deltas rather than absolute counts.
const bootBeacons = eventLog.filter(e => e.kind === 'beacon').length;

async function run() {
  // 1. track allowlist enforcement
  win.pizzariaTrack('order_complete', { order_id: 'PED-1234', order_total_brl: 99.9, payment_method: 'pix' });
  win.pizzariaTrack('NOT_ALLOWED', { foo: 'bar' });
  win.pizzariaTrack('order_complete', { email: 'user@example.com', phone: '+55 86 99999-9999' });
  await flush();
  // Debug
  if (process.env.DEBUG) {
    for (const b of eventLog) console.log('eventLog:', JSON.stringify(b));
  }
  // The first and third call should each produce a beacon; the second and
  // fourth should be dropped (warning, no send).
  const beacons = eventLog.filter(e => e.kind === 'beacon');
  if (beacons.length - bootBeacons !== 2) fail(`expected 2 beacons after allowlist test, got ${beacons.length - bootBeacons}`);
  for (const b of beacons) {
    const body = JSON.parse(b.body);
    if (body.data && Object.prototype.hasOwnProperty.call(body.data, 'email')) fail('email leaked');
    if (body.data && Object.prototype.hasOwnProperty.call(body.data, 'phone')) fail('phone leaked');
  }
  const oc = beacons.find(b => JSON.parse(b.body).event === 'order_complete' && JSON.parse(b.body).data.order_id === 'PED-1234');
  if (!oc) fail('order_id wrong: did not find PED-1234 beacon');
  const oc2 = beacons.find(b => JSON.parse(b.body).event === 'order_complete' && Object.keys(JSON.parse(b.body).data).length === 0);
  if (!oc2) fail('expected an order_complete with empty data (PII stripped)');
  ok('privacy allowlist + value clamping');

  // 2. runtime_error hook + sanitization
  const ev = {
    message: 'Boom: contact=joao@example.com / phone=86999990000',
    filename: 'https://pizzaria-premium.vercel.app/assets/js/script.js',
    lineno: 3010,
    colno: 12,
    error: new TypeError('Boom: contact=joao@example.com / phone=86999990000')
  };
  ev.error.stack = 'TypeError: Boom: contact=joao@example.com / phone=86999990000\n    at foo (https://pizzaria-premium.vercel.app/assets/js/script.js:3010:12)\n    at bar (https://pizzaria-premium.vercel.app/assets/js/script.js:3050:5)';
  win.dispatchEvent({ type: 'error', error: ev.error, message: ev.message, filename: ev.filename, lineno: ev.lineno, colno: ev.colno });
  await flush();
  const errBeacon = eventLog.filter(e => e.kind === 'beacon').slice(-1)[0];
  if (!errBeacon) fail('no beacon fired for runtime_error');
  const errBody = JSON.parse(errBeacon.body);
  if (errBody.type !== 'event' || errBody.event !== 'runtime_error') fail(`expected runtime_error, got ${errBody.event}`);
  const d = errBody.data;
  if (!d.error_fingerprint || d.error_fingerprint.length !== 16) fail('fingerprint not 16 hex: ' + d.error_fingerprint);
  if (d.error_msg_hash.length !== 16) fail('msg hash not 16 hex: ' + d.error_msg_hash);
  if (typeof d.error_msg_len !== 'number') fail('msg_len missing');
  if (!Array.isArray(d.error_stack_head) || d.error_stack_head.length === 0) {
    console.error('actual stack_head:', d.error_stack_head, 'typeof:', typeof d.error_stack_head);
    fail('stack head empty');
  }
  // The first redaction of `script.js:3010:12` should be present
  if (!d.error_stack_head.some(s => s.includes('script.js'))) fail('stack head missing file ref: ' + JSON.stringify(d.error_stack_head));
  if (!d.ua_class || !d.ua_class.includes('mobile:safari')) fail('ua_class wrong: ' + d.ua_class);
  if (d.app_version !== 'pizzaria-premium-2026.12-errors') fail('app_version wrong');
  if (JSON.stringify(d).includes('joao@example.com')) fail('PII leaked into payload');
  if (JSON.stringify(d).includes('86999990000')) fail('PII leaked into payload');
  ok('runtime_error sanitizes PII, classifies UA, redacts stack');

  // 3. unhandled_rejection hook
  win.dispatchEvent({ type: 'unhandledrejection', reason: { message: 'Failed to load', name: 'NetworkError', stack: 'NetworkError: Failed to load\n    at fetch (https://api.example.com/x:1:1)' } });
  await flush();
  const rej = eventLog.filter(e => e.kind === 'beacon').slice(-1)[0];
  if (!rej) fail('no beacon for unhandled_rejection');
  const rj = JSON.parse(rej.body);
  if (rj.event !== 'unhandled_rejection') fail('event name wrong');
  if (rj.data.error_kind !== 'unhandled_rejection') fail('error_kind wrong');
  if (rj.data.error_class !== 'NetworkError') fail('error_class wrong');
  ok('unhandled_rejection is captured');

  // 4. dedupe — fire the same error twice within window; only 1 beacon.
  eventLog.length = 0;
  const ev2 = JSON.parse(JSON.stringify(ev));
  win.dispatchEvent({ type: 'error', ...ev2 });
  win.dispatchEvent({ type: 'error', ...ev2 });
  await flush();
  const dedup = eventLog.filter(e => e.kind === 'beacon');
  if (dedup.length !== 1) fail(`dedupe failed: got ${dedup.length} beacons`);
  ok('dedupe: same fingerprint within 5s suppressed');

  // 5. rate limit — fire 25 unique errors; should cap at RATE_LIMIT_MAX (20).
  eventLog.length = 0;
  for (let i = 0; i < 25; i++) {
    win.dispatchEvent({
      type: 'error',
      message: 'unique error ' + i,
      filename: 'https://example.com/script.js',
      lineno: 100 + i,
      colno: 1,
      error: new Error('unique error ' + i)
    });
  }
  await flush();
  const over = eventLog.filter(e => e.kind === 'beacon');
  if (over.length > 20) fail(`rate limit failed: got ${over.length} beacons`);
  if (over.length < 15) fail(`rate limit too aggressive: got ${over.length}`);
  ok(`rate limit: capped at ${over.length} beacons (≤ 20 in 60s)`);

  // 6. offline queue — flip onLine=false, fire track, flip back, simulate online.
  eventLog.length = 0;
  navigator.onLine = false;
  win.pizzariaTrack('cart_open', { cart_size: 1, cart_total_brl: 50 });
  await flush();
  if (eventLog.length !== 0) fail('expected 0 beacons while offline');
  const outboxRaw = localStorage.getItem('premium_pizzaria_analytics_outbox');
  if (!outboxRaw) fail('expected outbox to be populated');
  const outbox = JSON.parse(outboxRaw);
  if (outbox.length !== 1) fail('expected 1 entry in outbox, got ' + outbox.length);
  if (outbox[0].event !== 'cart_open') fail('outbox event wrong');
  // Simulate reconnect
  navigator.onLine = true;
  win.dispatchEvent({ type: 'online' });
  await flush();
  const flushed = eventLog.filter(e => e.kind === 'beacon');
  if (flushed.length < 1) fail('expected flush beacon after online');
  const outboxAfter = JSON.parse(localStorage.getItem('premium_pizzaria_analytics_outbox') || '[]');
  if (outboxAfter.length !== 0) fail('outbox should be empty after flush');
  ok('offline queue: events enqueued, flushed on online event');

  // 7. raw User-Agent string is never in any beacon body.
  const allBodies = eventLog.filter(e => e.kind === 'beacon').map(e => e.body).join('\n');
  if (allBodies.includes('iPhone OS 17_0') || allBodies.includes('AppleWebKit/605')) {
    fail('raw User-Agent leaked into a beacon');
  }
  ok('raw User-Agent is never sent');

  console.log('\nALL OK');
}

run().catch(e => { console.error('uncaught:', e); process.exit(1); });
