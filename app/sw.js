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

const CACHE_VERSION = 'v2';
const CACHE_NAME = `playwright-daily-${CACHE_VERSION}`;

const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/dom.js',
  '/push.js',
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

/* ─────────────────────────── push ─────────────────────────── */

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Playwright Daily', {
      body: payload.body ?? "Time for today's 30 minutes.",
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      // A tag replaces an earlier notification instead of stacking duplicates.
      tag: payload.tag ?? 'daily-reminder',
      data: { url: payload.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? '/';

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ('navigate' in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});

/* ─────────────────────────── fetch ─────────────────────────── */

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
