const CACHE_NAME = 'mms-v4';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // فعال‌سازی فوری نسخه جدید
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // کنترل فوری تمام تب‌های باز
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // ✅ اگر درخواست مربوط به بارگذاری یک صفحه (HTML) باشد، فایل اصلی را برگردان تا React Router کار کند
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
        // در غیر این صورت، یک پاسخ ساده برگردان
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});