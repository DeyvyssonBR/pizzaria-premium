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
 * Opcional — Vercel KV para persistência:
 *   1. Vercel Dashboard → Storage → Create KV Database
 *   2. Adicionar envs: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN
 *   3. npm install @vercel/kv no projeto
 */

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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { /* keep raw */ }
  }
  body = body || {};

  const topic = body.topic || body.type || '';
  const resourceId = body.id || body.data?.id || '';
  const action = body.action || '';

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
