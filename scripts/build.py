"""Assemble src/ en un seul fichier www/index.html (100 % hors ligne)."""
import pathlib
r = pathlib.Path(__file__).resolve().parent.parent
s = r / "src"
html = (s / "index.template.html").read_text(encoding="utf-8")
DATA = ["data.js", "data2.js", "data3.js", "i18n.js", "i18n2.js", "i18n3.js"]   # contenu + textes d'interface (globaux)
data = "\n".join((s / f).read_text(encoding="utf-8") for f in DATA)
mods = sorted((s / "js").glob("*.js"))                                          # code de l'appli, dans l'ordre 00, 10, 20…
code = "\n".join(m.read_text(encoding="utf-8") for m in mods)
js = data + "\n(function(){\n\"use strict\";\n" + code + "\n})();"
audio = r / "www" / "audio"
n = len(list(audio.rglob("*.mp3"))) if audio.exists() else 0   # voix natives enregistrées
js = f"const AUDIO_N = {n};\n" + js
html = html.replace("/*CSS*/", (s / "style.css").read_text(encoding="utf-8")).replace("/*JS*/", js.replace("</script", "<\\/script"))
(r / "www" / "index.html").write_text(html, encoding="utf-8")
print("www/index.html :", len(html), "octets ·", n, "fichiers audio natifs")
import runpy
runpy.run_path(str(r / "scripts" / "make_icons.py"))
