/* BIBILEARN — mode hors ligne.
   • Page de l'appli : réseau d'abord (toujours la dernière version), sinon copie hors ligne.
   • Voix natives et icônes : copie hors ligne d'abord (cache permanent « bibilearn-audio »). */
const APP="bibilearn-app-v1.3", AUDIO="bibilearn-audio", F=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==APP&&x!==AUDIO).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const url=new URL(r.url), page=r.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html");
  if(page){
    e.respondWith(fetch(r).then(n=>{const cp=n.clone();caches.open(APP).then(c=>c.put("./index.html",cp));return n;})
      .catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(n=>{
    if(n.ok){const cp=n.clone();caches.open(url.pathname.includes("/audio/")?AUDIO:APP).then(c=>c.put(r,cp));}
    return n;})));
});
