// Auth Management Script - Enhanced with localStorage detection and optional Firebase
// Include this script in all HTML files for consistent authentication UI

// === STORAGE DETECTION AND FALLBACK ===

/**
 * Détecte si localStorage est disponible
 * @returns {boolean}
 */
function hasLocalStorage() {
    try {
        const k = '__test_ls_' + Date.now();
        localStorage.setItem(k, k);
        localStorage.removeItem(k);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Initialise la session in-memory fallback si localStorage n'est pas disponible
 */
function initInMemorySession() {
    if (!window.__TRAVELVLM_SESSION) {
        window.__TRAVELVLM_SESSION = {};
    }
}

/**
 * Détecte si Firebase est configuré et disponible
 * @returns {boolean}
 */
function hasFirebase() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
}

// Initialiser session in-memory au démarrage
initInMemorySession();

// Afficher message warning si localStorage n'est pas disponible
if (!hasLocalStorage()) {
    const banner = document.createElement('div');
    banner.id = 'ls-warning-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #fff3cd;
        border-bottom: 2px solid #ffc107;
        padding: 12px 16px;
        font-size: 14px;
        z-index: 10000;
        color: #856404;
        font-weight: 500;
    `;
    banner.textContent = '⚠️ Mode restreint : localStorage non disponible. Votre compte sera stocké temporairement pour cette session.';
    document.addEventListener('DOMContentLoaded', function() {
        if (document.body) {
            document.body.insertBefore(banner, document.body.firstChild);
        }
    });
}

// === AUTH FUNCTIONS WITH MULTI-BACKEND SUPPORT ===

/**
 * Enregistre un utilisateur (Firebase -> localStorage -> in-memory)
 */
async function registerUser(email, password, userData = {}) {
    try {
        if (hasFirebase()) {
            // Firebase path
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            // Optionally store user profile in Firestore
            if (firebase.firestore) {
                await firebase.firestore().collection('users').doc(result.user.uid).set({
                    email,
                    ...userData,
                    createdAt: new Date()
                });
            }
            return { success: true, user: result.user, backend: 'firebase' };
        } else if (hasLocalStorage()) {
            // localStorage path
            const users = JSON.parse(localStorage.getItem('travelvlm_users') || '{}');
            if (users[email]) {
                throw new Error('Cet email est déjà utilisé');
            }
            users[email] = { 
                password, 
                ...userData,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('travelvlm_users', JSON.stringify(users));
            localStorage.setItem('travelvlm_current', email);
            return { success: true, user: { email }, backend: 'localStorage' };
        } else {
            // in-memory fallback
            window.__TRAVELVLM_SESSION[email] = { 
                password, 
                ...userData,
                createdAt: new Date().toISOString()
            };
            window.__TRAVELVLM_SESSION.current = email;
            return { success: true, user: { email }, backend: 'memory' };
        }
    } catch (error) {
        return { success: false, error: error.message, backend: 'unknown' };
    }
}

/**
 * Connecte un utilisateur (Firebase -> localStorage -> in-memory)
 */
async function loginUser(email, password) {
    try {
        if (hasFirebase()) {
            // Firebase path
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user, backend: 'firebase' };
        } else if (hasLocalStorage()) {
            // localStorage path
            const users = JSON.parse(localStorage.getItem('travelvlm_users') || '{}');
            if (!users[email] || users[email].password !== password) {
                throw new Error('Email ou mot de passe incorrect');
            }
            localStorage.setItem('travelvlm_current', email);
            return { success: true, user: { email }, backend: 'localStorage' };
        } else {
            // in-memory fallback
            if (!window.__TRAVELVLM_SESSION[email] || window.__TRAVELVLM_SESSION[email].password !== password) {
                throw new Error('Email ou mot de passe incorrect');
            }
            window.__TRAVELVLM_SESSION.current = email;
            return { success: true, user: { email }, backend: 'memory' };
        }
    } catch (error) {
        return { success: false, error: error.message, backend: 'unknown' };
    }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
function getCurrentUser() {
    // sessionStorage for current session
    const currentUser = sessionStorage.getItem('traveldream_currentUser');
    if (currentUser) {
        return JSON.parse(currentUser);
    }
    
    // localStorage fallback
    const email = hasLocalStorage() ? localStorage.getItem('travelvlm_current') : null;
    if (email) {
        return { email, firstname: email.split('@')[0] };
    }
    
    // in-memory fallback
    if (window.__TRAVELVLM_SESSION && window.__TRAVELVLM_SESSION.current) {
        const email = window.__TRAVELVLM_SESSION.current;
        return { email, firstname: email.split('@')[0] };
    }
    
    return null;
}

/**
 * Déconnecte l'utilisateur
 */
function logoutUser() {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        return false;
    }
    
    sessionStorage.removeItem('traveldream_currentUser');
    localStorage.removeItem('traveldream_lastLoginTime');
    
    if (hasFirebase()) {
        firebase.auth().signOut().catch(e => console.error('Firebase logout error:', e));
    }
    
    window.__TRAVELVLM_SESSION.current = null;
    
    window.location.href = 'index.html';
    return true;
}

// === UI SETUP ===

function setupAuthUI() {
    const currentUser = getCurrentUser();
    const headerNav = document.querySelector('header nav') || document.querySelector('nav');
    
    if (!headerNav) return;

    // Remove existing auth buttons
    const existingAuthBtns = headerNav.querySelectorAll('[data-auth-btn]');
    existingAuthBtns.forEach(btn => btn.remove());

    if (currentUser) {
        // User is logged in
        const users = hasLocalStorage() ? JSON.parse(localStorage.getItem('traveldream_users') || '{}') : {};
        const fullUser = users[currentUser.email];
        const initials = currentUser.firstname ? currentUser.firstname.charAt(0).toUpperCase() : '?';
        const avatarColor = fullUser?.avatar?.color || '#667eea';

        const authHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <a href="account.html" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; padding: 8px 12px; border-radius: 5px; background: rgba(255,255,255,0.2); transition: all 0.3s;">
                    <span style="width: 36px; height: 36px; background: ${avatarColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                        ${initials}
                    </span>
                    <span style="display: none; font-weight: 500;">Mon compte</span>
                </a>
                <button onclick="logoutUser()" data-auth-btn="logout" style="background: rgba(255, 255, 255, 0.3); border: 1px solid white; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: 500; transition: all 0.3s;">
                    🚪 Déconnexion
                </button>
            </div>
        `;

        const authContainer = document.createElement('div');
        authContainer.innerHTML = authHTML;
        authContainer.setAttribute('data-auth-btn', 'container');
        headerNav.appendChild(authContainer);

        // Update mobile view
        const mobileAuth = document.createElement('div');
        mobileAuth.innerHTML = `
            <a href="account.html" data-auth-btn="mobile" style="color: white; text-decoration: none; font-weight: 500;">👤 ${currentUser.firstname}</a>
            <button onclick="logoutUser()" data-auth-btn="logout-mobile" style="background: #ff6b6b; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: 500;">Déconnexion</button>
        `;
        mobileAuth.style.display = 'flex';
        mobileAuth.style.gap = '10px';
        mobileAuth.style.flexWrap = 'wrap';
        mobileAuth.setAttribute('data-auth-btn', 'mobile-container');
    } else {
        // User is not logged in
        const authHTML = `
            <a href="login.html" class="nav-btn" data-auth-btn="login" style="color: white; text-decoration: none; padding: 8px 16px; border-radius: 5px; background: rgba(255,255,255,0.2); border: 1px solid white; transition: all 0.3s;">
                🔐 Se connecter
            </a>
            <a href="register.html" class="nav-btn" data-auth-btn="register" style="color: #667eea; text-decoration: none; padding: 8px 16px; border-radius: 5px; background: white; border: 1px solid white; transition: all 0.3s; font-weight: 600;">
                ✍️ S'inscrire
            </a>
        `;

        const authContainer = document.createElement('div');
        authContainer.innerHTML = authHTML;
        authContainer.style.display = 'flex';
        authContainer.style.gap = '10px';
        authContainer.setAttribute('data-auth-btn', 'container');
        headerNav.appendChild(authContainer);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupAuthUI);

// Re-setup when user logs in/out from other pages
window.addEventListener('storage', setupAuthUI);
