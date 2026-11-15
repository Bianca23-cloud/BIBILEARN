/* =====================================================================
   52 · PARCOURS ACCÉLÉRÉ : test de niveau, examen de passage, sprint
   • Test de niveau : 5 questions par niveau, de A1 vers C2. On s'arrête au
     premier niveau où l'on fait moins de 4/5 → les niveaux réussis sont validés.
   • Examen de passage : 15 questions d'un niveau. 80 % ou plus → niveau validé d'un coup.
   • Sprint : 3 minutes de questions rapides sur ton niveau + tes révisions, XP doublés.
   ===================================================================== */
function quizSteps(items, n){
  return shuffle(items).slice(0, n).map(i => {
    const gap = /\[.+?\]/.test(word(i, S.target).raw);
    const k = gap && Math.random() < .5 ? "cloze" : ["s2t", "t2s", "listen"][Math.floor(Math.random() * 3)];
    return { k, i };
  });
}
VIEWS.quiz = function(m, opt){
  const t = T();
  if (opt.mode === "exam"){
    const L = LEVELS.find(x => x.id === opt.level);
    runSteps(m, { steps: quizSteps(itemsOfLevel(L.id), 15), retry: false, quitTo: "lessons", onFinish(pct){
      const ok = pct >= EXAM_PASS; if (ok){ validateLevel(S.target, L.id, pct); addXp(30); }
      result(m, `${ok ? "🎓" : "💪"} ${t.exam} ${L.id} : ${pct}%`, ok ? t.examOk : t.examKo.replace("{p}", EXAM_PASS));
    }});
  }
  if (opt.mode === "sprint"){
    const lv = LEVELS[levelIdx(S.target)].id, pool = [...new Set(itemsOfLevel(lv).concat(dueList()))];
    runSteps(m, { steps: quizSteps(pool.concat(pool), 60), timer: 180, double: true, retry: false, quitTo: "home", onFinish(pct, r){
      result(m, `⚡ ${t.sprint} : ${r.good}/${r.total}`, t.sprintDone.replace("{n}", r.good * 4));
    }});
  }
  if (opt.mode === "placement"){
    let li = 0, passed = -1;
    const next = () => {
      const L = LEVELS[li];
      runSteps(m, { steps: quizSteps(itemsOfLevel(L.id), 5), retry: false, quitTo: "home", onFinish(pct, r){
        if (r.good >= 4){ passed = li; validateLevel(S.target, L.id, pct); li++; if (li < LEVELS.length) return next(); }
        const reached = passed >= 0 ? levelName(passed) : "—", start = levelName(Math.min(passed + 1, LEVELS.length - 1));
        result(m, `🧭 ${t.placement}`, t.placeDone.replace("{a}", reached).replace("{b}", start));
      }});
    };
    next();
  }
};
function result(m, title, text){
  const t = T();
  m.innerHTML = `<section class="card hero pop">${BIBI}<div><h1>${esc(title)}</h1><p>${esc(text)}</p></div></section>
  <div class="row"><button class="btn" id="les">${esc(t.lessons)}</button><button class="btn alt" id="hm">${esc(t.home)}</button></div>`;
  $("#les").onclick = () => go("lessons"); $("#hm").onclick = () => go("home");
}
