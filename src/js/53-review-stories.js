/* =====================================================================
   53 · RÉVISIONS ESPACÉES (cartes) et HISTOIRES BILINGUES
   ===================================================================== */
VIEWS.review = function(m){
  const t = T(), due = shuffle(dueList());
  if (!due.length){ m.innerHTML = `<h1>${esc(t.review)}</h1><section class="card hero">${BIBI}<p>${esc(t.revEmpty)}</p></section>`; return; }
  let k = 0;
  const card = () => {
    if (k >= due.length) return VIEWS.review(m);
    const i = due[k], tw = word(i, S.target), sw = word(i, S.source);
    m.innerHTML = `<h1>${esc(t.review)} · ${k + 1}/${due.length}</h1><section class="card flash pop"><div class="q">${txt(S.source, sw)}</div><div id="back" hidden><div class="q">${txt(S.target, tw)}</div></div></section>
    <div class="row" id="ctl"><button class="btn" id="show">${esc(t.show)}</button></div>`;
    $("#show").onclick = () => { $("#back").hidden = false; speak(tw.t, S.target);
      $("#ctl").innerHTML = `<button class="btn alt" id="say">${esc(t.listenBtn)}</button><button class="btn warn" id="no">✗ ${esc(t.notyet)}</button><button class="btn" id="yes">✓ ${esc(t.knew)}</button>`;
      $("#say").onclick = () => speak(tw.t, S.target);
      $("#no").onclick = () => { grade(i, false); k++; card(); };
      $("#yes").onclick = () => { grade(i, true); addXp(1); k++; card(); }; $("#yes").focus(); };
  };
  card();
};

VIEWS.stories = function(m){
  const t = T(), rd = S.read[S.target] || [];
  m.innerHTML = `<h1>${esc(t.stories)}</h1><div class="grid">${STORIES.map(st => `<button class="tile" data-id="${st.id}"><span class="ic" aria-hidden="true">${st.icon}</span><b>${esc(st.title[S.ui] || st.title.fr)}</b><small>${st.level}${rd.includes(st.id) ? " · ✅" : ""}</small></button>`).join("")}</div>`;
  $$(".tile").forEach(b => b.onclick = () => go("story", b.dataset.id));
};
VIEWS.story = function(m, id){
  const t = T(), st = STORIES.find(x => x.id === id);
  m.innerHTML = `<h1>${st.icon} ${esc(st.title[S.ui] || st.title.fr)}</h1><p class="rom">${esc(t.tapHint)}</p>
  <div class="row"><button class="btn alt" id="all">${esc(t.readAll)}</button></div>
  <section class="card">${st.s.map((_, k) => `<button class="sent" data-k="${k}">${txt(S.target, sent(st, k, S.target))}<span class="tr" hidden></span></button>`).join("")}</section>
  <div class="row"><button class="btn" id="fin">✓ ${esc(t.finish)}</button><button class="btn alt" id="bk">${esc(t.stories)}</button></div>`;
  $$(".sent").forEach(b => b.onclick = () => { const k = +b.dataset.k, tr = b.querySelector(".tr"); tr.innerHTML = txt(S.source, sent(st, k, S.source)); tr.hidden = false; speak(sent(st, k, S.target).t, S.target); });
  $("#all").onclick = () => speakSeq(st.s.map((_, k) => sent(st, k, S.target).t), S.target);
  $("#fin").onclick = () => { const r = S.read[S.target] || (S.read[S.target] = []); if (!r.includes(id)){ r.push(id); addXp(10); } save(); go("stories"); };
  $("#bk").onclick = () => go("stories");
};
