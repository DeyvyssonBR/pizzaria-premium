const CACHE_NAME = 'pizzaria-premium-v1';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './assets/css/styles.css',
  './assets/js/script.js',
  './assets/img/pizzaria-premium-logo.webp',
  './assets/img/logo-premium.png',
  './assets/img/hero-fachada-premium.jpg'
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
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
