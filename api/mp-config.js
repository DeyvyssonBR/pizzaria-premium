/**
 * GET /api/mp/config — ambiente público (sem Access Token).
 */
'use strict';

const { publicConfig, mpFetch, resolveCorsOrigin } = require('../lib/mercadoPago');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', resolveCorsOrigin(origin));
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET' });
  }

  const pub = publicConfig();
  let collectorId = null;
  let collectorNickname = null;
  let billingOk = null;

  if (pub.hasToken) {
    try {
      const me = await mpFetch('/users/me');
      if (me.ok && me.json) {
        collectorId = me.json.id || null;
        collectorNickname = me.json.nickname || null;
        billingOk = !(
          me.json.status &&
          me.json.status.billing &&
          me.json.status.billing.allow === false
        );
      }
    } catch (e) {
      /* ignore */
    }
  }

  return res.status(200).json({
    ok: pub.hasToken,
    ...pub,
    collectorId,
    collectorNickname,
    billingOk,
    // aliases legados pro front
    sandbox: pub.isSandbox,
    production: pub.isProduction
  });
};
