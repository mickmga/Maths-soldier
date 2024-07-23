"use strict";
(() => {
  // src/service-worker.ts
  var cacheName = "gamingMikeCache";
  var assetsToCache = [
    "/assets/palace/hero/old_walk/1.png",
    // add all your asset URLs here
  ];
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(cacheName).then((cache) => cache.addAll(assetsToCache))
    );
  });
  self.addEventListener("fetch", (event) => {
    console.log("fetching");
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(cacheName).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  });
  self.addEventListener("activate", (event) => {
    const cacheWhitelist = [cacheName];
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName2) => {
            if (cacheWhitelist.indexOf(cacheName2) === -1) {
              return caches.delete(cacheName2);
            }
          })
        );
      })
    );
  });
})();
//# sourceMappingURL=service-worker.js.map
