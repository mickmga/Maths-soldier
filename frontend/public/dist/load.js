"use strict";
(() => {
  // src/load.ts
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log(
          "The service worker registration successful with scope: ",
          registration.scope
        );
      }).catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
    });
  }
})();
//# sourceMappingURL=load.js.map
