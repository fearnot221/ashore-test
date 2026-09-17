const CACHE = "ashore-v33-shell";
const CORE = ["./", "./index.html", "./styles.css", "./script.js", "./favicon.svg", "./site.webmanifest"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(
        CORE.map(url =>
          fetch(url)
            .then(response => response.ok ? cache.put(url, response.clone()) : null)
            .catch(() => null)
        )
      )
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isShell =
    event.request.mode === "navigate" ||
    /\/(?:index\.html|styles\.css|script\.js)$/.test(url.pathname);

  if (isShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit =>
      hit || fetch(event.request).then(response => {
        if (response.ok && response.type !== "opaque") {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
    )
  );
});
