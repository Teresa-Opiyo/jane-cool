var CACHE="bridevilla-v3";
var FILES=["./","index.html","style.css","app.js","i18n.js","manifest.webmanifest","icon.svg","icon-v2-192.png","icon-v2-512.png","fonts/patrick-hand.woff2","fonts/great-vibes.woff2","fonts/cormorant-600.woff2","fonts/cormorant-500-italic.woff2"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==CACHE}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(function(r){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy)});return r}).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match("index.html")})}));
});
