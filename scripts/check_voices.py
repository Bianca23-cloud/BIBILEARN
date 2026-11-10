"""Vérifie que chaque langue est bien prononcée par une voix de CETTE langue :
on télécharge un enregistrement par langue depuis la version publiée et
l'outil de reconnaissance Whisper détecte la langue entendue."""
import json, os, subprocess, sys, urllib.request
import numpy as np
from faster_whisper import WhisperModel

def load_audio(path):
    """MP3 -> son 16 kHz mono (via ffmpeg), format attendu par Whisper."""
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0

WEB = os.environ.get("WEB", "https://bianca23-cloud.github.io/BIBILEARN/")
EXPECTED = {"en":"en","it":"it","fr":"fr","ro":"ro","ptBR":"pt","ptPT":"pt","esES":"es","esMX":"es","esAR":"es",
            "de":"de","ru":"ru","el":"el","nl":"nl","ja":"ja","zh":"zh"}

def fnv(s):
    h = 0x811C9DC5
    for b in s.encode("utf-8"):
        h ^= b; h = (h * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = "\n".join(open(os.path.join(root, "src", f), encoding="utf-8").read() for f in ("data.js", "data2.js"))
d = json.loads(subprocess.run(["node", "-e", js + "\nprocess.stdout.write(JSON.stringify({LANG_ORDER, STORIES}));"],
                              capture_output=True, text=True, check=True).stdout)
model = WhisperModel("small", device="cpu", compute_type="int8")
ok, lines = True, []
for c, lang in enumerate(d["LANG_ORDER"]):
    # 2 phrases longues de l'histoire « Au café » par langue
    for k in (0, 2):
        text = d["STORIES"][0]["s"][k][c].split("|")[0]
        url = f"{WEB}audio/{lang}/{fnv(lang + '|' + text)}.mp3"
        path = f"/tmp/{lang}_{k}.mp3"
        urllib.request.urlretrieve(url, path)
        _, info = model.transcribe(load_audio(path), beam_size=1)
        good = info.language == EXPECTED[lang]
        ok &= good
        lines.append(f"{'OK ' if good else 'ERREUR'} {lang:5} attendu={EXPECTED[lang]} entendu={info.language} ({info.language_probability:.0%}) « {text} »")
print("\n".join(lines))
open("voix.txt", "w").write("\n".join(lines) + "\n")
sys.exit(0 if ok else 1)
