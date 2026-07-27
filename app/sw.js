/**
 * Service worker for Playwright Daily.
 *
 * Strategy: network-first for same-origin GETs, falling back to cache.
 * The course content changes as new days are written, so a stale-cache-first
 * approach would leave you reading yesterday's lesson. This way you always get
 * fresh content when online and the whole site still works on a plane.
 *
 * Bump CACHE_VERSION whenever the precache list changes.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `playwright-daily-${CACHE_VERSION}`;

const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/data/curriculum.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/practice/index.html',
  '/practice/practice.css',
  '/practice/login.html',
  '/practice/signup.html',
  '/practice/dashboard.html',
  '/practice/orders.html',
  '/practice/dynamic.html',
  '/practice/embedded.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // addAll is atomic: one 404 would throw away the whole precache, so add
      // individually and tolerate misses.
      await Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => console.warn('[sw] precache miss', url)))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // An uncached page while offline: fall back to the app shell.
        if (request.mode === 'navigate') {
          const shell = await caches.match('/index.html');
          if (shell) return shell;
        }
        throw new Error('offline and not cached');
      }
    })()
  );
});
