// Comprehensive integration test for the MP Worker
// Stub global.fetch and the KV binding, then exercise every endpoint + edge case.

const m = require('D:/PaperClip/worker/dist-test.cjs');
const handler = m.default || m;

const stubFetch = async (url, init) => {
  const make = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body)
  });
  // Use 7-digit payment_id so the worker's "numeric 6+ → tx:<ref>" path is exercised.
  const PAYMENT_ID = 1234567;
  if (url.includes('/v1/payments/')) {
    return make(200, {
      id: PAYMENT_ID, status: 'approved', status_detail: 'accredited',
      external_reference: 'test-1', transaction_amount: 1.00,
      point_of_interaction: { transaction_data: { qr_code: 'abc', qr_code_base64: 'BASE64' } }
    });
  }
  if (url.includes('/v1/payments') && init.method === 'POST') {
    return make(201, {
      id: PAYMENT_ID, status: 'pending',
      point_of_interaction: { transaction_data: { qr_code: 'qr-code', qr_code_base64: 'png-base64' } }
    });
  }
  return make(404, { error: 'not found' });
};
global.fetch = stubFetch;

const stored = new Map();
const env = {
  MP_ACCESS_TOKEN: 'TEST',
  MP_WEBHOOK_SECRET: 'TEST-SECRET',
  ALLOWED_ORIGINS: 'https://example.com',
  MP_TX: {
    async get(k) { return stored.get(k) || null; },
    async put(k, v) { stored.set(k, v); return null; }
  }
};

function req(method, path, body, headers) {
  return new Request('https://worker.example.com' + path, {
    method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    body: body ? JSON.stringify(body) : undefined
  });
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? '✅' : '❌') + ' ' + name + (detail ? ' — ' + detail : ''));
}

