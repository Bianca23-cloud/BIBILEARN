# Vérification automatique de BIBILEARN

Date : 2026-11-15 17:18 UTC — run 43739881615

## web
```
OK web (version 2.0 en ligne)
Voix natives intégrées : 3780 enregistrements
BIBILEARN-Windows-Setup.exe -> HTTP 200
BIBILEARN-Windows-portable.exe -> HTTP 200
BIBILEARN-Linux.AppImage -> HTTP 200
BIBILEARN-Linux.deb -> HTTP 200
BIBILEARN-Android.apk -> HTTP 200
```

## fonctions
```
OK  appli chargée : 218 phrases, 34 thèmes, 6 histoires
OK  translittération présente et en lettres latines pour 100 % des phrases russes, grecques, japonaises et chinoises
OK  34 leçons terminées sans erreur : en ← fr
OK  34 leçons terminées sans erreur : ja ← ro
OK  34 leçons terminées sans erreur : ru ← en
OK  34 leçons terminées sans erreur : zh ← fr
OK  12 leçons terminées sans erreur : ptPT ← esAR
OK  12 leçons terminées sans erreur : el ← de
OK  12 leçons terminées sans erreur : esMX ← it
OK  12 leçons terminées sans erreur : nl ← ptBR
OK  exam : 🎓 Examen A1 : 100%
OK  sprint : ⚡ Sprint 3 min : 46/46
OK  placement : 🧭 Test de niveau
OK  test de niveau réussi en entier → niveau C2 atteint
OK  traducteur hors connexion : « Bonjour » → こんにちは + translittération « konnichiwa », voix native
OK  inversion des langues d'entrée et de sortie (⇄) : ja → fr
OK  deux micros : 1er en portugais du Portugal (pt-PT), 2e en anglais britannique (en-GB), traductions croisées affichées
OK  micro de la langue d'entrée (dictée fr-FR) → traduction chinoise + pinyin
OK  traduction en ligne réelle fr → ru : Подскажите, пожалуйста, где ближайшая железнодорожная станция?  [Podskazhite, pozhaluysta, gde blizhayshaya zheleznodorozhnaya stantsiya?]
OK  traduction en ligne réelle fr → el : Πού είναι ο πλησιέστερος σιδηροδρομικός σταθμός παρακαλώ;  [Poú eínai o plisiésteros sidirodromikós stathmós parakaló?]
OK  traduction en ligne réelle fr → ja : 最寄りの駅はどこですか？  [Moyori no eki wa dokodesu ka?]
OK  traduction en ligne réelle fr → zh : 请问最近的火车站在哪里？  [Qǐngwèn zuìjìn de huǒchē zhàn zài nǎlǐ?]
OK  traduction en ligne réelle fr → ptPT : Onde fica a estação de comboios mais próxima, por favor?
OK  traduction en ligne réelle fr → esAR : ¿Dónde está la estación de tren más cercana, por favor?
OK  texte libre en ligne : traduction + translittération affichées
OK  hors ligne : traducteur → 📴 Hors ligne : seules les phrases du cours sont traduites.
OK  hors ligne : leçon ouverte
```

## voix
```
OK  en    attendu=en entendu=en (99%) « Anna walks into a small café. »
OK  en    attendu=en entendu=en (98%) « The waiter is very friendly. »
OK  it    attendu=it entendu=it (97%) « Anna entra in un piccolo bar. »
OK  it    attendu=it entendu=it (98%) « Il cameriere è molto gentile. »
OK  fr    attendu=fr entendu=fr (99%) « Anna entre dans un petit café. »
OK  fr    attendu=fr entendu=fr (98%) « Le serveur est très gentil. »
OK  ro    attendu=ro entendu=ro (97%) « Anna intră într-o cafenea mică. »
OK  ro    attendu=ro entendu=ro (83%) « Chelnerul este foarte amabil. »
OK  ptBR  attendu=pt entendu=pt (100%) « Anna entra em um pequeno café. »
OK  ptBR  attendu=pt entendu=pt (100%) « O garçom é muito simpático. »
OK  ptPT  attendu=pt entendu=de (18%) « A Anna entra num pequeno café. » -> transcription en pt : « A Ana entra num pequeno café. » (ressemblance 98%)
OK  ptPT  attendu=pt entendu=pt (99%) « O empregado de mesa é muito simpático. »
OK  esES  attendu=es entendu=es (77%) « Anna entra en una pequeña cafetería. »
OK  esES  attendu=es entendu=es (98%) « El camarero es muy amable. »
OK  esMX  attendu=es entendu=es (98%) « Anna entra a una pequeña cafetería. »
OK  esMX  attendu=es entendu=es (99%) « El mesero es muy amable. »
OK  esAR  attendu=es entendu=es (94%) « Anna entra a un pequeño café. »
OK  esAR  attendu=es entendu=es (98%) « El mozo es muy amable. »
OK  de    attendu=de entendu=de (99%) « Anna geht in ein kleines Café. »
OK  de    attendu=de entendu=de (97%) « Der Kellner ist sehr freundlich. »
OK  ru    attendu=ru entendu=ru (99%) « Анна заходит в маленькое кафе. »
OK  ru    attendu=ru entendu=ru (99%) « Официант очень любезный. »
OK  el    attendu=el entendu=el (98%) « Η Άννα μπαίνει σε ένα μικρό καφέ. »
OK  el    attendu=el entendu=el (100%) « Ο σερβιτόρος είναι πολύ ευγενικός. »
OK  nl    attendu=nl entendu=nl (98%) « Anna loopt een klein café binnen. »
OK  nl    attendu=nl entendu=nl (99%) « De ober is heel vriendelijk. »
OK  ja    attendu=ja entendu=ja (99%) « アンナは小さなカフェに入ります。 »
OK  ja    attendu=ja entendu=ja (100%) « 店員さんはとても親切です。 »
OK  zh    attendu=zh entendu=zh (100%) « 安娜走进一家小咖啡馆。 »
OK  zh    attendu=zh entendu=zh (100%) « 服务员非常友好。 »
```

## windows
```
OK windows (fichiers locaux, aucun serveur) : 4 processus BIBILEARN, fenetre 'BIBILEARN — apprendre 15 langues'
```
![windows](windows.png)

## android
```
OK android SANS INTERNET (mode avion, processus ) — OK micro Android : permission RECORD_AUDIO + extensions SpeechRecognition et TextToSpeech présentes
```
![android](android.png)

## iphone
```
OK iPhone : iPhone 17 Pro (2CC7A2C1-E1A7-4633-911A-DB60BDEB97F0) (Shutdown) 
```
![iphone](iphone.png)

