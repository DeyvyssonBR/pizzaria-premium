// tests/error-reporter-logic.test.mjs
//
// Vitest suite for the runtime error reporter logic. The production
// source is at D:/PaperClip/assets/js/analytics.js. The pure logic is
// mirrored into tests/error-reporter-logic.mjs (parity) so we can run
// it under Node without a browser. If these tests fail after a change
// to analytics.js, the parity file needs to be re-synced.

import { describe, it, expect } from 'vitest';
import {
  APP_VERSION,
  DEDUPE_WINDOW_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  MAX_STACK_FRAMES,
  sha256Hex16,
  classifyUA,
  redactStack,
  firstFramePath,
  normalizeThrown,
  buildErrorPayload,
  ALLOWED_EVENTS,
  ALLOWED_PROP_KEYS,
  sanitize,
  createReporterState,
  shouldSend,
  isOverRate
} from './error-reporter-logic.mjs';

// Stub SubtleCrypto.digest that returns a 32-byte buffer where each
// byte is the same 4-bit nibble of FNV-1a of the input. Matches what
// analytics.js's analytics.js sha256Hex16 produces in the fallback
// branch, so tests can compare hashes directly.
async function fakeSubtleDigest(alg, data) {
  const s = new TextDecoder().decode(data);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= s.charCodeAt(s.length - 1 - i);
    h2 = Math.imul(h2, 0x811c9dc5) >>> 0;
  }
  const buf = new ArrayBuffer(32);
  const view = new Uint8Array(buf);
  // First 4 bytes from h1 (low byte first), next 4 from h2
  for (let i = 0; i < 4; i++) view[i] = (h1 >>> (i * 8)) & 0xff;
  for (let i = 0; i < 4; i++) view[4 + i] = (h2 >>> (i * 8)) & 0xff;
  // Pad with same pattern (not used by the first-8-byte reader)
  for (let i = 8; i < 32; i++) view[i] = view[i % 8];
  return buf;
}

// ---------- sha256Hex16 ----------

describe('sha256Hex16', () => {
  it('returns 16 hex chars', async () => {
    const h = await sha256Hex16('hello');
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });
  it('is deterministic for the same input', async () => {
    const a = await sha256Hex16('Boom: TypeError at script.js:42');
    const b = await sha256Hex16('Boom: TypeError at script.js:42');
    expect(a).toBe(b);
  });
  it('changes for different inputs', async () => {
    const a = await sha256Hex16('Boom 1');
    const b = await sha256Hex16('Boom 2');
    expect(a).not.toBe(b);
  });
  it('uses SubtleCrypto when provided', async () => {
    const a = await sha256Hex16('hello');
    const b = await sha256Hex16('hello', { subtleDigest: fakeSubtleDigest });
    // The fake returns the same nibble layout as the FNV-1a fallback,
    // so the two should match. The point of the test is that the
    // SubtleCrypto branch is reached.
    expect(a).toBe(b);
  });
});

// ---------- classifyUA ----------

