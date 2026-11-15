/* =====================================================================
   99 · DÉMARRAGE
   ===================================================================== */
window.addEventListener("online", header); window.addEventListener("offline", header);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; if (view === "home") go("home"); });
$$("nav.tabs button").forEach(b => b.onclick = () => go(b.dataset.v));
/* Clavier : touches 1 à 4 pour choisir une réponse */
document.addEventListener("keydown", e => {
  if (["lesson", "quiz"].includes(view) && /^[1-4]$/.test(e.key) && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)){
    const o = $$(".opt")[+e.key - 1]; if (o && !o.disabled) o.click(); }
});
/* Hors ligne (version web) : le « service worker » garde une copie de l'appli */
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !IS_APP) navigator.serviceWorker.register("sw.js").catch(() => {});
go((location.hash || "").slice(1) || "home");

/* Version web (iPhone, navigateurs) : téléchargement unique de toutes les voix natives dans le cache,
   pour qu'elles marchent ensuite en mode avion. (Windows, Linux, Android : déjà dans l'appli.) */
async function cacheVoices(){
  if (IS_APP || !HAS_AUDIO || !("caches" in window) || !navigator.onLine) return;
  try {
    const c = await caches.open("bibilearn-audio");
    const list = await (await fetch("audio/list.json")).json();
    const have = new Set((await c.keys()).map(r => r.url.split("/audio/")[1]).filter(Boolean));
    const miss = list.filter(f => !have.has(f.slice(6)));
    voicesCached = [list.length - miss.length, list.length];
    for (let i = 0; i < miss.length; i += 40){
      await c.addAll(miss.slice(i, i + 40));
      voicesCached = [list.length - miss.length + Math.min(i + 40, miss.length), list.length];
      if (view === "profile" && $("#vc")) $("#vc").textContent = voicesCached.join(" / ");
    }
  } catch (e) {}
}
setTimeout(cacheVoices, 1500);
/* Accès pour les tests automatiques */
window.__BIBI = { S: () => S, R: () => R, part, NON_LATIN, go, ITEMS, STORIES, THEMES, translateText, Mic, bookExact, levelIdx, word };
