// Auth Management Script
// Include this script in all HTML files for consistent authentication UI

function setupAuthUI() {
    const currentUser = sessionStorage.getItem('traveldream_currentUser');
    const headerNav = document.querySelector('header nav') || document.querySelector('nav');
    
    if (!headerNav) return;

    // Remove existing auth buttons
    const existingAuthBtns = headerNav.querySelectorAll('[data-auth-btn]');
    existingAuthBtns.forEach(btn => btn.remove());

    if (currentUser) {
        // User is logged in
        const user = JSON.parse(currentUser);
        const users = JSON.parse(localStorage.getItem('traveldream_users') || '[]');
        const fullUser = users.find(u => u.id === user.id);

        const authHTML = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <a href="account.html" style="display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; padding: 8px 12px; border-radius: 5px; background: rgba(255,255,255,0.2); transition: all 0.3s;">
                    <span style="width: 36px; height: 36px; background: ${fullUser?.avatar.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                        ${fullUser?.avatar.initials || user.firstname.charAt(0)}
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
            <a href="account.html" data-auth-btn="mobile" style="color: white; text-decoration: none; font-weight: 500;">👤 ${user.firstname}</a>
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

function logoutUser() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        sessionStorage.removeItem('traveldream_currentUser');
        localStorage.removeItem('traveldream_lastLoginTime');
        window.location.href = 'index.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupAuthUI);

// Re-setup when user logs in/out from other pages
window.addEventListener('storage', setupAuthUI);
