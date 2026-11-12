const CACHE='brinquedos-vs-pesadelos-v0.2.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png',
  './src/main.js','./src/style.css','./src/config.js','./src/data.js','./src/save.js','./src/audio.js','./src/engine.js','./src/render.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
   return response;
 }).catch(()=>caches.match('./index.html'))));
});
