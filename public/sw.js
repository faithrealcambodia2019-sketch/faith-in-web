/* Faith In - Progressive Web App Service Worker */
const CACHE_NAME = "faithin-cache-v1";
const PRECACHE_URLS = [
  "/",
  "/favicon.svg",
  "/assets/images/favicon-192x192.png",
  "/assets/images/favicon-512x512.png",
  "/faithin-app/assets/faithin-fonts.css",
  "/faithin-app/assets/faithin-icons.css",
  "/faithin-app/assets/faithin-tw.css",
  "/faithin-app/assets/faithin.css?v=20260831-v32",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[FaithIn SW] Precache partial error:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Exclude API, Firebase and Supabase realtime/backend endpoints from service worker caching
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("firebaseio.com")
  ) {
    return;
  }

  // Network first with cache fallback strategy for pages and static assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      })
  );
});
