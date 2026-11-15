/* =====================================================================
   51 · MOTEUR D'EXERCICES (utilisé par les leçons, l'examen, le test de niveau et le sprint)
   Un « parcours » = une liste d'étapes { k: type d'exercice, i: numéro de la phrase }.
   Types : tip (grammaire), intro (nouveau mot), s2t / t2s (choisir la traduction), listen (écouter),
           type (écrire), dict (dictée), order (remettre dans l'ordre), cloze (texte à trous),
           speak (parler au micro), match (associer les paires).
   ===================================================================== */
let R = null;                               // parcours en cours

/** Démarre un parcours. cfg = { steps, theme?, timer? (secondes), retry? (refaire les erreurs), onFinish(pct, R) } */
function runSteps(m, cfg){
  R = Object.assign({ m, n: 0, good: 0, total: 0, wrong: new Set(), retry: true }, cfg);
  if (cfg.timer) R.end = Date.now() + cfg.timer * 1000;
  step();
}
/** Cadre commun d'un exercice : bouton Quitter, compteur, barre, minuteur, zone de réponse. */
function shell(label, inner){
  const t = T(), pct = Math.round(R.n * 100 / R.steps.length);
  const left = R.end ? Math.max(0, Math.round((R.end - Date.now()) / 1000)) : null;
  R.m.innerHTML = `<div class="row" style="justify-content:space-between"><button class="btn alt" id="quit">✕ ${esc(t.quit)}</button>
  ${left !== null ? `<span class="pill" id="clock" aria-live="off">⏱ ${left}s</span>` : ""}<span>${R.n + 1}/${R.steps.length}</span></div>
  <div style="margin:10px 0">${bar(pct)}</div>
  <section class="card pop"><h1>${esc(label)}</h1>${inner}<div id="fb" aria-live="assertive"></div><div class="row" style="margin-top:12px"><button class="btn" id="go" disabled>${esc(t.check)}</button></div></section>`;
  $("#quit").onclick = () => { clearInterval(R.tick); go(R.quitTo || "lessons"); };
  const h = R.m.querySelector("h1"); h.setAttribute("tabindex", "-1"); h.focus();
  clearInterval(R.tick);
  if (R.end) R.tick = setInterval(() => { const s = Math.max(0, Math.round((R.end - Date.now()) / 1000)); const c = $("#clock"); if (c) c.textContent = "⏱ " + s + "s"; if (s <= 0){ clearInterval(R.tick); endRun(); } }, 500);
}
/** Bouton de réponse (avec translittération pour le russe, le grec, le japonais, le chinois). */
function optBtn(l, p, k){ return `<button class="opt" role="radio" aria-checked="false" data-v="${esc(p.t)}" lang="${HTML_LANG[l]}">${k + 1}. ${esc(p.t)}${(S.rom && NON_LATIN[l] && p.r) ? `<small class="rom" style="display:block">${esc(p.r)}</small>` : ""}</button>`; }
function wireOpts(set){ $$(".opt").forEach(b => b.onclick = () => { $$(".opt").forEach(x => { x.classList.remove("sel"); x.setAttribute("aria-checked", "false"); }); b.classList.add("sel"); b.setAttribute("aria-checked", "true"); set(b.dataset.v); $("#go").disabled = false; }); }
function markOpts(good, ans){ $$(".opt").forEach(x => { x.disabled = true; if (x.dataset.v === good) x.classList.add("good"); else if (x.dataset.v === ans) x.classList.add("bad"); }); }
/** 3 mauvaises réponses plausibles + la bonne, mélangées. */
function distract(i, l){
  const want = word(i, l).t, out = new Map([[want, word(i, l)]]);
  const pool = shuffle(itemsOf(ITEMS[i][0]).concat(shuffle(ITEMS.map((_, k) => k)).slice(0, 14)));
  for (const k of pool){ if (out.size >= 4) break; const w = word(k, l); if (!out.has(w.t)) out.set(w.t, w); }
  return shuffle([...out.values()]);
}
function inputBox(l){ return `<label>${esc(T().typeHere)} (${esc(langLabel(l))})<br><input type="text" id="inp" lang="${HTML_LANG[l]}" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%"></label>`; }
function wireInput(){ const inp = $("#inp"); inp.focus(); inp.oninput = () => { $("#go").disabled = !inp.value.trim(); }; inp.onkeydown = e => { if (e.key === "Enter" && inp.value.trim()) $("#go").click(); }; return inp; }
/** Une réponse écrite est juste si elle correspond au texte OU à sa translittération (pratique sans clavier russe/grec). */
const typedOk = (v, w) => norm(v) === norm(w.t) || (!!w.r && norm(v) === norm(w.r));

