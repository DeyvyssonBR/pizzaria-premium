/**
 * GET /api/mp/payment-status?ref=<payment_id>
 */
'use strict';

const { getAccessToken, mpFetch, resolveCorsOrigin } = require('../lib/mercadoPago');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigin = resolveCorsOrigin(origin);

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET' });
  }

  try {
    getAccessToken();
  } catch (e) {
    return res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' });
  }

  const parsedUrl = require('url').parse(req.url, true);
  const ref = String((parsedUrl.query && parsedUrl.query.ref) || '').trim();
  if (!ref || !/^\d{6,}$/.test(ref)) {
    return res.status(400).json({ error: 'ref (payment_id numérico) obrigatório' });
  }

  try {
    const response = await mpFetch(`/v1/payments/${ref}`);
    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 502).json({
        error: 'not_found_or_mp_error',
        status: response.status,
        message: (response.json && (response.json.message || response.json.error)) || null
      });
    }
    const data = response.json;
    return res.status(200).json({
      payment_id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      external_ref: data.external_reference,
      amount: data.transaction_amount,
      updated_at: data.date_last_updated || data.date_approved || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
