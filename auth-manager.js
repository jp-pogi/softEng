// Authentication and Session Management

class AuthManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        // Wait for DOM to be ready before checking auth
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.checkAuth();
                    this.setupSessionTimeout();
                    this.updateUserInfo();
                }, 50);
            });
        } else {
            // DOM is already ready
            setTimeout(() => {
                this.checkAuth();
                this.setupSessionTimeout();
                this.updateUserInfo();
            }, 50);
        }
    }

    checkAuth() {
        const currentUser = dataManager.getCurrentUser();
        const currentPath = window.location.pathname;
        
        // If on dashboard and not logged in, show login button (no auto-redirect)
        if (currentPath.includes('index.html') && !currentUser) {
            // Don't redirect automatically - let user see the page and choose to login
            // The login button will be shown by updateUserInfo()
            return false;
        }
        
        return !!currentUser;
    }

    setupSessionTimeout() {
        let lastActivity = Date.now();
        
        // Update last activity on user interaction
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            }, { passive: true });
        });

        // Check session timeout every minute
        setInterval(() => {
            const currentUser = dataManager.getCurrentUser();
            if (currentUser) {
                const timeSinceActivity = Date.now() - lastActivity;
                if (timeSinceActivity > this.sessionTimeout) {
                    this.logout('Your session has expired. Please login again.');
                }
            }
        }, 60000);
    }

    updateUserInfo() {
        const user = dataManager.getCurrentUser();
        
        // Update user display info - check for both old and new selectors
        if (user) {
            // Try new IDs first
            let userNameEl = document.getElementById('header-user-name');
            let userRoleEl = document.getElementById('header-user-role');
            let userAvatarEl = document.getElementById('header-user-avatar');
            
            // Fallback to old class selectors
            if (!userNameEl) userNameEl = document.querySelector('.user-name');
            if (!userRoleEl) userRoleEl = document.querySelector('.user-role');
            if (!userAvatarEl) userAvatarEl = document.querySelector('.user-avatar');
            
            if (userNameEl) userNameEl.textContent = user.name || 'User';
            if (userRoleEl) userRoleEl.textContent = user.roleTitle || user.role || 'User';
            if (userAvatarEl) {
                // Check if user has a profile picture
                if (user.profilePicture) {
                    // Display profile picture
                    userAvatarEl.style.backgroundImage = `url(${user.profilePicture})`;
                    userAvatarEl.style.backgroundSize = 'cover';
                    userAvatarEl.style.backgroundPosition = 'center';
                    userAvatarEl.textContent = '';
                } else {
                    // Display initials
                    userAvatarEl.style.backgroundImage = 'none';
                    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    userAvatarEl.textContent = initials;
                }
            }
        }
        
        // Don't call updateAuthUI here to avoid recursive loop
        // updateAuthUI will be called separately when needed
    }

    logout(message = 'Logged out successfully') {
        dataManager.logout();
        showNotification(message, 'info');
        setTimeout(() => {
            window.location.href = 'homepage.html';
        }, 1500);
    }

    requireAuth() {
        if (!this.checkAuth()) {
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