/* ---------- Les exercices ---------- */
const EX = {
  tip(s){ const th = themeOf(R.theme), t = T();
    shell(themeName(th), `<p class="tag">📘 ${esc(t.grammar)}</p><p style="font-size:1.1rem">${esc(th.tip[S.ui] || th.tip.fr)}</p>`);
    return "auto"; },
  intro(s, tw, sw, reg){ const t = T();
    shell(t.newWord, `<p class="tag">${esc(t.newWord)}</p>${reg}<div class="q">${txt(S.target, tw)}</div><p>= ${txt(S.source, sw)}</p><button class="btn alt" id="say">${esc(t.listenBtn)}</button>`);
    $("#say").onclick = () => speak(tw.t, S.target); speak(tw.t, S.target); grade(s.i, true);
    return "auto"; },
  choice(s, tw, sw, reg){ const t = T();
    const ask = s.k === "t2s" ? S.target : S.source, ans = s.k === "t2s" ? S.source : S.target;
    const aw = word(s.i, ans), qw = word(s.i, ask), ops = distract(s.i, ans); let answer = null;
    const prompt = s.k === "listen" ? `<button class="btn alt" id="say" style="font-size:1.4rem" aria-label="${esc(t.listenBtn)}">🔊</button>` : `<div class="q">${txt(ask, qw)}</div>${reg}`;
    shell(s.k === "listen" ? t.listen : t.choose, `${prompt}<div class="opts" role="radiogroup">${ops.map((o, k) => optBtn(ans, o, k)).join("")}</div>`);
    if (s.k === "listen"){ $("#say").onclick = () => speak(tw.t, S.target); speak(tw.t, S.target); }
    if (s.k === "t2s") speak(tw.t, S.target);
    wireOpts(v => answer = v);
    return () => { markOpts(aw.t, answer); return [answer === aw.t, aw.t, ans]; }; },
  type(s, tw, sw){ const t = T();
    shell(t.type, `<div class="q">${txt(S.source, sw)}</div>${inputBox(S.target)}`);
    const inp = wireInput();
    return () => { inp.disabled = true; return [typedOk(inp.value, tw), tw.t]; }; },
  dict(s, tw){ const t = T();
    shell(t.dict, `<div class="row"><button class="btn alt" id="say" style="font-size:1.4rem" aria-label="${esc(t.listenBtn)}">🔊</button><button class="btn alt" id="slow">🐢 ${esc(t.slow)}</button></div>${inputBox(S.target)}`);
    $("#say").onclick = () => speak(tw.t, S.target); $("#slow").onclick = () => speak(tw.t, S.target, Math.max(.5, S.rate - .35));
    speak(tw.t, S.target); const inp = wireInput();
    return () => { inp.disabled = true; return [typedOk(inp.value, tw), tw.t]; }; },
  order(s, tw, sw){ const t = T();
    const toks = tw.t.split(/\s+/), bag = shuffle(toks.map((w, k) => ({ w, k }))), pick = [];
    shell(t.order, `<div class="q">${txt(S.source, sw)}</div><div class="chips" id="ans" aria-label="${esc(t.typeHere)}"></div><div class="chips" id="bag"></div>`);
    const draw = () => {
      $("#ans").innerHTML = pick.map((p, k) => `<button class="chip" data-a="${k}" lang="${HTML_LANG[S.target]}">${esc(p.w)}</button>`).join("") || `<span class="rom">${esc(t.empty)}</span>`;
      $("#bag").innerHTML = bag.filter(b => !pick.includes(b)).map(b => `<button class="chip" data-k="${b.k}" lang="${HTML_LANG[S.target]}">${esc(b.w)}</button>`).join("");
      $$("#bag .chip").forEach(c => c.onclick = () => { pick.push(bag.find(b => b.k == c.dataset.k)); draw(); });
      $$("#ans .chip").forEach(c => c.onclick = () => { pick.splice(+c.dataset.a, 1); draw(); });
      $("#go").disabled = pick.length !== toks.length; };
    draw();
    return () => [norm(pick.map(p => p.w).join(" ")) === norm(tw.t), tw.t]; },
  cloze(s, tw, sw){ const t = T();
    const gap = tw.raw.match(/\[(.+?)\]/)[1], shown = tw.raw.replace(/\[.+?\]/, " ____ ").replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();
    const pool = new Set([gap]);
    shuffle(itemsOf(ITEMS[s.i][0]).concat(shuffle(ITEMS.map((_, k) => k)))).forEach(k => { if (pool.size >= 4) return; const r = word(k, S.target).raw.match(/\[(.+?)\]/); if (r && r[1] !== gap) pool.add(r[1]); });
    let answer = null;
    /* translittération du texte à trous : sans donner la réponse (russe/grec : calculée sur le texte à trous ;
       japonais/chinois : affichée avec la correction) */
    const gapRom = TR[S.target] ? { t: shown, r: translit(shown, S.target) } : { t: shown, r: "" };
    shell(t.cloze, `<div class="q">${lt(S.target, shown)}</div>${romHtml(gapRom, S.target)}<p>= ${txt(S.source, sw)}</p><div class="opts" role="radiogroup">${shuffle([...pool]).map((o, k) => optBtn(S.target, { t: o, r: "" }, k)).join("")}</div>`);
    wireOpts(v => answer = v);
    return () => { markOpts(gap, answer); return [answer === gap, tw.t]; }; },
  speak(s, tw, sw){ const t = T(); let heard = "";
    shell(t.speak, `<div class="q">${txt(S.target, tw)}</div><p>= ${txt(S.source, sw)}</p><div class="row"><button class="btn alt" id="say">${esc(t.listenBtn)}</button><button class="btn alt" id="mic">${esc(t.speakBtn)}</button><button class="btn alt" id="skp">${esc(t.skip)}</button></div><p id="heard" class="rom" aria-live="polite"></p>`);
    $("#say").onclick = () => speak(tw.t, S.target);
    $("#skp").onclick = () => { R.n++; step(); };
    $("#mic").onclick = () => { $("#heard").textContent = "🎙️ " + t.listening;
      Mic.listen(S.target).then(alts => { heard = alts.slice().sort((a, b) => similar(b, tw.t) - similar(a, tw.t))[0] || "";
        $("#heard").textContent = t.heard + " " + heard; $("#go").disabled = !heard; })
      .catch(e => { $("#heard").textContent = Mic.explain(e.code); }); };
    return () => [similar(heard, tw.t) >= .7, tw.t]; },
  match(s){ const t = T();
    const its = shuffle(itemsOf(ITEMS[s.i][0])).slice(0, 5), left = shuffle(its), right = shuffle(its); let selL = null, selR = null, found = 0;
    shell(t.match, `<p>${esc(t.matchHelp)}</p><div class="match"><div class="opts" id="ml">${left.map(k => { const w = word(k, S.target); return `<button class="opt" data-k="${k}" lang="${HTML_LANG[S.target]}">${esc(w.t)}${S.rom && NON_LATIN[S.target] && w.r ? `<small class="rom" style="display:block">${esc(w.r)}</small>` : ""}</button>`; }).join("")}</div><div class="opts" id="mr">${right.map(k => `<button class="opt" data-k="${k}" lang="${HTML_LANG[S.source]}">${esc(word(k, S.source).t)}</button>`).join("")}</div></div>`);
    const tryPair = () => { if (selL === null || selR === null) return;
      const bl = R.m.querySelector(`#ml [data-k="${selL}"]`), br = R.m.querySelector(`#mr [data-k="${selR}"]`);
      if (selL === selR){ bl.classList.add("good"); br.classList.add("good"); bl.disabled = br.disabled = true; found++; }
      else { bl.classList.add("bad"); br.classList.add("bad"); setTimeout(() => { bl.classList.remove("bad"); br.classList.remove("bad"); }, 600); }
      $$(".opt.sel").forEach(x => x.classList.remove("sel")); selL = selR = null;
      if (found === its.length){ const g = $("#go"); g.disabled = false; g.focus(); } };
    $$("#ml .opt").forEach(b => b.onclick = () => { $$("#ml .opt").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); selL = b.dataset.k; speak(word(+selL, S.target).t, S.target); tryPair(); });
    $$("#mr .opt").forEach(b => b.onclick = () => { $$("#mr .opt").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); selR = b.dataset.k; tryPair(); });
    return () => [true, ""]; }
};
EX.s2t = EX.t2s = EX.listen = EX.choice;

