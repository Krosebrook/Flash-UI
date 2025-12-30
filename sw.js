/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'flash-ui-v1.7.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './index.css',
  './manifest.json',
  './offline.html',
  './index.tsx', // Pre-cache entry point
  './types.ts',
  './utils.ts',
  './constants.ts',
  './db.ts',
  './contexts/StorageContext.tsx'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.debug('[SW] Precaching App Shell');
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
            console.debug('[SW] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Cache-First Strategy with dynamic caching
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    // Check if valid response to cache
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('./offline.html');
    }
    throw error;
  }
}

// Helper: Stale-While-Revalidate for external resources
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((err) => {
    console.warn('[SW] Network fetch failed', err);
    return cachedResponse; // Return cache if network fails
  });

  return cachedResponse || fetchPromise;
}

// Fetch Handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls (Network Only)
  if (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts')) {
    return;
  }

  // 2. External Libraries & Fonts (Stale-While-Revalidate)
  const isExternalLib = url.hostname === 'esm.sh' || 
                        url.hostname === 'unpkg.com' || 
                        url.hostname.includes('fonts.googleapis.com') || 
                        url.hostname.includes('gstatic.com');

  if (isExternalLib) {
    event.respondWith(staleWhileRevalidate(event.request, 'runtime-dependencies'));
    return;
  }

  // 3. Application Assets (Cache-First)
  // This covers index.html, local .js/.tsx files, images, etc.
  event.respondWith(cacheFirst(event.request, CACHE_NAME));
});