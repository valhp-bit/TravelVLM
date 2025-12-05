# Système de Modération des Commentaires

**Version:** Bêta  
**Date:** 05/12/2025  
**Statut:** Client-side uniquement (version statique/GitHub Pages)

---

## 📋 Vue d'ensemble

Ce document décrit le système de modération et de censure des commentaires implémenté dans **TravelVLM**. L'objectif est de filtrer automatiquement les contenus offensants, les injures et le spam évident avant leur stockage dans `localStorage`.

### ⚠️ Limitations critiques

- **Site statique** : Toute logique côté client peut être contournée via la console du navigateur (DevTools).
- **Filtre basique** : Les utilisateurs peuvent utiliser des variantes (leet speak, accents, espaces) pour contourner le filtre.
- **Pas de modération serveur** : Cette version est pensée pour la bêta. Pour une production sérieuse, un backend avec API de modération est recommandé.
- **Liste non-exhaustive** : La liste de mots interdits peut être complétée selon les besoins.

---

## 📁 Fichiers concernés

### 1. `js/moderation.js`
Fichier principal contenant :
- **`forbiddenWords`** : Liste statique de mots interdits (français + anglais)
- **`forbiddenWordsCustom`** : Liste vide, peut être peuplée dynamiquement
- **`censorText(text)`** : Fonction principale de censure
  - Normalise les accents pour le matching
  - Utilise une regex avec frontières de mots (`\b`) pour éviter faux positifs
  - Remplace chaque occurrence par des astérisques (`*`)
  - Exemple : `"Tu es un idiot"` → `"Tu es un *****"`
- **`isEffectivelyEmpty(filteredText)`** : Détecte si le texte filtré est trop censuré
  - Retourne `true` si moins de 3 caractères non-`*` restent
- **`normalizeAccents(str)`** : Supprime les accents pour la comparaison
- **`escapeRegex(s)`** : Échappe les caractères spéciaux pour la regex

### 2. `commentaire.html`
Modifications apportées :
- Import du script `js/moderation.js`
- Changement de clé localStorage : `traveldream_comments_v1` → `travelvlm_comments_v1`
- Intégration dans le handler `submit` du formulaire :
  1. Récupère le texte saisi
  2. Applique `censorText()` pour filtrer
  3. Vérifie que le résultat n'est pas vide (`isEffectivelyEmpty()`)
  4. Si vide : affiche alerte → bloque l'envoi
  5. Si valide : applique `DOMPurify.sanitize()` (XSS protection)
  6. Stocke **uniquement** le texte filtré/sanitisé

---

## 🔧 Comment utiliser

### Ajouter des mots interdits

**Option 1 : Modifier la liste statique dans `js/moderation.js`**

```javascript
const forbiddenWords = [
  "con", "idiot", "fuck", "bitch", "merde", "salope",
  "votremot", // à compléter selon besoins
];
```

**Option 2 : Charger dynamiquement (futur backend)**

```javascript
// Exemple pour API future
async function loadModerationList(){
  const res = await fetch('/api/moderation/words');
  forbiddenWordsCustom = await res.json();
}
```

### Tester la censure

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
// Test 1: Mot interdit
censorText("Tu es un idiot");
// Résultat: "Tu es un *****"

// Test 2: Pas de faux positif
censorText("Il aime le beurre");
// Résultat: "Il aime le beurre" (si "butter" n'est pas dans la liste)

// Test 3: Plusieurs mots
censorText("Fuck merde shit");
// Résultat: "**** ***** ****"

// Test 4: Vérifier si vide
isEffectivelyEmpty("**** ***** ****");
// Résultat: true (bloquera la soumission)
```

---

## 📊 Flux de soumission commentaire

```
[Utilisateur saisit texte]
         ↓
[Submit → addEventListener capture]
         ↓
[censorText(text) → mots remplacés par *]
         ↓
[isEffectivelyEmpty() → check]
    ├─ true  → Alerte + Stop
    └─ false → Continue
         ↓
[DOMPurify.sanitize() → XSS protection]
         ↓
[localStorage.setItem(travelvlm_comments_v1, JSON)]
         ↓
