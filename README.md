# 🦉 BIBILEARN

Application **gratuite, hors ligne et open source** pour apprendre 15 langues
à partir de **n'importe laquelle** d'entre elles (bouton ⇄ pour inverser).

Langues : anglais (UK), italien, français, roumain, portugais (Brésil / Portugal),
espagnol (Espagne / Mexique / Argentine), allemand, russe, grec moderne,
néerlandais, japonais, chinois mandarin.

## Téléchargements directs

| Appareil | Lien |
|---|---|
| Windows 11 (installation) | https://github.com/Bianca23-cloud/BIBILEARN/releases/latest/download/BIBILEARN-Windows-Setup.exe |
| Windows 11 (sans installation) | https://github.com/Bianca23-cloud/BIBILEARN/releases/latest/download/BIBILEARN-Windows-portable.exe |
| Linux (AppImage) | https://github.com/Bianca23-cloud/BIBILEARN/releases/latest/download/BIBILEARN-Linux.AppImage |
| Linux (Debian/Ubuntu) | https://github.com/Bianca23-cloud/BIBILEARN/releases/latest/download/BIBILEARN-Linux.deb |
| Android | https://github.com/Bianca23-cloud/BIBILEARN/releases/latest/download/BIBILEARN-Android.apk |
| iPhone / iPad / tout navigateur | https://bianca23-cloud.github.io/BIBILEARN/ |

## Nouveautés 2.0

- **Traducteur** : langue d'entrée ⇄ langue de sortie (15 langues), deux micros (conversation), voix natives, translittération.
- **218 phrases, 34 thèmes, 6 histoires** de A1 Débutant à C2 Natif.
- **Parcours accéléré** : test de niveau, examen de passage par niveau (80 %), sprint de 3 minutes, rythme intensif.
- **Translittération** de 100 % des phrases en russe, grec, japonais (rōmaji) et chinois (pinyin).

## Structure

```
src/data*.js   contenu (phrases en 15 langues, thèmes, histoires)
src/i18n*.js   textes de l'interface (fr, ro, en, it)
src/js/        code de l'appli, en modules numérotés (00-core … 99-start)
www/        application assemblée (index.html unique, hors ligne)
electron/   fenêtre de bureau (Windows, Linux)
scripts/    build.py (assemble), make_audio.py (voix natives), test_app.py (tests), check_voices.py (Whisper)
.github/    fabrication automatique des applis + publication web
```

## Développer en local

```bash
python3 scripts/build.py          # assemble l'appli
python3 -m http.server 8080 -d www  # ouvre http://localhost:8080
npm install && npm start          # version bureau (Electron)
```

Contenu pédagogique original. BIBILEARN s'inspire des fonctions des applis
d'apprentissage par la lecture (comme EWA) sans en reprendre le nom, les textes
ni les visuels.
