// Network-first app shell so the editor installs as an app (Android home screen, Windows Start menu)
// while always running the current version when the editor server is reachable.
const CACHE = "freshmark-editor-v1";
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/assets/editor.css", "/assets/editor.js", "/icon.svg"])).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && !url.pathname.startsWith("/content/")) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || Response.error())));
});
