// Homepage JavaScript functionality
console.log('Homepage script starting to load...');

// ============================================================================
// DEFINE MODAL FUNCTIONS FIRST - BEFORE ANYTHING ELSE
// ============================================================================

// Login modal functionality - Make it globally available IMMEDIATELY
console.log('Defining window.showLoginModal...');
window.showLoginModal = function showLoginModal() {
    console.log('=== showLoginModal function called ===');
    
    // Remove existing modal
    const existingModal = document.querySelector('.login-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Remove register modal if open
    const existingRegisterModal = document.querySelector('.register-modal');
    if (existingRegisterModal) {
        existingRegisterModal.remove();
    }

    // Create login modal with role selection
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.id = 'login-modal-container';
    // Set inline styles with !important to override any CSS - use very high z-index
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important; pointer-events: auto !important; opacity: 1 !important; visibility: visible !important; margin: 0 !important; padding: 0 !important;';
    modal.innerHTML = `
        <div class="modal-content" id="login-modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; width: 400px !important; max-width: 90vw !important; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important; position: relative !important; z-index: 1000000 !important; pointer-events: auto !important; margin: auto !important; opacity: 1 !important; visibility: visible !important; transform: none !important;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E5E7EB;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #1F2937; display: flex; align-items: center; gap: 8px; position: relative;">
                    <span style="width: 40px; height: 40px; background: rgba(37, 99, 235, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-circle" style="color: #2563EB; font-size: 20px;"></i>
                    </span>
                    Login to ToothTrack
                </h3>
                <button class="close-modal" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.background='#F3F4F6'; this.style.color='#1F2937';" onmouseout="this.style.background='none'; this.style.color='#6B7280';">&times;</button>
            </div>
            <form class="login-form">
                <div class="form-group">
                    <label for="login-role">
                        <i class="fas fa-user-tag" style="margin-right: 6px;"></i>
                        I am a
                    </label>
                    <select id="login-role" required>
                        <option value="">Select your role</option>
                        <option value="patient">Patient</option>
                        <option value="dentist">Dentist</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="email">
                        <i class="fas fa-envelope" style="margin-right: 6px;"></i>
                        Email Address
                    </label>
                    <input type="email" id="email" placeholder="Enter your email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock" style="margin-right: 6px;"></i>
                        Password
                    </label>
                    <input type="password" id="password" placeholder="Enter your password" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn btn-primary btn-large">
                    <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
                    Sign In
                </button>
            </form>
            <div class="modal-footer" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center;">
                <p style="margin: 0; color: #6B7280; font-size: 14px;">Don't have an account? <a href="#" class="register-link" id="show-register-modal" style="color: #2563EB; text-decoration: none; font-weight: 500;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Register here</a></p>
            </div>
        </div>
    `;

    // Add modal styles (only if not already added)
    if (!document.getElementById('login-modal-styles')) {
        const modalStyle = document.createElement('style');
        modalStyle.id = 'login-modal-styles';
        modalStyle.textContent = `
        .login-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .login-modal .modal-content {
            background: white !important;
            border-radius: 12px !important;
            padding: 30px !important;
            width: 400px !important;
            max-width: 90vw !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            position: relative !important;
            z-index: 100000 !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        `;
        document.head.appendChild(modalStyle);
    }

    // Add to document
    document.body.appendChild(modal);
    
    // Force modal to be visible immediately - multiple attempts
    const forceVisible = () => {
        modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important; pointer-events: auto !important; opacity: 1 !important; visibility: visible !important; margin: 0 !important; padding: 0 !important;';
        console.log('Login modal appended');
        console.log('Modal element:', modal);
        console.log('Modal in DOM:', document.body.contains(modal));
        console.log('Modal visible:', modal.offsetParent !== null);
        console.log('Modal computed display:', window.getComputedStyle(modal).display);
        console.log('Modal computed z-index:', window.getComputedStyle(modal).zIndex);
        console.log('Modal computed opacity:', window.getComputedStyle(modal).opacity);
        
        // Check if modal content exists
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            console.log('Modal content found:', modalContent);
            console.log('Modal content display:', window.getComputedStyle(modalContent).display);
        } else {
            console.error('Modal content NOT found!');
        }
    };
    
    forceVisible();
    setTimeout(forceVisible, 10);
    setTimeout(forceVisible, 50);

    // Close modal functionality
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none'; // Disable clicks during fade out
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
            // Ensure buttons are still clickable after modal removal
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            if (loginBtn) {
                loginBtn.style.pointerEvents = 'auto';
                loginBtn.disabled = false;
                loginBtn.style.opacity = '1';
            }
            if (registerBtn) {
                registerBtn.style.pointerEvents = 'auto';
                registerBtn.disabled = false;
                registerBtn.style.opacity = '1';
            }
        }, 300);
    }
    
    const closeBtn = modal.querySelector('.close-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }
    
    // Close on overlay click (clicking outside modal)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent modal content clicks from closing the modal
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Add fadeOut animation (only if not already added)
    if (!document.getElementById('fadeOut-animation')) {
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.id = 'fadeOut-animation';
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
    }

    // Form submission
    const form = modal.querySelector('.login-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const role = form.querySelector('#login-role').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        // Simple validation
        if (!role || !email || !password) {
            if (typeof showNotification !== 'undefined') {
                showNotification('Please fill in all fields', 'error');
            } else {
                alert('Please fill in all fields');
            }
            return;
        }
        
        // Check if dataManager is available
        if (typeof dataManager === 'undefined') {
            alert('System is initializing. Please try again in a moment.');
            return;
        }
        
        // Authenticate user
        const user = dataManager.authenticate(email, password);
        
        if (user) {
            // Verify role matches
            if (user.role !== role) {
                if (typeof showNotification !== 'undefined') {
                    showNotification(`Invalid credentials for ${role}. Please check your role selection.`, 'error');
                } else {
                    alert(`Invalid credentials for ${role}. Please check your role selection.`);
                }
                return;
            }
            
            dataManager.setCurrentUser(user);
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                closeModal();
                if (typeof showNotification !== 'undefined') {
                    showNotification('Login successful! Redirecting...', 'success');
                } else {
                    alert('Login successful! Redirecting...');
                }
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 1500);
            }, 1000);
        } else {
            if (typeof showNotification !== 'undefined') {
                showNotification('Invalid email or password', 'error');
            } else {
                alert('Invalid email or password');
            }
        }
    });

    // Register link handler
    const registerLink = modal.querySelector('#show-register-modal');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
        });
    }
};

