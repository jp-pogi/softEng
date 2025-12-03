// Utility Functions for ToothTrack

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
    const existingNotification = document.querySelector('.toast-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Close button
    notification.querySelector('.toast-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close
    setTimeout(() => closeNotification(notification), duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
}

// Modal System
function showModal(title, content, actions = []) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
            <div class="modal-actions">
                ${actions.map(action => `
                    <button class="btn ${action.class || 'btn-primary'}" data-action="${action.action}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
    
    // Action handlers
    actions.forEach(action => {
        const btn = modal.querySelector(`[data-action="${action.action}"]`);
        if (btn && action.handler) {
            btn.addEventListener('click', () => {
                const result = action.handler();
                // Only close modal if handler returns true (or undefined for backward compatibility)
                // If handler returns false, keep modal open (useful for validation errors)
                if (result !== false) {
                    closeModal(modal);
                }
            });
        }
    });
    
    return modal;
}

function closeModal(modal) {
    if (!modal) {
        // If modal is undefined, try to find the active modal
        modal = document.querySelector('.modal-overlay.active, .modal.active');
        if (!modal) return;
    }
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
}

// Confirmation Dialog
function showConfirmation(message, onConfirm, onCancel = null) {
    return showModal(
        'Confirm Action',
        `<p>${message}</p>`,
        [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: onCancel || (() => {})
            },
            {
                label: 'Confirm',
                class: 'btn-primary',
                action: 'confirm',
                handler: onConfirm
            }
        ]
    );
}

// Loading State
function showLoading(element) {
    if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        element.appendChild(loader);
    }
}

function hideLoading(element) {
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        const loader = element.querySelector('.loading-spinner');
        if (loader) loader.remove();
    }
}

// Form Validation
function validateForm(form) {
    const errors = [];
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            errors.push(`${input.name || input.id} is required`);
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                errors.push('Please enter a valid email address');
                input.classList.add('error');
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(input.value)) {
                errors.push('Please enter a valid phone number');
                input.classList.add('error');
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Date/Time Utilities
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(time) {
    return time; // Already in HH:MM format
}

function formatDateTime(date, time) {
    return `${formatDate(date)} at ${formatTime(time)}`;
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getTimeSlots() {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(time);
        }
    }
    return slots;
}

// Parse working hours string (e.g., "4:00 AM - 8:00 PM" or "8:00 AM - 6:00 PM") to get start and end hours
function parseWorkingHours(workingHoursStr) {
    if (!workingHoursStr || workingHoursStr.toLowerCase() === 'closed') {
        return { start: 0, end: 0 }; // Return empty range if closed
    }
    
    // Match patterns like "4:00 AM - 8:00 PM" or "8:00AM-6:00PM" or "12:00 AM - 11:59 PM"
    const match = workingHoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
        console.error('Failed to parse working hours:', workingHoursStr);
        return null; // Return null to indicate parsing failure
    }
    
    let startHour = parseInt(match[1]);
    const startMinute = parseInt(match[2]);
    const startPeriod = match[3].toUpperCase();
    let endHour = parseInt(match[4]);
    const endMinute = parseInt(match[5]);
    const endPeriod = match[6].toUpperCase();
    
    // Convert to 24-hour format (0-23)
    if (startPeriod === 'PM' && startHour !== 12) {
        startHour += 12;
    } else if (startPeriod === 'AM' && startHour === 12) {
        startHour = 0; // 12:00 AM = 0:00
    }
    
    if (endPeriod === 'PM' && endHour !== 12) {
        endHour += 12;
    } else if (endPeriod === 'AM' && endHour === 12) {
        endHour = 0; // 12:00 AM = 0:00
    }
    
    // Ensure hours are in valid range (0-23)
    startHour = Math.max(0, Math.min(23, startHour));
    endHour = Math.max(0, Math.min(23, endHour));
    
    // Calculate end hour: if there are minutes, round up to next hour
    // For example, 6:30 PM becomes 19:00 (7 PM), so slots go from startHour to endHour (exclusive)
    let endSlotHour = endHour;
    if (endMinute > 0) {
        endSlotHour = endHour + 1;
        // Handle midnight rollover (e.g., 11:30 PM -> 12:00 AM next day = 24:00 = 0:00)
        if (endSlotHour >= 24) {
            endSlotHour = 24; // Include up to 23:00
        }
    }
    
    return { start: startHour, end: endSlotHour };
}

// Get hourly time slots for schedule view based on working hours
function getScheduleTimeSlots(workingHours = null) {
    if (!workingHours || workingHours.toLowerCase() === 'closed') {
        return []; // Return empty array if closed or no hours
    }
    
    const parsed = parseWorkingHours(workingHours);
    if (!parsed || parsed.start === parsed.end) {
        console.error('Invalid working hours or closed:', workingHours);
        return []; // Return empty if parsing failed or closed
    }
    
    const startHour = parsed.start;
    const endHour = parsed.end;
    
    // Generate slots from start to end (exclusive, so endHour is not included)
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        // Handle hours 0-23 (midnight to 11 PM)
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(time);
    }
    
    return slots;
}

// Normalize appointment time to the nearest hour slot (for schedule display)
// e.g., 09:30 -> 09:00, 10:15 -> 10:00
function normalizeTimeToHour(time) {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    // Round down to the nearest hour
    return `${hours.toString().padStart(2, '0')}:00`;
}

// Get service duration in minutes
function getServiceDuration(serviceName) {
    const serviceDurations = {
        'Dental Cleaning': 60,
        'Consultation': 30,
        'Tooth Filling': 90,
        'Tooth Extraction': 45,
        'Root Canal': 120,
        'Braces Consultation': 60,
        'General Checkup': 45
    };
    return serviceDurations[serviceName] || 60; // Default to 60 minutes
}

// Calculate how many hours an appointment should occupy based on service duration
// Duration <= 60 minutes → 1 hour
// Duration > 60 minutes and <= 120 minutes → 2 hours
function getAppointmentHours(serviceName) {
    const duration = getServiceDuration(serviceName);
    if (duration <= 60) {
        return 1;
    } else if (duration <= 120) {
        return 2;
    } else {
        // For durations > 2 hours, round up to nearest hour
        return Math.ceil(duration / 60);
    }
}

// Get all time slots that should be blocked for an appointment
function getBlockedTimeSlots(startTime, serviceName, allTimeSlots) {
    const hours = getAppointmentHours(serviceName);
    const blockedSlots = [];
    
    // Find the starting slot index
    const startIndex = allTimeSlots.findIndex(slot => slot === startTime);
    if (startIndex === -1) return blockedSlots;
    
    // Add the required number of hours
    for (let i = 0; i < hours && (startIndex + i) < allTimeSlots.length; i++) {
        blockedSlots.push(allTimeSlots[startIndex + i]);
    }
    
    return blockedSlots;
}

// Search and Filter
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

// Print
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showNotification('Element not found', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .toast-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .toast-notification i {
        font-size: 20px;
    }
    
    .toast-success { border-left: 4px solid #10B981; }
    .toast-success i { color: #10B981; }
    
    .toast-error { border-left: 4px solid #EF4444; }
    .toast-error i { color: #EF4444; }
    
    .toast-warning { border-left: 4px solid #F59E0B; }
    .toast-warning i { color: #F59E0B; }
    
    .toast-info { border-left: 4px solid #3B82F6; }
    .toast-info i { color: #3B82F6; }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #6B7280;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
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
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .modal-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: #1F2937;
        margin: 0;
    }
    
    .modal-close {
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
    
    .modal-body {
        margin-bottom: 24px;
    }
    
    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
    
    .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #2563EB;
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #EF4444;
    }
    
    .error-message {
        color: #EF4444;
        font-size: 12px;
        margin-top: 4px;
    }
`;
document.head.appendChild(notificationStyles);

