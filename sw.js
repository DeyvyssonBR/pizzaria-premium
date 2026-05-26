const CACHE_NAME = 'pizzaria-premium-v7-payment';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './assets/css/styles.css',
  './assets/js/script.js',
  './assets/js/qrcode.min.js',
  './assets/img/logo-premium-2026.png',
  './assets/img/hero-fachada-premium-2026.jpg',
  './assets/img/cardapio/placeholder.webp'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log('Error caching assets:', err));
    })
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event (Network-First Fallback)
self.addEventListener('fetch', (e) => {
  // Apenas intercepta requisições GET
  if (e.request.method !== 'GET') {
    return;
  }

  // Apenas intercepta requisições http/https
  if (!e.request.url.startsWith('http')) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(response => {
        return response || new Response('Offline fallback content not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});
