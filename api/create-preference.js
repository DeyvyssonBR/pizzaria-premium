/**
 * POST /api/create-preference
 * Cria preferência Checkout Pro. Token e ambiente vêm de lib/mercadoPago.js
 */
'use strict';

const {
  getConfig,
  getAccessToken,
  mpFetch,
  pickCheckoutUrl,
  isSandbox,
  resolveCorsOrigin
} = require('../lib/mercadoPago');

module.exports = async (req, res) => {
  const originHeader = req.headers.origin || '';
  const allowedOrigin = resolveCorsOrigin(originHeader);

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  let requestBody = req.body;
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody);
    } catch (e) {
      return res.status(400).json({ error: 'Corpo da requisição inválido (JSON malformado).' });
    }
  }
  requestBody = requestBody || {};
  const { items, total } = requestBody;

  try {
    getAccessToken();
  } catch (e) {
    return res.status(500).json({
      error:
        'Token Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN (ou MP_ACCESS_TOKEN) no .env.'
    });
  }

  try {
    let origin = req.headers.origin || req.headers.referer || '';
    if (origin) {
      try {
        const urlObj = new URL(origin);
        let pathPrefix = '';
        if (urlObj.hostname.endsWith('github.io')) {
          const parts = urlObj.pathname.split('/').filter(Boolean);
          pathPrefix = parts.length ? `/${parts[0]}` : '';
        }
        origin = urlObj.origin + pathPrefix;
      } catch (e) {
        /* keep */
      }
    }

    const isLocal =
      !origin ||
      /localhost|127\.0\.0\.1/i.test(origin) ||
      origin.startsWith('http://');
    const returnBase = isLocal
      ? 'https://deyvyssonbr.github.io/pizzaria-premium'
      : origin.replace(/\/$/, '');

    let prefItems = Array.isArray(items) ? items : null;
    if (prefItems && prefItems.length) {
      prefItems = prefItems
        .map((it) => ({
          title: String(it.title || 'Item').slice(0, 120),
          quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
          unit_price: Math.round(Number(it.unit_price) * 100) / 100,
          currency_id: 'BRL'
        }))
        .filter((it) => it.unit_price > 0);
    }
    if (!prefItems || !prefItems.length) {
      prefItems = [
        {
          title: 'Pedido - Pizzaria Premium',
          quantity: 1,
          unit_price: Math.round((parseFloat(total) || 0) * 100) / 100,
          currency_id: 'BRL'
        }
      ];
    }

    const externalRef = String(
      (requestBody && requestBody.external_reference) || `pp-${Date.now()}`
    ).slice(0, 64);

    const returnBaseFinal = isLocal
      ? origin && /localhost|127\.0\.0\.1/i.test(origin)
        ? origin.replace(/\/$/, '')
        : 'http://localhost:3000'
      : returnBase;

    const preferenceBody = {
      items: prefItems,
      external_reference: externalRef,
      statement_descriptor: 'PIZZARIA PREMIUM',
      metadata: {
        source: 'pizzaria-premium-site',
        external_reference: externalRef,
        mp_env: getConfig().env
      },
      back_urls: {
        success: `${returnBaseFinal}/?payment_status=success&ext_ref=${encodeURIComponent(externalRef)}`,
        failure: `${returnBaseFinal}/?payment_status=failure&ext_ref=${encodeURIComponent(externalRef)}`,
        pending: `${returnBaseFinal}/?payment_status=pending&ext_ref=${encodeURIComponent(externalRef)}`
      }
    };

    if (!isLocal && returnBaseFinal.startsWith('https://')) {
      preferenceBody.auto_return = 'approved';
    }

    const response = await mpFetch('/checkout/preferences', {
      method: 'POST',
      body: preferenceBody
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do Mercado Pago: ${response.raw || JSON.stringify(response.json)}`
      );
    }

    const data = response.json;
    const checkoutUrl = pickCheckoutUrl(data);

    if (!checkoutUrl) {
      throw new Error(
        isSandbox()
          ? 'API do Mercado Pago não retornou sandbox_init_point/init_point.'
          : 'API do Mercado Pago não retornou init_point (produção).'
      );
    }

    return res.status(200).json({
      init_point: checkoutUrl,
      preference_id: data.id || null,
      sandbox: isSandbox(),
      env: getConfig().env
    });
  } catch (error) {
    console.error('Erro na criação da preferência:', error);
    return res.status(500).json({ error: error.message });
  }
};
