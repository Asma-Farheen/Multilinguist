// ============================================================
// GRAMA AI - Service Worker (Offline Support)
// ============================================================

const CACHE_NAME = 'grama-ai-v500';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/theme.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './css/animations.css',
  './js/config.js',
  './js/api.js',
  './js/audio.js',
  './js/ui.js',
  './js/main.js',
  './js/loader.js',
  './components/splash.html',
  './components/home.html',
  './components/listening.html',
  './components/thinking.html',
  './components/response.html',
  './components/panels.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap',
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Cache First for static, Network First for API
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API calls → network first
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ answer: 'You are offline. Please check your connection.' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Static → cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
