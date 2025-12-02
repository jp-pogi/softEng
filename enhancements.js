// System Enhancements - Error Handling, Accessibility, Performance

class SystemEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupErrorHandling();
        this.setupAccessibility();
        this.setupInputSanitization();
        this.setupLoadingStates();
        this.setupEmptyStates();
        this.setupTooltips();
        this.setupFormEnhancements();
    }

    // Error Handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            // Check if user is logged in before showing error
            let shouldShowError = true;
            
            // Check if dataManager is available and user is logged in
            if (typeof dataManager !== 'undefined' && dataManager.getCurrentUser) {
                const user = dataManager.getCurrentUser();
                if (!user) {
                    // User is not logged in - don't show error notifications
                    // These are likely initialization errors that are expected
                    shouldShowError = false;
                }
            } else {
                // dataManager not available yet - likely initialization phase
                // Don't show errors during initial page load when user is not logged in
                shouldShowError = false;
            }
            
            // Filter out common expected errors when not logged in
            if (e.error && e.error.message) {
                const errorMsg = e.error.message.toLowerCase();
                // Ignore errors related to accessing properties on null/undefined during initialization
                if (errorMsg.includes('cannot read') || 
                    errorMsg.includes('cannot access') ||
                    errorMsg.includes('is not defined') ||
                    errorMsg.includes('is null') ||
                    errorMsg.includes('is undefined')) {
                    // Check if we're on index.html and user is not logged in
                    if (window.location.pathname.includes('index.html')) {
                        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser || !dataManager.getCurrentUser()) {
                            shouldShowError = false;
                        }
                    }
                }
            }
            
            if (shouldShowError && typeof showNotification !== 'undefined') {
                showNotification('An unexpected error occurred. Please try again.', 'error');
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            
            // Check if user is logged in before showing error
            let shouldShowError = true;
            
            if (typeof dataManager !== 'undefined' && dataManager.getCurrentUser) {
                const user = dataManager.getCurrentUser();
                if (!user) {
                    // User is not logged in - don't show error notifications
                    shouldShowError = false;
                }
            } else {
                // dataManager not available yet - likely initialization phase
                shouldShowError = false;
            }
            
            if (shouldShowError && typeof showNotification !== 'undefined') {
                showNotification('An error occurred. Please refresh the page.', 'error');
            }
        });

        // Wrap data operations in try-catch
        this.wrapDataOperations();
    }

    wrapDataOperations() {
        // Wait for dataManager to be initialized
        if (typeof dataManager === 'undefined') {
            setTimeout(() => this.wrapDataOperations(), 100);
            return;
        }

        // Override dataManager methods with error handling
        if (dataManager.getAppointments && !dataManager._wrapped) {
            const originalGetAppointments = dataManager.getAppointments.bind(dataManager);
            dataManager.getAppointments = function(filters) {
                try {
                    return originalGetAppointments(filters);
                } catch (error) {
                    console.error('Error getting appointments:', error);
                    if (typeof showNotification !== 'undefined') {
                        showNotification('Failed to load appointments', 'error');
                    }
                    return [];
                }
            };

            const originalCreateAppointment = dataManager.createAppointment.bind(dataManager);
            dataManager.createAppointment = function(appointment) {
                try {
                    return originalCreateAppointment(appointment);
                } catch (error) {
                    console.error('Error creating appointment:', error);
                    if (typeof showNotification !== 'undefined') {
                        showNotification('Failed to create appointment', 'error');
                    }
                    return null;
                }
            };

            dataManager._wrapped = true;
        }
    }

    // Accessibility Enhancements
    setupAccessibility() {
        // Add ARIA labels to interactive elements
        const setupAria = () => {
            // Navigation items
            document.querySelectorAll('.nav-item').forEach((item, index) => {
                const view = item.getAttribute('data-view');
                if (view) {
                    item.setAttribute('aria-label', `Navigate to ${view}`);
                    item.setAttribute('role', 'button');
                    item.setAttribute('tabindex', '0');
                }
            });

            // Buttons
            document.querySelectorAll('button').forEach(btn => {
                if (!btn.getAttribute('aria-label') && btn.textContent.trim()) {
                    btn.setAttribute('aria-label', btn.textContent.trim());
                }
            });

            // Form inputs
            document.querySelectorAll('input, select, textarea').forEach(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label && !input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', label.textContent.trim());
                }
            });

            // Modals
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
            });

            // Tables
            document.querySelectorAll('table').forEach(table => {
                table.setAttribute('role', 'table');
                // Skip appointments and users tables - no caption needed, and remove any existing caption
                if (table.id === 'appointments-table' || table.id === 'users-table') {
                    const existingCaption = table.querySelector('caption');
                    if (existingCaption) {
                        existingCaption.remove();
                    }
                    return;
                }
                const caption = table.querySelector('caption');
                if (!caption) {
                    const header = table.querySelector('thead th');
                    if (header) {
                        const captionEl = document.createElement('caption');
                        captionEl.textContent = header.textContent + ' table';
                        captionEl.style.visuallyHidden = true;
                        table.insertBefore(captionEl, table.firstChild);
                    }
                }
            });
        };

        // Run immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupAria);
        } else {
            setupAria();
        }

        // Skip to main content link
        this.addSkipLink();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #2563EB;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            z-index: 10000;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Input Sanitization
    setupInputSanitization() {
        // Sanitize HTML input
        this.sanitizeHTML = (str) => {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        // Sanitize all text inputs (but preserve cursor position)
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.target.type !== 'password' && e.target.type !== 'email' && e.target.type !== 'tel') {
                    const cursorPos = e.target.selectionStart;
                    const oldValue = e.target.value;
                    const newValue = oldValue.replace(/[<>]/g, '');
                    
                    if (oldValue !== newValue) {
                        e.target.value = newValue;
                        // Restore cursor position
                        const newPos = Math.max(0, cursorPos - (oldValue.length - newValue.length));
                        e.target.setSelectionRange(newPos, newPos);
                    }
                }
            }
        }, true);
    }

    // Loading States
    setupLoadingStates() {
        // Enhanced loading indicator
        this.showLoading = (message = 'Loading...') => {
            const loader = document.createElement('div');
            loader.className = 'enhanced-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>${message}</p>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            `;
            document.body.appendChild(loader);
            return loader;
        };

        this.hideLoading = (loader) => {
            if (loader && loader.parentNode) {
                loader.remove();
            }
        };
    }

    // Empty States
    setupEmptyStates() {
        this.renderEmptyState = (message, icon = 'fa-inbox', action = null) => {
            return `
                <div class="empty-state-enhanced">
                    <div class="empty-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3>${message}</h3>
                    ${action ? `<button class="btn btn-primary">${action}</button>` : ''}
                </div>
            `;
        };
    }

    // Tooltips
    setupTooltips() {
        document.addEventListener('mouseenter', (e) => {
            // Check if target is an element and has the attribute
            if (e.target && e.target.nodeType === 1) {
                const tooltip = e.target.getAttribute('data-tooltip');
                if (tooltip) {
                    this.showTooltip(e.target, tooltip);
                }
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            // Check if target is an element and has the attribute
            if (e.target && e.target.nodeType === 1 && e.target.getAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        }, true);
    }

    showTooltip(element, text) {
        this.hideTooltip();
        const tooltip = document.createElement('div');
        tooltip.className = 'enhanced-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: fixed;
            background: #1F2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        const tooltipWidth = tooltip.offsetWidth;
        
        // Calculate position (above element, centered)
        let top = rect.top - tooltipHeight - 8;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        
        // Adjust if tooltip goes off screen
        if (top < 0) {
            top = rect.bottom + 8; // Show below instead
        }
        if (left < 0) {
            left = 8; // Keep 8px from left edge
        }
        if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 8; // Keep 8px from right edge
        }
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Form Enhancements
    setupFormEnhancements() {
        // Real-time validation feedback
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Skip if it's a phone field (will be handled separately)
                if (e.target.type !== 'tel' && !e.target.getAttribute('data-phone')) {
                    this.validateField(e.target);
                }
            }
        }, true);

        // Phone number formatting (with debounce to prevent cursor issues)
        let phoneFormatTimeout;
        document.addEventListener('input', (e) => {
            if (e.target.type === 'tel' || e.target.getAttribute('data-phone')) {
                clearTimeout(phoneFormatTimeout);
                phoneFormatTimeout = setTimeout(() => {
                    this.formatPhoneNumber(e.target);
                }, 100);
            }
        }, true);
    }

    validateField(field) {
        if (!field || !field.parentElement) return;
        
        const errors = [];
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            errors.push('This field is required');
        }
        
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                errors.push('Invalid email format');
            }
        }
        
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(field.value)) {
                errors.push('Invalid phone format');
            }
        }
        
        // Show/hide error message
        let errorMsg = field.parentElement.querySelector('.field-error');
        if (errors.length > 0) {
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'field-error';
                field.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = errors[0];
            field.classList.add('error');
        } else {
            if (errorMsg) errorMsg.remove();
            field.classList.remove('error');
        }
    }

    formatPhoneNumber(input) {
        if (!input || input.type === 'hidden') return;
        
        // Only format if not already formatted
        const currentValue = input.value || '';
        const digitsOnly = currentValue.replace(/\D/g, '');
        
        // Don't reformat if already properly formatted
        if (currentValue.match(/^\(\d{3}\) \d{3}-\d{4}$/)) {
            return;
        }
        
        // Don't format if user is deleting
        if (digitsOnly.length === 0) {
            input.value = '';
            return;
        }
        
        if (digitsOnly.length > 0 && digitsOnly.length <= 10) {
            let formatted = '';
            if (digitsOnly.length <= 3) {
                formatted = `(${digitsOnly}`;
            } else if (digitsOnly.length <= 6) {
                formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
            } else {
                formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
            }
            
            // Only update if different to prevent cursor jumping
            if (formatted !== currentValue) {
                const cursorPos = input.selectionStart || 0;
                input.value = formatted;
                // Restore cursor position approximately
                const newPos = Math.min(Math.max(0, cursorPos + (formatted.length - currentValue.length)), formatted.length);
                try {
                    input.setSelectionRange(newPos, newPos);
                } catch (e) {
                    // Ignore if input doesn't support setSelectionRange
                }
            }
        }
    }
}

// Initialize enhancements
const systemEnhancements = new SystemEnhancements();

