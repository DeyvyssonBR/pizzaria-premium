/**
 * Função Serverless para Vercel
 * Cria uma preferência de pagamento de forma segura no Mercado Pago.
 * Esconde o seu ACCESS_TOKEN do navegador do cliente.
 */

// Se estiver usando Node 18+, o 'fetch' já é nativo globalmente.
// Caso contrário, pode usar require('node-fetch') ou similar.

module.exports = async (req, res) => {
  // Configurações de CORS para permitir requisições apenas de origens conhecidas
  const ALLOWED_ORIGINS = [
    'https://deyvyssonbr.github.io',
    'https://pizzaria-premium.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://deyvyssonbr.github.io';

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  // Trata requisição de preflight CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Recebe os itens e o total do corpo da requisição com tratamento de segurança
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

  // Recupera o Token Secreto das variáveis de ambiente da Vercel (seguro)
  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ 
      error: 'Token de Acesso do Mercado Pago não configurado. Defina a variável MP_ACCESS_TOKEN na Vercel.' 
    });
  }

  try {
    // Determina o origin de forma limpa e robusta
    let origin = req.headers.origin || req.headers.referer || '';
    if (origin) {
      try {
        const urlObj = new URL(origin);
        origin = urlObj.origin; // Retorna ex: 'https://pizzaria-premium.vercel.app'
      } catch (e) {
        // Se falhar, mantém a string original
      }
    }
    if (!origin) {
      origin = 'https://www.mercadopago.com.br/';
    }

    // Monta o corpo da preferência de pagamento
    const preferenceBody = {
      items: items || [
        {
          title: "Pedido - Pizzaria Premium",
          quantity: 1,
          unit_price: parseFloat(total),
          currency_id: "BRL"
        }
      ],
      back_urls: {
        success: `${origin}?payment_status=success`,
        failure: `${origin}?payment_status=failure`,
        pending: `${origin}?payment_status=pending`
      },
      auto_return: "approved"
    };

    // Faz a requisição POST para a API oficial do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceBody)
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Erro na API do Mercado Pago: ${errorDetails}`);
    }

    const data = await response.json();

    // Retorna o link de checkout gerado (init_point)
    return res.status(200).json({ init_point: data.init_point });
  } catch (error) {
    console.error('Erro na criação da preferência:', error);
    return res.status(500).json({ error: error.message });
  }
};
