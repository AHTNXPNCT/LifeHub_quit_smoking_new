// A new cache version is used whenever the application shell changes. It
// prevents an older page bundle from requesting a now-missing lazy-loaded
// screen after an update.
const VERSION = "lifehub-v1.3.5";
const CORE = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;

  // Use the current deployment whenever it is reachable. Cache is a complete
  // offline fallback, not a source of older JavaScript during normal use.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        const cache = await caches.open(VERSION);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        return (await caches.match("/")) || new Response("LifeHub is unavailable", { status: 503 });
      }
      return new Response("", { status: 504 });
    }
  })());
});
