/* Service worker: кэширует оболочку приложения, чтобы оно открывалось без интернета.
   Данные пользователя хранятся в IndexedDB и сюда не попадают. */
const VERSION = '8dfb3aabdf3f';
const CACHE = 'cf-shell-' + VERSION;
const PRECACHE = [
  "./",
  "./assets/main-3J3IJP4D.css",
  "./assets/main-Y57DYVKP.js",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('cf-shell-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    const indexUrl = new URL('./index.html', self.registration.scope).href;
    event.respondWith(
      caches.match(indexUrl, { cacheName: CACHE }).then((cached) => cached || fetch(req)),
    );
    return;
  }

  event.respondWith(
    caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then((cached) => cached || fetch(req)),
  );
});
