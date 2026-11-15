/* =====================================================================
   BIBILEARN 2.0 — 00 · NOYAU
   Petits outils utilisés partout : sélection DOM, échappement HTML,
   stockage de la progression (localStorage), langue de l'interface.
   ===================================================================== */

/* ---------- Raccourcis ---------- */
const $  = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
/** Échappe un texte avant de l'insérer dans du HTML (sécurité + accents). */
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- Constantes ---------- */
const VERSION = "2.0";
const DAY = 864e5;                          // 1 jour en millisecondes
const BOXES = [0, 1, 2, 4, 7, 15, 30];      // répétition espacée : délais (jours) des boîtes de Leitner
const PASS = 60;                            // % moyen pour valider un niveau par les leçons
const EXAM_PASS = 80;                       // % pour valider un niveau d'un coup par l'examen
/** Code de langue HTML/BCP-47 de chaque langue (sert aux lecteurs d'écran et aux micros). */
const HTML_LANG = {en:"en-GB",it:"it-IT",fr:"fr-FR",ro:"ro-RO",ptBR:"pt-BR",ptPT:"pt-PT",esES:"es-ES",esMX:"es-MX",esAR:"es-AR",
                   de:"de-DE",ru:"ru-RU",el:"el-GR",nl:"nl-NL",ja:"ja-JP",zh:"zh-CN"};
const NO_SPACE = {ja:1, zh:1};              // langues écrites sans espaces entre les mots
const NON_LATIN = {ru:1, el:1, ja:1, zh:1}; // langues qui ont besoin d'une translittération
const ONLINE_APP_URL = "https://bianca23-cloud.github.io/BIBILEARN/";

/* ---------- Où tourne l'appli ? ---------- */
const IS_DESKTOP = /Electron/.test(navigator.userAgent);              // Windows 11 / Linux (Electron)
const IS_ANDROID_APP = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const IS_APP = IS_DESKTOP || IS_ANDROID_APP;
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const capPlugin = name => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[name];

/* ---------- Progression enregistrée sur l'appareil ---------- */
const KEY = "bibilearn.v1";                 // même clé qu'avant : la progression existante est conservée
const DEF = {
  ui:"fr", target:"en", source:"fr",        // langue de l'interface, langue apprise, langue de départ
  xp:0, xpBy:{}, day:"", dayXp:0, streak:0, last:"", goal:30,
  big:false, contrast:false, rom:true, acc:true, rate:0.9,
  pace:"normal",                            // rythme : "normal" ou "intensif"
  srs:{}, done:{}, read:{},                 // cartes de révision, % par thème, histoires lues
  exams:{},                                 // niveaux validés par examen ou test de niveau
  tr:{from:"fr", to:"en", hist:[]}          // traducteur : langue d'entrée, langue de sortie, historique
};
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}")); }
catch (e) { S = Object.assign({}, DEF); }
S.tr = Object.assign({}, DEF.tr, S.tr || {});
/** Enregistre la progression (silencieux si le stockage est indisponible). */
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
/** Textes de l'interface dans la langue choisie (français par défaut). */
const T = () => UI[S.ui] || UI.fr;

/* ---------- Petits utilitaires ---------- */
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function today(d){ d = d || new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
/** Normalise une réponse : minuscules, sans ponctuation, sans accents (option). */
function norm(s){
  s = String(s).toLowerCase().replace(/[.,!?¿¡;:«»“”„"'’()\-—…。、！？，：；「」·]/g, " ").replace(/\s+/g, " ").trim();
  if (S.acc) s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return s;
}
/** Distance de Levenshtein : nombre de lettres à changer pour passer de a à b. */
function lev(a, b){
  const m = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++){ let p = m[0]; m[0] = i;
    for (let j = 1; j <= b.length; j++){ const t = m[j]; m[j] = Math.min(m[j] + 1, m[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } }
  return m[b.length];
}
/** Ressemblance entre deux phrases, de 0 (rien à voir) à 1 (identiques). */
function similar(a, b){ a = norm(a); b = norm(b); if (!a || !b) return 0; return 1 - lev(a, b) / Math.max(a.length, b.length); }
/** Petit message temporaire en bas de l'écran (lu par les lecteurs d'écran). */
function toast(msg){ const d = document.createElement("div"); d.className = "toast"; d.setAttribute("role", "status"); d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 4200); }
