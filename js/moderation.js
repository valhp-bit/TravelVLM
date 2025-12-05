// Système de censure des commentaires – version bêta – date 05/12/2025
// Contient la liste des mots interdits et la fonction censorText()

// Liste de mots interdits (exemple, à compléter selon besoins)
const forbiddenWords = [
  "con", "idiot", "fuck", "bitch", "merde", "salope", "pute", "shit", "asshole"
];

// Liste personnalisable (vide par défaut, peut être chargée dynamiquement)
let forbiddenWordsCustom = [];

// Normalize accents (éèê -> e) for matching
function normalizeAccents(str){
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Build a safe regex from forbidden words (escape special chars)
function escapeRegex(s){
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Main censor function. Returns censored text.
function censorText(text){
  if(!text) return text;
  const base = forbiddenWords.concat(forbiddenWordsCustom || []);
  if(base.length === 0) return text;

  // Normalize for matching but preserve original characters for replacement
  const normalized = normalizeAccents(text).toLowerCase();

  // Build regex using word boundaries to avoid false positives (e.g., "butter")
  const words = base.map(w => escapeRegex(normalizeAccents(w)));
  const regex = new RegExp("\\b(" + words.join('|') + ")\\b", 'gi');

  // Replace matches in the original text by mapping positions from normalized string
  // Simpler approach: perform replace on the original text using a regex built from original words
  const origWords = base.map(w => escapeRegex(w));
  const origRegex = new RegExp("\\b(" + origWords.join('|') + ")\\b", 'gi');

  return text.replace(origRegex, (match) => '*'.repeat(match.length));
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
