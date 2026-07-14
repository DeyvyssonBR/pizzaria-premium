/**
 * GET /api/mp/verify-payment?payment_id= | external_reference=
 * Confirma aprovação no MP via lib/mercadoPago.js
 */
'use strict';

const { getAccessToken, mpFetch, resolveCorsOrigin } = require('../lib/mercadoPago');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigin = resolveCorsOrigin(origin);

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET', approved: false });
  }

  try {
    getAccessToken();
  } catch (e) {
    return res.status(500).json({ approved: false, error: 'token_missing' });
  }

  const url = require('url').parse(req.url, true);
  const paymentId = String((url.query && url.query.payment_id) || '').trim();
  const externalRef = String((url.query && url.query.external_reference) || '').trim();

  if (!paymentId && !externalRef) {
    return res.status(400).json({
      approved: false,
      error: 'payment_id_or_external_reference_required'
    });
  }

  try {
    let payment = null;

    if (paymentId && /^\d{6,}$/.test(paymentId)) {
      const r = await mpFetch(`/v1/payments/${paymentId}`);
      if (r.ok) payment = r.json;
    }

    if (!payment && externalRef) {
      const q = new URLSearchParams({
        sort: 'date_created',
        criteria: 'desc',
        external_reference: externalRef,
        range: 'date_created',
        begin_date: 'NOW-7DAYS',
        end_date: 'NOW'
      });
      const r = await mpFetch(`/v1/payments/search?${q}`);
      if (r.ok) {
        const results = (r.json && r.json.results) || [];
        payment = results.find((p) => p.status === 'approved') || results[0] || null;
      }
    }

    if (!payment) {
      return res.status(200).json({
        approved: false,
        status: 'not_found',
        verified: true
      });
    }

    const approved = payment.status === 'approved';
    return res.status(200).json({
      approved,
      verified: true,
      status: payment.status,
      status_detail: payment.status_detail || null,
      payment_id: payment.id,
      external_reference: payment.external_reference || null,
      amount: payment.transaction_amount,
      payment_method_id: payment.payment_method_id || null,
      date_approved: payment.date_approved || null
    });
  } catch (err) {
    console.error('[verify-payment]', err);
    return res.status(500).json({
      approved: false,
      error: err.message,
      verified: false
    });
  }
};
