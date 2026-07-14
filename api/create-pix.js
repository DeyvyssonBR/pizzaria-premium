/**
 * POST /api/mp/create-pix (e /api/create-pix)
 * Cria pagamento Pix. Credenciais via lib/mercadoPago.js
 */
'use strict';

const {
  getAccessToken,
  mpFetch,
  isSandbox,
  getConfig,
  resolveCorsOrigin
} = require('../lib/mercadoPago');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigin = resolveCorsOrigin(origin);

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    getAccessToken();
  } catch (e) {
    return res.status(500).json({
      error: 'MERCADOPAGO_ACCESS_TOKEN não configurado',
      hint: 'Defina no .env.local ou variáveis do host'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
  }
  body = body || {};

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount inválido' });
  }
  const externalRef = String(body.external_ref || '').trim().slice(0, 64);
  if (!externalRef) {
    return res.status(400).json({ error: 'external_ref obrigatório' });
  }

  const payer = body.payer && typeof body.payer === 'object' ? body.payer : {};
  const firstName = String(payer.first_name || 'Cliente').slice(0, 60);
  const lastName = String(payer.last_name || 'Pizzaria').slice(0, 60);
  const email = payer.email ? String(payer.email).slice(0, 120) : undefined;
  const description = String(body.description || 'Pedido Pizzaria Premium').slice(0, 120);

  const mpBody = {
    transaction_amount: Math.round(amount * 100) / 100,
    description,
    payment_method_id: 'pix',
    payer: {
      first_name: firstName,
      last_name: lastName,
      ...(email ? { email } : { email: 'teste@testuser.com' })
    },
    external_reference: externalRef,
    statement_descriptor: 'PIZZARIA PREMIUM'
  };

  try {
    const response = await mpFetch('/v1/payments', {
      method: 'POST',
      body: mpBody,
      idempotencyKey: `pp-${externalRef}`
    });

    if (!response.ok) {
      return res.status(502).json({
        error: 'mp_create_pix_failed',
        status: response.status,
        message:
          (response.json && (response.json.message || response.json.error)) ||
          response.raw.slice(0, 300),
        sandbox_pix_limited: isSandbox(),
        env: getConfig().env
      });
    }

    const data = response.json;
    const tx =
      data &&
      data.point_of_interaction &&
      data.point_of_interaction.transaction_data
        ? data.point_of_interaction.transaction_data
        : null;

    return res.status(200).json({
      payment_id: data.id,
      status: data.status || 'pending',
      qr_code: tx ? tx.qr_code || null : null,
      qr_code_base64: tx ? tx.qr_code_base64 || null : null,
      expiration_date: tx ? tx.expiration_date || null : null,
      sandbox: isSandbox(),
      env: getConfig().env
    });
  } catch (err) {
    console.error('[create-pix]', err);
    return res.status(500).json({ error: err.message || 'create_pix_error' });
  }
};