(async () => {
  // 1. create-pix
  const r1 = await handler.fetch(req('POST', '/api/mp/create-pix', { amount: 1.50, external_ref: 'test-1', description: 'Pizza' }, { Origin: 'https://example.com' }), env);
  const d1 = await r1.json();
  check('create-pix returns 200 + qr_code + base64', r1.status === 200 && d1.qr_code === 'qr-code' && d1.qr_code_base64 === 'png-base64' && d1.payment_id === 1234567, 'status=' + r1.status);

  // 2. idempotency
  const r2 = await handler.fetch(req('POST', '/api/mp/create-pix', { amount: 1.50, external_ref: 'test-1' }, { Origin: 'https://example.com' }), env);
  const d2 = await r2.json();
  check('idempotency by external_ref returns same payment_id with reused=true', d2.reused === true && d2.payment_id === 1234567, 'reused=' + d2.reused);

  // 3. status by payment_id (worker's heuristic: numeric refs of 6+ digits → tx:<ref>)
  const r3 = await handler.fetch(req('GET', '/api/mp/payment-status?ref=1234567'), env);
  const d3 = await r3.json();
  check('payment-status by payment_id returns cached record', r3.status === 200 && d3.payment_id === 1234567 && d3.external_ref === 'test-1', 'status=' + r3.status + ' ref=' + d3.external_ref);

  // 4. status by external_ref
  const r9 = await handler.fetch(req('GET', '/api/mp/payment-status?ref=test-1'), env);
  const d9 = await r9.json();
  check('payment-status by external_ref returns same record', r9.status === 200 && d9.payment_id === 1234567);

  // 5. unknown ref
  const r10 = await handler.fetch(req('GET', '/api/mp/payment-status?ref=00000000'), env);
  check('payment-status unknown ref returns 404', r10.status === 404, 'status=' + r10.status);

  // 5b. short numeric ref falls back to external_ref lookup (5 digits → "ref:<ref>")
  const r10b = await handler.fetch(req('GET', '/api/mp/payment-status?ref=12345'), env);
  check('payment-status short numeric ref tries ref:<ref> lookup (404 here)', r10b.status === 404, 'status=' + r10b.status);

  // 6. bad amount
  const r6 = await handler.fetch(req('POST', '/api/mp/create-pix', { amount: 0, external_ref: 'x' }), env);
  const d6 = await r6.json();
  check('create-pix with amount=0 returns 400', r6.status === 400 && /amount/.test(d6.error || ''), 'err=' + d6.error);

  // 7. bad ref
  const r7 = await handler.fetch(req('POST', '/api/mp/create-pix', { amount: 1, external_ref: '' }), env);
  const d7 = await r7.json();
  check('create-pix with empty ref returns 400', r7.status === 400 && /external_ref/.test(d7.error || ''));

  // 8. bad JSON
  const r8 = await handler.fetch(new Request('https://w/api/mp/create-pix', { method: 'POST', body: '{not json}', headers: { 'Content-Type': 'application/json' } }), env);
  const d8 = await r8.json();
  check('create-pix with bad JSON returns 400', r8.status === 400 && /invalid_json/.test(d8.error || ''));

  // 9. webhook with valid signature
  const crypto = require('crypto');
  const ts = Math.floor(Date.now() / 1000);
  const manifest = 'id:1234567;request-id:req-1;ts:' + ts + ';';
  const sig = crypto.createHmac('sha256', 'TEST-SECRET').update(manifest).digest('hex');
  const r4 = await handler.fetch(req('POST', '/api/mp/webhook', { type: 'payment', data: { id: '1234567' } }, {
    'x-signature': 'ts=' + ts + ',v1=' + sig,
    'x-request-id': 'req-1'
  }), env);
  check('webhook with valid sig returns 200', r4.status === 200, 'status=' + r4.status);

  // 10. status after webhook — webhook stored tx:1234567 and ref:test-1; look up by external_ref
  const r5 = await handler.fetch(req('GET', '/api/mp/payment-status?ref=test-1'), env);
  const d5 = await r5.json();
  check('status after webhook reflects approved', r5.status === 200 && d5.status === 'approved', 'status=' + d5.status);

  // 11. webhook with no signature
  const rNoSig = await handler.fetch(req('POST', '/api/mp/webhook', { type: 'payment', data: { id: '1234567' } }), env);
  check('webhook with no signature returns 401', rNoSig.status === 401, 'status=' + rNoSig.status);

  // 12. webhook with bad signature
  const rBadSig = await handler.fetch(req('POST', '/api/mp/webhook', { type: 'payment', data: { id: '1234567' } }, {
    'x-signature': 'ts=' + ts + ',v1=deadbeef',
    'x-request-id': 'req-1'
  }), env);
  check('webhook with bad signature returns 401', rBadSig.status === 401);

  // 13. webhook with no MP_WEBHOOK_SECRET configured
  const envNoSecret = Object.assign({}, env, { MP_WEBHOOK_SECRET: '' });
  const rNoSec = await handler.fetch(req('POST', '/api/mp/webhook', { type: 'payment', data: { id: '1234567' } }, {
    'x-signature': 'ts=' + ts + ',v1=' + sig,
    'x-request-id': 'req-1'
  }), envNoSecret);
  check('webhook with no secret configured returns 401', rNoSec.status === 401);

  // 14. webhook with non-payment topic (still needs valid sig)
  const manifest2 = 'id:;request-id:req-3;ts:' + ts + ';';
  const sig2 = crypto.createHmac('sha256', 'TEST-SECRET').update(manifest2).digest('hex');
  const r11 = await handler.fetch(req('POST', '/api/mp/webhook', { type: 'test' }, {
    'x-signature': 'ts=' + ts + ',v1=' + sig2,
    'x-request-id': 'req-3'
  }), env);
  check('webhook with non-payment topic + valid sig returns 200', r11.status === 200);

  // 15. CORS preflight
  const rPre = await handler.fetch(req('OPTIONS', '/api/mp/create-pix', null, { Origin: 'https://example.com' }), env);
  check('CORS preflight returns 204', rPre.status === 204);

  // 16. unknown path
  const rUnk = await handler.fetch(req('GET', '/unknown'), env);
  check('unknown path returns 404', rUnk.status === 404);

  // 17. CORS rejected origin
  const rCors = await handler.fetch(req('POST', '/api/mp/create-pix', { amount: 1, external_ref: 'cors-test' }, { Origin: 'https://evil.com' }), env);
  const corsHeader = rCors.headers.get('Access-Control-Allow-Origin');
  check('CORS rejected origin returns ACAO="null" (not first allowed)', corsHeader === 'null', 'got=' + corsHeader);

  // 17b. CORS preflight for rejected origin also returns ACAO="null"
  const rCorsPreflight = await handler.fetch(req('OPTIONS', '/api/mp/create-pix', null, { Origin: 'https://evil.com' }), env);
  const corsPreflightHeader = rCorsPreflight.headers.get('Access-Control-Allow-Origin');
  check('CORS preflight for rejected origin returns ACAO="null"', corsPreflightHeader === 'null', 'got=' + corsPreflightHeader);

  // 18. method not allowed
  const rGet = await handler.fetch(req('GET', '/api/mp/create-pix'), env);
  check('GET on /api/mp/create-pix returns 405', rGet.status === 405);

  // 19. POST on /api/mp/payment-status returns 405
  const rPost = await handler.fetch(req('POST', '/api/mp/payment-status'), env);
  check('POST on /api/mp/payment-status returns 405', rPost.status === 405);

  // 20. payment-status without ref
  const rNoRef = await handler.fetch(req('GET', '/api/mp/payment-status'), env);
  check('payment-status without ref returns 400', rNoRef.status === 400);

  // Summary
  const passed = results.filter(r => r.ok).length;
  const total = results.length;
  console.log('\n' + (passed === total ? '✅' : '❌') + ' ' + passed + '/' + total + ' checks passed');
  process.exit(passed === total ? 0 : 1);
})().catch(e => { console.error('test err', e); process.exit(1); });
