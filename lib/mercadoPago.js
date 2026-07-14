/**
 * mercadoPago.js — ÚNICO ponto de configuração da integração Mercado Pago.
 *
 * Ambiente definido exclusivamente por variáveis de ambiente (.env / .env.local / painel):
 *
 *   MERCADOPAGO_PUBLIC_KEY=...
 *   MERCADOPAGO_ACCESS_TOKEN=...
 *   MERCADOPAGO_ENV=sandbox|production
 *
 * Aliases legados (ainda aceitos):
 *   MP_PUBLIC_KEY, MP_ACCESS_TOKEN, MP_ENV
 *
 * Nenhuma credencial deve ficar hardcoded no código.
 * Todas as rotas /api/* e o server.js devem usar este módulo.
 */
'use strict';

const { loadEnv } = require('./loadEnv');

const API_BASE = 'https://api.mercadopago.com';

/** Origins permitidas em CORS (API). Railway: defina ALLOWED_ORIGINS=https://seu-app.up.railway.app */
function getAllowedOrigins() {
  ensureEnvLoaded();
  const defaults = [
    'https://deyvyssonbr.github.io',
    'https://pizzaria-premium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const site = (process.env.PUBLIC_SITE_URL || process.env.RAILWAY_PUBLIC_DOMAIN || '')
    .trim()
    .replace(/\/$/, '');
  if (site) {
    extra.push(site.startsWith('http') ? site : `https://${site}`);
  }
  return [...new Set([...defaults, ...extra])];
}

function resolveCorsOrigin(requestOrigin) {
  const list = getAllowedOrigins();
  if (requestOrigin && list.includes(requestOrigin)) return requestOrigin;
  // Railway / preview: permitir qualquer *.up.railway.app em produção se origin match
  if (
    requestOrigin &&
    /^https:\/\/[\w.-]+\.up\.railway\.app$/i.test(requestOrigin)
  ) {
    return requestOrigin;
  }
  return list[0];
}

function ensureEnvLoaded() {
  loadEnv();
}

function readEnv(primary, ...aliases) {
  ensureEnvLoaded();
  for (const key of [primary, ...aliases]) {
    const v = process.env[key];
    if (v != null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return '';
}

/**
 * @returns {{
 *   accessToken: string,
 *   publicKey: string,
 *   env: 'sandbox'|'production',
 *   isSandbox: boolean,
 *   isProduction: boolean,
 *   hasToken: boolean,
 *   hasPublicKey: boolean,
 *   apiBase: string,
 *   webhookSecret: string
 * }}
 */
function getConfig() {
  const accessToken = readEnv('MERCADOPAGO_ACCESS_TOKEN', 'MP_ACCESS_TOKEN');
  const publicKey = readEnv('MERCADOPAGO_PUBLIC_KEY', 'MP_PUBLIC_KEY');
  const webhookSecret = readEnv('MERCADOPAGO_WEBHOOK_SECRET', 'MP_WEBHOOK_SECRET');

  let envName = readEnv('MERCADOPAGO_ENV', 'MP_ENV').toLowerCase();

  if (envName !== 'sandbox' && envName !== 'production') {
    // Inferência segura a partir do prefixo do token
    if (accessToken.startsWith('TEST-')) envName = 'sandbox';
    else if (accessToken.startsWith('APP_USR-')) envName = 'production';
    else envName = 'sandbox';
  }

  const isSandbox = envName === 'sandbox';

  // Avisos de inconsistência (não quebram a app)
  if (accessToken) {
    if (isSandbox && accessToken.startsWith('APP_USR-')) {
      console.warn(
        '[mercadoPago] MERCADOPAGO_ENV=sandbox, mas o Access Token parece de PRODUÇÃO (APP_USR-).'
      );
    }
    if (!isSandbox && accessToken.startsWith('TEST-')) {
      console.warn(
        '[mercadoPago] MERCADOPAGO_ENV=production, mas o Access Token parece de TESTE (TEST-).'
      );
    }
  }

  return {
    accessToken,
    publicKey,
    env: isSandbox ? 'sandbox' : 'production',
    isSandbox,
    isProduction: !isSandbox,
    hasToken: Boolean(accessToken),
    hasPublicKey: Boolean(publicKey),
    apiBase: API_BASE,
    webhookSecret
  };
}

function getAccessToken() {
  const { accessToken } = getConfig();
  if (!accessToken) {
    throw new Error(
      'MERCADOPAGO_ACCESS_TOKEN (ou MP_ACCESS_TOKEN) não configurado. Defina no .env.local / variáveis do host.'
    );
  }
  return accessToken;
}

function getPublicKey() {
  return getConfig().publicKey;
}

function isSandbox() {
  return getConfig().isSandbox;
}

function isProduction() {
  return getConfig().isProduction;
}

/**
 * Fetch autenticado na API REST do Mercado Pago.
 * @param {string} path - ex: '/checkout/preferences' ou URL absoluta
 * @param {{ method?: string, body?: object|string, headers?: object, idempotencyKey?: string }} [options]
 */
async function mpFetch(path, options = {}) {
  const token = getAccessToken();
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (options.idempotencyKey) {
    headers['X-Idempotency-Key'] = options.idempotencyKey;
  }

  let body = options.body;
  if (body != null && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: options.method || (body ? 'POST' : 'GET'),
    headers,
    body
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { ok: res.ok, status: res.status, json, raw: text };
}

/**
 * Escolhe a URL de checkout da preferência conforme o ambiente.
 * - production → init_point (pagamentos reais)
 * - sandbox    → sandbox_init_point (só desenvolvimento; docs)
 */
function pickCheckoutUrl(preferenceData) {
  if (!preferenceData || typeof preferenceData !== 'object') return null;
  const { isSandbox: sand } = getConfig();
  if (sand) {
    return preferenceData.sandbox_init_point || preferenceData.init_point || null;
  }
  // Produção: SEMPRE preferir init_point (nunca depender de sandbox_init_point)
  return preferenceData.init_point || null;
}

/**
 * Config pública (segura para o browser) — NUNCA inclui access token.
 */
function publicConfig() {
  const c = getConfig();
  return {
    env: c.env,
    isSandbox: c.isSandbox,
    isProduction: c.isProduction,
    hasToken: c.hasToken,
    hasPublicKey: c.hasPublicKey,
    /** Public Key pode ir ao cliente (Bricks / SDK). Access Token NÃO. */
    publicKey: c.publicKey || null,
    checkoutProRecommended: c.isProduction,
    pixApiAvailable: c.hasToken,
    apiBase: API_BASE,
    message: !c.hasToken
      ? 'Configure MERCADOPAGO_ACCESS_TOKEN no .env'
      : c.isSandbox
        ? 'Ambiente sandbox (desenvolvimento). Use comprador de teste e cartões de teste.'
        : 'Ambiente production. Pagamentos reais.'
  };
}

/** Log de boot (sem vazar token completo). */
function logBootStatus(prefix = 'Mercado Pago') {
  const c = getConfig();
  if (!c.hasToken) {
    console.log(`${prefix}: SEM token — defina MERCADOPAGO_ACCESS_TOKEN`);
    return;
  }
  const tip = c.accessToken.slice(0, 12) + '…';
  console.log(`${prefix}: env=${c.env} token=${tip} publicKey=${c.hasPublicKey ? 'ok' : '—'}`);
}

module.exports = {
  API_BASE,
  getConfig,
  getAccessToken,
  getPublicKey,
  isSandbox,
  isProduction,
  mpFetch,
  pickCheckoutUrl,
  publicConfig,
  logBootStatus,
  getAllowedOrigins,
  resolveCorsOrigin
};
