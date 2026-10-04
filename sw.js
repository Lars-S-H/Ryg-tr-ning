// Gør appen brugbar uden internet. Ved nye versioner: hæv VERSION.
const VERSION = 'v4';
const FILES = [
  './', 'index.html', 'foraelder.html', 'css/app.css', 'config.js', 'manifest.webmanifest',
  'js/app.js', 'js/exercises.js', 'js/figure.js', 'js/plan.js', 'js/store.js', 'js/parent.js', 'js/charts.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Netværk først (så opdateringer kommer med det samme), cache som reserve offline
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
