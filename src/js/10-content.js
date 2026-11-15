/* =====================================================================
   10 · CONTENU : lecture des données, translittération, recherche de phrases
   ===================================================================== */

/** Numéro de colonne d'une langue dans ITEMS / STORIES. */
const col = l => LANG_ORDER.indexOf(l);

/* ---------- Translittération automatique (russe, grec) ----------
   Le japonais et le chinois ont leur translittération écrite dans les données (« texte|romaji »). */
const TR = {
  ru:{"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"kh","ц":"ts","ч":"ch","ш":"sh","щ":"shch","ъ":"","ы":"y","ь":"'","э":"e","ю":"yu","я":"ya"},
  el:{"α":"a","ά":"á","β":"v","γ":"g","δ":"d","ε":"e","έ":"é","ζ":"z","η":"i","ή":"í","θ":"th","ι":"i","ί":"í","ϊ":"i","ΐ":"í","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"x","ο":"o","ό":"ó","π":"p","ρ":"r","σ":"s","ς":"s","τ":"t","υ":"y","ύ":"ý","ϋ":"y","φ":"f","χ":"ch","ψ":"ps","ω":"o","ώ":"ó"}
};
/** Écrit un texte russe ou grec en lettres latines. */
function translit(text, l){
  const map = TR[l]; if (!map) return "";
  if (l === "el") text = text.replace(/ου/g, "ou").replace(/ού/g, "oú").replace(/Ου/g, "Ou").replace(/αυ/g, "av").replace(/ευ/g, "ev");
  return [...text].map(ch => { const lo = ch.toLowerCase(), v = map[lo];
    if (v === undefined) return ch;
    return (ch !== lo && v) ? v[0].toUpperCase() + v.slice(1) : v; }).join("");
}

/** Découpe une donnée brute « texte|translittération ».
    Renvoie { t: texte affiché, raw: texte avec [crochets], r: translittération (toujours remplie pour ru/el/ja/zh si possible) }. */
function part(raw, l){
  const [x, r] = String(raw).split("|");
  const t = x.replace(/[\[\]]/g, "");
  return { t, raw: x, r: r || (TR[l] ? translit(t, l) : "") };
}
const word = (i, l) => part(ITEMS[i][2][col(l)], l);
const sent = (st, k, l) => part(st.s[k][col(l)], l);
const themeOf = id => THEMES.find(t => t.id === id);
const themeName = th => th[S.ui] || th.fr;
const itemsOf = theme => ITEMS.map((it, i) => it[0] === theme ? i : -1).filter(i => i >= 0);
const levelOfTheme = th => th.level || "A1";
const themesOfLevel = id => THEMES.filter(th => levelOfTheme(th) === id);
const itemsOfLevel = id => themesOfLevel(id).flatMap(th => itemsOf(th.id));

/* ---------- Affichage d'un texte dans sa langue (+ translittération) ---------- */
/** <span lang="…"> : les lecteurs d'écran et les polices choisissent la bonne prononciation/écriture. */
function lt(l, text, cls){ return `<span lang="${HTML_LANG[l]}" class="${cls || ""}">${esc(text)}</span>`; }
/** Ligne de translittération (affichée pour toutes les langues non latines quand l'option est active). */
function romHtml(p, l){ return (S.rom && p.r && (!l || NON_LATIN[l])) ? `<div class="rom" lang="${l ? HTML_LANG[l] + "-Latn" : ""}">${esc(p.r)}</div>` : ""; }
/** Texte + translittération, en une fois. */
function txt(l, p, cls){ return lt(l, p.t, cls) + romHtml(p, l); }
function langLabel(l){ const L = LANGS[l]; return `${L.flag} ${S.ui === "fr" ? L.name : L.native}`; }
function langOptions(sel){ return LANG_ORDER.map(l => `<option value="${l}" ${l === sel ? "selected" : ""}>${esc(langLabel(l))}</option>`).join(""); }

/* ---------- Recueil de phrases (pour le traducteur hors ligne) ----------
   Toutes les phrases du cours et des histoires existent dans les 15 langues :
   on peut donc les traduire SANS internet, avec la voix native enregistrée. */
const BOOK = [];
ITEMS.forEach((it, i) => BOOK.push({ get: l => word(i, l) }));
STORIES.forEach(st => st.s.forEach((_, k) => BOOK.push({ get: l => sent(st, k, l) })));
const bookIndex = {};
/** Index (texte normalisé → entrée) d'une langue, construit à la demande. */
function bookFor(l){
  if (!bookIndex[l]){ const m = new Map(); BOOK.forEach(b => { const n = norm(b.get(l).t); if (n && !m.has(n)) m.set(n, b); }); bookIndex[l] = m; }
  return bookIndex[l];
}
/** Phrase identique dans le recueil ? */
function bookExact(text, l){ return bookFor(l).get(norm(text)) || null; }
/** Les phrases du recueil les plus proches d'un texte (suggestions). */
function bookNearest(text, l, n){
  const q = norm(text); if (!q) return [];
  return BOOK.map(b => { const t = b.get(l).t, nt = norm(t);
      const score = nt.includes(q) ? 0.9 + q.length / (nt.length * 10) : similar(q, nt);
      return { b, score }; })
    .filter(x => x.score >= 0.45).sort((a, b) => b.score - a.score).slice(0, n || 5);
}
