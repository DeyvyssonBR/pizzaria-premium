/**
 * Webhook para notificações IPN do Mercado Pago.
 *
 * Recebe notificações de pagamento do MP e registra.
 * O fluxo primário de confirmação é via redirect (payment_status URL param).
 * Este webhook é complementar — armazena status em KV quando disponível.
 *
 * Configuração no painel do Mercado Pago (Developers → Webhooks):
 *   URL: https://pizzaria-premium.vercel.app/api/mp-webhook
 *   Eventos: payment
 *
 * Segurança:
 *   - Valida assinatura `x-signature` (HMAC-SHA256) usando
 *     `MP_WEBHOOK_SECRET`. Rejeita 401 quando ausente ou inválida.
 *   - Replay protection: rejeita `ts` fora de ±5 min.
 *   - Manifesto: `id:<resourceId>;topic:<topic>;ts:<ts>;` (formato MP).
 *
 * Variáveis de ambiente:
 *   MP_ACCESS_TOKEN     — token privado de produção
 *   MP_WEBHOOK_SECRET   — segredo configurado no painel MP (Webhooks)
 *
 * Opcional — Vercel KV para persistência:
 *   1. Vercel Dashboard → Storage → Create KV Database
 *   2. Adicionar envs: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN
 *   3. npm install @vercel/kv no projeto
 */

const crypto = require('crypto');

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

async function tryStoreKv(key, data) {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(`mp_payment:${key}`, JSON.stringify(data));
    await kv.expire(`mp_payment:${key}`, 86400 * 7);
    return true;
  } catch {
    return false;
  }
}

function extractSignatureHeader(header) {
  // MP sends: "ts=<unix_ts>,v1=<hmac_hex>" or just "v1=<hmac_hex>"
  if (!header || typeof header !== 'string') return { ts: null, v1: null };
  const out = { ts: null, v1: null };
  header.split(',').forEach((part) => {
    const [k, v] = part.split('=');
    if (k === 'ts') out.ts = v;
    else if (k === 'v1') out.v1 = v;
  });
  return out;
}

function verifyMpSignature({ secret, signatureHeader, manifest, requestId }) {
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
  // MP official manifest format for v1: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const expected = hmac.digest('hex');
  // Constant-time compare
  const ok = expected.length === v1.length &&
    crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
  return { ok, reason: ok ? null : 'mismatch' };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { /* keep raw */ }
  }
  body = body || {};

  const dataId = body.data && body.data.id ? String(body.data.id) : (body.id ? String(body.id) : '');
  const topic = body.topic || body.type || '';
  const resourceId = dataId;
  const action = body.action || '';

  // ---- Signature validation ---------------------------------------------
  const secret = process.env.MP_WEBHOOK_SECRET;
  const signatureHeader = req.headers['x-signature'] || '';
  const requestId = req.headers['x-request-id'] || '';
  const manifest = `id:${dataId};request-id:${requestId};ts:${extractSignatureHeader(signatureHeader).ts || ''};`;
  const sig = verifyMpSignature({ secret, signatureHeader, manifest, requestId });
  if (!sig.ok) {
    // Log minimal info for ops; never echo the body (could carry payment data).
    console.warn('[MP-Webhook] signature rejected', { reason: sig.reason, topic });
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('[MP-Webhook]', JSON.stringify({ topic, resourceId, action }));

  const isPayment = topic === 'payment' || action.startsWith('payment.');
  if (isPayment && resourceId) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (token) {
      try {
        const resp = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const pay = await resp.json();
          const snap = {
            id: pay.id, status: pay.status, statusDetail: pay.status_detail,
            externalReference: pay.external_reference, preferenceId: pay.preference_id,
            amount: pay.transaction_amount, dateApproved: pay.date_approved,
            updatedAt: new Date().toISOString()
          };
          console.log('[MP-Webhook] Payment:', JSON.stringify(snap));

          const key = pay.external_reference || `payment_${pay.id}`;
          const stored = await tryStoreKv(key, snap);
          console.log('[MP-Webhook] KV:', stored ? 'armazenado' : 'indisponivel');
        } else {
          console.error('[MP-Webhook] Erro ao buscar payment:', await resp.text());
        }
      } catch (err) {
        console.error('[MP-Webhook] Erro:', err.message);
      }
    }
  }

  return res.status(200).json({ received: true });
};
