/* BIBILEARN — logique de l'application (vanilla JS, 100 % hors ligne) */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY = 864e5, BOXES = [0,1,2,4,7,15,30];
const LV = [0,200,600,1200];
const HTML_LANG = {en:"en-GB",it:"it",fr:"fr",ro:"ro",ptBR:"pt-BR",ptPT:"pt-PT",esES:"es-ES",esMX:"es-MX",esAR:"es-AR",de:"de",ru:"ru",el:"el",nl:"nl",ja:"ja",zh:"zh-CN"};
const NO_SPACE = {ja:1,zh:1};

/* ---------- Stockage ---------- */
const KEY = "bibilearn.v1";
const DEF = {ui:"fr",target:"en",source:"fr",xp:0,xpBy:{},day:"",dayXp:0,streak:0,last:"",goal:30,big:false,contrast:false,rom:true,acc:true,rate:0.9,srs:{},done:{},read:{}};
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch(e){ S = Object.assign({}, DEF); }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
const T = () => UI[S.ui] || UI.fr;

/* ---------- Contenu ---------- */
const col = l => LANG_ORDER.indexOf(l);
function part(raw){ const [t, r] = String(raw).split("|"); return {t, r: r || ""}; }
function word(i, l){ return part(ITEMS[i][2][col(l)]); }
function sent(st, k, l){ return part(st.s[k][col(l)]); }
function themeName(th){ return th[S.ui] || th.fr; }
function itemsOf(theme){ const a=[]; ITEMS.forEach((it,i)=>{ if(it[0]===theme) a.push(i); }); return a; }
function lt(l, text, cls){ return `<span lang="${HTML_LANG[l]}" class="${cls||""}">${esc(text)}</span>`; }
function romHtml(p){ return (S.rom && p.r) ? `<div class="rom">${esc(p.r)}</div>` : ""; }
function langLabel(l){ const L = LANGS[l]; return `${L.flag} ${S.ui==="fr" ? L.name : L.native}`; }