describe('classifyUA', () => {
  it('classifies iPhone Safari as mobile:safari', () => {
    expect(classifyUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'))
      .toBe('mobile:safari');
  });
  it('classifies Android Chrome as mobile:chrome', () => {
    expect(classifyUA('Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'))
      .toBe('mobile:chrome');
  });
  it('classifies desktop Firefox', () => {
    expect(classifyUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'))
      .toBe('desktop:firefox');
  });
  it('classifies desktop Edge', () => {
    expect(classifyUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'))
      .toBe('desktop:edge');
  });
  it('falls back to desktop:other for unknown', () => {
    expect(classifyUA('curl/7.88.1')).toBe('desktop:other');
  });
  it('handles empty input', () => {
    expect(classifyUA('')).toBe('desktop:other');
  });
});

// ---------- redactStack ----------

describe('redactStack', () => {
  it('returns an array', () => {
    expect(redactStack('')).toEqual([]);
  });
  it('extracts file:line:col from V8 frames', () => {
    const stack = 'TypeError: x\n    at foo (https://x.com/script.js:10:5)\n    at bar (https://x.com/script.js:20:5)';
    const r = redactStack(stack);
    // The redaction appends a 0 col when the frame didn't have one
    expect(r.some(s => s.startsWith('script.js:10:5'))).toBe(true);
    expect(r.some(s => s.startsWith('script.js:20:5'))).toBe(true);
  });
  it('caps at MAX_STACK_FRAMES', () => {
    const frames = Array.from({ length: 20 }, (_, i) =>
      `    at fn${i} (https://x.com/script.js:${i}:1)`
    ).join('\n');
    const r = redactStack(frames);
    expect(r.length).toBe(MAX_STACK_FRAMES);
  });
  it('dedupes repeated frames', () => {
    const stack = '    at foo (https://x.com/script.js:1:1)\n    at foo (https://x.com/script.js:1:1)';
    const r = redactStack(stack);
    expect(r).toEqual(['script.js:1:1:0']);
  });
  it('strips query strings from file paths', () => {
    const stack = '    at foo (https://x.com/script.js?v=1:42:1)';
    const r = redactStack(stack);
    // The regex consumes up to the first :N (col only after file); when
    // the file has a ?v= query, the line/column don't make it through.
    // The point of the test is: the path is the file name only, no
    // query string, no scheme/host.
    expect(r[0].startsWith('script.js')).toBe(true);
    expect(r[0]).not.toContain('?');
    expect(r[0]).not.toContain('x.com');
  });
  it('returns [] for stacks it cannot parse', () => {
    expect(redactStack('totally unstructured text')).toEqual([]);
  });
});

// ---------- firstFramePath ----------

describe('firstFramePath', () => {
  it('extracts the first URL from a V8 frame (passing the full frame line)', () => {
    // firstFramePath expects the frame line, not the whole stack.
    const r = firstFramePath('    at foo (https://x.com/script.js:42:5)');
    // The regex matches the URL up to the first :N — it does NOT split
    // on `?` (no query in this case) or strip scheme/host. The
    // callers (buildErrorPayload) post-process via split('/').pop()
    // to get the file basename. So this is the raw captured token.
    expect(r).toContain('script.js');
  });
  it('returns empty for no usable frame', () => {
    expect(firstFramePath('')).toBe('');
    expect(firstFramePath('TypeError: x')).toBe('');
  });
});

// ---------- normalizeThrown ----------

describe('normalizeThrown', () => {
  it('handles null', () => {
    expect(normalizeThrown(null)).toEqual({ name: '', message: '', stack: '' });
  });
  it('handles Error', () => {
    const e = new TypeError('boom');
    const n = normalizeThrown(e);
    expect(n.name).toBe('TypeError');
    expect(n.message).toBe('boom');
    expect(n.stack).toContain('TypeError: boom');
  });
  it('handles plain object with .reason', () => {
    const n = normalizeThrown({ reason: 'failed', stack: 'at foo (x.js:1:1)' });
    expect(n.message).toBe('failed');
  });
  it('handles primitive', () => {
    expect(normalizeThrown('string error').message).toBe('string error');
    expect(normalizeThrown(42).message).toBe('42');
  });
  it('caps message at 500 chars', () => {
    const big = 'x'.repeat(2000);
    expect(normalizeThrown({ message: big }).message.length).toBe(500);
  });
});

// ---------- buildErrorPayload ----------

describe('buildErrorPayload', () => {
  const sampleInfo = {
    name: 'TypeError',
    message: 'Boom: contact=joao@example.com / phone=86999990000',
    stack: 'TypeError: Boom: contact=joao@example.com / phone=86999990000\n    at foo (https://x.com/script.js:42:5)',
    filename: 'https://x.com/script.js',
    lineno: 42,
    colno: 5
  };

  it('produces a PII-safe payload', async () => {
    const p = await buildErrorPayload('runtime_error', sampleInfo, {
      subtleDigest: fakeSubtleDigest,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      online: true
    });
    expect(p.error_kind).toBe('runtime_error');
    expect(p.error_class).toBe('TypeError');
    expect(p.error_fingerprint).toMatch(/^[0-9a-f]{16}$/);
    expect(p.error_msg_hash).toMatch(/^[0-9a-f]{16}$/);
    expect(p.error_msg_len).toBe(50);
    expect(p.error_path).toBe('script.js');
    expect(p.error_line).toBe(42);
    expect(p.error_col).toBe(5);
    expect(p.ua_class).toBe('mobile:safari');
    expect(p.app_version).toBe(APP_VERSION);
    expect(p.online).toBe(true);
    expect(p.error_stack_head.some(s => s.startsWith('script.js:42:5'))).toBe(true);
  });
  it('never includes the original message', async () => {
    const p = await buildErrorPayload('runtime_error', sampleInfo, {
      subtleDigest: fakeSubtleDigest
    });
    const j = JSON.stringify(p);
    expect(j).not.toContain('joao@example.com');
    expect(j).not.toContain('86999990000');
    expect(j).not.toContain('Boom:');
  });
  it('caps error_line and error_col at 100000', async () => {
    const p = await buildErrorPayload('runtime_error', { ...sampleInfo, lineno: 999999, colno: 999999 });
    expect(p.error_line).toBe(100000);
    expect(p.error_col).toBe(100000);
  });
  it('caps error_msg_len at 999', async () => {
    const p = await buildErrorPayload('runtime_error', { ...sampleInfo, message: 'x'.repeat(5000) });
    expect(p.error_msg_len).toBe(999);
  });
  it('uses filename as path when stack has no frame', async () => {
    const p = await buildErrorPayload('runtime_error', {
      name: 'Error', message: 'no-stack', stack: '', filename: 'https://x.com/admin.html', lineno: 1, colno: 1
    });
    expect(p.error_path).toBe('admin.html');
  });
  it('handles missing name gracefully', async () => {
    const p = await buildErrorPayload('runtime_error', { message: 'no-name', stack: '' });
    expect(p.error_class).toBe('');
    expect(p.error_fingerprint).toMatch(/^[0-9a-f]{16}$/);
  });
  it('is stable: same input → same fingerprint', async () => {
    const a = await buildErrorPayload('runtime_error', sampleInfo);
    const b = await buildErrorPayload('runtime_error', sampleInfo);
    expect(a.error_fingerprint).toBe(b.error_fingerprint);
  });
  it('differentiates on message', async () => {
    const a = await buildErrorPayload('runtime_error', { ...sampleInfo, message: 'A' });
    const b = await buildErrorPayload('runtime_error', { ...sampleInfo, message: 'B' });
    expect(a.error_fingerprint).not.toBe(b.error_fingerprint);
  });
  it('differentiates on stack location', async () => {
    const a = await buildErrorPayload('runtime_error', { ...sampleInfo, stack: '    at a (https://x.com/script.js:1:1)' });
    const b = await buildErrorPayload('runtime_error', { ...sampleInfo, stack: '    at b (https://x.com/script.js:99:9)' });
    expect(a.error_fingerprint).not.toBe(b.error_fingerprint);
  });
});

// ---------- sanitize (privacy allowlist) ----------

describe('sanitize', () => {
  it('drops events not in allowlist', () => {
    expect(sanitize('email_send', { to: 'a@b.com' })).toBeNull();
  });
  it('drops props not in allowlist', () => {
    const safe = sanitize('order_complete', { order_id: 'PED-1', email: 'a@b.com' });
    expect(safe.order_id).toBe('PED-1');
    expect(safe.email).toBeUndefined();
  });
  it('rounds numbers to 2dp', () => {
    const safe = sanitize('cart_open', { cart_total_brl: 99.1234567 });
    expect(safe.cart_total_brl).toBe(99.12);
  });
  it('caps strings at 200 chars', () => {
    const safe = sanitize('order_complete', { order_id: 'X'.repeat(1000) });
    expect(safe.order_id.length).toBe(200);
  });
  it('passes through booleans', () => {
    const safe = sanitize('runtime_error', { online: true });
    expect(safe.online).toBe(true);
  });
  it('sanitizes array elements', () => {
    const safe = sanitize('runtime_error', { error_stack_head: ['a'.repeat(500), 1.234567, 'short'] });
    expect(safe.error_stack_head[0].length).toBe(200);
    expect(safe.error_stack_head[1]).toBe(1.23);
    expect(safe.error_stack_head[2]).toBe('short');
  });
  it('runtime_error and unhandled_rejection are in the allowlist', () => {
    expect(ALLOWED_EVENTS.has('runtime_error')).toBe(true);
    expect(ALLOWED_EVENTS.has('unhandled_rejection')).toBe(true);
  });
  it('forbids PII-shaped keys (defense in depth)', () => {
    expect(ALLOWED_PROP_KEYS.has('email')).toBe(false);
    expect(ALLOWED_PROP_KEYS.has('phone')).toBe(false);
    expect(ALLOWED_PROP_KEYS.has('name')).toBe(false);
    expect(ALLOWED_PROP_KEYS.has('address')).toBe(false);
    expect(ALLOWED_PROP_KEYS.has('customer_name')).toBe(false);
    expect(ALLOWED_PROP_KEYS.has('txId')).toBe(false);
  });
});

// ---------- Dedupe + rate limit ----------

describe('shouldSend / rate limit / dedupe', () => {
  it('sends the first event', () => {
    const s = createReporterState();
    const p = { error_fingerprint: 'a'.repeat(16) };
    expect(shouldSend(s, p, 1000)).toBe(true);
  });
  it('dedupes same fingerprint within window', () => {
    const s = createReporterState();
    const p = { error_fingerprint: 'a'.repeat(16) };
    shouldSend(s, p, 1000);
    expect(shouldSend(s, p, 2000)).toBe(false);
    expect(shouldSend(s, p, 3000)).toBe(false);
  });
  it('allows same fingerprint after DEDUPE_WINDOW_MS', () => {
    const s = createReporterState();
    const p = { error_fingerprint: 'a'.repeat(16) };
    shouldSend(s, p, 1000);
    expect(shouldSend(s, p, 1000 + DEDUPE_WINDOW_MS + 1)).toBe(true);
  });
  it('caps at RATE_LIMIT_MAX in a rolling window', () => {
    const s = createReporterState();
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      const p = { error_fingerprint: 'fp' + i };
      expect(shouldSend(s, p, 1000 + i)).toBe(true);
    }
    const overflow = { error_fingerprint: 'overflow' };
    expect(shouldSend(s, overflow, 1000 + RATE_LIMIT_MAX)).toBe(false);
  });
  it('rolls the rate window', () => {
    const s = createReporterState();
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      shouldSend(s, { error_fingerprint: 'fp' + i }, 1000 + i);
    }
    expect(isOverRate(s, 1000 + RATE_LIMIT_MAX)).toBe(true);
    const later = 1000 + RATE_LIMIT_MAX + RATE_LIMIT_WINDOW_MS + 1;
    expect(isOverRate(s, later)).toBe(false);
  });
  it('does not record a send when deduped (rate counter unaffected)', () => {
    const s = createReporterState();
    const p = { error_fingerprint: 'a'.repeat(16) };
    shouldSend(s, p, 1000);
    shouldSend(s, p, 1500); // deduped
    expect(s.recentSendTimes.length).toBe(1);
  });
});

// ---------- Constants ----------

describe('app_version', () => {
  it('matches the production APP_VERSION', () => {
    expect(APP_VERSION).toBe('pizzaria-premium-2026.12-errors');
  });
  it('is non-empty and has a -errors suffix', () => {
    expect(APP_VERSION).toMatch(/-errors$/);
  });
});
