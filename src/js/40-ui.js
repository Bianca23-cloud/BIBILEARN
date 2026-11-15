/* =====================================================================
   40 · INTERFACE COMMUNE : en-tête, choix des langues, navigation entre les écrans
   ===================================================================== */

/** Met à jour l'en-tête (hors ligne, série, XP), la barre de langues et les onglets. */
function header(){
  const t = T();
  $("#stats").innerHTML = (navigator.onLine ? "" : `<span class="pill" title="${esc(t.offline)}">📴 ${esc(t.offShort)}</span>`)
    + `<span class="pill" title="${esc(t.streak)}">🔥 ${S.streak}</span><span class="pill">⭐ ${S.xp} ${t.xp}</span>`;
  const bar = $("#pair");
  bar.hidden = view === "translate";      // le traducteur a ses propres langues d'entrée et de sortie
  bar.innerHTML = `<label>${esc(t.learn)}<select id="tgt">${langOptions(S.target)}</select></label>
   <button class="swap" id="swp" aria-label="${esc(t.swap)}" title="${esc(t.swap)}">⇄</button>
   <label>${esc(t.from)}<select id="src">${langOptions(S.source)}</select></label>`;
  $("#tgt").onchange = e => setPair(e.target.value, S.source);
  $("#src").onchange = e => setPair(S.target, e.target.value);
  $("#swp").onclick = () => setPair(S.source, S.target);
  $$("nav.tabs button").forEach(b => { b.querySelector("em").textContent = t[b.dataset.v];
    if (b.dataset.v === view) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  document.documentElement.lang = S.ui;
  document.body.classList.toggle("big", S.big); document.body.classList.toggle("contrast", S.contrast);
}
/** Change la langue apprise et/ou la langue de départ (à tout moment). */
function setPair(tg, src){
  if (tg === src){ toast(T().same); header(); return; }
  S.target = tg; S.source = src; save(); header();
  go(["lesson", "story", "quiz"].includes(view) ? "home" : view);
}

/* ---------- Mascotte originale « Bibi » ---------- */
const BIBI = `<svg viewBox="0 0 120 120" width="96" height="96" role="img" aria-label="Bibi"><ellipse cx="60" cy="68" rx="44" ry="42" fill="#c9b6f5"/><ellipse cx="60" cy="74" rx="30" ry="26" fill="#fff3c4"/><circle cx="44" cy="54" r="12" fill="#fff"/><circle cx="76" cy="54" r="12" fill="#fff"/><circle cx="46" cy="56" r="6" fill="#2d2a4a"/><circle cx="78" cy="56" r="6" fill="#2d2a4a"/><circle cx="48" cy="54" r="2" fill="#fff"/><circle cx="80" cy="54" r="2" fill="#fff"/><path d="M52 74 Q60 82 68 74" stroke="#2d2a4a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="34" cy="70" r="5" fill="#ffb3c7"/><circle cx="86" cy="70" r="5" fill="#ffb3c7"/><path d="M30 30 L40 44 L24 42Z M90 30 L80 44 L96 42Z" fill="#a58ae8"/><rect x="40" y="92" width="40" height="18" rx="3" fill="#ffd8b1"/><line x1="60" y1="92" x2="60" y2="110" stroke="#5b4bc4" stroke-width="2"/></svg>`;

/* ---------- Navigation ---------- */
let view = "home";
const VIEWS = {};                         // chaque écran s'enregistre ici : VIEWS.home = function(main, arg){…}
/** Affiche un écran. */
function go(v, arg){
  if (!VIEWS[v]) v = "home";
  stopAudio(); Mic.stop();
  view = v; header();
  const m = $("#main");
  VIEWS[v](m, arg);
  const h = m.querySelector("h1"); if (h){ h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: false }); }
  window.scrollTo(0, 0);
  if (["home", "lessons", "review", "stories", "translate", "profile"].includes(v)) history.replaceState(null, "", "#" + v);
}
/** Barre de progression accessible. */
function bar(pct, label){ return `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"${label ? ` aria-label="${esc(label)}"` : ""}><i style="width:${pct}%"></i></div>`; }