/* ---------- Audio (synthèse vocale native) ---------- */
let voices = [];
function loadVoices(){ try { voices = speechSynthesis.getVoices() || []; } catch(e){ voices = []; } }
if ("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(tag){
  const n = v => v.lang.replace("_","-").toLowerCase(), t = tag.toLowerCase(), p = t.split("-")[0];
  const alt = {"es-ar":["es-419","es-us","es-mx"],"es-mx":["es-419","es-us"],"pt-pt":["pt-br"],"en-gb":["en-au","en-us"]}[t] || [];
  const loc = voices.filter(v=>v.localService!==false), pick = list => list.find(v=>n(v)===t) || alt.map(a=>list.find(v=>n(v)===a)).find(Boolean) || list.find(v=>n(v).startsWith(p));
  return pick(loc) || pick(voices);
  return voices.find(v=>n(v)===t) || alt.map(a=>voices.find(v=>n(v)===a)).find(Boolean) || voices.find(v=>n(v).startsWith(p));
}
function speak(text, l){
  const tag = LANGS[l].tts;
  const cap = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
  if (cap){ cap.speak({text, lang:tag, rate:S.rate}).catch(()=>toast(T().noVoice)); return; }
  if (!("speechSynthesis" in window)){ toast(T().noVoice); return; }
  loadVoices();
  const u = new SpeechSynthesisUtterance(text); u.lang = tag; u.rate = S.rate;
  const v = pickVoice(tag); if (v) u.voice = v; else if (voices.length) toast(T().noVoice);
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
/* La reconnaissance vocale du navigateur passe par internet : on ne la propose qu'en ligne,
   et jamais dans l'appli bureau (Electron) ni Android (WebView), où elle n'existe pas. */
const IS_DESKTOP = /Electron/.test(navigator.userAgent);
const canSpeakEx = () => !!SR && navigator.onLine && !IS_DESKTOP && !window.Capacitor;
window.addEventListener("online", ()=>header()); window.addEventListener("offline", ()=>header());

/* ---------- Utilitaires ---------- */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function norm(s){
  s = String(s).toLowerCase().replace(/[.,!?¿¡;:«»“”„"'’()\-。、！？，：；「」…]/g," ").replace(/\s+/g," ").trim();
  if (S.acc) s = s.normalize("NFD").replace(/[̀-ͯ]/g,"");
  return s;
}
function lev(a,b){ const m=[...Array(b.length+1).keys()]; for(let i=1;i<=a.length;i++){ let p=m[0]; m[0]=i; for(let j=1;j<=b.length;j++){ const t=m[j]; m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1)); p=t; } } return m[b.length]; }
function similar(a,b){ a=norm(a); b=norm(b); if(!a||!b) return 0; return 1 - lev(a,b)/Math.max(a.length,b.length); }
function toast(msg){ const d=document.createElement("div"); d.className="toast"; d.setAttribute("role","status"); d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),3200); }
function today(){ const d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function levelOf(xp){ let k=0; LV.forEach((v,i)=>{ if(xp>=v) k=i; }); return k; }

/* ---------- Progression ---------- */
function addXp(n){
  const d = today();
  if (S.day !== d){
    const y = new Date(Date.now()-DAY); const yd = y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
    S.streak = (S.last === yd) ? S.streak + 1 : 1; S.last = d; S.day = d; S.dayXp = 0;
  }
  S.xp += n; S.dayXp += n; S.xpBy[S.target] = (S.xpBy[S.target]||0) + n; save(); header();
}
function srsOf(l){ return S.srs[l] || (S.srs[l] = {}); }
function grade(i, good){
  const m = srsOf(S.target), c = m[i] || {b:0,d:0};
  c.b = good ? Math.min(c.b+1, BOXES.length-1) : 1;
  c.d = Date.now() + BOXES[c.b]*DAY; m[i] = c; save();
}
function dueList(){ const m = srsOf(S.target), now = Date.now(); return Object.keys(m).filter(i=>m[i].d<=now).map(Number); }
function learnedCount(l){ return Object.values(S.srs[l]||{}).filter(c=>c.b>=2).length; }

/* ---------- En-tête & barre de langues ---------- */
function header(){
  const t = T();
  $("#stats").innerHTML = (navigator.onLine ? "" : `<span class="pill" title="${esc(t.offline)}">📴 ${esc(t.offShort)}</span>`) + `<span class="pill" title="${esc(t.streak)}">🔥 ${S.streak}</span><span class="pill">⭐ ${S.xp} ${t.xp}</span>`;
  const opts = sel => LANG_ORDER.map(l=>`<option value="${l}" ${l===sel?"selected":""}>${esc(langLabel(l))}</option>`).join("");
  $("#pair").innerHTML = `<label>${esc(t.learn)}<select id="tgt">${opts(S.target)}</select></label>
   <button class="swap" id="swp" aria-label="${esc(t.swap)}" title="${esc(t.swap)}">⇄</button>
   <label>${esc(t.from)}<select id="src">${opts(S.source)}</select></label>`;
  $("#tgt").onchange = e => setPair(e.target.value, S.source);
  $("#src").onchange = e => setPair(S.target, e.target.value);
  $("#swp").onclick = () => setPair(S.source, S.target);
  document.querySelectorAll("nav.tabs button").forEach(b=>{ b.querySelector("em").textContent = t[b.dataset.v]; b.toggleAttribute("aria-current", b.dataset.v===view); if(b.dataset.v===view) b.setAttribute("aria-current","page"); });
  document.documentElement.lang = S.ui;
  document.body.classList.toggle("big", S.big); document.body.classList.toggle("contrast", S.contrast);
}
function setPair(tg, src){
  if (tg === src){ toast(T().same); header(); return; }
  S.target = tg; S.source = src; save(); header(); go(view==="lesson"||view==="story" ? "home" : view);
}

/* ---------- Mascotte originale « Bibi » ---------- */
const BIBI = `<svg viewBox="0 0 120 120" width="96" height="96" role="img" aria-label="Bibi, la mascotte"><ellipse cx="60" cy="68" rx="44" ry="42" fill="#c9b6f5"/><ellipse cx="60" cy="74" rx="30" ry="26" fill="#fff3c4"/><circle cx="44" cy="54" r="12" fill="#fff"/><circle cx="76" cy="54" r="12" fill="#fff"/><circle cx="46" cy="56" r="6" fill="#2d2a4a"/><circle cx="78" cy="56" r="6" fill="#2d2a4a"/><circle cx="48" cy="54" r="2" fill="#fff"/><circle cx="80" cy="54" r="2" fill="#fff"/><path d="M52 74 Q60 82 68 74" stroke="#2d2a4a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="34" cy="70" r="5" fill="#ffb3c7"/><circle cx="86" cy="70" r="5" fill="#ffb3c7"/><path d="M30 30 L40 44 L24 42Z M90 30 L80 44 L96 42Z" fill="#a58ae8"/><rect x="40" y="92" width="40" height="18" rx="3" fill="#ffd8b1"/><line x1="60" y1="92" x2="60" y2="110" stroke="#5b4bc4" stroke-width="2"/></svg>`;

/* ---------- Vues ---------- */
let view = "home";
function go(v, arg){
  view = v; header();
  const m = $("#main");
  ({home, lessons, review, stories, profile, lesson:startLesson, story:openStory})[v](m, arg);
  const h = m.querySelector("h1"); if (h){ h.setAttribute("tabindex","-1"); h.focus({preventScroll:false}); }
  window.scrollTo(0,0);
}
function home(m){
  const t=T(), pct=Math.min(100, Math.round(S.dayXp*100/S.goal)), lx=S.xpBy[S.target]||0, lv=levelOf(lx);
  const nextTheme = THEMES.find(th=>!(S.done[S.target]||{})[th.id]) || THEMES[0];
  m.innerHTML = `<h1 class="sr">BIBILEARN</h1>
  <section class="card hero">${BIBI}<div><b>${esc(t.tag)}</b><div>${esc(langLabel(S.target))} ← ${esc(langLabel(S.source))}</div><div class="tag">${esc(t.level)} : ${esc(t.lvl[lv])}</div></div></section>
  <section class="card"><h2>${esc(t.goal)} — ${S.dayXp}/${S.goal} ${t.xp}</h2><div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
  <p>🔥 ${S.streak} ${esc(t.streak)} · 📚 ${learnedCount(S.target)} ${esc(t.words)} · 🔁 ${dueList().length} ${esc(t.due)}</p>
  <div class="row"><button class="btn" id="cont">▶ ${esc(t.cont)} : ${nextTheme.icon} ${esc(themeName(nextTheme))}</button>
  ${dueList().length?`<button class="btn alt" id="rev">🔁 ${esc(t.review)}</button>`:""}
  <button class="btn alt" id="inst" hidden>${esc(t.install)}</button></div></section>
  <p class="rom">${esc(t.tip)}</p>`;
  m.querySelector("h1").style.cssText="position:absolute;left:-9999px";
  $("#cont").onclick = () => go("lesson", nextTheme.id);
  if ($("#rev")) $("#rev").onclick = () => go("review");
  if (deferredPrompt){ const b=$("#inst"); b.hidden=false; b.onclick=()=>{ deferredPrompt.prompt(); deferredPrompt=null; b.hidden=true; }; }
}
function lessons(m){
  const t=T(), done=S.done[S.target]||{};
  m.innerHTML = `<h1>${esc(t.lessons)} — ${esc(langLabel(S.target))}</h1><div class="grid">${THEMES.map(th=>{
    const its=itemsOf(th.id), reg=its.filter(i=>ITEMS[i][1]).length;
    return `<button class="tile" data-th="${th.id}"><span class="ic" aria-hidden="true">${th.icon}</span><b>${esc(themeName(th))}</b><small>${its.length} · ${reg} ${esc(t.regional)}${done[th.id]?" · ✅ "+done[th.id]+"%":""}</small></button>`;
  }).join("")}</div>`;
  m.querySelectorAll(".tile").forEach(b=>b.onclick=()=>go("lesson", b.dataset.th));
}

/* ---------- Leçon : exercices variés ---------- */
let L = null;
function buildSteps(theme){
  const its = shuffle(itemsOf(theme)), m = srsOf(S.target), steps = [];
  its.forEach(i=>{
    const multi = word(i,S.target).t.trim().split(/\s+/).length > 2 && !NO_SPACE[S.target];
    if (!m[i]) steps.push({k:"intro", i});
    const pool = ["s2t","t2s","listen"]; if (!NO_SPACE[S.target]) pool.push("type"); if (multi) pool.push("order","order"); if (canSpeakEx() && multi) pool.push("speak");
    steps.push({k: pool[Math.floor(Math.random()*pool.length)], i});
  });
  return steps;
}
function startLesson(m, theme){ L = {theme, steps:buildSteps(theme), n:0, good:0, total:0, retry:new Set(), m}; step(); }
function distract(i, l){
  const want = word(i,l).t, out = new Set([want]);
  const pool = shuffle(itemsOf(ITEMS[i][0]).concat(shuffle(ITEMS.map((_,k)=>k)).slice(0,12)));
  for (const k of pool){ if (out.size>=4) break; const w = word(k,l).t; if (w!==want) out.add(w); }
  return shuffle([...out]);
}
function shell(inner, label){
  const t=T(), pct=Math.round(L.n*100/L.steps.length);
  L.m.innerHTML = `<div class="row" style="justify-content:space-between"><button class="btn alt" id="quit">✕ ${esc(t.quit)}</button><span>${L.n+1}/${L.steps.length}</span></div>
  <div class="bar" style="margin:10px 0" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
  <section class="card pop"><h1>${esc(label)}</h1>${inner}<div id="fb" aria-live="assertive"></div><div class="row" style="margin-top:12px"><button class="btn" id="go" disabled>${esc(t.check)}</button></div></section>`;
  $("#quit").onclick = () => go("lessons");
  const h=L.m.querySelector("h1"); h.setAttribute("tabindex","-1"); h.focus();
}
function step(){
  if (L.n >= L.steps.length) return finish();
  const t=T(), s=L.steps[L.n], i=s.i, tw=word(i,S.target), sw=word(i,S.source), reg = ITEMS[i][1] ? ` <span class="tag">${esc(t.regional)} ${LANGS[S.target].flag}</span>` : "";
  let answer = null, check = null;
  if (s.k==="intro"){
    shell(`<p class="tag">${esc(t.newWord)}</p>${reg}<div class="q">${lt(S.target,tw.t)}</div>${romHtml(tw)}<p>= ${lt(S.source,sw.t)}</p><button class="btn alt" id="say">${esc(t.listenBtn)}</button>`, t.newWord);
    $("#say").onclick=()=>speak(tw.t,S.target); speak(tw.t,S.target);
    const g=$("#go"); g.disabled=false; g.textContent=t.next; g.onclick=()=>{ grade(i,true); L.n++; step(); }; return;
  }
  if (s.k==="s2t" || s.k==="t2s" || s.k==="listen"){
    const ask = s.k==="t2s" ? S.target : S.source, ans = s.k==="t2s" ? S.source : S.target, aw = word(i,ans), qw = word(i,ask);
    const prompt = s.k==="listen" ? `<button class="btn alt" id="say" style="font-size:1.4rem">🔊</button>` : `<div class="q">${lt(ask,qw.t)}</div>${ask===S.target?romHtml(qw):""}${reg}`;
    const ops = distract(i, ans);
    shell(`${prompt}<div class="opts" role="radiogroup">${ops.map((o,k)=>`<button class="opt" role="radio" aria-checked="false" data-v="${esc(o)}" lang="${HTML_LANG[ans]}">${k+1}. ${esc(o)}</button>`).join("")}</div>`, s.k==="listen"?t.listen:t.choose);
    if (s.k==="listen"){ $("#say").onclick=()=>speak(tw.t,S.target); speak(tw.t,S.target); }
    if (s.k==="t2s") speak(tw.t,S.target);
    L.m.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{ L.m.querySelectorAll(".opt").forEach(x=>{x.classList.remove("sel");x.setAttribute("aria-checked","false");}); b.classList.add("sel"); b.setAttribute("aria-checked","true"); answer=b.dataset.v; $("#go").disabled=false; });
    check = () => { const ok = answer===aw.t; L.m.querySelectorAll(".opt").forEach(x=>{ x.disabled=true; if(x.dataset.v===aw.t) x.classList.add("good"); else if(x.dataset.v===answer) x.classList.add("bad"); }); return [ok, aw.t]; };
  }
  if (s.k==="type"){
    shell(`<div class="q">${lt(S.source,sw.t)}</div><label>${esc(t.typeHere)} (${esc(langLabel(S.target))})<br><input type="text" id="inp" lang="${HTML_LANG[S.target]}" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%"></label>`, t.type);
    const inp=$("#inp"); inp.focus(); inp.oninput=()=>{$("#go").disabled=!inp.value.trim();}; inp.onkeydown=e=>{ if(e.key==="Enter" && inp.value.trim()) $("#go").click(); };
    check = () => { const v=inp.value; inp.disabled=true; const ok = norm(v)===norm(tw.t) || (tw.r && norm(v)===norm(tw.r)); return [ok, tw.t]; };
  }
  if (s.k==="order"){
    const toks = tw.t.split(/\s+/), bag = shuffle(toks.map((w,k)=>({w,k}))), pick=[];
    shell(`<div class="q">${lt(S.source,sw.t)}</div><div class="chips" id="ans" aria-label="${esc(t.typeHere)}"></div><div class="chips" id="bag"></div>`, t.order);
    const draw=()=>{ $("#ans").innerHTML = pick.map((p,k)=>`<button class="chip" data-a="${k}" lang="${HTML_LANG[S.target]}">${esc(p.w)}</button>`).join("") || `<span class="rom">${esc(t.empty)}</span>`;
      $("#bag").innerHTML = bag.filter(b=>!pick.includes(b)).map(b=>`<button class="chip" data-k="${b.k}" lang="${HTML_LANG[S.target]}">${esc(b.w)}</button>`).join("");
      L.m.querySelectorAll("#bag .chip").forEach(c=>c.onclick=()=>{ pick.push(bag.find(b=>b.k==c.dataset.k)); draw(); });
      L.m.querySelectorAll("#ans .chip").forEach(c=>c.onclick=()=>{ pick.splice(+c.dataset.a,1); draw(); });
      $("#go").disabled = pick.length!==toks.length; };
    draw();
    check = () => [norm(pick.map(p=>p.w).join(" "))===norm(tw.t), tw.t];
  }
  if (s.k==="speak"){
    shell(`<div class="q">${lt(S.target,tw.t)}</div>${romHtml(tw)}<p>= ${lt(S.source,sw.t)}</p><div class="row"><button class="btn alt" id="say">${esc(t.listenBtn)}</button><button class="btn alt" id="mic">${esc(t.speakBtn)}</button><button class="btn alt" id="skp">${esc(t.skip)}</button></div><p id="heard" class="rom" aria-live="polite"></p>`, t.speak);
    $("#say").onclick=()=>speak(tw.t,S.target);
    $("#skp").onclick=()=>{ L.n++; step(); };
    let heard="";
    $("#mic").onclick=()=>{ try{ const r=new SR(); r.lang=LANGS[S.target].tts; r.interimResults=false; r.maxAlternatives=3;
      r.onresult=e=>{ const alts=[...e.results[0]].map(a=>a.transcript); heard = alts.sort((a,b)=>similar(b,tw.t)-similar(a,tw.t))[0]; $("#heard").textContent=t.heard+" "+heard; $("#go").disabled=false; };
      r.onerror=()=>toast(t.noMic); r.start(); } catch(e){ toast(t.noMic); } };
    check = () => [similar(heard, tw.t) >= .7, tw.t];
  }
  const g=$("#go");
  g.onclick = () => {
    if (g.dataset.st==="next"){ L.n++; step(); return; }
    const [ok, right] = check(); L.total++;
    if (ok){ L.good++; grade(i,true); addXp(2); } else { grade(i,false); if(!L.retry.has(i)){ L.retry.add(i); L.steps.push({k:"s2t", i}); } }
    $("#fb").className = "fb " + (ok?"good":"bad");
    $("#fb").innerHTML = ok ? `✅ ${esc(t.ok)}` : `❌ ${esc(t.ko)} ${lt(S.target,right)}`;
    speak(tw.t, S.target);
    g.textContent = t.next; g.dataset.st="next"; g.disabled=false; g.focus();
  };
}
function finish(){
  const t=T(), pct = L.total ? Math.round(L.good*100/L.total) : 100, bonus = 5 + Math.round(pct/10);
  addXp(bonus); const d = S.done[S.target] || (S.done[S.target]={}); d[L.theme] = Math.max(d[L.theme]||0, pct); save();
  L.m.innerHTML = `<section class="card hero pop">${BIBI}<div><h1>🎉 ${esc(t.done)}</h1><p>${pct}% · +${bonus + L.good*2} ${esc(t.earned)}</p></div></section>
  <div class="row"><button class="btn" id="again">↻ ${esc(t.start)}</button><button class="btn alt" id="back">${esc(t.lessons)}</button></div>`;
  $("#again").onclick=()=>go("lesson", L.theme); $("#back").onclick=()=>go("lessons");
}

