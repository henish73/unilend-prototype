/* Keeps a copy of the app on the phone so a reload still works if the Wi-Fi drops.
   Network first: when online, the newest version is always fetched and stored.
   The cached copy is used only when the network fails or takes over 4 seconds. */
var CACHE = "unilend-v1";
var CORE = ["./", "index.html", "facilitator.html", "css/app.css", "js/config.js", "js/rewards.js", "js/data.js", "js/store.js", "js/log.js", "js/app.js"];

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
    return Promise.race([fetch(req), timeout]).then(function (res) {
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
