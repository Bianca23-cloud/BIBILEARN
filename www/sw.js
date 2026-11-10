/* BIBILEARN — tout est mis en cache à la 1re ouverture (appli + voix natives) :
   ensuite l'appli marche sans internet ni données mobiles. */
const C="bibilearn-v1.2",F=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(async c=>{
  await c.addAll(F);
  try{ const list=await (await fetch("./audio/list.json")).json();
       for(let i=0;i<list.length;i+=40) await c.addAll(list.slice(i,i+40).map(f=>"./"+f)); }catch(err){}
}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put(e.request,cp));return n;}).catch(()=>caches.match("./index.html"))));});
