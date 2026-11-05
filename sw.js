/* Keeps a copy of the app on the phone so a reload still works if the Wi-Fi drops.
   Network first: when online, the newest version is always fetched and stored.
   The cached copy is used only when the network fails or takes over 4 seconds.
   Every request asks the server whether the file changed, instead of trusting the
   browser cache, so a release always loads as one matching set of files.
   tools/stamp_version.py updates VERSION on each release. */
var VERSION = "20261105154058";
var CACHE = "unilend-" + VERSION;
var CORE = ["./", "index.html", "facilitator.html", "css/app.css", "js/config.js", "js/rewards.js", "js/data.js", "js/store.js", "js/log.js", "js/app.js", "manifest.webmanifest", "favicon.svg", "favicon.ico", "assets/brand/logo-mark.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE);
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) {
      return k !== CACHE;
    }).map(function (k) {
      return caches.delete(k);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(networkFirst(req));
});

function networkFirst(req) {
  var url = new URL(req.url);
  var key = url.origin + url.pathname; // one copy per file, whatever the query string
  return caches.open(CACHE).then(function (cache) {
    var timeout = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error("timeout"));
      }, 4000);
    });
    // Revalidate with the server. A navigation request can't take options, so rebuild it.
    var fresh = new Request(req.url, { cache: "no-cache", credentials: "same-origin" });
    return Promise.race([fetch(fresh), timeout]).then(function (res) {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    }).catch(function (err) {
      return cache.match(key).then(function (hit) {
        if (hit) return hit;
        if (req.mode === "navigate") return cache.match(url.origin + url.pathname.replace(/[^/]*$/, "") + "index.html");
        throw err;
      }).then(function (res) {
        if (res) return res;
        throw err;
      });
    });
  });
}
