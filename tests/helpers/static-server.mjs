// tests/helpers/static-server.mjs
// Tiny static file server used by the smoke test. Mirrors the same MIME
// behaviour as `python -m http.server` so the PWA is served the same way
// the README describes.

import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  '.xml': 'application/xml'
};

export function startServer(rootDir, port = 0) {
  const root = path.resolve(rootDir);
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let target = path.join(root, urlPath);
        // Disallow path traversal
        if (!target.startsWith(root)) {
          res.writeHead(403);
          res.end('forbidden');
          return;
        }
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
          // SPA fallback to index.html (so /admin still loads index, but the
          // smoke test asks for /admin.html directly anyway).
          const fallback = path.join(root, 'index.html');
          if (fs.existsSync(fallback)) {
            target = fallback;
          } else {
            res.writeHead(404);
            res.end('not found');
            return;
          }
        }
        const ext = path.extname(target).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(target).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${addr.port}`,
        port: addr.port,
        close: () => new Promise((r) => server.close(() => r()))
      });
    });
  });
}
