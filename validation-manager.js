// Validation Manager for Appointments and Data

class ValidationManager {
    constructor() {
        this.businessHours = {
            start: '08:00',
            end: '18:00',
            weekdays: [1, 2, 3, 4, 5], // Monday to Friday
            saturday: [6],
            saturdayEnd: '16:00'
        };
    }

    // Appointment Validation
    validateAppointment(appointment, existingAppointments = null) {
        const errors = [];

        // Date validation
        const dateErrors = this.validateDate(appointment.date);
        if (dateErrors.length > 0) errors.push(...dateErrors);

        // Time validation
        const timeErrors = this.validateTime(appointment.time, appointment.date);
        if (timeErrors.length > 0) errors.push(...timeErrors);

        // Conflict detection
        if (existingAppointments === null) {
            existingAppointments = dataManager.getAppointments({ date: appointment.date });
        }
        const conflictErrors = this.checkConflicts(appointment, existingAppointments);
        if (conflictErrors.length > 0) errors.push(...conflictErrors);

        // Service duration validation
        const durationErrors = this.validateServiceDuration(appointment);
        if (durationErrors.length > 0) errors.push(...durationErrors);

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDate(date) {
        const errors = [];
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is in the past
        if (appointmentDate < today) {
            errors.push('Cannot book appointments in the past');
        }

        // Check if date is too far in the future (e.g., 1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (appointmentDate > oneYearFromNow) {
            errors.push('Cannot book appointments more than 1 year in advance');
        }

        // Check if date is a weekend
        const dayOfWeek = appointmentDate.getDay();
        if (dayOfWeek === 0) { // Sunday
            errors.push('Clinic is closed on Sundays');
        }

        return errors;
    }

    validateTime(time, date) {
        const errors = [];
        const [hours, minutes] = time.split(':').map(Number);
        const dayOfWeek = new Date(date).getDay();

        // Check business hours
        if (dayOfWeek === 6) { // Saturday
            if (time >= this.businessHours.saturdayEnd || time < this.businessHours.start) {
                errors.push(`Saturday hours are ${this.businessHours.start} - ${this.businessHours.saturdayEnd}`);
            }
        } else if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
            if (time < this.businessHours.start || time >= this.businessHours.end) {
                errors.push(`Business hours are ${this.businessHours.start} - ${this.businessHours.end}`);
            }
        }

        // Check if time is in 30-minute intervals
        if (minutes !== 0 && minutes !== 30) {
            errors.push('Appointments must be scheduled in 30-minute intervals');
        }

        return errors;
    }

    checkConflicts(newAppointment, existingAppointments) {
        const errors = [];
        const serviceDurations = {
            'Dental Cleaning': 60,
            'Consultation': 30,
            'Tooth Filling': 90,
            'Tooth Extraction': 45,
            'Root Canal': 120,
            'Braces Consultation': 60,
            'General Checkup': 45
        };

        const duration = serviceDurations[newAppointment.service] || 30;
        const newStart = this.timeToMinutes(newAppointment.time);
        const newEnd = newStart + duration;

        // Filter out the current appointment if editing
        const otherAppointments = existingAppointments.filter(apt => 
            !newAppointment.id || apt.id !== newAppointment.id
        );

        otherAppointments.forEach(existing => {
            const existingDuration = serviceDurations[existing.service] || 30;
            const existingStart = this.timeToMinutes(existing.time);
            const existingEnd = existingStart + existingDuration;

            // Check for overlap
            if ((newStart < existingEnd && newEnd > existingStart) && 
                existing.status !== 'cancelled') {
                errors.push(`Time slot conflicts with existing appointment: ${existing.patientName} at ${existing.time}`);
            }
        });

        return errors;
    }

    validateServiceDuration(appointment) {
        const errors = [];
        const serviceDurations = {
            'Dental Cleaning': 60,
            'Consultation': 30,
            'Tooth Filling': 90,
            'Tooth Extraction': 45,
            'Root Canal': 120,
            'Braces Consultation': 60,
            'General Checkup': 45
        };

        if (!appointment.service) {
            errors.push('Service is required');
            return errors;
        }

        const duration = serviceDurations[appointment.service];
        if (!duration) {
            errors.push(`Unknown service: ${appointment.service}`);
        }

        // Check if appointment fits in business hours
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const endTime = this.minutesToTime(hours * 60 + minutes + duration);
        const dayOfWeek = new Date(appointment.date).getDay();
        
        if (dayOfWeek === 6) { // Saturday
            if (endTime > this.businessHours.saturdayEnd) {
                errors.push(`Appointment extends beyond Saturday closing time (${this.businessHours.saturdayEnd})`);
            }
        } else if (endTime > this.businessHours.end) {
            errors.push(`Appointment extends beyond business hours (${this.businessHours.end})`);
        }

        return errors;
    }

    // Helper functions
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Patient validation
    validatePatient(patient) {
        const errors = [];

        if (!patient.name || patient.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (patient.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(patient.email)) {
                errors.push('Invalid email address');
            }

            // Check for duplicate email
            const existingPatients = dataManager.getPatients();
            const duplicate = existingPatients.find(p => 
                p.email === patient.email && p.id !== patient.id
            );
            if (duplicate) {
                errors.push('A patient with this email already exists');
            }
        }

        if (patient.phone) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(patient.phone)) {
                errors.push('Invalid phone number format');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Password validation
    validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Initialize validation manager
const validationManager = new ValidationManager();

