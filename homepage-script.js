// Homepage JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    const patientLoginBtn = document.getElementById('patient-login');
    const staffLoginBtn = document.getElementById('staff-login');
    const bookAppointmentBtn = document.querySelector('.hero-buttons .btn-primary');
    const learnMoreBtn = document.querySelector('.hero-buttons .btn-outline');
    const serviceBtns = document.querySelectorAll('.service-btn');
    const scheduleBtns = document.querySelectorAll('.schedule-card .btn');

    // Login button functionality
    if (patientLoginBtn) {
        patientLoginBtn.addEventListener('click', function() {
            showLoginModal('patient');
        });
    }

    if (staffLoginBtn) {
        staffLoginBtn.addEventListener('click', function() {
            showLoginModal('staff');
        });
    }

    // Book appointment button functionality
    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', function() {
            // Redirect to dashboard with book appointment view
            window.location.href = 'index.html#book-appointment';
        });
    }

    // Learn more button functionality
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Scroll to services section
            document.querySelector('.services').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Service buttons functionality
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('h3').textContent;
            showServiceModal(serviceName);
        });
    });

    // Schedule buttons functionality
    scheduleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Book')) {
                // Redirect to dashboard with book appointment view
                window.location.href = 'index.html#book-appointment';
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
});

// Login modal functionality
function showLoginModal(userType) {
    // Remove existing modal
    const existingModal = document.querySelector('.login-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create login modal
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${userType === 'patient' ? 'Patient' : 'Staff'} Login</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form class="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-large">Login</button>
                </form>
                <div class="modal-footer">
                    <p>Don't have an account? <a href="#" class="register-link">Register here</a></p>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .login-modal {
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
        
        .modal-overlay {
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
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            animation: slideUp 0.3s ease;
            position: relative;
            z-index: 10001;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .modal-header h3 {
            font-size: 20px;
            font-weight: 600;
            color: #1F2937;
            margin: 0;
        }
        
        .close-modal {
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
        
        .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .form-group label {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input {
            padding: 12px;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #2563EB;
        }
        
        .modal-footer {
            text-align: center;
            margin-top: 20px;
        }
        
        .modal-footer p {
            font-size: 14px;
            color: #6B7280;
            margin: 0;
        }
        
        .register-link {
            color: #2563EB;
            text-decoration: none;
        }
        
        .register-link:hover {
            text-decoration: underline;
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

    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);

    // Form submission
    const form = modal.querySelector('.login-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        // Simple validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Simulate login
        showLoadingState(form);
        
        setTimeout(() => {
            hideLoadingState(form);
            closeModal();
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 2000);
    });
}

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
                        <button class="btn btn-outline">Learn More</button>
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
            gap: 12px;
        }
        
        .service-actions .btn {
            flex: 1;
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