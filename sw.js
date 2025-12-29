/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'flash-ui-v1.3.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/offline.html',
  '/constants.ts',
  '/types.ts',
  '/utils.ts'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching application shell and offline fallback');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intelligent Fetch Handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle ESM dependencies from esm.sh or unpkg (Stale-while-revalidate)
  if (url.hostname === 'esm.sh' || url.hostname === 'unpkg.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open('runtime-dependencies').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // 2. Handle API calls (Always network, don't cache)
  if (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts')) {
    return;
  }

  // 3. Local Assets (Cache-First, fallback to network/offline)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).catch(() => {
        // Return custom offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});