const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);
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
    const headers = { 'Content-Type': mime };
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

  if (pathname === '/api/create-preference') {
    if (req.method === 'OPTIONS') {
      MP_HANDLER(req, res);
      return;
    }
    if (req.method !== 'POST') {
      MP_HANDLER(req, res);
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      req.body = body;
      MP_HANDLER(req, res);
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
