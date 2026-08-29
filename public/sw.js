const CACHE_NAME = 'mms-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // فقط برای درخواست‌های GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // اگر در cache بود، برگردان
        if (response) {
          return response;
        }

        // اگر نبود، سعی کن از شبکه بگیر
        return fetch(event.request)
          .then((response) => {
            // اگر پاسخ موفق بود، آن را cache کن
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // اگر شبکه هم کار نکرد، برای درخواست‌های navigation، index.html را برگردان
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            // برای سایر درخواست‌ها، null برگردان
            return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});