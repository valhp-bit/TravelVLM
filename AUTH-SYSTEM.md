# Système d'Authentification Complet - TravelVLM

## 📋 Vue d'ensemble

Un système complet de gestion de compte avec création de compte, connexion, profil et réinitialisation de mot de passe.

---

## 🔧 Fichiers Créés

### 1. **register.html** - Création de Compte
- Formulaire d'inscription avec validation
- Vérification de la force du mot de passe
- Vérification des doublons d'email
- Avatar auto-généré avec initiales et couleur

**Champs:**
- Prénom et Nom
- Email (unique)
- Mot de passe (min 8 caractères)
- Téléphone, Date de naissance, Pays (optionnels)
- Acceptation des conditions

---

### 2. **login.html** - Connexion
- Formulaire de connexion simple et intuitif
- "Se souvenir de moi" pour l'email
- "Mot de passe oublié?" lien vers réinitialisation
- Affichage visuel du mot de passe

**Fonctionnalités:**
- Vérification des identifiants
- Gestion de session (sessionStorage)
- Redirection vers le compte

---

### 3. **account.html** - Profil Utilisateur
Page de gestion du profil avec:

**Sections:**
- 👤 **Informations personnelles** - Édition du profil
- 📊 **Statistiques** - Rendez-vous, commentaires, voyages
- 🔒 **Sécurité** - Gestion du mot de passe, 2FA
- ⚙️ **Préférences** - Notifications, thème
- 📋 **Activité Récente** - Historique des actions

---

### 4. **reset-password.html** - Réinitialisation
Processus en 3 étapes:

**Étape 1:** Email
- Vérification que l'email existe

**Étape 2:** Code de Vérification
- Code à 6 chiffres
- Entrée intuitive avec focus automatique
- Option "Renvoyer"

**Étape 3:** Nouveau Mot de Passe
- Confirmation du mot de passe
- Validation avant mise à jour

---

### 5. **auth-ui.js** - Gestion UI d'Authentification
Script global pour:
- Afficher les boutons de connexion/inscription si non connecté
- Afficher le profil avec avatar si connecté
- Gestion dynamique de la navigation

---

## 💾 Stockage des Données

### localStorage
```javascript
// Utilisateurs
traveldream_users: [
  {
    id: "1733316000000",
    firstname: "Jean",
    lastname: "Dupont",
    email: "jean@example.com",
    password: "hash_a1b2c3d4",
    phone: "+33 6 12 34 56 78",
    birthdate: "1990-01-15",
    country: "France",
    avatar: {
      initials: "JD",
      color: "#667eea"
    },
    createdAt: "2024-12-04T..."
  }
]

// Préférences utilisateur
traveldream_preferences_[userid]: {
  emailNotif: true,
  smsNotif: false,
  promotions: true,
  theme: "light"
}

// Email mémorisé
traveldream_remembered_email: "jean@example.com"

// Dernier login
traveldream_lastLoginTime: "2024-12-04T..."
```

### sessionStorage
```javascript
// Utilisateur actuel
traveldream_currentUser: {
  id: "1733316000000",
  firstname: "Jean",
  lastname: "Dupont",
  email: "jean@example.com",
  avatar: {
    initials: "JD",
    color: "#667eea"
  }
}

// Code de réinitialisation
traveldream_reset_code: "123456"
traveldream_reset_email: "jean@example.com"
```

---

## 🔐 Sécurité

### Notes sur la Sécurité (Développement/Éducation)
⚠️ **IMPORTANT:** Ce système est conçu à des fins éducatives/pédagogiques.

- Les mots de passe sont hashés avec une fonction simple (non production-grade)
- Les données sont stockées en localStorage (accessible au client)
- Pas de backend - tous les données restent côté client
- Les codes de vérification sont générés côté client (simulation)

### Pour une Application Production:
- ✅ Backend avec API sécurisée
- ✅ Hash bcrypt ou Argon2 pour les mots de passe
- ✅ Authentification JWT/OAuth2
- ✅ 2FA/TOTP
- ✅ Chiffrement des données sensibles
- ✅ HTTPS obligatoire
- ✅ Validation CSRF, XSS protection

---

## 📱 Utilisation

### Créer un Compte
1. Cliquer sur "S'inscrire"
2. Remplir le formulaire
3. Accepter les conditions
4. Créer le compte → Redirection vers connexion

### Se Connecter
1. Cliquer sur "Se connecter"
2. Entrer email et mot de passe
3. Optionnel: Cocher "Se souvenir de moi"
4. Connexion réussie → Redirection vers le compte

### Gérer le Profil
1. Cliquer sur l'avatar en haut à droite
2. Éditer les informations
3. Enregistrer les modifications

### Réinitialiser le Mot de Passe
1. Sur la page de connexion: "Mot de passe oublié?"
2. Entrer l'email
3. Entrer le code de vérification (voir console dev)
4. Définir le nouveau mot de passe

---

## 🎨 Intégration dans les Pages

Pour ajouter les boutons d'authentification aux autres pages:

```html
<!-- À la fin du body (avant </body>) -->
<script src="auth-ui.js"></script>
```

Le script:
- Détecte automatiquement si l'utilisateur est connecté
- Affiche les boutons appropriés
- Gère la déconnexion

---

## 🧪 Test Rapide

### Test 1: Création de Compte
```
Email: test@example.com
Mot de passe: Test123!@#
```

### Test 2: Connexion
```
Email: test@example.com
Mot de passe: Test123!@#
```

### Test 3: Voir les Données
Ouvrir DevTools (F12) → Application/Storage → localStorage

---

## 📊 Statistiques

Les statistiques du compte affichent:
- **Rendez-vous**: Nombre total de rendez-vous (traveldream_appts_v1)
- **Commentaires**: Nombre total de commentaires (traveldream_comments_v1)
- **Voyages**: Nombre aléatoire (simulation)

---

## 🔄 Flux d'Authentification

```
index.html (non connecté)
    ↓
  [Cliquer S'inscrire]
    ↓
register.html
    ↓
  [Créer compte] → localStorage (traveldream_users)
    ↓
  Redirection vers login.html
    ↓
login.html
    ↓
  [Se connecter] → sessionStorage (traveldream_currentUser)
    ↓
account.html (connecté)
    ↓
  [Mon profil] → Édition des infos
    ↓
  [Déconnexion] → Suppression sessionStorage
    ↓
index.html (non connecté)
```

---

## 🚀 Améliorations Futures

- [ ] Système de vérification d'email réelle
- [ ] SMS pour la vérification 2FA
- [ ] Intégration Google/Facebook OAuth
- [ ] Historique des activités détaillé
- [ ] Export des données utilisateur
- [ ] Suppression de compte
- [ ] Blocage de compte après N tentatives

---

## 📞 Support

Pour questions ou modifications, consulter le code source dans:
- register.html
- login.html
- account.html
- reset-password.html
- auth-ui.js
