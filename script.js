// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentViews = document.querySelectorAll('.content-view');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const serviceItems = document.querySelectorAll('.service-item');
    const nextBtn = document.querySelector('.next-btn');
    const backBtn = document.querySelector('.back-btn');

    // Navigation switching
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the view to show
            const viewId = this.getAttribute('data-view');
            
            // Hide all content views
            contentViews.forEach(view => view.classList.remove('active'));
            
            // Show the selected view
            if (viewId === 'dashboard') {
                document.getElementById('dashboard-view').classList.add('active');
            } else if (viewId === 'appointments') {
                document.getElementById('appointments-view').classList.add('active');
            } else if (viewId === 'patients') {
                document.getElementById('patients-view').classList.add('active');
            } else if (viewId === 'schedule') {
                document.getElementById('schedule-view').classList.add('active');
            } else if (viewId === 'records') {
                document.getElementById('records-view').classList.add('active');
            } else if (viewId === 'settings') {
                document.getElementById('settings-view').classList.add('active');
            }
        });
    });

    // View toggle functionality
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all toggle buttons
            toggleBtns.forEach(toggle => toggle.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Handle view switching logic here
            if (this.id === 'patient-view') {
                // Switch to patient view
                console.log('Switched to Patient View');
            } else if (this.id === 'staff-view') {
                // Switch to staff view
                console.log('Switched to Staff View');
            }
        });
    });

    // Service selection functionality
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove selection from all service items
            serviceItems.forEach(service => service.classList.remove('selected'));
            
            // Add selection to clicked item
            this.classList.add('selected');
            
            // Update the next button text with selected service
            const serviceName = this.querySelector('h4').textContent;
            nextBtn.textContent = `Next: Choose a Dentist - ${serviceName}`;
        });
    });

    // Next button functionality
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            // Move to next step in appointment booking
            const currentStep = document.querySelector('.progress-step.active');
            const nextStep = currentStep.nextElementSibling;
            
            if (nextStep && nextStep.classList.contains('progress-step')) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                // Update progress line
                const progressLine = currentStep.nextElementSibling;
                if (progressLine && progressLine.classList.contains('progress-line')) {
                    progressLine.style.background = '#2563EB';
                }
            }
        });
    }

    // Back button functionality
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            // Go back to dashboard
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-view="dashboard"]').classList.add('active');
            
            contentViews.forEach(view => view.classList.remove('active'));
            document.getElementById('dashboard-view').classList.add('active');
        });
    }

    // Notification bell functionality
    const notificationBell = document.querySelector('.notifications');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            // Show notifications dropdown or modal
            showNotificationDropdown();
        });
    }

    // Mobile sidebar toggle (for responsive design)
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.style.cssText = `
        display: none;
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        background: #2563EB;
        color: white;
        border: none;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        cursor: pointer;
    `;
    
    document.body.appendChild(mobileMenuBtn);

    // Show/hide mobile menu button based on screen size
    function toggleMobileMenu() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'flex';
            mobileMenuBtn.style.alignItems = 'center';
            mobileMenuBtn.style.justifyContent = 'center';
        } else {
            mobileMenuBtn.style.display = 'none';
        }
    }

    // Mobile menu toggle functionality
    mobileMenuBtn.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        toggleMobileMenu();
        
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });

    // Initialize mobile menu
    toggleMobileMenu();
});

// Notification dropdown functionality
function showNotificationDropdown() {
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.notification-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    // Create notification dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="close-notifications">&times;</button>
        </div>
        <div class="notification-list">
            <div class="notification-item">
                <div class="notification-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="notification-content">
                    <h4>Appointment Confirmed</h4>
                    <p>Dr. Dela Cruz's appointment for tomorrow has been confirmed.</p>
                    <span class="notification-time">2 hours ago</span>
                </div>
            </div>
            <div class="notification-item">
                <div class="notification-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="notification-content">
                    <h4>Pending Action Required</h4>
                    <p>Follow-up call needed for Dr. Dela Cruz's post-surgery checkup.</p>
                    <span class="notification-time">4 hours ago</span>
                </div>
            </div>
        </div>
    `;

    // Add styles
    dropdown.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .notification-header h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
            margin: 0;
        }
        
        .close-notifications {
            background: none;
            border: none;
            font-size: 20px;
            color: #6B7280;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .notification-item {
            display: flex;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid #F3F4F6;
        }
        
        .notification-item:last-child {
            border-bottom: none;
        }
        
        .notification-icon {
            width: 32px;
            height: 32px;
            background: #EBF4FF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563EB;
            font-size: 14px;
        }
        
        .notification-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 4px 0;
        }
        
        .notification-content p {
            font-size: 12px;
            color: #6B7280;
            margin: 0 0 4px 0;
            line-height: 1.4;
        }
        
        .notification-time {
            font-size: 11px;
            color: #9CA3AF;
        }
    `;
    document.head.appendChild(style);

    // Add to document
    document.body.appendChild(dropdown);

    // Close dropdown functionality
    const closeBtn = dropdown.querySelector('.close-notifications');
    closeBtn.addEventListener('click', function() {
        dropdown.remove();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !document.querySelector('.notifications').contains(e.target)) {
            dropdown.remove();
        }
    });
}

