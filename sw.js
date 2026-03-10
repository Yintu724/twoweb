const CACHE_NAME = 'janyan-v1';
const STATIC_CACHE = [
  'index.html',
  'styles.css',
  'script.js',
  'anime-season.html',
  'anime-classics.html',
  'anime-characters.html',
  'anime-hot-videos.html',
  'anime-season-videos.html',
  'anime-classics-videos.html',
  'summer.html',
  'electronic.html',
  'healing.html',
  'playlist.css',
  'playlist.js',
  'anime-pages.css',
  'sw-register.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
        return res;
      });
    })
  );
});