/** Affiche l'étape en cours. */
function step(){
  if (R.n >= R.steps.length || (R.end && Date.now() >= R.end)) return endRun();
  const t = T(), s = R.steps[R.n], i = s.i, tw = word(i, S.target), sw = word(i, S.source);
  const reg = ITEMS[i][1] ? ` <span class="tag">${esc(t.regional)} ${LANGS[S.target].flag}</span>` : "";
  const check = EX[s.k](s, tw, sw, reg);
  const g = $("#go");
  if (check === "auto"){ g.disabled = false; g.textContent = t.next; g.onclick = () => { R.n++; step(); }; return; }
  g.onclick = () => {
    if (g.dataset.st === "next"){ R.n++; step(); return; }
    const [ok, right, rl] = check(); R.total++;
    if (ok){ R.good++; grade(i, true); addXp(R.double ? 4 : 2); }
    else { grade(i, false); if (R.retry && !R.wrong.has(i)){ R.wrong.add(i); R.steps.push({ k: "s2t", i }); } }
    $("#fb").className = "fb " + (ok ? "good" : "bad");
    const rw = right ? part(right, rl || S.target) : null;
    $("#fb").innerHTML = ok ? `✅ ${esc(t.ok)}` : `❌ ${esc(t.ko)} ${lt(rl || S.target, right)}${rw ? romHtml(rw, rl || S.target) : ""}`;
    if (s.k !== "match") speak(tw.t, S.target);
    g.textContent = t.next; g.dataset.st = "next"; g.disabled = false; g.focus();
  };
}
function endRun(){ clearInterval(R.tick); const pct = R.total ? Math.round(R.good * 100 / R.total) : 100; R.onFinish(pct, R); }

