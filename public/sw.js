const STATIC_CACHE = 'jc-sportswear-static-v7';
const API_CACHE = 'jc-sportswear-api-v7';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/192.png',
  '/assets/512.png',
  '/assets/logo.png'
];

// Install: Pre-cache the App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NETWORK-FIRST Strategy for Express API GET requests (Dynamic API Caching)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ offline: true, message: 'Offline: No cached API data available.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. CACHE-FIRST Strategy for App Shell & Static Assets (HTML, CSS, JS, images, icons)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cachedShell => {
        const networkFetch = fetch(event.request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', copy));
          }
          return response;
        }).catch(() => cachedShell);

        return cachedShell || networkFetch;
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => caches.match('/index.html'));
      })
    );
  }
});
