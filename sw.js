const CACHE='brinquedos-vs-pesadelos-v1.3.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/codex-atlas.svg?v=1.3.0',
  './src/main.js?v=1.3.0','./src/style.css?v=1.3.0','./src/config.js?v=1.3.0','./src/data.js?v=1.3.0','./src/upgrades.js?v=1.3.0','./src/save.js?v=1.3.0','./src/audio.js?v=1.3.0','./src/engine.js?v=1.3.0','./src/render.js?v=1.3.0'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('brinquedos-vs-pesadelos-')&&k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{
    if(response.ok)caches.open(CACHE).then(c=>c.put(e.request,response.clone())).catch(()=>{});
    return response;
  })));
});
