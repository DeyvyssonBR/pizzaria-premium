/**
 * Consulta status de pagamento armazenado pelo webhook.
 *
 * Uso (cliente):
 *   GET /api/payment-status?ref=preference_id_ou_external_reference
 *
 * Retorna o status do pagamento se encontrado no Vercel KV,
 * ou 404 se ainda não processado / KV não configurado.
 *
 * Requer @vercel/kv instalado e KV configurado no projeto Vercel.
 */

async function tryGetKv(key) {
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`mp_payment:${key}`);
    if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
    return null;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  const ALLOWED_ORIGINS = [
    'https://deyvyssonbr.github.io',
    'https://pizzaria-premium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  const origin = req.headers.origin || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Origem não autorizada' });
  }
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://deyvyssonbr.github.io';
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

  const ref = req.query.ref || '';
  if (!ref) {
    return res.status(400).json({ error: 'Parâmetro "ref" é obrigatório' });
  }

  const data = await tryGetKv(ref);
  if (!data) {
    return res.status(404).json({ status: 'unknown', message: 'Pagamento não encontrado. Pode ainda estar sendo processado ou KV não configurado.' });
  }

  return res.status(200).json(data);
};
