"""Assemble src/ en un seul fichier www/index.html (100 % hors ligne)."""
import pathlib
r = pathlib.Path(__file__).resolve().parent.parent
s = r / "src"
html = (s / "index.template.html").read_text(encoding="utf-8")
js = "\n".join((s / f).read_text(encoding="utf-8") for f in ["data.js", "i18n.js", "app.js"])
html = html.replace("/*CSS*/", (s / "style.css").read_text(encoding="utf-8")).replace("/*JS*/", js.replace("</script", "<\\/script"))
(r / "www" / "index.html").write_text(html, encoding="utf-8")
print("www/index.html :", len(html), "octets")
import runpy
runpy.run_path(str(r / "scripts" / "make_icons.py"))
