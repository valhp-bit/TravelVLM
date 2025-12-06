// Système de censure des commentaires – corrigé 06/12/2025
// Censure UNIQUEMENT les mots spécifiés et leurs variantes (maj/min)

// ⚠️ LISTE PRÉCISE DE MOTS À CENSURER
// ATTENTION: Ne censure QUE ces mots exacts, pas les sous-mots
const forbiddenWords = [
  "connard",
  "con",
  "pute",
  "enculé"
];

let forbiddenWordsCustom = [];

// Fonction pour créer un pattern regex qui censure un mot avec ses variantes maj/min
// Mais PAS les sous-mots
function createCensorPattern(word) {
  // Split word into characters and join with case-insensitive pattern
  // This ensures we catch all case variations
  let pattern = '';
  for (let char of word) {
    // For each character, create [aA] style pattern for case-insensitivity
    pattern += `[${char}${char.toUpperCase()}]`;
  }
  // Add word boundaries using spaces/punctuation detection
  return pattern;
}

// Main censor function
function censorText(text) {
  if (!text || typeof text !== 'string') return text;
  
  const base = forbiddenWords.concat(forbiddenWordsCustom || []);
  if (base.length === 0) return text;

  let result = text;
  
  // For each forbidden word, replace all case variations
  for (let word of base) {
    // Create a pattern that matches the word in any case
    // Use negative lookahead/lookbehind to avoid matching as sub-word
    // Split by common delimiters to check word boundaries
    
    // Simple approach: split text by non-letter characters, check each word
    // Then rebuild while replacing matches
    
    const wordLower = word.toLowerCase();
    
    // Split text into tokens (words + non-words)
    const tokens = result.split(/(\W+)/);
    
    result = tokens.map(token => {
      // If token is a word (not punctuation/spaces)
      if (/\w/.test(token)) {
        // Check if it matches the forbidden word (case-insensitive)
        if (token.toLowerCase() === wordLower) {
          // Replace entire word with asterisks
          return '*'.repeat(token.length);
        }
      }
      return token;
    }).join('');
  }
  
  return result;
}

// Helper: detect if comment is too censored to be useful
function isEffectivelyEmpty(filteredText) {
  if (!filteredText) return true;
  // Count non-asterisk, non-whitespace characters
  const meaningful = filteredText.replace(/[\s*]/g, '').length;
  return meaningful < 3;
}

// Expose functions to window
if (typeof window !== 'undefined') {
  window.forbiddenWords = forbiddenWords;
  window.forbiddenWordsCustom = forbiddenWordsCustom;
  window.censorText = censorText;
  window.isEffectivelyEmpty = isEffectivelyEmpty;
}
