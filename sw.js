/* Daily Checklist — service worker
   Bump CACHE when you ship new code so old clients pull the new shell. */
const CACHE = "checklist-shell-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./css/app.css",
  "./css/print.css",
  "./js/state.js",
  "./js/render.js",
  "./js/modals.js",
  "./js/app.js",
  "./js/features/recurring.js",
  "./js/features/csv.js",
  "./js/features/pdf.js",
  "./js/features/share.js",
  "./js/features/backup.js",
  "./js/features/templates.js",
  "./js/features/branding.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () { /* ignore individual failures */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                            .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  // ignore chrome-extension etc
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) {
        // refresh in background
        fetch(e.request).then(function (fresh) {
          if (fresh && fresh.ok) caches.open(CACHE).then(function (c) { c.put(e.request, fresh); });
        }).catch(function () {});
        return cached;
      }
      return fetch(e.request).then(function (resp) {
        if (resp && resp.ok && (url.origin === location.origin || url.hostname.indexOf("cdnjs.cloudflare.com") !== -1)) {
          var clone = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function () {
        // last-ditch offline fallback for navigations
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});

self.addEventListener("message", function (e) {
  if (e.data === "skipWaiting") self.skipWaiting();
});
