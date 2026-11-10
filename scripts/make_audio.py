"""Enregistre chaque mot et chaque phrase avec une VOIX NATIVE de la langue
(voix neuronales gratuites de Microsoft Edge, via edge-tts).
Les fichiers MP3 sont ensuite intégrés à l'appli : prononciation native, hors ligne."""
import asyncio, json, os, re, subprocess, sys
import edge_tts

# Une voix native par langue (et par pays pour les variantes)
VOICES = {
    "en":   "en-GB-SoniaNeural",      # anglais britannique
    "it":   "it-IT-ElsaNeural",       # italien d'Italie
    "fr":   "fr-FR-DeniseNeural",     # français de France
    "ro":   "ro-RO-AlinaNeural",      # roumain de Roumanie
    "ptBR": "pt-BR-FranciscaNeural",  # portugais du Brésil
    "ptPT": "pt-PT-RaquelNeural",     # portugais du Portugal
    "esES": "es-ES-ElviraNeural",     # espagnol d'Espagne
    "esMX": "es-MX-DaliaNeural",      # espagnol du Mexique
    "esAR": "es-AR-ElenaNeural",      # espagnol d'Argentine
    "de":   "de-DE-KatjaNeural",      # allemand d'Allemagne
    "ru":   "ru-RU-SvetlanaNeural",   # russe
    "el":   "el-GR-AthinaNeural",     # grec moderne
    "nl":   "nl-NL-ColetteNeural",    # néerlandais
    "ja":   "ja-JP-NanamiNeural",     # japonais
    "zh":   "zh-CN-XiaoxiaoNeural",   # chinois mandarin
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "www", "audio")

def fnv(s):
    """Empreinte FNV-1a 32 bits (identique à celle de app.js)."""
    h = 0x811C9DC5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h

def load_content():
    js = "\n".join(open(os.path.join(ROOT, "src", f), encoding="utf-8").read() for f in ("data.js", "data2.js"))
    code = js + "\nprocess.stdout.write(JSON.stringify({LANG_ORDER, ITEMS, STORIES}));"
    return json.loads(subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True).stdout)

def jobs():
    d = load_content()
    out = {}
    for c, lang in enumerate(d["LANG_ORDER"]):
        texts = [it[2][c] for it in d["ITEMS"]] + [s[c] for st in d["STORIES"] for s in st["s"]]
        for raw in texts:
            t = raw.split("|")[0].replace("[", "").replace("]", "")   # même texte que l'appli
            out[(lang, t)] = os.path.join(OUT, lang, fnv(lang + "|" + t) + ".mp3")
    return out

def spoken(t):
    # « Bonjour (le matin) » -> on ne prononce pas la précision entre parenthèses
    return re.sub(r"\s+\([^)]*\)", "", t).strip()

async def main():
    voices = {v["ShortName"] for v in await edge_tts.list_voices()}
    missing = [v for v in VOICES.values() if v not in voices]
    if missing:
        sys.exit("Voix introuvables : " + ", ".join(missing))
    todo = jobs()
    sem = asyncio.Semaphore(6)
    errors = []

    async def one(lang, text, path):
        if os.path.exists(path) and os.path.getsize(path) > 500:
            return
        os.makedirs(os.path.dirname(path), exist_ok=True)
        async with sem:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(spoken(text), VOICES[lang], rate="-10%").save(path)
                    if os.path.getsize(path) > 500:
                        return
                except Exception as e:  # réseau : on réessaie
                    last = e
                await asyncio.sleep(2 + attempt * 3)
            errors.append(f"{lang}: {text}")

    await asyncio.gather(*(one(l, t, p) for (l, t), p in todo.items()))
    if errors:
        sys.exit("Échecs :\n" + "\n".join(errors))
    files = sorted(os.path.relpath(p, os.path.join(ROOT, "www")).replace(os.sep, "/") for p in todo.values())
    json.dump(files, open(os.path.join(OUT, "list.json"), "w"))
    for lang, v in VOICES.items():
        n = len([1 for (l, _) in todo if l == lang])
        print(f"{lang:5} {v:24} {n} fichiers")
    print("TOTAL", len(files), "fichiers audio natifs")

asyncio.run(main())