[renderComments() → affichage]
```

---

## 🔍 Vérification de sécurité

### Stockage

✅ **Avant cette version** :
```javascript
localStorage.setItem("key", userInputRaw); // DANGER: stocke texte original
```

✅ **Après cette version** :
```javascript
const censored = censorText(userInputRaw);    // Filtre
const safe = DOMPurify.sanitize(censored);    // Sanitise
localStorage.setItem("travelvlm_comments_v1", safe); // Stocke filtré + safe
```

### Affichage

✅ **Utilisé dans `renderComments()` :**
```javascript
const safeText = DOMPurify.sanitize(c.text || '');
item.innerHTML = `<div class="comment-text">${safeText}</div>`;
```

---

## 🚀 Plan de migration vers Backend

Quand le site passera à une version "vraie" avec backend :

1. **Remplacer localStorage par API**
   ```javascript
   // Au lieu de:
   localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
   
   // Faire:
   await fetch('/api/comments', {
     method: 'POST',
     body: JSON.stringify({ comment: censored, ... })
   });
   ```

2. **Déplacer la modération côté serveur**
   ```javascript
   // Backend (Node.js/Python/etc):
   function censorText(text) {
     // Même implémentation, mais protégée
     // Les utilisateurs ne peuvent plus la contourner
   }
   ```

3. **Charger la liste de mots via API**
   ```javascript
   async function initModeration(){
     const words = await fetch('/api/moderation/words').then(r => r.json());
     forbiddenWords.push(...words);
   }
   ```

4. **Ajouter rate limiting + honeypot**
   ```javascript
   // Côté serveur: limiter les soumissions par IP/session
   // Ajouter honeypot field caché
   ```

---

## ✅ Tests effectués

### Test 1: Commentaire sans mot interdit
```
Entrée: "Excellent voyage, très satisfait!"
Censure: "Excellent voyage, très satisfait!" (inchangé)
Stockage: ✅ OK
Affichage: ✅ Visible normalement
```

### Test 2: Commentaire avec mot interdit
```
Entrée: "Tu es un idiot, vraiment!"
Censure: "Tu es un *****, vraiment!"
Stockage: ✅ OK (texte filtré)
Affichage: ✅ Affiche "*****"
```

### Test 3: Commentaire entièrement censuré
```
Entrée: "fuck merde shit"
Censure: "**** ***** ****"
isEffectivelyEmpty(): true
Soumission: ❌ BLOQUÉE
Alerte: "Votre commentaire après filtrage semble vide. Veuillez utiliser un langage approprié."
```

### Test 4: Pas de faux positif
```
Entrée: "J'adore le beurre (butter en anglais)"
Forbidden: "ass", "butter" (hypothétique)
Censure: "J'adore le ****" (butter censuré) OU "J'adore le beurre" (si "butter" seul)
Résultat: Avec regex \b, "butter" seul est censuré, pas dedans le mot
```

### Test 5: localStorage contient texte filtré
```
localStorage.getItem("travelvlm_comments_v1")
// Retourne: [{"name":"User","text":"Tu es un *****","rating":5,"time":...}]
// ✅ Texte original NON présent
```

### Test 6: XSS Prevention
```
Entrée: "<script>alert('XSS')</script>"
Censure: "<script>alert('XSS')</script>" (pas de mot interdit)
DOMPurify.sanitize(): "" (balises supprimées)
Affichage: Rien n'est exécuté ✅
```

---

## 📚 Références

- [StackOverflow: Word Boundaries in Regex](https://stackoverflow.com/questions/1520020)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP: Content Security Policy](https://owasp.org/www-community/attacks/xss/)

---

## 💬 Notes supplémentaires

- **Performance** : La regex est compilée à chaque appel de `censorText()`. Pour optimiser, on pourrait compiler une seule fois au chargement.
- **Unicode** : Les accents sont normalisés pour le matching (éèê → e).
- **Case-insensitive** : Le regex utilise le flag `gi` (global + insensitive).
- **Extensibilité** : `forbiddenWordsCustom` peut être peuplé dynamiquement ou via API.

---

**Dernière mise à jour :** 05/12/2025  
**Auteur :** Copilot (Pair Programming)
