# Système d'Authentification TravelVLM - Documentation Complète

## 📋 Vue d'ensemble

Système d'authentification flexible avec support multi-backend :
- **Mode Bêta (Actif)** : localStorage + fallback in-memory
- **Mode Production (Optionnel)** : Firebase Authentication

---

## 🔧 Architecture

### auth-ui.js - Cœur du Système
Le fichier `auth-ui.js` contient :
- Détection de disponibilité `localStorage`
- Support optionnel Firebase
- Fallback session en mémoire pour environnements restreints
- Fonctions : `registerUser()`, `loginUser()`, `getCurrentUser()`, `logoutUser()`

### Pages Authentification
- **register.html** : Création de compte
- **login.html** : Connexion
- **account.html** : Gestion du profil
- **reset-password.html** : Réinitialisation mot de passe

### Intégration Formulaires
- **rendezvous.html** : Formulaire Formspree
- **commentaire.html** : Stockage localStorage + DOMPurify sanitization
- **voyage_pro.html** : Paiements désactivés (bêta)

---

## 💾 Modes de Stockage

### 1️⃣ Mode localStorage (Par défaut - Bêta)
```javascript
// Format données utilisateurs
localStorage.travelvlm_users = {
  "email@example.com": {
    password: "motdepasse",  // ⚠️ Stocké en clair - démo seulement
    firstname: "Jean",
    lastname: "Dupont",
    email: "email@example.com",
    createdAt: "2024-12-05T..."
  }
};

// Utilisateur actuellement connecté
localStorage.travelvlm_current = "email@example.com";

// Clés réservées à ne pas importer
// - travelvlm_auth*
// - travelvlm_vip*
// - travelvlm_password*
```

### 2️⃣ Mode Firebase (Production)
```javascript
// Si firebase-config.js existe et est configuré :
firebase.initializeApp(firebaseConfig);
firebase.auth().createUserWithEmailAndPassword(email, password);
firebase.auth().signInWithEmailAndPassword(email, password);

// Profils utilisateurs (optionnel, Firestore)
db.collection('users').doc(uid).set({
  email: "...",
  firstname: "...",
  createdAt: serverTimestamp()
});
```

### 3️⃣ Fallback In-Memory (Environnements Restreints)
```javascript
// Stockage temporaire si localStorage indisponible
window.__TRAVELVLM_SESSION = {
  "email@example.com": { password: "...", ... },
  current: "email@example.com"
};
// ⚠️ Données perdues au rechargement de la page
```

### Message Utilisateur
Un banneau informe l'utilisateur si localStorage n'est pas disponible :
```
⚠️ Mode restreint : localStorage non disponible. 
   Votre compte sera stocké temporairement pour cette session.
```

---

## 🔐 Sécurité

### État Actuel (Bêta/Éducation)
⚠️ **NON SÉCURISÉ pour production** :
- Mots de passe stockés en clair (côté client)
- Pas de chiffrement des données
- Pas de validation backend
- localStorage accessible via DevTools

### Passage Production
✅ **À implémenter** :
1. **Backend sécurisé** (Node/Django/PHP)
2. **Hash bcrypt/Argon2** pour mots de passe
3. **JWT ou OAuth2** pour sessions
4. **HTTPS obligatoire**
5. **CSRF tokens** et **XSS protection**
6. **2FA/TOTP**
7. **Rate limiting** sur login

---

## 🚀 Configuration Firebase (Optional)

### Étape 1 : Créer firebase-config.js
```javascript
// firebase-config.js (À créer)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Étape 2 : Ajouter au HTML
```html
<!-- Dans le <head> ou avant </body> -->
<script type="module">
  import { auth } from './firebase-config.js';
  window.firebase = { auth }; // Accessible globalement
</script>
<script src="auth-ui.js"></script>
```

### Étape 3 : Tester
- `hasFirebase()` retournera `true`
- Connexion/Inscription utiliseront Firebase
- Données persitées dans Firebase Authentication

---

## 📧 Configuration Formspree (Rendez-vous)

### Étape 1 : Créer Formspree
1. Aller sur [formspree.io](https://formspree.io)
2. Créer un nouveau formulaire
3. Copier l'ID du formulaire : `f/xvgzqzpo` (exemple)

### Étape 2 : Mettre à jour rendezvous.html
```html
<form id="rendezvousForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- Champs ... -->
</form>
```

### Étape 3 : Tester
- Remplir le formulaire
- Soumettre
- Email reçu dans la boîte Formspree

### Clés Formspree Acceptées
```javascript
{
  firstname: "string",
  lastname: "string",
  email: "string",
  phone: "string",
  preferred_date: "date",
  preferred_time: "time",
  subject: "string",
  message: "string",
  newsletter: "boolean",
  consent: "boolean"
}
```

---

## 🛡️ Sécurité des Commentaires

### Sanitization (DOMPurify)
```html
<!-- Dans commentaire.html -->
<script src="https://unpkg.com/dompurify@2.4.0/dist/purify.min.js"></script>
```

```javascript
// Avant insertion dans le DOM
const safeText = DOMPurify.sanitize(userComment);
element.innerHTML = safeText;
```

### Validation Import JSON
```javascript
// Accepte UNIQUEMENT
{
  name: "string",
  text: "string",
  rating: 1-5,
  email: "optional string",
  time: "optional timestamp"
}

