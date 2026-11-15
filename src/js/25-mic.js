/* =====================================================================
   25 · MICROPHONE : reconnaissance de la parole dans N'IMPORTE QUELLE des 15 langues
   • Android (appli)      : reconnaissance vocale du téléphone (extension Capacitor « speech-recognition »).
   • iPhone, Chrome, Edge : reconnaissance vocale du navigateur (Web Speech API).
   • Windows 11 (appli)   : Windows ne fournit pas ce service aux applis Electron →
                            on propose la saisie vocale Windows (⊞ Win + H) ou la version Edge.
   ===================================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const Mic = {
  /** Quel micro est disponible ici ? "android" | "web" | "desktop" | "none" */
  kind(){
    if (capPlugin("SpeechRecognition")) return "android";
    if (IS_DESKTOP) return "desktop";
    if (SR) return "web";
    return "none";
  },
  /** Le micro peut-il être utilisé maintenant (pour les exercices « Parler ») ? */
  ready(){ const k = Mic.kind(); return k === "android" || (k === "web" && navigator.onLine); },
  /** Écoute l'utilisateur dans la langue l. Renvoie une promesse : liste des phrases entendues (la plus probable d'abord). */
  async listen(l){
    const tag = LANGS[l].tts, kind = Mic.kind();
    if (kind === "android"){
      const P = capPlugin("SpeechRecognition");
      const perm = await P.requestPermissions().catch(() => ({}));
      if (perm && perm.speechRecognition === "denied") throw Object.assign(new Error("not-allowed"), { code: "not-allowed" });
      const r = await P.start({ language: tag, maxResults: 3, prompt: LANGS[l].native, partialResults: false, popup: true });
      return (r && r.matches) || [];
    }
    if (kind === "web"){
      return new Promise((ok, ko) => {
        const r = new SR(); r.lang = tag; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
        let done = false;
        r.onresult = e => { done = true; ok([...e.results[0]].map(a => a.transcript)); };
        r.onerror = e => { done = true; ko(Object.assign(new Error(e.error || "error"), { code: e.error || "error" })); };
        r.onend = () => { if (!done) ko(Object.assign(new Error("no-speech"), { code: "no-speech" })); };
        try { r.start(); } catch (e) { ko(Object.assign(e, { code: "start" })); }
        Mic.current = r;
      });
    }
    throw Object.assign(new Error(kind), { code: kind });
  },
  stop(){ try { if (Mic.current) Mic.current.stop(); } catch (e) {} const P = capPlugin("SpeechRecognition"); if (P) P.stop().catch(() => {}); },
  /** Message clair selon l'erreur. */
  explain(code){
    const t = T();
    if (code === "desktop") return t.micDesktop;
    if (code === "not-allowed" || code === "service-not-allowed") return t.micDenied;
    if (code === "network") return t.micNetwork;
    if (code === "no-speech" || code === "aborted") return t.micNothing;
    if (code === "language-not-supported") return t.micLang;
    return t.noMic;
  }
};
