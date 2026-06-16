const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

// --- In-memory rate limiter (per IP) ---------------------------------------
// Defense against credential stuffing / abuse on the /api/* payment surface.
// Best-effort: with multiple Vercel serverless instances the limit is per
// instance. For production-grade limit, swap to Upstash/Vercel KV.
const RATE_BUCKETS = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQ = {
  '/api/create-preference': 20,
  '/api/payment-status': 60,
  '/api/mp-webhook': 120
};
function rateCheck(ip, path) {
  const limit = RATE_MAX_REQ[path];
  if (!limit) return { ok: true };
  const now = Date.now();
  const arr = RATE_BUCKETS.get(ip) || [];
  const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= limit) {
    return { ok: false, retryAfterMs: RATE_WINDOW_MS - (now - fresh[0]) };
  }
  fresh.push(now);
  RATE_BUCKETS.set(ip, fresh);
  return { ok: true, remaining: limit - fresh.length };
}
function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const MP_HANDLER = require('./api/create-preference');

function compatRes(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    const body = JSON.stringify(data);
    if (!res.hasHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(body);
  };
  res.hasHeader = res.hasHeader || function (name) {
    return this.getHeader(name) !== undefined;
  };
  return res;
}

function serveStatic(res, filePath, ext) {
  const mime = MIME[ext] || 'application/octet-stream';
  const cacheable = /\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(ext);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Não encontrado');
      return;
    }
    const headers = {
      'Content-Type': mime,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(self "https://www.mercadopago.com.br"), usb=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=()'
    };
    if (cacheable) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function serveIndex(res) {
  const fp = path.join(PUBLIC_DIR, 'index.html');
  fs.stat(fp, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Não encontrado');
      return;
    }
    serveStatic(res, fp, '.html');
  });
}

const server = http.createServer((req, res) => {
  compatRes(res);
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (pathname === '/api/create-preference' || pathname === '/api/mp-webhook' || pathname === '/api/payment-status') {
    const ip = clientIp(req);
    const r = rateCheck(ip, pathname);
    if (!r.ok) {
      res.setHeader('Retry-After', Math.ceil(r.retryAfterMs / 1000).toString());
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }
    if (req.method === 'OPTIONS') {
      const handler = pathname === '/api/mp-webhook' ? require('./api/mp-webhook') : MP_HANDLER;
      handler(req, res);
      return;
    }
    if (pathname === '/api/mp-webhook' && req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' });
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      req.body = body;
      const handler = pathname === '/api/mp-webhook' ? require('./api/mp-webhook')
                    : pathname === '/api/payment-status' ? require('./api/payment-status')
                    : MP_HANDLER;
      handler(req, res);
    });
    return;
  }

  const filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      serveIndex(res);
      return;
    }
    serveStatic(res, filePath, ext);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Pizzaria Premium Server rodando em http://0.0.0.0:${PORT}`);
});