/* ---------- Leçon d'un thème ---------- */
/** Prépare les étapes d'une leçon. Rythme intensif : 2 exercices différents par phrase. */
function buildSteps(theme){
  const its = shuffle(itemsOf(theme)), known = srsOf(S.target), steps = [], th = themeOf(theme);
  if (th && th.tip) steps.push({ k: "tip", i: its[0] });
  its.forEach(i => {
    const w = word(i, S.target), multi = w.t.trim().split(/\s+/).length > 2 && !NO_SPACE[S.target], gap = /\[.+?\]/.test(w.raw);
    if (!known[i]) steps.push({ k: "intro", i });
    const pool = ["s2t", "t2s", "listen"];
    if (!NO_SPACE[S.target]) pool.push("type", "dict");
    if (multi) pool.push("order", "order");
    if (gap) pool.push("cloze", "cloze", "cloze");
    if (Mic.ready() && multi) pool.push("speak");
    const reps = S.pace === "intensif" ? 2 : 1, chosen = shuffle(pool).filter((k, j, a) => a.indexOf(k) === j).slice(0, reps);
    chosen.forEach(k => steps.push({ k, i }));
  });
  if (its.length >= 4) steps.push({ k: "match", i: its[0] });
  return steps;
}
VIEWS.lesson = function(m, theme){
  runSteps(m, { theme, steps: buildSteps(theme), onFinish(pct){
    const t = T(), bonus = 5 + Math.round(pct / 10);
    addXp(bonus); const d = S.done[S.target] || (S.done[S.target] = {}); d[theme] = Math.max(d[theme] || 0, pct); save();
    m.innerHTML = `<section class="card hero pop">${BIBI}<div><h1>🎉 ${esc(t.done)}</h1><p>${pct}% · +${bonus + R.good * 2} ${esc(t.earned)}</p></div></section>
    <div class="row"><button class="btn" id="again">↻ ${esc(t.start)}</button><button class="btn alt" id="back">${esc(t.lessons)}</button></div>`;
    $("#again").onclick = () => go("lesson", theme); $("#back").onclick = () => go("lessons");
  }});
};