// Service item selection styling
const serviceStyle = document.createElement('style');
serviceStyle.textContent = `
    .service-item.selected {
        background: #EBF4FF;
        border-color: #2563EB;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    
    .service-item.selected h4 {
        color: #2563EB;
    }
    
    .service-item.selected .service-price {
        color: #1D4ED8;
    }
`;
document.head.appendChild(serviceStyle);

// Smooth scrolling for sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Add smooth transition effect
        const contentView = document.querySelector('.content-view.active');
        if (contentView) {
            contentView.style.opacity = '0';
            contentView.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                contentView.style.opacity = '1';
                contentView.style.transform = 'translateY(0)';
            }, 150);
        }
    });
});

// Add loading states for better UX
function showLoadingState(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Simulate data loading for dashboard cards
function loadDashboardData() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            const valueElement = card.querySelector('.card-value');
            animateCounter(valueElement, Math.floor(Math.random() * 10));
        }, index * 200);
    });
}

// Counter animation
function animateCounter(element, targetValue) {
    let currentValue = 0;
    const increment = targetValue / 20;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 50);
}

// Initialize dashboard data when dashboard view is shown
document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard data after a short delay
    setTimeout(loadDashboardData, 500);
});

// Add hover effects for interactive elements
document.querySelectorAll('.dashboard-card, .appointment-item, .action-item').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open dropdowns or modals
        const dropdown = document.querySelector('.notification-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        // Close mobile menu
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }
});

// Add accessibility improvements
document.querySelectorAll('.nav-item, .service-item, .toggle-btn').forEach(element => {
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    // Add tabindex for keyboard navigation
    element.setAttribute('tabindex', '0');
});

// Add focus styles for accessibility
const focusStyle = document.createElement('style');
focusStyle.textContent = `
    .nav-item:focus,
    .service-item:focus,
    .toggle-btn:focus {
        outline: 2px solid #2563EB;
        outline-offset: 2px;
    }
`;
document.head.appendChild(focusStyle);

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.nav-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show logout confirmation
            showLogoutConfirmation();
        });
    }
});

// Logout confirmation modal
function showLogoutConfirmation() {
    // Remove existing modal
    const existingModal = document.querySelector('.logout-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create logout confirmation modal
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Logout</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to logout?</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline cancel-btn">Cancel</button>
                    <button class="btn btn-primary confirm-logout">Logout</button>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .logout-modal {
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
        
        .logout-modal .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logout-modal .modal-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.3s ease;
        }
        
        .logout-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .logout-modal .modal-header h3 {
            font-size: 20px;
            font-weight: 600;
            color: #1F2937;
            margin: 0;
        }
        
        .logout-modal .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            color: #6B7280;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logout-modal .modal-body {
            margin-bottom: 24px;
        }
        
        .logout-modal .modal-body p {
            font-size: 16px;
            color: #6B7280;
            margin: 0;
        }
        
        .logout-modal .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        
        .logout-modal .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
        }
        
        .logout-modal .btn-outline {
            background: transparent;
            color: #6B7280;
            border: 1px solid #D1D5DB;
        }
        
        .logout-modal .btn-outline:hover {
            background: #F9FAFB;
            color: #374151;
        }
        
        .logout-modal .btn-primary {
            background: #EF4444;
            color: white;
        }
        
        .logout-modal .btn-primary:hover {
            background: #DC2626;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(modalStyle);

    // Add to document
    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-logout');
    const overlay = modal.querySelector('.modal-overlay');
    
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Confirm logout
    confirmBtn.addEventListener('click', function() {
        // Show loading state
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        confirmBtn.disabled = true;
        
        // Simulate logout process
        setTimeout(() => {
            // Redirect to homepage
            window.location.href = 'homepage.html';
        }, 1000);
    });

    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
}