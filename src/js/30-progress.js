/* =====================================================================
   30 · PROGRESSION : XP, série de jours, répétition espacée, niveaux A1 → C2
   ===================================================================== */

/** Ajoute des points d'expérience et met à jour la série de jours. */
function addXp(n){
  const d = today();
  if (S.day !== d){
    const yd = today(new Date(Date.now() - DAY));
    S.streak = (S.last === yd) ? S.streak + 1 : 1; S.last = d; S.day = d; S.dayXp = 0;
  }
  S.xp += n; S.dayXp += n; S.xpBy[S.target] = (S.xpBy[S.target] || 0) + n; save(); header();
}

/* ---------- Répétition espacée (boîtes de Leitner) ---------- */
const srsOf = l => S.srs[l] || (S.srs[l] = {});
/** Bonne réponse → boîte suivante (révision plus tard) ; erreur → retour à la boîte 1 (révision demain). */
function grade(i, good){
  const m = srsOf(S.target), c = m[i] || { b: 0, d: 0 };
  c.b = good ? Math.min(c.b + 1, BOXES.length - 1) : 1;
  c.d = Date.now() + BOXES[c.b] * DAY; m[i] = c; save();
}
function dueList(){ const m = srsOf(S.target), now = Date.now(); return Object.keys(m).filter(i => m[i].d <= now).map(Number); }
const learnedCount = l => Object.values(S.srs[l] || {}).filter(c => c.b >= 2).length;

/* ---------- Niveaux CECRL ---------- */
/** % de réussite de chaque niveau (moyenne des thèmes ; 100 % si validé par examen/test). */
function levelStats(l){
  const done = S.done[l] || {}, ex = S.exams[l] || {};
  return LEVELS.map(L => {
    if (ex[L.id]) return Math.max(ex[L.id], 0);
    const th = themesOfLevel(L.id);
    return Math.round(th.reduce((a, t) => a + (done[t.id] || 0), 0) / Math.max(1, th.length));
  });
}
/** Niveau actuel : le premier niveau pas encore validé. */
function levelIdx(l){
  const st = levelStats(l), ex = S.exams[l] || {}; let k = 0;
  while (k < st.length && (st[k] >= PASS || ex[LEVELS[k].id])) k++;
  return Math.min(k, LEVELS.length - 1);
}
const levelName = i => `${LEVELS[i].id} · ${LEVELS[i][S.ui] || LEVELS[i].fr}`;
/** Valide un niveau (examen réussi ou test de niveau). */
function validateLevel(l, id, pct){ const ex = S.exams[l] || (S.exams[l] = {}); ex[id] = Math.max(ex[id] || 0, pct); save(); }
