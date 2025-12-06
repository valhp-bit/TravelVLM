// Système de censure des commentaires – version bêta – date 05/12/2025
// Contient la liste des mots interdits et la fonction censorText()

// ⚠️ LISTE PRÉCISE DE MOTS À CENSURER (avec variantes maj/min automatiques)
// Ajoute UNIQUEMENT les mots que tu veux censurer
const forbiddenWords = [
  "connard",  // censure: connard, Connard, CONNARD, etc.
  "con",      // censure: con, Con, CON, etc.
  "pute",     // censure: pute, Pute, PUTE, etc.
  "enculé"    // censure: enculé, Enculé, ENCULÉ, etc.
];

// Liste personnalisable (vide par défaut, peut être chargée dynamiquement)
let forbiddenWordsCustom = [];

// Build a safe regex from forbidden words (escape special chars)
function escapeRegex(s){
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Main censor function. Returns censored text.
// Censure UNIQUEMENT les mots exacts (pas de sous-mots)
function censorText(text){
  if(!text) return text;
  const base = forbiddenWords.concat(forbiddenWordsCustom || []);
  if(base.length === 0) return text;

  // Crée une regex avec word boundaries pour chaque mot
  // 'gi' = global + case-insensitive (censure maj et min)
  let result = text;
  
  for(let word of base){
    // Échappe les caractères spéciaux du regex
    const escaped = escapeRegex(word);
    // Crée une regex avec word boundaries pour éviter les sous-mots
    // \b = limite de mot (début/fin de mot)
    const regex = new RegExp("\\b" + escaped + "\\b", 'gi');
    // Remplace par des astérisques
    result = result.replace(regex, (match) => '*'.repeat(match.length));
  }
  
  return result;
}

// Helper: detect if filtered text is effectively empty (too censored)
function isEffectivelyEmpty(filteredText){
  if(!filteredText) return true;
  const stripped = filteredText.replace(/\*/g, '').trim();
  return stripped.length < 3; // if less than 3 non-* characters, consider empty
}

// Expose to window for legacy inline scripts
if(typeof window !== 'undefined'){
  window.forbiddenWords = forbiddenWords;
  window.forbiddenWordsCustom = forbiddenWordsCustom;
  window.censorText = censorText;
  window.isEffectivelyEmpty = isEffectivelyEmpty;
}
