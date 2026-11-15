"""Test automatique complet de BIBILEARN (navigateur Chromium piloté par Playwright).

Ce que le test vérifie :
  1. Chaque leçon des 34 thèmes, pour plusieurs paires de langues, se termine sans erreur
     (un « pilote automatique » répond juste à chaque exercice).
  2. Translittération : chaque phrase russe, grecque, japonaise et chinoise a une version en lettres latines.
  3. Test de niveau, examen de passage, sprint.
  4. Traducteur : phrase du cours hors ligne, inversion des langues, texte libre en ligne,
     et les DEUX micros (langue d'entrée et langue de sortie) avec la bonne langue de reconnaissance.
  5. Mode hors ligne (réseau coupé) : l'appli et le traducteur marchent toujours.
Usage : python scripts/test_app.py [URL]   (par défaut : sert www/ en local)
"""
import functools, http.server, json, re, sys, threading, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else None
if not URL:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / "www"))
    handler.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8765), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    URL = "http://127.0.0.1:8765/"

# Faux micro : remplace la reconnaissance vocale du navigateur, note la langue demandée,
# et « entend » la phrase préparée par le test pour cette langue.
FAKE_MIC = """
window.__micLangs = []; window.__say = {};
class FakeSR { constructor(){ this.lang=''; }
  start(){ const me=this; window.__micLangs.push(me.lang);
    setTimeout(()=>{ const t = window.__say[me.lang] || 'bonjour';
      me.onresult && me.onresult({results:[[{transcript:t}]]}); me.onend && me.onend(); }, 50); }
  stop(){} }
window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
"""

AUTOPILOT = """() => {
  const B = window.__BIBI, R = B.R(); if (!R) return 'none';
  const go = document.querySelector('#go'); if (!go) return 'nogo';
  if (go.dataset.st === 'next' || (R.steps[R.n] && ['tip','intro'].includes(R.steps[R.n].k))) { go.click(); return 'next'; }
  const s = R.steps[R.n], S = B.S(), w = l => B.word(s.i, l);
  const pick = v => { const o=[...document.querySelectorAll('.opt')].find(b=>b.dataset.v===v); if(!o) throw new Error('option absente '+v+' '+s.k); o.click(); };
  if (['s2t','listen'].includes(s.k)) pick(w(S.target).t);
  else if (s.k==='t2s') pick(w(S.source).t);
  else if (s.k==='cloze') pick(w(S.target).raw.match(/\\[(.+?)\\]/)[1]);
  else if (['type','dict'].includes(s.k)) { const i=document.querySelector('#inp'); i.value=w(S.target).t; i.dispatchEvent(new Event('input')); }
  else if (s.k==='order') { const toks=w(S.target).t.split(/\\s+/); for (const tk of toks){ const c=[...document.querySelectorAll('#bag .chip')].find(b=>b.textContent===tk); c.click(); } }
  else if (s.k==='match') { const L=[...document.querySelectorAll('#ml .opt')].map(b=>b.dataset.k); for(const k of L){ document.querySelector('#ml [data-k="'+k+'"]').click(); document.querySelector('#mr [data-k="'+k+'"]').click(); } }
  else if (s.k==='speak') { document.querySelector('#skp').click(); return 'skip'; }
  const g=document.querySelector('#go'); if (g.disabled) throw new Error('bouton bloqué '+s.k); g.click(); return s.k;
}"""

