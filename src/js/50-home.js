/* =====================================================================
   50 · ACCUEIL et LISTE DES LEÇONS (par niveau A1 → C2)
   ===================================================================== */
let deferredPrompt = null;                // bouton « Installer l'appli » (Chrome, Edge, Android)

VIEWS.home = function(m){
  const t = T(), pct = Math.min(100, Math.round(S.dayXp * 100 / S.goal)), lv = levelIdx(S.target);
  const done = S.done[S.target] || {};
  const nextTheme = themesOfLevel(LEVELS[lv].id).find(th => (done[th.id] || 0) < PASS) || THEMES.find(th => !done[th.id]) || THEMES[0];
  const due = dueList().length;
  const iosHint = IS_IOS && !navigator.standalone && !IS_APP;
  m.innerHTML = `<h1 class="sr">BIBILEARN</h1>
  <section class="card hero">${BIBI}<div><b>${esc(t.tag)}</b><div>${esc(langLabel(S.target))} ← ${esc(langLabel(S.source))}</div><div class="tag">${esc(t.level)} : ${esc(levelName(lv))}</div></div></section>
  <section class="card"><h2>${esc(t.goal)} — ${S.dayXp}/${S.goal} ${t.xp}</h2>${bar(pct)}
  <p>🔥 ${S.streak} ${esc(t.streak)} · 📚 ${learnedCount(S.target)} ${esc(t.words)} · 🔁 ${due} ${esc(t.due)}</p>
  <div class="row"><button class="btn" id="cont">▶ ${esc(t.cont)} : ${nextTheme.icon} ${esc(themeName(nextTheme))}</button>
  ${due ? `<button class="btn alt" id="rev">🔁 ${esc(t.review)}</button>` : ""}
  <button class="btn alt" id="inst" hidden>${esc(t.install)}</button></div></section>
  <section class="card"><h2>🚀 ${esc(t.fastTitle)}</h2><p class="rom">${esc(t.fastHelp)}</p>
  <div class="row"><button class="btn alt" id="place">🧭 ${esc(t.placement)}</button><button class="btn alt" id="sprint">⚡ ${esc(t.sprint)}</button>
  <button class="btn alt" id="exam">🎓 ${esc(t.exam)} ${esc(LEVELS[lv].id)}</button><button class="btn alt" id="trl">🌐 ${esc(t.translate)}</button></div></section>
  ${iosHint ? `<section class="card"><h2>🍎 ${esc(t.iosTitle)}</h2><p>${esc(t.iosHelp)}</p></section>` : ""}
  <p class="rom">${esc(t.tip)}</p>`;
  $("#cont").onclick = () => go("lesson", nextTheme.id);
  if ($("#rev")) $("#rev").onclick = () => go("review");
  $("#place").onclick = () => go("quiz", { mode: "placement" });
  $("#sprint").onclick = () => go("quiz", { mode: "sprint" });
  $("#exam").onclick = () => go("quiz", { mode: "exam", level: LEVELS[lv].id });
  $("#trl").onclick = () => go("translate");
  if (deferredPrompt){ const b = $("#inst"); b.hidden = false; b.onclick = () => { deferredPrompt.prompt(); deferredPrompt = null; b.hidden = true; }; }
};

VIEWS.lessons = function(m){
  const t = T(), done = S.done[S.target] || {}, st = levelStats(S.target), cur = levelIdx(S.target), ex = S.exams[S.target] || {};
  m.innerHTML = `<h1>${esc(t.lessons)} — ${esc(langLabel(S.target))}</h1>` + LEVELS.map((L, li) => {
    const ths = themesOfLevel(L.id); if (!ths.length) return "";
    const nItems = itemsOfLevel(L.id).length;
    return `<section class="card"><h2>${li < cur ? "✅" : li === cur ? "▶" : "⬜"} ${esc(levelName(li))} <span class="tag">${st[li]}%</span> <small>· ${nItems} ${esc(t.phrases)}</small></h2>
    ${bar(st[li], levelName(li))}
    <div class="grid" style="margin-top:12px">${ths.map(th => {
      const its = itemsOf(th.id), reg = its.filter(i => ITEMS[i][1]).length;
      return `<button class="tile" data-th="${th.id}"><span class="ic" aria-hidden="true">${th.icon}</span><b>${esc(themeName(th))}</b><small>${th.tip ? "📘 " + esc(t.grammar) + " · " : ""}${its.length}${reg ? " · " + reg + " " + esc(t.regional) : ""}${done[th.id] ? " · ✅ " + done[th.id] + "%" : ""}</small></button>`;
    }).join("")}</div>
    <div class="row" style="margin-top:10px"><button class="btn alt" data-exam="${L.id}">🎓 ${esc(t.exam)} ${L.id}${ex[L.id] ? " · ✅ " + ex[L.id] + "%" : ""}</button></div></section>`;
  }).join("") + `<p class="rom">${esc(t.levelHelp)}</p>`;
  $$(".tile").forEach(b => b.onclick = () => go("lesson", b.dataset.th));
  $$("[data-exam]").forEach(b => b.onclick = () => go("quiz", { mode: "exam", level: b.dataset.exam }));
};