/* ---------- Révisions espacées (cartes) ---------- */
function review(m){
  const t=T(), due=shuffle(dueList());
  if (!due.length){ m.innerHTML=`<h1>${esc(t.review)}</h1><section class="card hero">${BIBI}<p>${esc(t.revEmpty)}</p></section>`; return; }
  let k=0;
  const card=()=>{
    if (k>=due.length) return review(m);
    const i=due[k], tw=word(i,S.target), sw=word(i,S.source);
    m.innerHTML=`<h1>${esc(t.review)} · ${k+1}/${due.length}</h1><section class="card flash pop"><div class="q">${lt(S.source,sw.t)}</div><div id="back" hidden><div class="q">${lt(S.target,tw.t)}</div>${romHtml(tw)}</div></section>
    <div class="row" id="ctl"><button class="btn" id="show">${esc(t.show)}</button></div>`;
    $("#show").onclick=()=>{ $("#back").hidden=false; speak(tw.t,S.target);
      $("#ctl").innerHTML=`<button class="btn alt" id="say">${esc(t.listenBtn)}</button><button class="btn warn" id="no">✗ ${esc(t.notyet)}</button><button class="btn" id="yes">✓ ${esc(t.knew)}</button>`;
      $("#say").onclick=()=>speak(tw.t,S.target);
      $("#no").onclick=()=>{ grade(i,false); k++; card(); };
      $("#yes").onclick=()=>{ grade(i,true); addXp(1); k++; card(); }; $("#yes").focus(); };
  };
  card();
}

