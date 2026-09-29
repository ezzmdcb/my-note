const CACHE='ezz-notes-v5';
const ASSETS=['./','./index.html','./style.css','./app.js','./links.js','./icon.svg','./manifest.json'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(res=>{
        if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
        return res;
      }).catch(()=>cached);
      return cached||network;
    })
  );
});
