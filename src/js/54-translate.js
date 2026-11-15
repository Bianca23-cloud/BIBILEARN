/* =====================================================================
   54 · TRADUCTEUR : langue d'entrée ⇄ langue de sortie, deux micros, voix natives
   Comment une phrase est traduite :
   1. Phrase du cours (≈ 250 phrases × 15 langues) → traduction exacte, voix native
      enregistrée, translittération : marche SANS internet.
   2. Sinon, si internet est là → traduction gratuite en ligne (Google Translate,
      puis MyMemory en secours), avec la translittération fournie par Google.
   3. Sinon (hors ligne) → on propose les phrases du cours les plus proches.
   ===================================================================== */
const GOOGLE = {en:"en",it:"it",fr:"fr",ro:"ro",ptBR:"pt",ptPT:"pt-PT",esES:"es",esMX:"es",esAR:"es",de:"de",ru:"ru",el:"el",nl:"nl",ja:"ja",zh:"zh-CN"};

/** fetch avec délai maximal (une connexion lente ne bloque pas l'appli). */
async function getJson(url, ms){
  const c = new AbortController(), timer = setTimeout(() => c.abort(), ms || 7000);
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); }
  finally { clearTimeout(timer); }
}
/** Traduction en ligne : Google (avec translittération), puis MyMemory. */
async function onlineTranslate(text, from, to){
  try {
    const d = await getJson(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${GOOGLE[from]}&tl=${GOOGLE[to]}&dt=t&dt=rm&q=${encodeURIComponent(text)}`);
    const segs = d[0] || [], out = segs.filter(s => typeof s[0] === "string").map(s => s[0]).join("");
    const rm = segs.find(s => s[0] == null && (s[2] || s[3])) || [];
    if (out) return { t: out, r: rm[2] || "", rIn: rm[3] || "", via: "google" };
  } catch (e) {}
  const d = await getJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${LANGS[from].tts}|${LANGS[to].tts}`);
  const out = d && d.responseData && d.responseData.translatedText;
  if (!out) throw new Error("no translation");
  return { t: out, r: "", via: "mymemory" };
}
/** Traduit un texte. Renvoie { t, r (translittération), src: "book" | "online" | "near", near: [...] } */
async function translateText(text, from, to){
  text = text.trim(); if (!text) return null;
  const hit = bookExact(text, from);
  if (hit){ const p = hit.get(to); return { t: p.t, r: p.r, src: "book", inR: hit.get(from).r }; }
  if (navigator.onLine){
    try { const o = await onlineTranslate(text, from, to);
      const r = o.r || (TR[to] ? translit(o.t, to) : ""), inR = o.rIn || (TR[from] ? translit(text, from) : "");
      return { t: o.t, r, inR, src: "online", via: o.via };
    } catch (e) {}
  }
  const near = bookNearest(text, from, 4);
  return { t: "", r: "", src: "near", near };
}

VIEWS.translate = function(m){
  const t = T(), tr = S.tr;
  if (tr.from === tr.to) tr.to = tr.from === "en" ? "fr" : "en";
  m.innerHTML = `<h1>🌐 ${esc(t.translate)}</h1>
  <section class="card">
   <div class="pairbar inline"><label>${esc(t.inLang)}<select id="trFrom">${langOptions(tr.from)}</select></label>
   <button class="swap" id="trSwap" aria-label="${esc(t.swap)}" title="${esc(t.swap)}">⇄</button>
   <label>${esc(t.outLang)}<select id="trTo">${langOptions(tr.to)}</select></label></div>
   <label for="trIn" class="sr">${esc(t.typeHere)}</label>
   <textarea id="trIn" rows="3" lang="${HTML_LANG[tr.from]}" placeholder="${esc(t.trPlaceholder)}"></textarea>
   <div id="trInRom" class="rom"></div>
   <div class="row"><button class="btn" id="doTr">➜ ${esc(t.translateBtn)}</button>
   <button class="btn alt" id="micFrom">🎤 ${esc(LANGS[tr.from].native)}</button>
   <button class="btn alt" id="sayIn" aria-label="${esc(t.listenBtn)}">🔊</button>
   <button class="btn alt" id="clr" aria-label="${esc(t.clear)}">✕</button></div>
   <div id="sug" class="chips" aria-label="${esc(t.suggest)}"></div>
  </section>
  <section class="card" id="outCard" hidden aria-live="polite"></section>
  <section class="card"><h2>💬 ${esc(t.convTitle)}</h2><p class="rom">${esc(t.convHelp)}</p>
   <div class="row"><button class="btn big" id="cvA">🎤 ${esc(langLabel(tr.from))}</button><button class="btn big alt" id="cvB">🎤 ${esc(langLabel(tr.to))}</button></div>
   <div id="micMsg" class="rom" aria-live="polite"></div>
   <div id="conv"></div></section>
  <section class="card"><h2>🕘 ${esc(t.history)}</h2><div id="hist"></div></section>
  <p class="rom">${esc(t.trHelp)}</p>`;
  const inp = $("#trIn");
  const setLangs = (f, o) => { if (f === o){ toast(t.same); return; } tr.from = f; tr.to = o; save(); const v = inp.value; VIEWS.translate(m); $("#trIn").value = v; showSug(); };
  $("#trFrom").onchange = e => setLangs(e.target.value, tr.to);
  $("#trTo").onchange = e => setLangs(tr.from, e.target.value);
  $("#trSwap").onclick = () => { const outTxt = ($("#outCard [data-out]") || {}).textContent || ""; setLangs(tr.to, tr.from); if (outTxt) { $("#trIn").value = outTxt; showSug(); doTranslate(); } };
  $("#clr").onclick = () => { inp.value = ""; $("#outCard").hidden = true; showSug(); inp.focus(); };
  $("#sayIn").onclick = () => inp.value.trim() && speak(inp.value.trim(), tr.from);
  $("#doTr").onclick = () => doTranslate();
  inp.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); doTranslate(); } };
  inp.oninput = () => showSug();

  /** Suggestions du recueil (hors ligne) pendant la frappe. */
  function showSug(){
    const q = $("#trIn").value, box = $("#sug"), rom = $("#trInRom");
    const ex = bookExact(q, tr.from); rom.textContent = S.rom && NON_LATIN[tr.from] && q.trim() ? (ex ? ex.get(tr.from).r : (TR[tr.from] ? translit(q, tr.from) : "")) : "";
    if (!q.trim() || ex){ box.innerHTML = ""; return; }
    box.innerHTML = bookNearest(q, tr.from, 5).map((x, k) => `<button class="chip" data-k="${k}" lang="${HTML_LANG[tr.from]}">📚 ${esc(x.b.get(tr.from).t)}</button>`).join("");
    const list = bookNearest(q, tr.from, 5);
    $$("#sug .chip").forEach(c => c.onclick = () => { $("#trIn").value = list[+c.dataset.k].b.get(tr.from).t; showSug(); doTranslate(); });
  }
  /** Traduit la zone de texte et affiche le résultat. */
  async function doTranslate(text){
    text = (text || $("#trIn").value).trim(); if (!text) return;
    const out = $("#outCard"); out.hidden = false; out.innerHTML = `<p>⏳ ${esc(t.translating)}</p>`;
    const res = await translateText(text, tr.from, tr.to);
    if (res.inR && S.rom && NON_LATIN[tr.from]) $("#trInRom").textContent = res.inR;
    renderOut(out, res, text);
  }
  function badge(res){
    if (res.src === "book") return `<span class="tag">📚 ${esc(t.srcBook)}</span>`;
    if (res.src === "online") return `<span class="tag">🌐 ${esc(t.srcOnline)}${["esMX","esAR","ptPT"].includes(tr.to) && res.via === "google" ? " · " + esc(t.srcGeneric) : ""}</span>`;
    return "";
  }
  function renderOut(out, res, text){
    if (res.src === "near"){
      out.innerHTML = `<p>📴 ${esc(navigator.onLine ? t.trFail : t.trOffline)}</p>` + (res.near.length ? `<p>${esc(t.trNear)}</p>` + res.near.map((x, k) => `<button class="sent" data-k="${k}">${txt(tr.from, x.b.get(tr.from))}<span class="tr">→ ${txt(tr.to, x.b.get(tr.to))}</span></button>`).join("") : "");
      $$("#outCard .sent").forEach(b => b.onclick = () => { const e = res.near[+b.dataset.k].b; $("#trIn").value = e.get(tr.from).t; doTranslate(); });
      return;
    }
    out.innerHTML = `${badge(res)}<div class="q" data-out lang="${HTML_LANG[tr.to]}">${esc(res.t)}</div>${romHtml(res, tr.to)}
    <div class="row"><button class="btn" id="sayOut">🔊 ${esc(t.listenBtn.replace("🔊 ", ""))}</button><button class="btn alt" id="copy">📋 ${esc(t.copy)}</button>
    <button class="btn alt" id="micTo">🎤 ${esc(t.answerIn)} ${esc(LANGS[tr.to].native)}</button></div>`;
    $("#sayOut").onclick = () => speak(res.t, tr.to); speak(res.t, tr.to);
    $("#copy").onclick = () => { try { navigator.clipboard.writeText(res.t).then(() => toast(t.copied)); } catch (e) {} };
    $("#micTo").onclick = () => talk(tr.to, tr.from);
    tr.hist = [{ f: tr.from, o: tr.to, a: text, b: res.t, r: res.r }].concat(tr.hist.filter(h => h.a !== text)).slice(0, 12); save(); drawHist();
  }
  /** Conversation : une personne parle dans la langue « who », on traduit vers « into » et on lit la traduction. */
  async function talk(who, into){
    const msg = $("#micMsg"); msg.textContent = "🎙️ " + t.listening + " (" + LANGS[who].native + ")";
    try {
      const alts = await Mic.listen(who), said = alts[0] || "";
      if (!said){ msg.textContent = ""; return; }
      msg.textContent = "⏳ " + t.translating;
      const res = await translateText(said, who, into); msg.textContent = "";
      const said_p = { t: said, r: res && res.inR || (TR[who] ? translit(said, who) : "") };
      const line = res && res.t ? res : { t: "—", r: "" };
      $("#conv").insertAdjacentHTML("afterbegin", `<div class="bubble ${who === tr.from ? "a" : "b"}"><div>${txt(who, said_p)}</div><div class="tr">→ ${txt(into, line)}</div><button class="btn alt small" aria-label="${esc(t.listenBtn)}">🔊</button></div>`);
      const b = $("#conv .bubble button"); b.onclick = () => speak(line.t, into);
      if (res && res.t) speak(res.t, into);
    } catch (e) { msg.innerHTML = esc(Mic.explain(e.code)) + (e.code === "desktop" ? ` <button class="btn alt small" id="openWeb">🌐 ${esc(t.openEdge)}</button>` : "");
      if ($("#openWeb")) $("#openWeb").onclick = () => window.open(ONLINE_APP_URL + "#translate", "_blank"); }
  }
  $("#micFrom").onclick = async () => {
    const msg = $("#micMsg"); msg.textContent = "🎙️ " + t.listening + " (" + LANGS[tr.from].native + ")";
    try { const alts = await Mic.listen(tr.from); msg.textContent = ""; if (alts[0]){ $("#trIn").value = alts[0]; showSug(); doTranslate(); } }
    catch (e) { msg.innerHTML = esc(Mic.explain(e.code)) + (e.code === "desktop" ? ` <button class="btn alt small" id="openWeb">🌐 ${esc(t.openEdge)}</button>` : "");
      if ($("#openWeb")) $("#openWeb").onclick = () => window.open(ONLINE_APP_URL + "#translate", "_blank"); }
  };
  $("#cvA").onclick = () => talk(tr.from, tr.to);
  $("#cvB").onclick = () => talk(tr.to, tr.from);
  function drawHist(){
    $("#hist").innerHTML = tr.hist.length ? tr.hist.map((h, k) => `<button class="sent" data-h="${k}">${lt(h.f, h.a)} <span class="tr">→ ${lt(h.o, h.b)}${S.rom && NON_LATIN[h.o] && h.r ? `<span class="rom" style="display:block">${esc(h.r)}</span>` : ""}</span></button>`).join("") : "<p>—</p>";
    $$("#hist .sent").forEach(b => b.onclick = () => { const h = tr.hist[+b.dataset.h]; speak(h.b, h.o); });
  }
  drawHist();
};