/* ---------- Histoires bilingues ---------- */
function stories(m){
  const t=T(), rd=S.read[S.target]||[];
  m.innerHTML=`<h1>${esc(t.stories)}</h1><div class="grid">${STORIES.map(st=>`<button class="tile" data-id="${st.id}"><span class="ic" aria-hidden="true">${st.icon}</span><b>${esc(st.title[S.ui]||st.title.fr)}</b><small>${st.level}${rd.includes(st.id)?" · ✅":""}</small></button>`).join("")}</div>`;
  m.querySelectorAll(".tile").forEach(b=>b.onclick=()=>go("story", b.dataset.id));
}
function openStory(m, id){
  const t=T(), st=STORIES.find(x=>x.id===id);
  m.innerHTML=`<h1>${st.icon} ${esc(st.title[S.ui]||st.title.fr)}</h1><p class="rom">${esc(t.tapHint)}</p>
  <div class="row"><button class="btn alt" id="all">${esc(t.readAll)}</button></div>
  <section class="card">${st.s.map((_,k)=>{ const p=sent(st,k,S.target); return `<button class="sent" data-k="${k}">${lt(S.target,p.t)}${S.rom&&p.r?`<span class="rom" style="display:block">${esc(p.r)}</span>`:""}<span class="tr" hidden></span></button>`; }).join("")}</section>
  <div class="row"><button class="btn" id="fin">✓ ${esc(t.finish)}</button><button class="btn alt" id="bk">${esc(t.stories)}</button></div>`;
  m.querySelectorAll(".sent").forEach(b=>b.onclick=()=>{ const k=+b.dataset.k, tr=b.querySelector(".tr"); tr.innerHTML=lt(S.source, sent(st,k,S.source).t); tr.hidden=false; speak(sent(st,k,S.target).t, S.target); });
  $("#all").onclick=()=>speak(st.s.map((_,k)=>sent(st,k,S.target).t).join(" "), S.target);
  $("#fin").onclick=()=>{ const r=S.read[S.target]||(S.read[S.target]=[]); if(!r.includes(id)){ r.push(id); addXp(10); } save(); go("stories"); };
  $("#bk").onclick=()=>go("stories");
}

