/* =====================================================================
   20 · VOIX : enregistrements natifs, puis voix de l'appareil
   1) Chaque phrase du cours est enregistrée à l'avance par une voix native
      Microsoft (neural) de la langue : audio/<langue>/<empreinte>.mp3.
      Ces fichiers sont DANS l'appli → hors ligne.
   2) Pour un texte libre (traducteur), on utilise une voix de l'appareil,
      mais UNIQUEMENT si elle est de la même langue (jamais une voix
      française pour lire de l'anglais).
   ===================================================================== */

/** Empreinte FNV-1a 32 bits : nom du fichier MP3 (identique à scripts/make_audio.py). */
function fnv(s){ let h = 0x811c9dc5; for (const b of new TextEncoder().encode(s)){ h ^= b; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
const HAS_AUDIO = typeof AUDIO_N !== "undefined" && AUDIO_N > 0;   // AUDIO_N est écrit par scripts/build.py
const clipUrl = (l, text) => `audio/${l}/${fnv(l + "|" + text)}.mp3`;

let curAudio = null, seqId = 0;
/** Arrête toute lecture en cours. */
function stopAudio(){
  seqId++;
  if (curAudio){ try { curAudio.pause(); } catch (e) {} curAudio = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
  const tts = capPlugin("TextToSpeech"); if (tts) tts.stop().catch(() => {});
}
/** Joue l'enregistrement natif d'un texte. Échoue s'il n'existe pas (texte libre). */
function playClip(l, text, rate){
  return new Promise((ok, ko) => {
    const a = new Audio(clipUrl(l, text));
    a.playbackRate = Math.max(.5, Math.min(1.5, (rate || S.rate) / 0.9));
    a.onended = () => ok(); a.onerror = () => ko(new Error("clip"));
    curAudio = a; const p = a.play(); if (p && p.catch) p.catch(ko);
  });
}

/* ---------- Voix de l'appareil ---------- */
let voices = [];
function loadVoices(){ try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
if ("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
/** Choisit une voix de l'appareil pour une langue : même pays si possible, sinon même langue, sinon rien. */
function pickVoice(tag){
  const n = v => v.lang.replace("_", "-").toLowerCase(), t = tag.toLowerCase(), base = t.split("-")[0];
  const near = {"es-ar":["es-419","es-us","es-mx"],"es-mx":["es-419","es-us"],"pt-pt":[],"en-gb":["en-ie","en-au"]}[t] || [];
  const same = voices.filter(v => n(v).split("-")[0] === base);
  const best = list => list.find(v => n(v) === t && /natural|neural|online/i.test(v.name)) || list.find(v => n(v) === t)
                    || near.map(a => list.find(v => n(v) === a)).find(Boolean) || list[0];
  return best(same.filter(v => v.localService !== false)) || best(same) || null;
}
const warned = {};
function noVoice(l){ if (!warned[l]){ warned[l] = 1; toast(T().noVoice + " (" + LANGS[l].native + ")"); } }
/** Lit un texte avec une voix de l'appareil de la bonne langue. */
function deviceSpeak(text, l, rate){
  const tag = LANGS[l].tts, tts = capPlugin("TextToSpeech");
  if (tts){ tts.speak({ text, lang: tag, rate: rate || S.rate }).catch(() => noVoice(l)); return; }   // Android
  if (!("speechSynthesis" in window)){ noVoice(l); return; }
  loadVoices(); const v = pickVoice(tag);
  if (!v){ noVoice(l); return; }            // pas de voix de cette langue : on se tait plutôt que de mal prononcer
  const u = new SpeechSynthesisUtterance(text); u.lang = v.lang; u.voice = v; u.rate = rate || S.rate;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
/** Prononce un texte : voix native enregistrée, sinon voix de l'appareil de la même langue. */
function speak(text, l, rate){
  stopAudio();
  if (HAS_AUDIO) playClip(l, text, rate).catch(() => deviceSpeak(text, l, rate)); else deviceSpeak(text, l, rate);
}
/** Lit plusieurs phrases à la suite (histoires). */
function speakSeq(list, l){
  stopAudio(); const id = seqId; let i = 0;
  const next = () => { if (id !== seqId || i >= list.length) return; const tx = list[i++];
    (HAS_AUDIO ? playClip(l, tx) : Promise.reject()).then(next).catch(() => { if (id === seqId) deviceSpeak(list.slice(i - 1).join(" "), l); }); };
  next();
}
