/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'flash-ui-v1.4.2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './index.css',
  './manifest.json',
  './offline.html'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
          if (cacheName !== CACHE_NAME && cacheName !== 'runtime-dependencies') {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Handler with specialized strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. External Library Dependencies (Stale-While-Revalidate)
  const isExternalLib = url.hostname === 'esm.sh' || 
                        url.hostname === 'unpkg.com' || 
                        url.hostname.includes('googleapis.com') || 
                        url.hostname.includes('gstatic.com');

  if (isExternalLib) {
    event.respondWith(
      caches.open('runtime-dependencies').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse); // Fallback to cache on network failure
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Gemini API and other dynamic resources (Network Only)
  if (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts')) {
    return;
  }

  // 3. Navigation Requests (Network-First with Offline Fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./offline.html');
      })
    );
    return;
  }

  // 4. Local Assets (Cache First)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});