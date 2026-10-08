const CACHE_NAME = 'tunexia-v2';
const STATIC_ASSETS = [
    '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Purging old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Bypass audio streaming files and API mutation endpoints
    if (request.method !== 'GET' || url.pathname.endsWith('.mp3') || url.pathname.includes('/api/song/add')) {
        return;
    }

    // 1. Navigation / HTML requests: Network-First so user always gets the latest JS bundles
    if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
        );
        return;
    }

    // 2. Stale-While-Revalidate for song & album lists (instant 0ms response + background refresh)
    if (url.pathname.startsWith('/api/song/list') || url.pathname.startsWith('/api/album/list')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const networkFetch = fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || networkFetch;
                });
            })
        );
        return;
    }

    // 3. Network-first for other API queries with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // 4. Cache-first for hashed static assets (/assets/*)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((networkResponse) => {
                if (networkResponse.ok && (url.origin === location.origin || url.hostname.includes('cloudinary'))) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return networkResponse;
            });
        })
    );
});