// Registration modal - Make it globally available IMMEDIATELY
console.log('Defining window.showRegisterModal...');
window.showRegisterModal = function showRegisterModal() {
    console.log('=== showRegisterModal function called ===');
    
    const existingModal = document.querySelector('.register-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Remove login modal if open
    const existingLoginModal = document.querySelector('.login-modal');
    if (existingLoginModal) {
        existingLoginModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'register-modal';
    modal.id = 'register-modal-container';
    // Set inline styles with !important to override any CSS - use very high z-index
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important; pointer-events: auto !important; opacity: 1 !important; visibility: visible !important; margin: 0 !important; padding: 0 !important;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; width: 500px !important; max-width: 90vw !important; max-height: 90vh !important; overflow-y: auto !important; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important; position: relative !important; z-index: 100000 !important; pointer-events: auto !important; opacity: 1 !important; visibility: visible !important;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E5E7EB;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #1F2937; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-plus" style="color: #2563EB;"></i>
                        Create Account
                    </h3>
                    <button class="close-modal" style="background: none; border: none; font-size: 24px; color: #6B7280; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.background='#F3F4F6'; this.style.color='#1F2937';" onmouseout="this.style.background='none'; this.style.color='#6B7280';">&times;</button>
                </div>
                <form class="register-form">
                    <div class="form-group">
                        <label for="reg-role">
                            <i class="fas fa-user-tag" style="margin-right: 6px;"></i>
                            I am registering as *
                        </label>
                        <select id="reg-role" name="role" required>
                            <option value="">Select your role</option>
                            <option value="patient">Patient</option>
                            <option value="dentist">Dentist</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reg-name">
                            <i class="fas fa-user" style="margin-right: 6px;"></i>
                            Full Name *
                        </label>
                        <input type="text" id="reg-name" name="name" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="reg-email">
                            <i class="fas fa-envelope" style="margin-right: 6px;"></i>
                            Email Address *
                        </label>
                        <input type="email" id="reg-email" name="email" placeholder="Enter your email" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="reg-phone">
                            <i class="fas fa-phone" style="margin-right: 6px;"></i>
                            Phone
                        </label>
                        <input type="tel" id="reg-phone" name="phone" placeholder="Enter your phone number">
                    </div>
                    <div class="form-group">
                        <label for="reg-password">
                            <i class="fas fa-lock" style="margin-right: 6px;"></i>
                            Password *
                        </label>
                        <input type="password" id="reg-password" name="password" placeholder="Enter your password" required autocomplete="new-password">
                        <small class="password-hint">Must be at least 8 characters with uppercase, lowercase, and number</small>
                    </div>
                    <div class="form-group">
                        <label for="reg-confirm-password">
                            <i class="fas fa-lock" style="margin-right: 6px;"></i>
                            Confirm Password *
                        </label>
                        <input type="password" id="reg-confirm-password" name="confirmPassword" placeholder="Confirm your password" required autocomplete="new-password">
                    </div>
                    <div class="form-group" id="patient-fields" style="display: none;">
                        <label for="reg-dob">
                            <i class="fas fa-calendar" style="margin-right: 6px;"></i>
                            Date of Birth
                        </label>
                        <input type="date" id="reg-dob" name="dob">
                    </div>
                    <div class="form-group" id="patient-address-field" style="display: none;">
                        <label for="reg-address">
                            <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i>
                            Address
                        </label>
                        <textarea id="reg-address" name="address" rows="2" placeholder="Enter your address"></textarea>
                    </div>
                    <div id="dentist-clinic-fields" style="display: none;">
                        <div style="margin: 20px 0; padding: 16px; background: #F0F9FF; border-left: 4px solid #2563EB; border-radius: 4px;">
                            <h4 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-hospital" style="color: #2563EB;"></i>
                                Clinic Information
                            </h4>
                            <div class="form-group">
                                <label for="reg-clinic-name">
                                    <i class="fas fa-hospital" style="margin-right: 6px;"></i>
                                    Clinic Name *
                                </label>
                                <input type="text" id="reg-clinic-name" name="clinicName" placeholder="e.g., ISEM Dental Clinic">
                            </div>
                            <div class="form-group">
                                <label for="reg-branch">
                                    <i class="fas fa-building" style="margin-right: 6px;"></i>
                                    Branch
                                </label>
                                <input type="text" id="reg-branch" name="branch" placeholder="e.g., Laoag City">
                            </div>
                            <div class="form-group">
                                <label for="reg-clinic-address">
                                    <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i>
                                    Clinic Address *
                                </label>
                                <textarea id="reg-clinic-address" name="clinicAddress" rows="2" placeholder="Enter your clinic's full address"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="reg-clinic-phone">
                                    <i class="fas fa-phone" style="margin-right: 6px;"></i>
                                    Clinic Phone *
                                </label>
                                <input type="tel" id="reg-clinic-phone" name="clinicPhone" placeholder="e.g., 09665494955">
                            </div>
                            <div class="form-group">
                                <label for="reg-clinic-email">
                                    <i class="fas fa-envelope" style="margin-right: 6px;"></i>
                                    Clinic Email
                                </label>
                                <input type="email" id="reg-clinic-email" name="clinicEmail" placeholder="e.g., contact@clinic.com">
                            </div>
                            <div class="form-group">
                                <label for="reg-weekdays-hours">
                                    <i class="fas fa-clock" style="margin-right: 6px;"></i>
                                    Working Hours (Weekdays) *
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center;">
                                    <div>
                                        <label style="font-size: 12px; color: #6B7280; margin-bottom: 4px; display: block;">Start Time</label>
                                        <input type="time" id="reg-weekdays-start" name="weekdaysStart" style="width: 100%;">
                                    </div>
                                    <span style="color: #6B7280; font-weight: 500; margin-top: 20px;">to</span>
                                    <div>
                                        <label style="font-size: 12px; color: #6B7280; margin-bottom: 4px; display: block;">End Time</label>
                                        <input type="time" id="reg-weekdays-end" name="weekdaysEnd" style="width: 100%;">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="reg-saturday-hours">
                                    <i class="fas fa-clock" style="margin-right: 6px;"></i>
                                    Working Hours (Saturday)
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center;">
                                    <div>
                                        <label style="font-size: 12px; color: #6B7280; margin-bottom: 4px; display: block;">Start Time</label>
                                        <input type="time" id="reg-saturday-start" name="saturdayStart" style="width: 100%;">
                                    </div>
                                    <span style="color: #6B7280; font-weight: 500; margin-top: 20px;">to</span>
                                    <div>
                                        <label style="font-size: 12px; color: #6B7280; margin-bottom: 4px; display: block;">End Time</label>
                                        <input type="time" id="reg-saturday-end" name="saturdayEnd" style="width: 100%;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-large">
                        <i class="fas fa-user-plus" style="margin-right: 8px;"></i>
                        Register
                    </button>
                </form>
                <div class="modal-footer" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center;">
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">Already have an account? <a href="#" class="login-link" style="color: #2563EB; text-decoration: none; font-weight: 500;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Login here</a></p>
                </div>
        </div>
    `;

    // Add register modal styles (only if not already added)
    if (!document.getElementById('register-modal-styles')) {
        const registerStyle = document.createElement('style');
        registerStyle.id = 'register-modal-styles';
        registerStyle.textContent = `
        .register-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .register-modal .modal-content {
            background: white !important;
            border-radius: 12px !important;
            padding: 30px !important;
            width: 500px !important;
            max-width: 90vw !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            position: relative !important;
            z-index: 100000 !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        `;
        document.head.appendChild(registerStyle);
    }

    document.body.appendChild(modal);
    
    // Force modal to be visible immediately - multiple attempts
    const forceVisible = () => {
        modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important; pointer-events: auto !important; opacity: 1 !important; visibility: visible !important; margin: 0 !important; padding: 0 !important;';
        console.log('Register modal appended');
        console.log('Register modal element:', modal);
        console.log('Register modal in DOM:', document.body.contains(modal));
        console.log('Register modal visible:', modal.offsetParent !== null);
        console.log('Register modal computed display:', window.getComputedStyle(modal).display);
        console.log('Register modal computed z-index:', window.getComputedStyle(modal).zIndex);
        
        // Check if modal content exists
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            console.log('Register modal content found:', modalContent);
            console.log('Register modal content display:', window.getComputedStyle(modalContent).display);
        } else {
            console.error('Register modal content NOT found!');
        }
    };
    
    forceVisible();
    setTimeout(forceVisible, 10);
    setTimeout(forceVisible, 50);

    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none'; // Disable clicks during fade out
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
            // Ensure buttons are still clickable after modal removal
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            if (loginBtn) {
                loginBtn.style.pointerEvents = 'auto';
                loginBtn.disabled = false;
                loginBtn.style.opacity = '1';
            }
            if (registerBtn) {
                registerBtn.style.pointerEvents = 'auto';
                registerBtn.disabled = false;
                registerBtn.style.opacity = '1';
            }
        }, 300);
    }
    
    const closeBtn = modal.querySelector('.close-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }
    
    // Close on overlay click (clicking outside modal)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent modal content clicks from closing the modal
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Show/hide role-specific fields based on role selection
    const roleSelect = modal.querySelector('#reg-role');
    const patientFields = modal.querySelector('#patient-fields');
    const patientAddressField = modal.querySelector('#patient-address-field');
    const dentistClinicFields = modal.querySelector('#dentist-clinic-fields');
    
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            if (this.value === 'patient') {
                // Show patient fields, hide dentist fields
                if (patientFields) patientFields.style.display = 'block';
                if (patientAddressField) patientAddressField.style.display = 'block';
                if (dentistClinicFields) dentistClinicFields.style.display = 'none';
                
                // Remove required attributes from dentist fields
                removeDentistRequired();
            } else if (this.value === 'dentist') {
                // Show dentist fields, hide patient fields
                if (patientFields) patientFields.style.display = 'none';
                if (patientAddressField) patientAddressField.style.display = 'none';
                if (dentistClinicFields) dentistClinicFields.style.display = 'block';
                
                // Add required attributes to dentist clinic fields
                addDentistRequired();
            } else {
                // Hide all role-specific fields
                if (patientFields) patientFields.style.display = 'none';
                if (patientAddressField) patientAddressField.style.display = 'none';
                if (dentistClinicFields) dentistClinicFields.style.display = 'none';
                
                // Remove required attributes from dentist fields
                removeDentistRequired();
            }
        });
    }

    // Form submission
    const form = modal.querySelector('.register-form');
    if (!form) {
        console.error('Register form not found!');
        return;
    }
    
    console.log('Register form found, adding submit listener...');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Register form submitted!');
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('Form data:', data);
        
        // Validation
        if (!data.role) {
            if (typeof showNotification !== 'undefined') {
                showNotification('Please select your role', 'error');
            } else {
                alert('Please select your role');
            }
            return;
        }
        
        // Validate dentist clinic information
        if (data.role === 'dentist') {
            if (!data.clinicName || !data.clinicName.trim()) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('Clinic name is required for dentists', 'error');
                } else {
                    alert('Clinic name is required for dentists');
                }
                return;
            }
            if (!data.clinicAddress || !data.clinicAddress.trim()) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('Clinic address is required for dentists', 'error');
                } else {
                    alert('Clinic address is required for dentists');
                }
                return;
            }
            if (!data.clinicPhone || !data.clinicPhone.trim()) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('Clinic phone is required for dentists', 'error');
                } else {
                    alert('Clinic phone is required for dentists');
                }
                return;
            }
            if (!data.weekdaysStart || !data.weekdaysEnd) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('Working hours (weekdays) are required for dentists', 'error');
                } else {
                    alert('Working hours (weekdays) are required for dentists');
                }
                return;
            }
        }
        
        // Helper function to convert 24-hour time (HH:MM) to 12-hour format (HH:MM AM/PM)
        const formatTimeTo12Hour = (time24) => {
            if (!time24) return '';
            const [hours, minutes] = time24.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        };
        
        // Convert time picker values to the expected format for dentists
        let weekdaysHours = '8:00 AM - 6:00 PM';
        let saturdayHours = '8:00 AM - 4:00 PM';
        if (data.role === 'dentist') {
            weekdaysHours = `${formatTimeTo12Hour(data.weekdaysStart)} - ${formatTimeTo12Hour(data.weekdaysEnd)}`;
            if (data.saturdayStart && data.saturdayEnd) {
                saturdayHours = `${formatTimeTo12Hour(data.saturdayStart)} - ${formatTimeTo12Hour(data.saturdayEnd)}`;
            }
        }
        
        if (data.password !== data.confirmPassword) {
            if (typeof showNotification !== 'undefined') {
                showNotification('Passwords do not match', 'error');
            } else {
                alert('Passwords do not match');
            }
            return;
        }

        // Check if validationManager is available
        if (typeof validationManager !== 'undefined') {
            const passwordValidation = validationManager.validatePassword(data.password);
            if (!passwordValidation.isValid) {
                if (typeof showNotification !== 'undefined') {
                    showNotification(passwordValidation.errors[0], 'error');
                } else {
                    alert(passwordValidation.errors[0]);
                }
                return;
            }
        } else {
            // Basic password validation if validationManager not available
            if (data.password.length < 8) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('Password must be at least 8 characters', 'error');
                } else {
                    alert('Password must be at least 8 characters');
                }
                return;
            }
        }

        // Check if dataManager is available
        if (typeof dataManager === 'undefined') {
            if (typeof showNotification !== 'undefined') {
                showNotification('System is initializing. Please try again in a moment.', 'error');
            } else {
                alert('System is initializing. Please try again in a moment.');
            }
            return;
        }

        // Create user using dataManager (database)
        try {
            const userData = {
                email: data.email,
                password: data.password,
                role: data.role,
                name: data.name,
                phone: data.phone,
                dob: data.dob,
                address: data.address,
                roleTitle: data.role === 'patient' ? 'Patient' : 
                          data.role === 'dentist' ? 'Dentist' : 'User'
            };
            
            // Add clinic information for dentists
            if (data.role === 'dentist') {
                userData.clinicName = data.clinicName || '';
                userData.branch = data.branch || '';
                userData.clinicAddress = data.clinicAddress || '';
                userData.clinicPhone = data.clinicPhone || '';
                userData.clinicEmail = data.clinicEmail || '';
                // Use clinic address as primary address if provided
                if (data.clinicAddress) {
                    userData.address = data.clinicAddress;
                }
                // Use clinic phone as primary phone if provided
                if (data.clinicPhone) {
                    userData.phone = data.clinicPhone;
                }
                userData.workingHours = {
                    weekdays: weekdaysHours,
                    saturday: saturdayHours,
                    sunday: 'Closed'
                };
                // Store clinic settings
                userData.clinicSettings = {
                    clinicName: data.clinicName || '',
                    branch: data.branch || '',
                    address: data.clinicAddress || '',
                    phone: data.clinicPhone || data.phone || '',
                    email: data.clinicEmail || data.email,
                    workingHours: {
                        weekdays: weekdaysHours,
                        saturday: saturdayHours,
                        sunday: 'Closed'
                    }
                };
            }
            
            const newUser = dataManager.createUser(userData);
            
            console.log('User created successfully:', newUser);
            
            // Verify patient record was created if patient
            if (userData.role === 'patient') {
                const patients = dataManager.getPatients();
                const patientRecord = patients.find(p => p && (p.id === newUser.id || p.email === newUser.email));
                if (!patientRecord) {
                    console.warn('Patient record was not created, attempting to create manually...');
                    try {
                        dataManager.createPatient({
                            id: newUser.id,
                            name: newUser.name,
                            email: newUser.email,
                            phone: newUser.phone || '',
                            dob: newUser.dob || '',
                            address: newUser.address || ''
                        });
                        console.log('Patient record created manually');
                    } catch (patientError) {
                        console.error('Error creating patient record manually:', patientError);
                    }
                } else {
                    console.log('Patient record found:', patientRecord);
                }
            }

            if (typeof showNotification !== 'undefined') {
                showNotification('Registration successful! Please login.', 'success');
            } else {
                alert('Registration successful! Please login.');
            }
            setTimeout(() => {
                closeModal();
                if (typeof window.showLoginModal === 'function') {
                    window.showLoginModal();
                }
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error stack:', error.stack);
            if (typeof showNotification !== 'undefined') {
                showNotification(error.message || 'Registration failed. Please try again.', 'error');
            } else {
                alert(error.message || 'Registration failed. Please try again.');
            }
        }
    });

    // Login link
    const loginLink = modal.querySelector('.login-link');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            // Small delay to ensure modal is fully closed
            setTimeout(() => {
                if (typeof window.showLoginModal === 'function') {
                    window.showLoginModal();
                }
            }, 350);
        });
    }
};

// Functions are already defined on window object above

// Set up button handlers immediately if DOM is ready, otherwise wait for DOMContentLoaded
function setupLoginRegisterButtons() {
    console.log('=== Setting up login/register buttons ===');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    console.log('Login button found:', loginBtn);
    console.log('Register button found:', registerBtn);
    console.log('showLoginModal available:', typeof window.showLoginModal);
    console.log('showRegisterModal available:', typeof window.showRegisterModal);
    
    if (loginBtn) {
        // Remove any existing listeners by cloning
        const newLogin = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLogin, loginBtn);
        
        newLogin.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== LOGIN BUTTON CLICKED ===');
            console.log('showLoginModal type:', typeof window.showLoginModal);
            
            try {
                if (typeof window.showLoginModal === 'function') {
                    console.log('Calling showLoginModal...');
                    window.showLoginModal();
                    console.log('showLoginModal called successfully');
                } else {
                    console.error('showLoginModal is not a function!');
                    alert('Login feature is not available. Please refresh the page.');
                }
            } catch (error) {
                console.error('Error calling showLoginModal:', error);
                alert('Error opening login modal: ' + error.message);
            }
            return false;
        });
        
        // Also add onclick as backup
        newLogin.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login onclick triggered');
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
            return false;
        };
        
        console.log('Login button handler attached');
    } else {
        console.error('Login button not found!');
    }
    
    if (registerBtn) {
        // Remove any existing listeners by cloning
        const newRegister = registerBtn.cloneNode(true);
        registerBtn.parentNode.replaceChild(newRegister, registerBtn);
        
        newRegister.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== REGISTER BUTTON CLICKED ===');
            console.log('showRegisterModal type:', typeof window.showRegisterModal);
            
            try {
                if (typeof window.showRegisterModal === 'function') {
                    console.log('Calling showRegisterModal...');
                    window.showRegisterModal();
                    console.log('showRegisterModal called successfully');
                } else {
                    console.error('showRegisterModal is not a function!');
                    alert('Register feature is not available. Please refresh the page.');
                }
            } catch (error) {
                console.error('Error calling showRegisterModal:', error);
                alert('Error opening register modal: ' + error.message);
            }
            return false;
        });
        
        // Also add onclick as backup
        newRegister.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Register onclick triggered');
            if (typeof window.showRegisterModal === 'function') {
                window.showRegisterModal();
            }
            return false;
        };
        
        console.log('Register button handler attached');
    } else {
        console.error('Register button not found!');
    }
}

// Try to set up immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded fired');
        setupLoginRegisterButtons();
    });
} else {
    // DOM is already ready
    console.log('DOM already ready, setting up buttons immediately');
    setupLoginRegisterButtons();
}

// Also try after multiple delays to ensure everything is loaded
setTimeout(function() {
    console.log('Delayed setup attempt 1 (100ms)');
    setupLoginRegisterButtons();
}, 100);

setTimeout(function() {
    console.log('Delayed setup attempt 2 (500ms)');
    setupLoginRegisterButtons();
}, 500);

setTimeout(function() {
    console.log('Delayed setup attempt 3 (1000ms)');
    setupLoginRegisterButtons();
}, 1000);

// Also set up on window load as final fallback
window.addEventListener('load', function() {
    console.log('Window load event fired');
    setupLoginRegisterButtons();
});

document.addEventListener('DOMContentLoaded', function() {
    const patientLoginBtn = document.getElementById('patient-login');
    const staffLoginBtn = document.getElementById('staff-login');
    const bookAppointmentBtn = document.querySelector('.hero-buttons .btn-primary');
    const learnMoreBtn = document.querySelector('.hero-buttons .btn-outline');
    const serviceBtns = document.querySelectorAll('.service-btn');
    const scheduleBtns = document.querySelectorAll('.schedule-card .btn');

    // Login and Register buttons are set up in setupLoginRegisterButtons() above
    // This ensures they work even if clicked before DOMContentLoaded

    // Book appointment button functionality
    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', function() {
            // Check if user is logged in as patient
            const user = typeof dataManager !== 'undefined' ? dataManager.getCurrentUser() : null;
            if (user && user.role === 'patient') {
                // Show dentist selection modal
                showDentistSelectionModal();
            } else {
                // If not logged in, redirect to dashboard
                window.location.href = 'index.html#book-appointment';
            }
        });
    }

    // Learn more button functionality
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Scroll to services section
            const servicesSection = document.querySelector('.services');
            if (servicesSection) {
                servicesSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

    // Service buttons functionality
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            if (serviceCard) {
                const serviceNameEl = serviceCard.querySelector('h3');
                if (serviceNameEl) {
                    const serviceName = serviceNameEl.textContent;
                    if (typeof showServiceModal !== 'undefined') {
                        showServiceModal(serviceName);
                    }
                }
            }
        });
    });

    // Schedule buttons functionality
    scheduleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Book')) {
                // Check if user is logged in as patient
                const user = typeof dataManager !== 'undefined' ? dataManager.getCurrentUser() : null;
                if (user && user.role === 'patient') {
                    // Show dentist selection modal
                    showDentistSelectionModal();
                } else {
                    // If not logged in, redirect to dashboard
                    window.location.href = 'index.html#book-appointment';
                }                   
            } else if (this.textContent.includes('Call')) {
                // Copy phone number to clipboard
                copyToClipboard('(+63) 9123-456-7891');
                showNotification('Phone number copied to clipboard!', 'success');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .service-card').forEach(el => {
        observer.observe(el);
    });
    
    // Test: Try to show modal immediately after page load (for testing)
    console.log('=== PAGE LOADED ===');
    console.log('Testing button availability...');
    const testLoginBtn = document.getElementById('login-btn');
    const testRegisterBtn = document.getElementById('register-btn');
    console.log('Test - Login button:', testLoginBtn);
    console.log('Test - Register button:', testRegisterBtn);
    console.log('Test - showLoginModal function:', typeof showLoginModal);
    console.log('Test - showRegisterModal function:', typeof showRegisterModal);
    console.log('Test - window.showLoginModal:', typeof window.showLoginModal);
    console.log('Test - window.showRegisterModal:', typeof window.showRegisterModal);
    
    // Functions should already be globally available from top of file
    // But ensure they're definitely set
    if (typeof window.showLoginModal === 'function') {
        console.log('✅ window.showLoginModal is available');
    } else {
        console.error('❌ window.showLoginModal is NOT available!');
    }
    
    if (typeof window.showRegisterModal === 'function') {
        console.log('✅ window.showRegisterModal is available');
    } else {
        console.error('❌ window.showRegisterModal is NOT available!');
    }
});

// NOTE: Removed duplicate/orphaned code block that was causing JavaScript syntax errors
// The modal functions are already properly defined above in the showLoginModal and showRegisterModal functions

// Service modal functionality
function showServiceModal(serviceName) {
    console.log('showServiceModal called for:', serviceName);
    
    // Simple service info modal
    const modal = document.createElement('div');
    modal.className = 'service-modal';
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; max-width: 500px !important; width: 90% !important;">
            <div class="modal-header">
                <h3>${serviceName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <p>Information about ${serviceName} service.</p>
            <button class="btn btn-primary" onclick="this.closest('.service-modal').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// NOTE: Removed duplicate/malformed showServiceModal function that was causing syntax errors
// The correct showServiceModal function is defined below


// Service modal functionality
function showServiceModal(serviceName) {
    const serviceDetails = {
        'General Checkup': {
            description: 'A comprehensive dental examination including visual inspection, X-rays if needed, and professional cleaning.',
            duration: '45 minutes',
            price: '₱ 800',
            includes: ['Visual examination', 'X-rays if needed', 'Professional cleaning', 'Oral health assessment']
        },
        'Dental Cleaning': {
            description: 'Professional teeth cleaning to remove plaque and tartar buildup.',
            duration: '1 hour',
            price: '₱ 1,500',
            includes: ['Plaque removal', 'Tartar scaling', 'Teeth polishing', 'Fluoride treatment']
        },
        'Tooth Filling': {
            description: 'Restoration of decayed or damaged teeth using composite or amalgam materials.',
            duration: '1 hour 30 minutes',
            price: '₱ 2,500',
            includes: ['Cavity preparation', 'Filling placement', 'Shaping and polishing', 'Follow-up care']
        },
        'Tooth Extraction': {
            description: 'Safe and comfortable removal of damaged or problematic teeth.',
            duration: '45 minutes',
            price: '₱ 2,000',
            includes: ['Local anesthesia', 'Tooth removal', 'Post-extraction care', 'Recovery instructions']
        },
        'Root Canal': {
            description: 'Endodontic treatment to save infected or damaged teeth.',
            duration: '2 hours',
            price: '₱ 8,000',
            includes: ['Nerve removal', 'Canal cleaning', 'Filling and sealing', 'Crown placement if needed']
        },
        'Braces Consultation': {
            description: 'Orthodontic assessment and treatment planning for teeth alignment.',
            duration: '1 hour',
            price: '₱ 1,200',
            includes: ['Orthodontic examination', 'Treatment planning', 'Cost estimation', 'Timeline discussion']
        }
    };

    const service = serviceDetails[serviceName];
    if (!service) return;

    // Remove existing modal
    const existingModal = document.querySelector('.service-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create service modal
    const modal = document.createElement('div');
    modal.className = 'service-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${serviceName}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="service-details">
                    <div class="service-info">
                        <div class="info-item">
                            <span class="label">Duration:</span>
                            <span class="value">${service.duration}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Price:</span>
                            <span class="value">${service.price}</span>
                        </div>
                    </div>
                    <div class="service-description">
                        <h4>Description</h4>
                        <p>${service.description}</p>
                    </div>
                    <div class="service-includes">
                        <h4>What's Included</h4>
                        <ul>
                            ${service.includes.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="service-actions">
                        <button class="btn btn-primary">Book This Service</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add service modal styles
    const serviceModalStyle = document.createElement('style');
    serviceModalStyle.textContent = `
        .service-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .service-modal .modal-content {
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            z-index: 10001;
        }
        
        .service-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
            padding: 16px;
            background: #F9FAFB;
            border-radius: 8px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .info-item .label {
            font-weight: 500;
            color: #6B7280;
        }
        
        .info-item .value {
            font-weight: 600;
            color: #1F2937;
        }
        
        .service-description,
        .service-includes {
            margin-bottom: 24px;
        }
        
        .service-description h4,
        .service-includes h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 8px;
        }
        
        .service-description p {
            color: #6B7280;
            line-height: 1.6;
        }
        
        .service-includes ul {
            list-style: none;
            padding: 0;
        }
        
        .service-includes li {
            padding: 4px 0;
            color: #6B7280;
            position: relative;
            padding-left: 20px;
        }
        
        .service-includes li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: 600;
        }
        
        .service-actions {
            display: flex;
            justify-content: center;
        }
        
        .service-actions .btn {
            width: auto;
            min-width: 200px;
            padding: 12px 32px;
        }
    `;
    document.head.appendChild(serviceModalStyle);

    // Add to document
    document.body.appendChild(modal);

    // Close modal functionality - FIXED
    const closeBtn = modal.querySelector('.close-modal');
    const overlay = modal.querySelector('.modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Prevent modal content clicks from closing the modal
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }

    // Book service button
    const bookBtn = modal.querySelector('.service-actions .btn-primary');
    bookBtn.addEventListener('click', function() {
        closeModal();
        showNotification('Redirecting to appointment booking...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html#book-appointment';
        }, 1000);
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function showLoadingState(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Add notification styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(notificationStyle);

// Final verification - log that script has loaded
console.log('=== HOMEPAGE SCRIPT LOADED ===');
console.log('showLoginModal available:', typeof window.showLoginModal);
console.log('showRegisterModal available:', typeof window.showRegisterModal);

// Test button availability after a delay
setTimeout(function() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    console.log('=== FINAL BUTTON CHECK ===');
    console.log('Login button:', loginBtn);
    console.log('Register button:', registerBtn);
    if (loginBtn) {
        console.log('Login button onclick:', loginBtn.onclick);
        console.log('Login button has listeners:', loginBtn.onclick !== null);
    }
    if (registerBtn) {
        console.log('Register button onclick:', registerBtn.onclick);
        console.log('Register button has listeners:', registerBtn.onclick !== null);
    }
}, 2000);

// Final verification that functions are defined
console.log('=== FINAL FUNCTION VERIFICATION ===');
console.log('window.showLoginModal defined:', typeof window.showLoginModal === 'function');
console.log('window.showRegisterModal defined:', typeof window.showRegisterModal === 'function');

if (typeof window.showLoginModal !== 'function') {
    console.error('❌ CRITICAL: window.showLoginModal is NOT a function!');
}
if (typeof window.showRegisterModal !== 'function') {
    console.error('❌ CRITICAL: window.showRegisterModal is NOT a function!');
}

// Load logged-in user info and display dentists
function initHomepageForLoggedInUser() {
    // Wait for dataManager to be available
    if (typeof dataManager === 'undefined') {
        setTimeout(initHomepageForLoggedInUser, 100);
        return;
    }
    
    const user = dataManager.getCurrentUser();
    
    // Redirect dentists back to dashboard - they shouldn't access homepage
    if (user && user.role === 'dentist') {
        window.location.href = 'index.html';
        return;
    }
    
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    
    if (user) {
        // User is logged in - show user info, hide login buttons
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) userSection.style.display = 'flex';
        
        // Update user info
        const userNameEl = document.getElementById('homepage-user-name');
        const userRoleEl = document.getElementById('homepage-user-role');
        const userAvatarEl = document.getElementById('homepage-user-avatar');
        
        if (userNameEl) userNameEl.textContent = user.name || 'User';
        if (userRoleEl) userRoleEl.textContent = user.roleTitle || user.role || 'User';
        if (userAvatarEl) {
            if (user.profilePicture) {
                userAvatarEl.style.backgroundImage = `url(${user.profilePicture})`;
                userAvatarEl.style.backgroundSize = 'cover';
                userAvatarEl.style.backgroundPosition = 'center';
                userAvatarEl.textContent = '';
            } else {
                userAvatarEl.style.backgroundImage = 'none';
                const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                userAvatarEl.textContent = initials;
            }
        }
    } else {
        // User is not logged in - show login buttons, hide user info
        if (loginSection) loginSection.style.display = 'flex';
        if (userSection) userSection.style.display = 'none';
    }
    
    // Load and display all dentists
    loadDentistsOnHomepage();
    
    // Update clinic info from settings if available
    updateClinicInfo();
    
    // Setup logout button
    setupHomepageLogout();
}

// Update system rating display on homepage
function updateSystemRatingDisplay() {
    if (typeof dataManager === 'undefined' || !dataManager.calculateSystemRating) {
        setTimeout(updateSystemRatingDisplay, 100);
        return;
    }
    
    const ratingData = dataManager.calculateSystemRating();
    const starsContainer = document.getElementById('system-rating-stars-display');
    const ratingText = document.getElementById('system-rating-text');
    
    if (!starsContainer || !ratingText) {
        // Retry if elements not found yet
        setTimeout(updateSystemRatingDisplay, 100);
        return;
    }
    
    // Update star display based on average rating
    const average = ratingData.average || 0;
    const fullStars = Math.floor(average);
    const hasHalfStar = (average - fullStars) >= 0.5;
    
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= fullStars) {
            star.className = 'fas fa-star';
            star.style.color = '#FBBF24';
        } else if (i === fullStars + 1 && hasHalfStar) {
            star.className = 'fas fa-star-half-alt';
            star.style.color = '#FBBF24';
        } else {
            star.className = 'far fa-star';
            star.style.color = '#D1D5DB';
        }
        starsContainer.appendChild(star);
    }
    
    // Update rating text
    if (ratingData.count === 0) {
        ratingText.textContent = 'No ratings yet';
    } else {
        const trustedText = ratingData.trustedCount > 0 
            ? `Trusted by ${ratingData.trustedCount}${ratingData.trustedCount >= 100 ? '+' : ''} users`
            : 'No trusted ratings yet';
        ratingText.textContent = `${average}/5 ${trustedText}`;
    }
}

// Update system rating display on homepage
function updateSystemRatingDisplay() {
    if (typeof dataManager === 'undefined' || !dataManager.calculateSystemRating) {
        setTimeout(updateSystemRatingDisplay, 100);
        return;
    }
    
    const ratingData = dataManager.calculateSystemRating();
    const starsContainer = document.getElementById('system-rating-stars-display');
    const ratingText = document.getElementById('system-rating-text');
    
    if (!starsContainer || !ratingText) return;
    
    // Update star display based on average rating
    const average = ratingData.average || 0;
    const fullStars = Math.floor(average);
    const hasHalfStar = (average - fullStars) >= 0.5;
    
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= fullStars) {
            star.className = 'fas fa-star';
            star.style.color = '#FBBF24';
        } else if (i === fullStars + 1 && hasHalfStar) {
            star.className = 'fas fa-star-half-alt';
            star.style.color = '#FBBF24';
        } else {
            star.className = 'far fa-star';
            star.style.color = '#D1D5DB';
        }
        starsContainer.appendChild(star);
    }
    
    // Update rating text
    if (ratingData.count === 0) {
        ratingText.textContent = 'No ratings yet';
    } else {
        const trustedText = ratingData.trustedCount > 0 
            ? `Trusted by ${ratingData.trustedCount}${ratingData.trustedCount >= 100 ? '+' : ''} users`
            : 'No trusted ratings yet';
        ratingText.textContent = `${average}/5 ${trustedText}`;
    }
}

function setupHomepageLogout() {
    const logoutBtn = document.getElementById('homepage-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show confirmation
            if (confirm('Are you sure you want to logout?')) {
                // Actually logout - clear session
                if (typeof dataManager !== 'undefined' && dataManager.logout) {
                    dataManager.logout();
                } else {
                    // Fallback: clear storage manually
                    sessionStorage.removeItem('currentUser');
                    localStorage.removeItem('currentUser');
                }
                
                // Reload the page to show logged out state
                window.location.reload();
            }
        });
    }
}

function updateClinicInfo() {
    if (typeof dataManager === 'undefined') {
        setTimeout(updateClinicInfo, 100);
        return;
    }
    
    const settings = dataManager.getSettings();
    if (!settings) return;
    
    // Update clinic address if available
    const addressElements = document.querySelectorAll('.clinic-details .detail-item span');
    addressElements.forEach(el => {
        if (el.textContent.includes('Rizal Street') || el.textContent.includes('Laoag City')) {
            if (settings.address) {
                el.textContent = settings.address;
            }
        }
    });
    
    // Update phone if available
    if (settings.phone) {
        const phoneElements = document.querySelectorAll('.clinic-details .detail-item span');
        phoneElements.forEach(el => {
            if (el.textContent.includes('0945') || el.textContent.includes('(077)')) {
                el.textContent = settings.phone;
            }
        });
    }
}

function loadDentistsOnHomepage() {
    if (typeof dataManager === 'undefined') {
        setTimeout(loadDentistsOnHomepage, 100);
        return;
    }
    
    const doctorsGrid = document.getElementById('doctors-grid');
    if (!doctorsGrid) return;
    
    const dentists = dataManager.getUsers({ role: 'dentist' });
    
    if (dentists.length === 0) {
        return; // Keep default doctor card
    }
    
    doctorsGrid.innerHTML = dentists.map(dentist => {
        const specialties = (dentist.specialties || []).join(', ') || 'General Dentistry';
        const profilePicture = dentist.profilePicture;
        const totalAppointments = dataManager.getAppointments({ dentist: dentist.name }).length;
        const completedAppointments = dataManager.getAppointments({ dentist: dentist.name, status: 'completed' }).length;
        const pendingAppointments = dataManager.getAppointments({ dentist: dentist.name, status: 'pending' }).length;
        const ratingData = dataManager.calculateDentistAverageRating(dentist.name);
        const rating = ratingData.average > 0 ? ratingData.average.toFixed(1) : 'N/A';
        const reviewCount = ratingData.count;
        
        return `
            <div class="doctor-card" data-dentist-id="${dentist.id}" data-dentist-name="${dentist.name}" data-dentist-role-title="${dentist.roleTitle || ''}">
                <div class="doctor-icon">
                    ${profilePicture 
                        ? `<img src="${profilePicture}" alt="${dentist.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #2563EB;">`
                        : `<i class="fas fa-user-md"></i>`
                    }
                </div>
                <h3>${dentist.name}</h3>
                <div class="doctor-specialties">
                    ${dentist.specialties && dentist.specialties.length > 0
                        ? dentist.specialties.map(spec => `<span>${spec}</span>`).join('')
                        : '<span>General Dentistry</span>'
                    }
                </div>
                <div class="doctor-rating">
                    <i class="fas fa-star"></i>
                    <span>${rating} (${reviewCount} reviews)</span>
                </div>
                <div class="doctor-experience">
                    <span>${dentist.roleTitle || 'Dentist'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to doctor cards
    doctorsGrid.querySelectorAll('.doctor-card').forEach(card => {
        card.addEventListener('click', function() {
            const dentistId = this.getAttribute('data-dentist-id');
            const dentistName = this.getAttribute('data-dentist-name');
            const dentistRoleTitle = this.getAttribute('data-dentist-role-title');
            const dentist = dataManager.getUser(dentistId); // Get full dentist object
            if (dentist) {
                showDoctorDetailsModal(dentist);
            }
        });
    });
}

// Show doctor details modal when clicking on a doctor card
function showDoctorDetailsModal(dentist) {
    if (!dentist) return;
    
    // Check if user is logged in
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') {
        showNotification('Please login as a patient to book an appointment', 'error');
        if (typeof window.showLoginModal === 'function') {
            setTimeout(() => window.showLoginModal(), 1000);
        }
        return;
    }
    
    // Get dentist statistics
    const totalAppointments = dataManager.getAppointments({ dentist: dentist.name }).length;
    const completedAppointments = dataManager.getAppointments({ dentist: dentist.name, status: 'completed' }).length;
    const ratingData = dataManager.calculateDentistAverageRating(dentist.name);
    const rating = ratingData.average > 0 ? ratingData.average.toFixed(1) : 'N/A';
    const reviewCount = ratingData.count;
    const specialties = (dentist.specialties || []).join(', ') || 'General Dentistry';
    
    // Get dentist's clinic settings
    const clinicSettings = dataManager.getSettings(dentist);
    const clinicName = clinicSettings?.clinicName || dentist.clinicName || 'Dental Clinic';
    const branch = clinicSettings?.branch || dentist.branch || '';
    const address = clinicSettings?.address || dentist.address || '';
    const phone = clinicSettings?.phone || dentist.phone || '';
    const email = clinicSettings?.email || dentist.email || '';
    const workingHours = clinicSettings?.workingHours || {};
    
    // Remove existing modal
    const existingModal = document.querySelector('.doctor-details-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'doctor-details-modal';
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; max-width: 600px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
            <div class="modal-header">
                <h3>Doctor Details</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="doctor-details-content">
                <div class="doctor-profile-section" style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 120px; height: 120px; margin: 0 auto 16px; border-radius: 50%; overflow: hidden; border: 4px solid #2563EB;">
                        ${dentist.profilePicture 
                            ? `<img src="${dentist.profilePicture}" alt="${dentist.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<div style="width: 100%; height: 100%; background: #EBF4FF; display: flex; align-items: center; justify-content: center; color: #2563EB; font-size: 48px;"><i class="fas fa-user-md"></i></div>`
                        }
                    </div>
                    <h2 style="margin: 0 0 8px 0; color: #1F2937;">${dentist.name}</h2>
                    <p style="margin: 0; color: #6B7280; font-size: 16px;">${dentist.roleTitle || 'Dentist'}</p>
                </div>
                
                <div class="doctor-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="text-align: center; padding: 16px; background: #F9FAFB; border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: 600; color: #2563EB;">${rating}</div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Rating</div>
                    </div>
                    <div id="reviews-card" style="text-align: center; padding: 16px; background: #F9FAFB; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#EBF4FF'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='#F9FAFB'; this.style.transform='scale(1)'">
                        <div style="font-size: 24px; font-weight: 600; color: #2563EB;">${reviewCount}</div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Reviews</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #F9FAFB; border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: 600; color: #2563EB;">${totalAppointments}</div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">Appointments</div>
                    </div>
                </div>
                
                <div class="doctor-specialties-section" style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px;">Specialties</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${dentist.specialties && dentist.specialties.length > 0
                            ? dentist.specialties.map(spec => `<span style="padding: 6px 12px; background: #EBF4FF; color: #2563EB; border-radius: 6px; font-size: 14px;">${spec}</span>`).join('')
                            : '<span style="padding: 6px 12px; background: #EBF4FF; color: #2563EB; border-radius: 6px; font-size: 14px;">General Dentistry</span>'
                        }
                    </div>
                </div>
                
                <div class="clinic-info-section" style="margin-bottom: 24px; padding: 20px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #2563EB;">
                    <h4 style="margin: 0 0 16px 0; color: #1F2937; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-hospital" style="color: #2563EB;"></i>
                        Clinic Information
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${clinicName ? `
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <i class="fas fa-building" style="color: #6B7280; margin-top: 4px; min-width: 16px;"></i>
                            <div>
                                <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 2px;">Clinic Name</div>
                                <div style="font-size: 14px; color: #1F2937; font-weight: 500;">${clinicName}${branch ? ` - ${branch}` : ''}</div>
                            </div>
                        </div>
                        ` : ''}
                        ${address ? `
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <i class="fas fa-map-marker-alt" style="color: #6B7280; margin-top: 4px; min-width: 16px;"></i>
                            <div>
                                <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 2px;">Address</div>
                                <div style="font-size: 14px; color: #1F2937;">${address}</div>
                            </div>
                        </div>
                        ` : ''}
                        ${phone ? `
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <i class="fas fa-phone" style="color: #6B7280; margin-top: 4px; min-width: 16px;"></i>
                            <div>
                                <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 2px;">Phone</div>
                                <div style="font-size: 14px; color: #1F2937;">
                                    <a href="tel:${phone}" style="color: #2563EB; text-decoration: none;">${phone}</a>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        ${email ? `
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <i class="fas fa-envelope" style="color: #6B7280; margin-top: 4px; min-width: 16px;"></i>
                            <div>
                                <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 2px;">Email</div>
                                <div style="font-size: 14px; color: #1F2937;">
                                    <a href="mailto:${email}" style="color: #2563EB; text-decoration: none;">${email}</a>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        ${workingHours && (workingHours.weekdays || workingHours.saturday) ? `
                        <div style="display: flex; align-items: start; gap: 12px;">
                            <i class="fas fa-clock" style="color: #6B7280; margin-top: 4px; min-width: 16px;"></i>
                            <div style="flex: 1;">
                                <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 4px;">Working Hours</div>
                                ${workingHours.weekdays ? `
                                <div style="font-size: 14px; color: #1F2937; margin-bottom: 4px;">
                                    <strong>Weekdays:</strong> ${workingHours.weekdays}
                                </div>
                                ` : ''}
                                ${workingHours.saturday ? `
                                <div style="font-size: 14px; color: #1F2937;">
                                    <strong>Saturday:</strong> ${workingHours.saturday}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" id="book-appointment-btn" style="flex: 1; padding: 12px; background: #2563EB; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        <i class="fas fa-calendar-plus" style="margin-right: 8px;"></i>
                        Book Appointment
                    </button>
                    <button class="btn btn-outline" id="close-doctor-modal-btn" style="padding: 12px; background: white; color: #2563EB; border: 1px solid #2563EB; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const closeBtn2 = modal.querySelector('#close-doctor-modal-btn');
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Book appointment button
    const bookBtn = modal.querySelector('#book-appointment-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            closeModal();
            // Store selected dentist in sessionStorage for booking modal
            sessionStorage.setItem('selectedDentist', JSON.stringify({
                id: dentist.id,
                name: dentist.name,
                roleTitle: dentist.roleTitle || ''
            }));
            // Show booking modal
            showHomepageBookingModal(dentist);
        });
    }
    
    // Reviews card click handler
    const reviewsCard = modal.querySelector('#reviews-card');
    if (reviewsCard && reviewCount > 0) {
        reviewsCard.addEventListener('click', () => {
            showPatientReviewsModal(dentist, user);
        });
    }
}

// Show all reviews modal for a specific dentist
function showPatientReviewsModal(dentist, patient) {
    if (!dentist) return;
    
    // Get all reviews for this dentist
    const allReviews = dataManager.getDentistRatings(dentist.name);
    
    // Sort reviews by date (newest first)
    const sortedReviews = allReviews.sort((a, b) => {
        const dateA = new Date(a.ratedAt || a.date || 0);
        const dateB = new Date(b.ratedAt || b.date || 0);
        return dateB - dateA;
    });
    
    // Remove existing modal
    const existingModal = document.querySelector('.patient-reviews-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Helper function to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateStr;
        }
    };
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'patient-reviews-modal';
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important;';
    
    const reviewsContent = sortedReviews.length > 0 ? `
        <div style="display: flex; flex-direction: column; gap: 16px; max-height: 400px; overflow-y: auto;">
            ${sortedReviews.map(review => {
                const reviewDate = review.ratedAt ? formatDate(review.ratedAt) : (review.date ? formatDate(review.date) : 'N/A');
                
                return `
                    <div style="padding: 16px; background: #F9FAFB; border-radius: 8px; border-left: 3px solid #2563EB;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">${review.patientName || 'Anonymous'}</div>
                                <div style="font-size: 13px; color: #6B7280; margin-bottom: 4px;">${review.treatment || 'Treatment'}</div>
                                <div style="font-size: 12px; color: #9CA3AF;">
                                    <i class="fas fa-calendar-alt" style="margin-right: 4px;"></i>${reviewDate}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 4px; margin-left: 16px;">
                                ${Array.from({ length: 5 }, (_, i) => `
                                    <i class="fas fa-star" style="color: ${i < review.rating ? '#FBBF24' : '#D1D5DB'}; font-size: 16px;"></i>
                                `).join('')}
                                <span style="margin-left: 4px; font-weight: 600; color: #1F2937;">${review.rating}/5</span>
                            </div>
                        </div>
                        ${review.review ? `
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
                                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${review.review}</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    ` : `
        <div style="text-align: center; padding: 40px 20px;">
            <i class="fas fa-comment-slash" style="font-size: 48px; color: #D1D5DB; margin-bottom: 16px;"></i>
            <p style="color: #6B7280; font-size: 16px; margin: 0;">No reviews yet.</p>
            <p style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">Reviews will appear here when patients rate this dentist.</p>
        </div>
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; max-width: 600px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
            <div class="modal-header">
                <h3>All Reviews for ${dentist.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" style="margin-top: 20px;">
                ${reviewsContent}
            </div>
            <div class="modal-actions" style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="btn btn-primary" id="close-reviews-modal-btn" style="flex: 1; padding: 12px; background: #2563EB; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const closeBtn2 = modal.querySelector('#close-reviews-modal-btn');
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Show dentist selection modal for booking
function showDentistSelectionModal() {
    // Check if user is logged in as patient
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') {
        showNotification('Please login as a patient to book an appointment', 'error');
        if (typeof window.showLoginModal === 'function') {
            setTimeout(() => window.showLoginModal(), 1000);
        }
        return;
    }
    
    // Get all dentists
    const dentists = dataManager.getUsers().filter(u => u.role === 'dentist' && u.isActive !== false);
    
    if (dentists.length === 0) {
        showNotification('No dentists available at the moment', 'error');
        return;
    }
    
    // Remove existing modal
    const existingModal = document.querySelector('.dentist-selection-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'dentist-selection-modal';
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important;';
    
    // Generate dentist cards
    const dentistsGrid = dentists.map(dentist => {
        const profilePicture = dentist.profilePicture || '';
        const ratingData = dataManager.calculateDentistAverageRating(dentist.name);
        const rating = ratingData.average > 0 ? ratingData.average.toFixed(1) : 'N/A';
        const reviewCount = ratingData.count;
        const specialties = (dentist.specialties || []).slice(0, 2).join(', ') || 'General Dentistry';
        
        return `
            <div class="dentist-selection-card" data-dentist-id="${dentist.id}" style="padding: 20px; background: white; border-radius: 12px; border: 2px solid #E5E7EB; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#2563EB'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.15)'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none'">
                <div style="display: flex; gap: 16px; align-items: start;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 3px solid #EBF4FF;">
                        ${profilePicture 
                            ? `<img src="${profilePicture}" alt="${dentist.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<div style="width: 100%; height: 100%; background: #EBF4FF; display: flex; align-items: center; justify-content: center; color: #2563EB; font-size: 32px;"><i class="fas fa-user-md"></i></div>`
                        }
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 18px; font-weight: 600;">${dentist.name}</h3>
                        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">${specialties}</p>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-star" style="color: #FBBF24; font-size: 14px;"></i>
                                <span style="font-weight: 600; color: #1F2937; font-size: 14px;">${rating}</span>
                            </div>
                            <span style="color: #9CA3AF; font-size: 13px;">(${reviewCount} reviews)</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; color: #2563EB;">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; max-width: 700px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
            <div class="modal-header">
                <h3>Select a Dentist</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" style="margin-top: 20px;">
                <p style="color: #6B7280; margin-bottom: 20px; font-size: 14px;">Choose a dentist to book an appointment with:</p>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${dentistsGrid}
                </div>
            </div>
            <div class="modal-actions" style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="btn btn-outline" id="close-dentist-selection-btn" style="flex: 1; padding: 12px; background: white; color: #2563EB; border: 1px solid #2563EB; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const closeBtn2 = modal.querySelector('#close-dentist-selection-btn');
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Add click handlers to dentist cards
    modal.querySelectorAll('.dentist-selection-card').forEach(card => {
        card.addEventListener('click', function() {
            const dentistId = this.getAttribute('data-dentist-id');
            const dentist = dentists.find(d => d.id === dentistId);
            if (dentist) {
                closeModal();
                // Store selected dentist in sessionStorage
                sessionStorage.setItem('selectedDentist', JSON.stringify({
                    id: dentist.id,
                    name: dentist.name,
                    roleTitle: dentist.roleTitle || ''
                }));
                // Show booking modal
                showHomepageBookingModal(dentist);
            }
        });
    });
}

// Show homepage booking modal (for patients logged in on homepage)
function showHomepageBookingModal(selectedDentist) {
    if (!selectedDentist) {
        // Try to get from sessionStorage
        const stored = sessionStorage.getItem('selectedDentist');
        if (stored) {
            selectedDentist = JSON.parse(stored);
        } else {
            showNotification('Please select a doctor first', 'error');
            return;
        }
    }
    
    // Check if user is logged in as patient
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') {
        showNotification('Please login as a patient to book an appointment', 'error');
        if (typeof window.showLoginModal === 'function') {
            setTimeout(() => window.showLoginModal(), 1000);
        }
        return;
    }
    
    // Store booking data
    const bookingData = {
        dentist: selectedDentist.name || selectedDentist.roleTitle || '',
        dentistId: selectedDentist.id,
        service: '',
        date: '',
        time: '',
        patientName: user.name,
        email: user.email,
        phone: user.phone || '',
        notes: ''
    };
    
    // Remove existing modal
    const existingModal = document.querySelector('.homepage-booking-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'homepage-booking-modal';
    modal.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; background: rgba(0, 0, 0, 0.5) !important;';
    modal.innerHTML = `
        <div class="modal-content" style="background: white !important; border-radius: 12px !important; padding: 30px !important; max-width: 600px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
            <div class="modal-header">
                <h3>Book Appointment with ${selectedDentist.name || 'Doctor'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form id="homepage-booking-form">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1F2937;">Service *</label>
                    <select name="service" required style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
                        <option value="">Select a service</option>
                        <option value="Dental Cleaning">Dental Cleaning</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Tooth Filling">Tooth Filling</option>
                        <option value="Tooth Extraction">Tooth Extraction</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Braces Consultation">Braces Consultation</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1F2937;">Date *</label>
                    <input type="date" name="date" id="homepage-booking-date" required style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1F2937;">Time *</label>
                    <div id="homepage-time-slots" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <!-- Time slots will be loaded here -->
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1F2937;">Notes (Optional)</label>
                    <textarea name="notes" rows="3" placeholder="Any additional information..." style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; background: #2563EB; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        <i class="fas fa-calendar-check" style="margin-right: 8px;"></i>
                        Book Appointment
                    </button>
                    <button type="button" class="btn btn-outline" id="cancel-booking-btn" style="padding: 12px; background: white; color: #2563EB; border: 1px solid #2563EB; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('#cancel-booking-btn');
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            sessionStorage.removeItem('selectedDentist');
        }, 300);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Load time slots when date is selected
    const dateInput = modal.querySelector('input[name="date"]') || modal.querySelector('#homepage-booking-date');
    const timeSlotsContainer = modal.querySelector('#homepage-time-slots');
    const serviceSelect = modal.querySelector('select[name="service"]');
    
    // Ensure date input has min set to today and validate on change
    if (dateInput) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Set min attribute to prevent past dates
        dateInput.setAttribute('min', todayStr);
        dateInput.value = ''; // Clear any existing value
        
        // Also set max attribute to prevent dates too far in the future (optional, but good practice)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
        
        // Validate date on change to prevent past dates
        dateInput.addEventListener('change', function() {
            const selectedDate = this.value;
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);
            
            if (selectedDate && selectedDateObj < todayDate) {
                showNotification('Cannot select a past date. Please select today or a future date.', 'error');
                this.value = '';
                timeSlotsContainer.innerHTML = '<p style="color: #EF4444; text-align: center; padding: 20px;">Please select today or a future date</p>';
                return;
            }
            loadTimeSlots();
        });
        
        // Also validate on input event (when user types)
        dateInput.addEventListener('input', function() {
            const selectedDate = this.value;
            if (selectedDate) {
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                const selectedDateObj = new Date(selectedDate);
                selectedDateObj.setHours(0, 0, 0, 0);
                
                if (selectedDateObj < todayDate) {
                    showNotification('Cannot select a past date. Please select today or a future date.', 'error');
                    this.value = '';
                    timeSlotsContainer.innerHTML = '<p style="color: #EF4444; text-align: center; padding: 20px;">Please select today or a future date</p>';
                }
            }
        });
    }
    
    function loadTimeSlots() {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            timeSlotsContainer.innerHTML = '<p style="color: #6B7280; text-align: center; padding: 20px;">Please select a date first</p>';
            return;
        }
        
        // Validate that the selected date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        
        if (selected < today) {
            timeSlotsContainer.innerHTML = '<p style="color: #EF4444; text-align: center; padding: 20px;">Cannot book appointments in the past. Please select today or a future date.</p>';
            dateInput.value = '';
            return;
        }
        
        const isToday = selected.getTime() === today.getTime();
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Get dentist's working hours
        let workingHours = null;
        if (selectedDentist && selectedDentist.id) {
            const dentist = dataManager.getUser(selectedDentist.id);
            if (dentist) {
                const settings = dataManager.getSettings(dentist);
                if (settings && settings.workingHours) {
                    // Determine which working hours to use based on day of week
                    const dayOfWeek = new Date(selectedDate).getDay();
                    if (dayOfWeek === 6) { // Saturday
                        workingHours = settings.workingHours.saturday || settings.workingHours.weekdays;
                    } else if (dayOfWeek === 0) { // Sunday
                        workingHours = settings.workingHours.sunday || 'Closed';
                    } else { // Weekdays (Monday-Friday)
                        workingHours = settings.workingHours.weekdays;
                    }
                }
            }
        }
        
        // Generate time slots based on working hours
        let timeSlots = [];
        if (workingHours && workingHours.toLowerCase() !== 'closed') {
            // Use getScheduleTimeSlots if available, otherwise parse manually
            if (typeof getScheduleTimeSlots === 'function') {
                timeSlots = getScheduleTimeSlots(workingHours);
            } else {
                // Fallback: parse working hours manually
                const match = workingHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (match) {
                    let startHour = parseInt(match[1]);
                    const startPeriod = match[3].toUpperCase();
                    let endHour = parseInt(match[4]);
                    const endMinute = parseInt(match[5]);
                    const endPeriod = match[6].toUpperCase();
                    
                    // Convert to 24-hour format
                    if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
                    else if (startPeriod === 'AM' && startHour === 12) startHour = 0;
                    
                    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
                    else if (endPeriod === 'AM' && endHour === 12) endHour = 0;
                    
                    // Generate hourly slots
                    for (let hour = startHour; hour < endHour; hour++) {
                        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                    }
                } else {
                    // Default to 9 AM - 5 PM if parsing fails
                    for (let hour = 9; hour <= 17; hour++) {
                        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                    }
                }
            }
        } else {
            // Default to 9 AM - 5 PM if no working hours or closed
            for (let hour = 9; hour <= 17; hour++) {
                timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            }
        }
        
        // Get existing appointments for this dentist and date
        const existingAppointments = dataManager.getAppointments({ 
            date: selectedDate, 
            dentist: bookingData.dentist 
        });
        
        // Block time slots based on service duration
        const bookedTimes = new Set();
        existingAppointments
            .filter(apt => apt.status !== 'cancelled' && apt.service)
            .forEach(apt => {
                // Normalize appointment time to hour (e.g., 09:30 -> 09:00)
                if (apt.time) {
                    const [hour] = apt.time.split(':').map(Number);
                    const startTime = `${hour.toString().padStart(2, '0')}:00`;
                    
                    // Get how many hours this appointment should occupy
                    const hours = typeof getAppointmentHours === 'function' ? getAppointmentHours(apt.service) : 1;
                    
                    // Block all hours this appointment occupies
                    for (let i = 0; i < hours; i++) {
                        const slotIndex = timeSlots.findIndex(s => s === startTime);
                        if (slotIndex !== -1 && (slotIndex + i) < timeSlots.length) {
                            bookedTimes.add(timeSlots[slotIndex + i]);
                        }
                    }
                }
            });
        
        timeSlotsContainer.innerHTML = timeSlots.map(slot => {
            const isBooked = bookedTimes.has(slot);
            // Check if slot is in the past (for today's date)
            let isPast = false;
            if (isToday) {
                const [slotHour] = slot.split(':').map(Number);
                if (slotHour < currentHour || (slotHour === currentHour && currentMinute > 0)) {
                    isPast = true;
                }
            }
            const isDisabled = isBooked || isPast;
            const disabledTitle = isBooked ? 'Already booked' : (isPast ? 'Past time slot' : '');
            return `<div class="time-slot ${isDisabled ? 'disabled' : ''}" data-time="${slot}" style="padding: 10px; text-align: center; border: 1px solid ${isDisabled ? '#D1D5DB' : '#2563EB'}; border-radius: 6px; background: ${isDisabled ? '#F3F4F6' : 'white'}; color: ${isDisabled ? '#9CA3AF' : '#2563EB'}; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; transition: all 0.2s; opacity: ${isDisabled ? '0.6' : '1'};" ${isDisabled ? `title="${disabledTitle}"` : ''}>
                        ${slot} ${isDisabled ? '<i class="fas fa-lock"></i>' : ''}
                    </div>`;
        }).join('');
        
        // Time slot selection
        timeSlotsContainer.querySelectorAll('.time-slot:not(.disabled)').forEach(slot => {
            slot.addEventListener('click', function() {
                timeSlotsContainer.querySelectorAll('.time-slot').forEach(s => {
                    s.style.background = s.classList.contains('disabled') ? '#F3F4F6' : 'white';
                    s.style.color = s.classList.contains('disabled') ? '#9CA3AF' : '#2563EB';
                });
                this.style.background = '#2563EB';
                this.style.color = 'white';
                bookingData.time = this.getAttribute('data-time');
            });
        });
    }
    
    // Form submission
    const form = modal.querySelector('#homepage-booking-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        bookingData.service = formData.get('service');
        bookingData.date = formData.get('date');
        bookingData.notes = formData.get('notes') || '';
        
        if (!bookingData.time) {
            showNotification('Please select a time slot', 'error');
            return;
        }
        
        // Create appointment
        try {
            const appointment = {
                patientId: user.id,
                patientName: bookingData.patientName,
                email: bookingData.email,
                phone: bookingData.phone,
                service: bookingData.service,
                dentist: bookingData.dentist,
                date: bookingData.date,
                time: bookingData.time,
                status: 'pending',
                notes: bookingData.notes,
                createdAt: new Date().toISOString()
            };
            
            const result = dataManager.createAppointment(appointment);
            if (result) {
                showNotification('Appointment booked successfully!', 'success');
                
                // Notify dentist when appointment is created from homepage
                if (appointment.dentist) {
                    const dentists = dataManager.getUsers({ role: 'dentist' });
                    const dentist = dentists.find(d => d.name === appointment.dentist);
                    if (dentist) {
                        dataManager.createNotification({
                            userId: dentist.id,
                            userRole: 'dentist',
                            type: 'appointment',
                            title: 'New Appointment',
                            message: `${appointment.patientName} has booked an appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
                            relatedId: result.id,
                            relatedType: 'appointment'
                        });
                        
                        // Update notification badge
                        if (typeof updateNotificationBadge === 'function') {
                            updateNotificationBadge();
                        }
                    }
                }
                
                closeModal();
                // Optionally redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html#appointments';
                }, 1500);
            } else {
                showNotification('Failed to book appointment. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showNotification('An error occurred while booking. Please try again.', 'error');
        }
    });
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initHomepageForLoggedInUser, 200);
        // Update system rating display
        setTimeout(updateSystemRatingDisplay, 300);
    });
} else {
    setTimeout(initHomepageForLoggedInUser, 200);
    // Update system rating display
    setTimeout(updateSystemRatingDisplay, 300);
}

// Also update system rating on window load
window.addEventListener('load', function() {
    setTimeout(updateSystemRatingDisplay, 100);
});