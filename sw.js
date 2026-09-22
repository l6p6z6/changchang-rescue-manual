const CACHE_NAME = "changchang-water-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./story.js",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/manual-icon.svg",
  "./assets/scene-cover.svg",
  "./assets/scene-01-phone.svg",
  "./assets/scene-02-task.svg",
  "./assets/scene-03-day1.svg",
  "./assets/scene-04-pact.svg",
  "./assets/scene-05-beast.svg",
  "./assets/scene-06-day4.svg",
  "./assets/scene-07-day5.svg",
  "./assets/scene-08-day6.svg",
  "./assets/scene-09-day7.svg",
  "./assets/scene-10-day8.svg",
  "./assets/scene-11-door.svg",
  "./assets/scene-12-finale.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
