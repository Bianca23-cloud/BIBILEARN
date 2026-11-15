/* =====================================================================
   56 · PROFIL & RÉGLAGES : progression par langue, niveaux, voix, micro, sauvegarde
   ===================================================================== */
let voicesCached = null;                    // version web : [voix déjà téléchargées, total]

VIEWS.profile = function(m){
  const t = T(), cur = levelIdx(S.target);
  const rows = LANG_ORDER.filter(l => S.xpBy[l]).map(l => `<tr><td>${esc(langLabel(l))}</td><td>${S.xpBy[l]} ${t.xp}</td><td>${esc(levelName(levelIdx(l)))}</td><td>${learnedCount(l)}</td></tr>`).join("");
  const micKind = Mic.kind(), micTxt = { android: "✅ " + t.micAndroid, web: (navigator.onLine ? "✅ " : "📴 ") + t.micWeb, desktop: "ℹ️ " + t.micDesktop, none: "⚠️ " + t.noMic }[micKind];
  m.innerHTML = `<h1>${esc(t.profile)}</h1>
  <section class="card"><h2>${esc(t.progress)}</h2>${rows ? `<table><thead><tr><th>${esc(t.lang)}</th><th>${t.xp}</th><th>${esc(t.level)}</th><th>${esc(t.words)}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p>—</p>`}</section>
  <section class="card"><h2>🎓 ${esc(t.levels)} — ${esc(langLabel(S.target))}</h2><table><tbody>${levelStats(S.target).map((p, i) => `<tr><td>${i < cur ? "✅" : i === cur ? "▶" : "⬜"} ${esc(levelName(i))}</td><td style="width:45%">${bar(p, levelName(i))}</td><td>${p}%</td></tr>`).join("")}</tbody></table></section>
  <section class="card"><h2>${esc(t.settings)}</h2>
   <div class="set"><label for="ui">${esc(t.uiLang)}</label><select id="ui">${[["fr","🇫🇷 Français"],["ro","🇷🇴 Română"],["en","🇬🇧 English"],["it","🇮🇹 Italiano"]].map(([k, v]) => `<option value="${k}" ${k === S.ui ? "selected" : ""}>${v}</option>`).join("")}</select></div>
   <div class="set"><label for="pace">${esc(t.pace)}</label><select id="pace"><option value="normal" ${S.pace !== "intensif" ? "selected" : ""}>${esc(t.paceNormal)}</option><option value="intensif" ${S.pace === "intensif" ? "selected" : ""}>${esc(t.paceFast)}</option></select></div>
   ${[["big", t.big], ["contrast", t.contrast], ["rom", t.rom], ["acc", t.acc]].map(([k, v]) => `<div class="set"><label for="c_${k}">${esc(v)}</label><input type="checkbox" id="c_${k}" ${S[k] ? "checked" : ""}></div>`).join("")}
   <div class="set"><label for="rate">${esc(t.rate)} (${S.rate})</label><input type="range" id="rate" min="0.5" max="1.3" step="0.1" value="${S.rate}"></div>
   <div class="set"><label for="goal">${esc(t.goalSet)}</label><input type="number" id="goal" min="10" max="500" step="10" value="${S.goal}" style="width:100px"></div>
   <div class="row" style="margin-top:12px"><button class="btn alt" id="exp">⬇ ${esc(t.exp)}</button><label class="btn alt" for="imp" tabindex="0">⬆ ${esc(t.imp)}</label><input type="file" id="imp" accept="application/json" hidden><button class="btn warn" id="rst">🗑 ${esc(t.reset)}</button></div>
  </section>
  <section class="card"><h2>🔊 ${esc(t.voices)}</h2><p class="rom">${esc(t.voicesHelp)}</p>${voicesCached ? `<p>📥 ${esc(t.offlineVoices)} : <b id="vc">${voicesCached.join(" / ")}</b></p>` : ""}<table><tbody id="vt"></tbody></table><button class="btn alt" id="vtest">${esc(t.listenBtn)} — ${esc(langLabel(S.target))}</button></section>
  <section class="card"><h2>🎤 ${esc(t.micTitle)}</h2><p>${esc(micTxt)}</p></section>
  <p class="rom">BIBILEARN ${VERSION} · ${esc(t.offline)} · Open source (MIT) · 0 pub · 0 compte.</p>`;
  const fillV = () => { loadVoices(); const cap = capPlugin("TextToSpeech");
    $("#vt").innerHTML = LANG_ORDER.map(l => { const v = pickVoice(LANGS[l].tts);
      const free = cap ? "📱 " + t.sysVoice : !v ? "⚠️ " + t.vNone : (v.localService === false ? "🌐 " + t.vOnline : "✅ " + t.vLocal);
      return `<tr><td>${esc(langLabel(l))}</td><td>${HAS_AUDIO ? "🎧 " + esc(t.vNative) : ""}</td><td>${esc(t.freeText)} : ${esc(free)}</td></tr>`; }).join(""); };
  fillV(); if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = () => { loadVoices(); fillV(); };
  $("#vtest").onclick = () => speak(word(9, S.target).t, S.target);
  $("#ui").onchange = e => { S.ui = e.target.value; save(); go("profile"); };
  $("#pace").onchange = e => { S.pace = e.target.value; if (S.pace === "intensif" && S.goal < 60) S.goal = 60; save(); go("profile"); };
  ["big", "contrast", "rom", "acc"].forEach(k => $("#c_" + k).onchange = e => { S[k] = e.target.checked; save(); go("profile"); });
  $("#rate").onchange = e => { S.rate = +e.target.value; save(); go("profile"); };
  $("#goal").onchange = e => { S.goal = Math.max(10, +e.target.value || 30); save(); };
  $("#exp").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" })); a.download = "bibilearn-progression.json"; a.click(); };
  $("#imp").onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(x => { try { S = Object.assign({}, DEF, JSON.parse(x)); save(); toast(t.imported); go("profile"); } catch (err) { toast("JSON ?"); } }); };
  $("#rst").onclick = () => { if (confirm(t.confirm)){ S = Object.assign({}, DEF, { ui: S.ui }); save(); go("home"); } };
};