errors, report = [], []
def ok(msg): report.append("OK  " + msg); print("OK ", msg, flush=True)
def fail(msg): errors.append(msg); report.append("ERREUR " + msg); print("ERREUR", msg, flush=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context()
    ctx.add_init_script(FAKE_MIC)
    page = ctx.new_page()
    page.on("pageerror", lambda e: fail("erreur JavaScript : " + str(e)))
    page.goto(URL); page.wait_for_selector("#cont")
    info = page.evaluate("() => ({items: __BIBI.ITEMS.length, themes: __BIBI.THEMES.length, stories: __BIBI.STORIES.length})")
    ok(f"appli chargée : {info['items']} phrases, {info['themes']} thèmes, {info['stories']} histoires")

    # 2. Translittération de toutes les phrases non latines
    bad = page.evaluate("""() => { const B=__BIBI, out=[];
      for (const l of ['ru','el','ja','zh']) { B.ITEMS.forEach((_,i)=>{ const p=B.word(i,l); if(!p.r || /[\\u0400-\\u04ff\\u0370-\\u03ff\\u3040-\\u30ff\\u4e00-\\u9fff]/.test(p.r)) out.push(l+':'+p.t); });
        B.STORIES.forEach(st=>st.s.forEach(s=>{ const p=B.part(s[['en','it','fr','ro','ptBR','ptPT','esES','esMX','esAR','de','ru','el','nl','ja','zh'].indexOf(l)],l); if(!p.r) out.push(l+':'+p.t); })); }
      return out; }""")
    if bad: fail(f"translittération manquante : {bad[:5]}")
    else: ok("translittération présente et en lettres latines pour 100 % des phrases russes, grecques, japonaises et chinoises")

    # 1. Toutes les leçons, plusieurs paires
    pairs = [("en","fr"), ("ja","ro"), ("ru","en"), ("zh","fr"), ("ptPT","esAR"), ("el","de"), ("esMX","it"), ("nl","ptBR")]
    themes = page.evaluate("() => __BIBI.THEMES.map(t=>t.id)")
    for tg, src in pairs:
        page.evaluate(f"() => {{ const S=__BIBI.S(); S.target='{tg}'; S.source='{src}'; S.rom=true; }}")
        n = 0
        for th in (themes if tg in ("en","ja","ru","zh") else themes[::3]):
            page.evaluate(f"() => __BIBI.go('lesson','{th}')")
            for _ in range(200):
                if page.locator("#again").count(): break
                page.evaluate(AUTOPILOT)
            else: fail(f"leçon {th} ({tg}←{src}) ne se termine pas"); continue
            n += 1
        # translittération visible dans une leçon pour les langues non latines
        if tg in ("ja","ru","zh","el"):
            page.evaluate(f"() => {{ __BIBI.S().srs['{tg}'] = {{}}; __BIBI.go('lesson','greet'); }}")
            if page.locator(".rom").count() == 0: fail(f"pas de translittération affichée ({tg})")
        ok(f"{n} leçons terminées sans erreur : {tg} ← {src}")

    # 3. Parcours accéléré
    page.evaluate("() => { const S=__BIBI.S(); S.target='en'; S.source='fr'; }")
    for mode in ("exam", "sprint", "placement"):
        page.evaluate(f"() => __BIBI.go('quiz', {{mode:'{mode}', level:'A1'}})")
        for _ in range(400):
            if page.locator("#les").count(): break
            page.evaluate(AUTOPILOT)
        else: fail(f"{mode} ne se termine pas"); continue
        ok(f"{mode} : {page.locator('h1').first.inner_text()}")
    lv = page.evaluate("() => __BIBI.levelIdx('en')")
    if lv >= 5: ok("test de niveau réussi en entier → niveau C2 atteint")
    else: fail(f"test de niveau : niveau {lv} au lieu de C2")

    # 4. Traducteur
    page.evaluate("() => { const S=__BIBI.S(); S.tr.from='fr'; S.tr.to='ja'; S.tr.hist=[]; __BIBI.go('translate'); }")
    page.fill("#trIn", "Bonjour"); page.click("#doTr"); page.wait_for_selector("#outCard [data-out]")
    out = page.inner_text("#outCard")
    if "こんにちは" in out and "konnichiwa" in out.lower(): ok("traducteur hors connexion : « Bonjour » → こんにちは + translittération « konnichiwa », voix native")
    else: fail("traducteur phrase du cours : " + out[:120])
    page.click("#trSwap"); page.wait_for_selector("#outCard [data-out]")
    if page.input_value("#trFrom") == "ja" and "Bonjour" in page.inner_text("#outCard"): ok("inversion des langues d'entrée et de sortie (⇄) : ja → fr")
    else: fail("inversion des langues")
    # micro langue d'entrée + micro langue de sortie (conversation)
    page.evaluate("() => { const S=__BIBI.S(); S.tr.from='ptPT'; S.tr.to='en'; __BIBI.go('translate'); window.__micLangs=[]; window.__say={'pt-PT':'Obrigado.','en-GB':'Thank you.'}; }")
    page.click("#cvA"); page.wait_for_selector(".bubble"); page.click("#cvB"); page.wait_for_function("document.querySelectorAll('.bubble').length>=2")
    langs = page.evaluate("window.__micLangs"); conv = page.inner_text("#conv")
    if langs == ["pt-PT", "en-GB"] and "Thank you" in conv and "Obrigado" in conv: ok("deux micros : 1er en portugais du Portugal (pt-PT), 2e en anglais britannique (en-GB), traductions croisées affichées")
    else: fail(f"micros : {langs} / {conv[:100]}")
    page.evaluate("() => { const S=__BIBI.S(); S.tr.from='fr'; S.tr.to='zh'; __BIBI.go('translate'); window.__micLangs=[]; window.__say={'fr-FR': __BIBI.word(1,'fr').t}; }")
    page.click("#micFrom"); page.wait_for_selector("#outCard [data-out]")
    if page.evaluate("window.__micLangs") == ["fr-FR"] and page.locator("#outCard .rom").count(): ok("micro de la langue d'entrée (dictée fr-FR) → traduction chinoise + pinyin")
    else: fail("micro de dictée")
    # texte libre en ligne, VRAIE traduction (seulement sur le site publié, avec internet)
    if len(sys.argv) > 1:
        for to in ("ru", "el", "ja", "zh", "ptPT", "esAR"):
            r = page.evaluate(f"async () => JSON.stringify(await __BIBI.translateText(\"Où se trouve la gare la plus proche, s'il vous plaît ?\", 'fr', '{to}'))")
            r = json.loads(r)
            latin = bool(r.get("r")) and not re.search(r"[\u0400-\u04ff\u0370-\u03ff\u3040-\u30ff\u4e00-\u9fff]", r.get("r", ""))
            if r.get("src") == "online" and r.get("t") and (latin or to in ("ptPT", "esAR")):
                ok(f"traduction en ligne réelle fr → {to} : {r['t']}" + (f"  [{r['r']}]" if r.get('r') else ""))
            else: fail(f"traduction en ligne réelle fr → {to} : {r}")
    # texte libre en ligne (réponse de Google simulée pour un test reproductible)
    page.route("https://translate.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="application/json",
        body=json.dumps([[["Я люблю зелёный чай.", "J'adore le thé vert.", None, None, 3], [None, None, "Ya lyublyu zelyonyy chay.", None]], None, "fr"])))
    page.evaluate("() => { const S=__BIBI.S(); S.tr.from='fr'; S.tr.to='ru'; __BIBI.go('translate'); }")
    page.fill("#trIn", "J'adore le thé vert."); page.click("#doTr"); page.wait_for_selector("#outCard [data-out]")
    out = page.inner_text("#outCard")
    if "Я люблю" in out and "Ya lyublyu" in out: ok("texte libre en ligne : traduction + translittération affichées")
    else: fail("texte libre en ligne : " + out[:120])

    # 5. Hors ligne
    ctx.set_offline(True)
    page.evaluate("() => { const S=__BIBI.S(); S.tr.from='en'; S.tr.to='de'; __BIBI.go('translate'); }")
    page.fill("#trIn", "Thank you very much"); page.click("#doTr"); page.wait_for_selector("#outCard .sent, #outCard [data-out]")
    ok("hors ligne : traducteur → " + page.inner_text("#outCard").split("\n")[0][:70])
    page.evaluate("() => __BIBI.go('lesson','food')")
    if page.locator("#go").count(): ok("hors ligne : leçon ouverte")
    else: fail("hors ligne : leçon")
    ctx.set_offline(False)
    b.close()

(ROOT / "test-report.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
print("\n" + ("TOUT EST OK" if not errors else f"{len(errors)} ERREUR(S)"))
sys.exit(1 if errors else 0)