/* ---------- Profil & réglages ---------- */
function profile(m){
  const t=T();
  const rows = LANG_ORDER.filter(l=>S.xpBy[l]).map(l=>`<tr><td>${esc(langLabel(l))}</td><td>${S.xpBy[l]} ${t.xp}</td><td>${esc(t.lvl[levelOf(S.xpBy[l])])}</td><td>${learnedCount(l)}</td></tr>`).join("");
  m.innerHTML=`<h1>${esc(t.profile)}</h1>
  <section class="card"><h2>${esc(t.progress)}</h2>${rows?`<table><thead><tr><th>${esc(t.lang)}</th><th>${t.xp}</th><th>${esc(t.level)}</th><th>${esc(t.words)}</th></tr></thead><tbody>${rows}</tbody></table>`:`<p>—</p>`}</section>
  <section class="card"><h2>${esc(t.settings)}</h2>
   <div class="set"><label for="ui">${esc(t.uiLang)}</label><select id="ui">${[["fr","🇫🇷 Français"],["ro","🇷🇴 Română"],["en","🇬🇧 English"],["it","🇮🇹 Italiano"]].map(([k,v])=>`<option value="${k}" ${k===S.ui?"selected":""}>${v}</option>`).join("")}</select></div>
   ${[["big",t.big],["contrast",t.contrast],["rom",t.rom],["acc",t.acc]].map(([k,v])=>`<div class="set"><label for="c_${k}">${esc(v)}</label><input type="checkbox" id="c_${k}" ${S[k]?"checked":""}></div>`).join("")}
   <div class="set"><label for="rate">${esc(t.rate)} (${S.rate})</label><input type="range" id="rate" min="0.5" max="1.3" step="0.1" value="${S.rate}"></div>
   <div class="set"><label for="goal">${esc(t.goalSet)}</label><input type="number" id="goal" min="10" max="500" step="10" value="${S.goal}" style="width:100px"></div>
   <div class="row" style="margin-top:12px"><button class="btn alt" id="exp">⬇ ${esc(t.exp)}</button><label class="btn alt" for="imp" tabindex="0">⬆ ${esc(t.imp)}</label><input type="file" id="imp" accept="application/json" hidden><button class="btn warn" id="rst">🗑 ${esc(t.reset)}</button></div>
  </section>
  <section class="card"><h2>🔊 ${esc(t.voices)}</h2><p class="rom">${esc(t.voicesHelp)}</p><table><tbody id="vt"></tbody></table><button class="btn alt" id="vtest">${esc(t.listenBtn)} — ${esc(langLabel(S.target))}</button></section>
  <p class="rom">BIBILEARN 1.1 · ${esc(t.offline)} · Open source (MIT) · 0 pub · 0 compte · 0 donnée envoyée.</p>`;
  const fillV=()=>{ loadVoices(); const cap=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.TextToSpeech;
    $("#vt").innerHTML = LANG_ORDER.map(l=>{ let st;
      if (cap) st = "📱 " + t.sysVoice;
      else { const v=pickVoice(LANGS[l].tts); st = !v ? "⚠️ "+t.vNone : (v.localService===false ? "🌐 "+t.vOnline : "✅ "+t.vLocal); }
      return `<tr><td>${esc(langLabel(l))}</td><td>${esc(st)}</td></tr>`; }).join(""); };
  fillV(); if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged=()=>{ loadVoices(); fillV(); };
  $("#vtest").onclick=()=>speak(word(9,S.target).t, S.target);
  $("#ui").onchange=e=>{ S.ui=e.target.value; save(); go("profile"); };
  ["big","contrast","rom","acc"].forEach(k=>$("#c_"+k).onchange=e=>{ S[k]=e.target.checked; save(); go("profile"); });
  $("#rate").onchange=e=>{ S.rate=+e.target.value; save(); go("profile"); };
  $("#goal").onchange=e=>{ S.goal=Math.max(10,+e.target.value||30); save(); };
  $("#exp").onclick=()=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:"application/json"})); a.download="bibilearn-progression.json"; a.click(); };
  $("#imp").onchange=e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(x=>{ try{ S=Object.assign({},DEF,JSON.parse(x)); save(); toast(t.imported); go("profile"); }catch(err){ toast("JSON ?"); } }); };
  $("#rst").onclick=()=>{ if(confirm(t.confirm)){ S=Object.assign({},DEF,{ui:S.ui}); save(); go("home"); } };
}

/* ---------- Démarrage ---------- */
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); deferredPrompt=e; if(view==="home") go("home"); });
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>go(b.dataset.v));
document.addEventListener("keydown", e=>{ if(view==="lesson" && /^[1-4]$/.test(e.key) && document.activeElement.tagName!=="INPUT"){ const o=document.querySelectorAll(".opt")[+e.key-1]; if(o && !o.disabled) o.click(); } });
const isApp = window.Capacitor || /Electron/.test(navigator.userAgent);
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !isApp) navigator.serviceWorker.register("sw.js").catch(()=>{});
go("home");
window.__BIBI = { S:()=>S, go, ITEMS, STORIES };
})();