// REFUSE
{
  password: "...",   // ❌ Clé auth
  vip_status: "...", // ❌ Clé VIP
  admin: "..."       // ❌ Clé interdite
}
```

---

## 🥚 Easter Eggs & Achievements

### Clés de Stockage
```javascript
// Oeuf secret (état 0, 1, 2)
localStorage.travelvlm_easter_egg_v1 = "0"; // 🥚 initial

// Achievements
localStorage.travelvlm_achievements = {
  "first_booking": { unlocked: true, unlockedAt: "..." },
  "boss_found": { unlocked: true, unlockedAt: "..." }
};

// Clés VIP (easter egg)
localStorage.travelvlm_vip_user = true;
localStorage.travelvlm_boss_flag = true;
```

### Utilisation
```javascript
// Débloquer achievement
unlockAchievement('first_booking');

// Vérifier
const achievements = JSON.parse(
  localStorage.getItem('travelvlm_achievements') || '{}'
);
```

### Pages Easter Eggs
- **boss.html** / **boss_login.html** : Secret avec flag localStorage
- **login_VIP.html** / **voyages_VIP.html** : VIP mode (démo)
- **hidden_truth.html** / **secret.html** : Autres easter eggs

---

## 📱 Flux de Fonctionnement

### Sans Firebase
```
register.html
    ↓ [registerUser()]
localStorage.travelvlm_users += newUser
    ↓
sessionStorage.traveldream_currentUser = user
    ↓
login.html ← redirect
    ↓ [loginUser()]
localStorage.travelvlm_current = email
sessionStorage.traveldream_currentUser = user
    ↓
account.html (connecté)
    ↓ [logoutUser()]
sessionStorage.traveldream_currentUser = null
localStorage.travelvlm_current = null
    ↓
index.html (déconnecté)
```

### Avec Firebase
```
register.html
    ↓ [registerUser()]
firebase.auth().createUserWithEmailAndPassword()
    ↓
Firestore: users/{uid} = profile
    ↓
sessionStorage.traveldream_currentUser = user
    ↓
login.html ← redirect
    ↓ [loginUser()]
firebase.auth().signInWithEmailAndPassword()
    ↓
sessionStorage.traveldream_currentUser = user
    ↓
account.html (connecté)
```

---

## 🔍 Debugging

### Outils Disponibles

#### 1. Page debugger.html
```
http://localhost/debugger.html
```
Permet de :
- Inspecter localStorage/sessionStorage
- Gérer achievements
- Tester notifications
- Exporter/importer données
- Vérifier état système

#### 2. Console DevTools
```javascript
// Vérifier localStorage
console.log(localStorage);
console.log(JSON.parse(localStorage.getItem('travelvlm_users')));

// Vérifier user actuel
console.log(getCurrentUser());

// Tester hasLocalStorage
console.log(hasLocalStorage());

// Tester Firebase
console.log(hasFirebase());
```

#### 3. Fonctions Test
```javascript
// Dans n'importe quel page
registerUser(email, password, userData);
loginUser(email, password);
getCurrentUser();
logoutUser();
```

---

## 📋 Checklist Déploiement Production

- [ ] Activer Firebase (créer firebase-config.js)
- [ ] Configurer Formspree pour rendezvous
- [ ] Activer 2FA dans Firebase
- [ ] Ajouter HTTPS
- [ ] Implémenter backend custom si besoin
- [ ] Activer paiements Stripe/PayPal
- [ ] Tester tous les formulaires
- [ ] Audit sécurité XSS/CSRF
- [ ] Configurer logs & analytics
- [ ] Documenter pour production

---

## 🆘 Troubleshooting

### Problème : "localStorage non disponible"
```
✅ Solution : Mode fallback in-memory activé automatiquement
   - Vérifier banneau jaune en haut
   - Données perdues au refresh
```

### Problème : Firebase non détecté
```
✅ Solution : Créer firebase-config.js et ajouter au HTML
   - Ou utiliser localStorage par défaut
```

### Problème : Commentaire avec XSS échoue
```
✅ Solution : DOMPurify.sanitize() bloque les scripts
   - Vérifier console pour erreurs
```

### Problème : Import JSON échoue
```
✅ Solution : Vérifier structure JSON acceptée
   - Pas de clés auth/vip/password
   - Format: { name, text, rating, email?, time? }
```

---

## 📚 Ressources

- [Firebase Docs](https://firebase.google.com/docs)
- [Formspree Docs](https://formspree.io/docs)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [OWASP Security](https://owasp.org)

---

**Version** : 2.0 (Bêta + Production-ready)  
**Dernière mise à jour** : 5 décembre 2024  
**Statut** : ✅ En produit
