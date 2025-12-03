// Data Management System for ToothTrack
// Uses LocalStorage for persistence (can be replaced with API calls)

class DataManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!localStorage.getItem('toothtrack_appointments')) {
            localStorage.setItem('toothtrack_appointments', JSON.stringify([]));
        }
        if (!localStorage.getItem('toothtrack_patients')) {
            localStorage.setItem('toothtrack_patients', JSON.stringify([]));
        }
        if (!localStorage.getItem('toothtrack_users')) {
            localStorage.setItem('toothtrack_users', JSON.stringify([
                {
                    id: '1',
                    email: 'admin@toothtrack.ph',
                    password: 'password123',
                    role: 'admin',
                    name: 'Admin User',
                    roleTitle: 'Administrator'
                },
                {
                    id: '2',
                    email: 'dentist@toothtrack.ph',
                    password: 'password123',
                    role: 'dentist',
                    name: 'Dr. Juan Dela Cruz',
                    roleTitle: 'Clinic Dentist',
                    specialties: ['General Dentistry', 'Orthodontics', 'Oral Surgery']
                },
                {
                    id: '3',
                    email: 'patient@toothtrack.ph',
                    password: 'password123',
                    role: 'patient',
                    name: 'John Doe',
                    phone: '(077) 123-4567',
                    dob: '1990-01-15',
                    address: '123 Main St, Laoag City'
                }
            ]));
        }
        if (!localStorage.getItem('toothtrack_records')) {
            localStorage.setItem('toothtrack_records', JSON.stringify([]));
        }
        if (!localStorage.getItem('toothtrack_settings')) {
            localStorage.setItem('toothtrack_settings', JSON.stringify({
                clinicName: 'Smile Dental Clinic',
                branch: 'Ilocos Norte Branch',
                address: '123 Rizal St, Laoag City',
                phone: '(077) 123-4567',
                email: 'info@toothtrack.ph',
                workingHours: {
                    weekdays: '8:00 AM - 6:00 PM',
                    saturday: '8:00 AM - 4:00 PM',
                    sunday: 'Closed'
                }
            }));
        }
        if (!localStorage.getItem('toothtrack_notifications')) {
            localStorage.setItem('toothtrack_notifications', JSON.stringify([]));
        }
    }

    // Appointment Methods
    getAppointments(filters = {}) {
        let appointments = JSON.parse(localStorage.getItem('toothtrack_appointments') || '[]');
        
        // Filter out null/undefined entries
        appointments = appointments.filter(apt => apt !== null && apt !== undefined);
        
        if (filters.date) {
            appointments = appointments.filter(apt => apt.date === filters.date);
        }
        if (filters.status) {
            appointments = appointments.filter(apt => apt.status === filters.status);
        }
        if (filters.patientId) {
            appointments = appointments.filter(apt => apt.patientId === filters.patientId);
        }
        if (filters.dentist) {
            // Filter by dentist name (case-insensitive, exact match)
            const dentistName = (filters.dentist || '').trim().toLowerCase();
            appointments = appointments.filter(apt => {
                if (!apt.dentist) return false;
                const appointmentDentist = apt.dentist.trim().toLowerCase();
                // Exact match
                if (appointmentDentist === dentistName) return true;
                // Match with role title (e.g., "Dentist Trillo" matches "Trillo")
                if (appointmentDentist.includes(dentistName) || dentistName.includes(appointmentDentist)) {
                    // Check if it's a valid match (not just partial substring)
                    const cleanAppointmentDentist = appointmentDentist.replace(/^(dr\.?|dentist)\s+/i, '').trim();
                    const cleanDentistName = dentistName.replace(/^(dr\.?|dentist)\s+/i, '').trim();
                    if (cleanAppointmentDentist === cleanDentistName) return true;
                }
                return false;
            });
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            appointments = appointments.filter(apt => {
                return (apt.patientName && apt.patientName.toLowerCase().includes(search)) ||
                       (apt.service && apt.service.toLowerCase().includes(search)) ||
                       (apt.dentist && apt.dentist.toLowerCase().includes(search));
            });
        }
        
        // Sort appointments from latest to oldest (by date and time)
        return appointments.sort((a, b) => {
            // Parse date and time more reliably
            const parseDateTime = (dateStr, timeStr) => {
                if (!dateStr) return new Date(0);
                
                // Date is in YYYY-MM-DD format
                const date = dateStr.trim();
                let time = (timeStr || '00:00').trim();
                
                // Convert 12-hour format to 24-hour if needed
                if (time.includes('AM') || time.includes('PM')) {
                    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const period = match[3].toUpperCase();
                        
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        
                        time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    }
                }
                
                // Create ISO string format: YYYY-MM-DDTHH:MM:SS
                const dateTimeStr = `${date}T${time}:00`;
                const parsed = new Date(dateTimeStr);
                
                // Fallback if parsing fails
                if (isNaN(parsed.getTime())) {
                    return new Date(date + ' ' + time);
                }
                return parsed;
            };
            
            const dateTimeA = parseDateTime(a.date, a.time);
            const dateTimeB = parseDateTime(b.date, b.time);
            
            return dateTimeB.getTime() - dateTimeA.getTime(); // Sort descending (newest first)
        });
    }

    getAppointment(id) {
        const appointments = this.getAppointments();
        return appointments.find(apt => apt.id === id);
    }

    createAppointment(appointment) {
        const appointments = this.getAppointments();
        const newAppointment = {
            id: Date.now().toString(),
            ...appointment,
            createdAt: new Date().toISOString(),
            status: appointment.status || 'pending'
        };
        appointments.push(newAppointment);
        localStorage.setItem('toothtrack_appointments', JSON.stringify(appointments));
        return newAppointment;
    }

    updateAppointment(id, updates) {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('toothtrack_appointments', JSON.stringify(appointments));
            return appointments[index];
        }
        return null;
    }

    deleteAppointment(id) {
        const appointments = this.getAppointments();
        const filtered = appointments.filter(apt => apt.id !== id);
        localStorage.setItem('toothtrack_appointments', JSON.stringify(filtered));
        return true;
    }

    // Patient Methods
    getPatients(filters = {}) {
        let patients = JSON.parse(localStorage.getItem('toothtrack_patients') || '[]');
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            patients = patients.filter(patient => {
                if (!patient) return false;
                return (patient.name && patient.name.toLowerCase().includes(search)) ||
                       (patient.email && patient.email.toLowerCase().includes(search)) ||
                       (patient.phone && patient.phone.includes(search));
            });
        }
        
        return patients.filter(p => p !== null && p !== undefined);
    }

    getPatient(id) {
        const patients = this.getPatients();
        return patients.find(patient => patient.id === id);
    }

    createPatient(patient) {
        const patients = this.getPatients();
        const newPatient = {
            id: patient.id || Date.now().toString(), // Use provided ID if available, otherwise generate one
            ...patient,
            createdAt: new Date().toISOString()
        };
        patients.push(newPatient);
        localStorage.setItem('toothtrack_patients', JSON.stringify(patients));
        return newPatient;
    }

    updatePatient(id, updates) {
        const patients = this.getPatients();
        const index = patients.findIndex(patient => patient.id === id);
        if (index !== -1) {
            patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('toothtrack_patients', JSON.stringify(patients));
            return patients[index];
        }
        return null;
    }

    deletePatient(id) {
        const patients = this.getPatients();
        const filtered = patients.filter(patient => patient.id !== id);
        localStorage.setItem('toothtrack_patients', JSON.stringify(filtered));
        return true;
    }

    // User/Auth Methods - Database Operations
    getUsers(filters = {}) {
        let users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');
        
        // Filter out null/undefined entries
        users = users.filter(user => user !== null && user !== undefined);
        
        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            users = users.filter(user => {
                return (user.name && user.name.toLowerCase().includes(search)) ||
                       (user.email && user.email.toLowerCase().includes(search)) ||
                       (user.phone && user.phone.includes(search));
            });
        }
        
        return users.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }

    getUser(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email && user.email.toLowerCase() === email.toLowerCase());
    }

    createUser(userData) {
        const users = this.getUsers();
        
        // Check if email already exists
        if (this.getUserByEmail(userData.email)) {
            throw new Error('Email already registered');
        }
        
        // Validate required fields
        if (!userData.email || !userData.password || !userData.role || !userData.name) {
            throw new Error('Missing required fields: email, password, role, and name are required');
        }
        
        // Create new user object
        const newUser = {
            id: this.generateId(),
            email: userData.email.toLowerCase().trim(),
            password: userData.password, // In production, hash this password
            role: userData.role,
            name: userData.name.trim(),
            phone: userData.phone || '',
            roleTitle: userData.roleTitle || this.getDefaultRoleTitle(userData.role),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: userData.isActive !== undefined ? userData.isActive : true
        };
        
        // Add role-specific fields
        if (userData.role === 'patient') {
            newUser.dob = userData.dob || '';
            newUser.address = userData.address || '';
        }
        
        if (userData.role === 'dentist') {
            newUser.specialties = userData.specialties || [];
            newUser.licenseNumber = userData.licenseNumber || '';
            // Add clinic information
            newUser.clinicName = userData.clinicName || '';
            newUser.branch = userData.branch || '';
            newUser.clinicAddress = userData.clinicAddress || '';
            newUser.clinicPhone = userData.clinicPhone || '';
            newUser.clinicEmail = userData.clinicEmail || '';
            newUser.workingHours = userData.workingHours || {
                weekdays: '8:00 AM - 6:00 PM',
                saturday: '8:00 AM - 4:00 PM',
                sunday: 'Closed'
            };
            newUser.clinicSettings = userData.clinicSettings || {
                clinicName: userData.clinicName || '',
                branch: userData.branch || '',
                address: userData.clinicAddress || userData.address || '',
                phone: userData.clinicPhone || userData.phone || '',
                email: userData.clinicEmail || userData.email || '',
                workingHours: userData.workingHours || {
                    weekdays: '8:00 AM - 6:00 PM',
                    saturday: '8:00 AM - 4:00 PM',
                    sunday: 'Closed'
                }
            };
            // Update address and phone if clinic info provided
            if (userData.clinicAddress) {
                newUser.address = userData.clinicAddress;
            }
            if (userData.clinicPhone) {
                newUser.phone = userData.clinicPhone;
            }
        }
        
        // Add any additional fields
        if (userData.additionalFields) {
            Object.assign(newUser, userData.additionalFields);
        }
        
        users.push(newUser);
        localStorage.setItem('toothtrack_users', JSON.stringify(users));
        
        // If patient, also create patient record
        if (userData.role === 'patient' && typeof this.createPatient === 'function') {
            try {
                this.createPatient({
                    id: newUser.id, // Link patient record to user ID
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    dob: userData.dob,
                    address: userData.address
                });
            } catch (error) {
                console.error('Error creating patient record:', error);
                // Don't fail user creation if patient record creation fails
            }
        }
        
        return newUser;
    }

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === id);
        
        if (index === -1) {
            throw new Error('User not found');
        }
        
        // Don't allow changing email if it conflicts with another user
        if (updates.email && updates.email !== users[index].email) {
            const existingUser = this.getUserByEmail(updates.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Email already registered to another user');
            }
        }
        
        // Update user
        users[index] = {
            ...users[index],
            ...updates,
            email: updates.email ? updates.email.toLowerCase().trim() : users[index].email,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('toothtrack_users', JSON.stringify(users));
        return users[index];
    }

    deleteUser(id) {
        const users = this.getUsers();
        const user = users.find(u => u.id === id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Prevent deleting admin accounts
        if (user.role === 'admin') {
            throw new Error('Cannot delete administrator account');
        }
        
        const userEmail = (user.email || '').toLowerCase().trim();
        const userName = (user.name || '').trim();
        
        // 1. Delete all appointments related to this user
        const appointments = this.getAppointments();
        const remainingAppointments = appointments.filter(apt => {
            // Check if appointment is linked to this user
            const aptPatientId = apt.patientId || '';
            const aptEmail = (apt.email || '').toLowerCase().trim();
            const aptDentist = (apt.dentist || '').trim();
            
            // Skip if appointment is linked to this user as patient or dentist
            if (aptPatientId === id || aptEmail === userEmail) {
                return false; // Delete this appointment
            }
            
            // For dentists, also check by name
            if (user.role === 'dentist' && aptDentist === userName) {
                return false; // Delete this appointment
            }
            
            return true; // Keep this appointment
        });
        localStorage.setItem('toothtrack_appointments', JSON.stringify(remainingAppointments));
        
        // 2. Delete all records related to this user
        const records = this.getRecords();
        const remainingRecords = records.filter(record => {
            const recordPatientId = record.patientId || '';
            const recordEmail = (record.email || '').toLowerCase().trim();
            const recordDentist = (record.dentist || '').trim();
            
            // Skip if record is linked to this user as patient or dentist
            if (recordPatientId === id || recordEmail === userEmail) {
                return false; // Delete this record
            }
            
            // For dentists, also check by name
            if (user.role === 'dentist' && recordDentist === userName) {
                return false; // Delete this record
            }
            
            return true; // Keep this record
        });
        localStorage.setItem('toothtrack_records', JSON.stringify(remainingRecords));
        
        // 3. Delete patient record if user is a patient
        if (user.role === 'patient') {
            const patients = this.getPatients();
            const remainingPatients = patients.filter(patient => {
                const patientId = patient.id || '';
                const patientEmail = (patient.email || '').toLowerCase().trim();
                return patientId !== id && patientEmail !== userEmail;
            });
            localStorage.setItem('toothtrack_patients', JSON.stringify(remainingPatients));
        }
        
        // 4. Delete all notifications for this user
        const notifications = this.getNotifications();
        const remainingNotifications = notifications.filter(notification => {
            return notification.userId !== id;
        });
        localStorage.setItem('toothtrack_notifications', JSON.stringify(remainingNotifications));
        
        // 5. Finally, delete the user account
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('toothtrack_users', JSON.stringify(filtered));
        
        // 6. If this user is currently logged in, log them out
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === id) {
            this.setCurrentUser(null);
            // Redirect to homepage
            if (typeof window !== 'undefined') {
                window.location.href = 'homepage.html';
            }
        }
        
        return true;
    }

    resetUserPassword(id, newPassword) {
        return this.updateUser(id, { password: newPassword });
    }

    authenticate(email, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.email && u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password &&
            (u.isActive !== false) // Check if user is active
        );
        return user || null;
    }

    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        // Also clear from localStorage as a fallback (in case it was stored there)
        localStorage.removeItem('currentUser');
    }

    /**
     * Clear all data from all databases
     * WARNING: This will permanently delete all data including users, appointments, records, etc.
     * After clearing, the system will reinitialize with default data
     * @returns {boolean} True if successful
     */
    clearAllData() {
        try {
            // Clear all localStorage keys
            localStorage.removeItem('toothtrack_appointments');
            localStorage.removeItem('toothtrack_patients');
            localStorage.removeItem('toothtrack_users');
            localStorage.removeItem('toothtrack_records');
            localStorage.removeItem('toothtrack_settings');
            localStorage.removeItem('toothtrack_notifications');
            
            // Clear sessionStorage
            sessionStorage.removeItem('currentUser');
            sessionStorage.clear();
            
            // Reinitialize with default data
            this.init();
            
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

        // Helper method to get default role title
        getDefaultRoleTitle(role) {
            const roleTitles = {
                'admin': 'Administrator',
                'dentist': 'Dentist',
                'patient': 'Patient'
            };
            return roleTitles[role] || 'User';
        }

    // Record Methods
    getRecords(filters = {}) {
        let records = JSON.parse(localStorage.getItem('toothtrack_records') || '[]');
        
        // Filter out null/undefined entries
        records = records.filter(record => record !== null && record !== undefined);
        
        if (filters.patientId) {
            records = records.filter(record => record.patientId === filters.patientId);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            records = records.filter(record => 
                (record.patientName && record.patientName.toLowerCase().includes(search)) ||
                (record.treatment && record.treatment.toLowerCase().includes(search))
            );
        }
        
        // Sort by date (latest to oldest) - use date + time if available, otherwise use createdAt
        return records.sort((a, b) => {
            let dateA, dateB;
            
            if (a.date) {
                // If time is available, combine date and time
                if (a.time) {
                    dateA = new Date(`${a.date}T${a.time}`);
                } else {
                    dateA = new Date(a.date);
                }
            } else if (a.createdAt) {
                dateA = new Date(a.createdAt);
            } else {
                dateA = new Date(0); // Fallback to epoch
            }
            
            if (b.date) {
                // If time is available, combine date and time
                if (b.time) {
                    dateB = new Date(`${b.date}T${b.time}`);
                } else {
                    dateB = new Date(b.date);
                }
            } else if (b.createdAt) {
                dateB = new Date(b.createdAt);
            } else {
                dateB = new Date(0); // Fallback to epoch
            }
            
            // Handle invalid dates
            if (isNaN(dateA.getTime())) dateA = new Date(0);
            if (isNaN(dateB.getTime())) dateB = new Date(0);
            
            return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });
    }

    getRecord(id) {
        const records = this.getRecords();
        return records.find(record => record.id === id);
    }

    createRecord(record) {
        const records = JSON.parse(localStorage.getItem('toothtrack_records') || '[]');
        const newRecord = {
            id: Date.now().toString(),
            ...record,
            createdAt: new Date().toISOString()
        };
        records.push(newRecord);
        localStorage.setItem('toothtrack_records', JSON.stringify(records));
        return newRecord;
    }

    updateRecord(id, updates) {
        const records = JSON.parse(localStorage.getItem('toothtrack_records') || '[]');
        const index = records.findIndex(record => record.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('toothtrack_records', JSON.stringify(records));
            return records[index];
        }
        return null;
    }

    deleteRecord(id) {
        const records = JSON.parse(localStorage.getItem('toothtrack_records') || '[]');
        const filtered = records.filter(record => record.id !== id);
        localStorage.setItem('toothtrack_records', JSON.stringify(filtered));
        return true;
    }

    // Rating and Review Methods
    getDentistRatings(dentistName) {
        const records = this.getRecords();
        const dentistRecords = records.filter(record => {
            if (!record.dentist || !record.rating) return false;
            const recordDentist = record.dentist.trim().toLowerCase();
            const searchDentist = dentistName.trim().toLowerCase();
            
            // Match by exact name
            if (recordDentist === searchDentist) return true;
            
            // Match by cleaned name (remove prefixes)
            const cleanRecordDentist = recordDentist.replace(/^(dr\.?|dentist)\s+/i, '').trim();
            const cleanSearchDentist = searchDentist.replace(/^(dr\.?|dentist)\s+/i, '').trim();
            if (cleanRecordDentist === cleanSearchDentist) return true;
            
            return false;
        });
        
        return dentistRecords.map(record => ({
            rating: record.rating,
            review: record.review,
            patientName: record.patientName,
            date: record.date || record.createdAt,
            treatment: record.treatment,
            ratedAt: record.ratedAt || record.updatedAt || record.createdAt,
            email: record.email
        }));
    }

    calculateDentistAverageRating(dentistName) {
        const ratings = this.getDentistRatings(dentistName);
        if (ratings.length === 0) return { average: 0, count: 0 };
        
        const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
        const average = sum / ratings.length;
        
        return {
            average: parseFloat(average.toFixed(1)),
            count: ratings.length
        };
    }
    
    // System Rating Methods
    getSystemRatings() {
        const users = this.getUsers();
        const ratings = [];
        
        // Get system ratings from dentists and patients
        users.forEach(user => {
            if ((user.role === 'dentist' || user.role === 'patient') && user.systemRating) {
                ratings.push({
                    rating: user.systemRating,
                    userId: user.id,
                    userName: user.name,
                    role: user.role,
                    ratedAt: user.systemRatingUpdatedAt || user.updatedAt || user.createdAt
                });
            }
        });
        
        return ratings;
    }
    
    calculateSystemRating() {
        const ratings = this.getSystemRatings();
        if (ratings.length === 0) return { average: 0, count: 0, trustedCount: 0 };
        
        // Calculate average of ALL ratings
        const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
        const average = sum / ratings.length;
        
        // Count only ratings >= 3 for "Trusted by" count
        const trustedCount = ratings.filter(r => (r.rating || 0) >= 3).length;
        
        return {
            average: parseFloat(average.toFixed(1)),
            count: ratings.length,
            trustedCount: trustedCount
        };
    }

    // Settings Methods
    getSettings(user = null) {
        // If user is provided and is a dentist, return their clinic settings
        if (user && user.role === 'dentist') {
            // Get dentist's clinic settings from their user object
            const dentist = this.getUser(user.id);
            if (dentist && dentist.clinicSettings) {
                return dentist.clinicSettings;
            }
            // Return default clinic settings if dentist doesn't have custom settings
            return {
                clinicName: dentist?.clinicName || 'Dental Clinic',
                branch: dentist?.branch || '',
                address: dentist?.address || '',
                phone: dentist?.phone || '',
                email: dentist?.email || '',
                latitude: dentist?.latitude || null,
                longitude: dentist?.longitude || null,
                workingHours: {
                    weekdays: dentist?.workingHours?.weekdays || '8:00 AM - 6:00 PM',
                    saturday: dentist?.workingHours?.saturday || '8:00 AM - 4:00 PM',
                    sunday: dentist?.workingHours?.sunday || 'Closed'
                }
            };
        }
        // For admin or global settings, return global settings
        return JSON.parse(localStorage.getItem('toothtrack_settings') || '{}');
    }

    updateSettings(settings, user = null) {
        // If user is provided and is a dentist, update their clinic settings
        if (user && user.role === 'dentist') {
            const dentist = this.getUser(user.id);
            if (dentist) {
                // Store clinic settings in the dentist's user object
                // Use !== undefined to properly handle empty strings
                const updatedDentist = {
                    ...dentist,
                    clinicName: settings.clinicName !== undefined ? settings.clinicName : dentist.clinicName,
                    branch: settings.branch !== undefined ? settings.branch : dentist.branch,
                    address: settings.address !== undefined ? settings.address : dentist.address,
                    clinicAddress: settings.address !== undefined ? settings.address : (dentist.clinicAddress || dentist.address),
                    phone: settings.phone !== undefined ? settings.phone : dentist.phone,
                    clinicPhone: settings.phone !== undefined ? settings.phone : (dentist.clinicPhone || dentist.phone),
                    email: settings.email !== undefined ? settings.email : dentist.email,
                    clinicEmail: settings.email !== undefined ? settings.email : (dentist.clinicEmail || dentist.email),
                    latitude: settings.latitude !== undefined ? settings.latitude : dentist.latitude,
                    longitude: settings.longitude !== undefined ? settings.longitude : dentist.longitude,
                    workingHours: {
                        weekdays: settings.weekdays || settings.workingHours?.weekdays || dentist.workingHours?.weekdays || '8:00 AM - 6:00 PM',
                        saturday: settings.saturday || settings.workingHours?.saturday || dentist.workingHours?.saturday || '8:00 AM - 4:00 PM',
                        sunday: settings.workingHours?.sunday || dentist.workingHours?.sunday || 'Closed'
                    },
                    clinicSettings: {
                        clinicName: settings.clinicName !== undefined ? settings.clinicName : dentist.clinicName,
                        branch: settings.branch !== undefined ? settings.branch : dentist.branch,
                        address: settings.address !== undefined ? settings.address : dentist.address,
                        phone: settings.phone !== undefined ? settings.phone : dentist.phone,
                        email: settings.email !== undefined ? settings.email : dentist.email,
                        latitude: settings.latitude !== undefined ? settings.latitude : dentist.latitude,
                        longitude: settings.longitude !== undefined ? settings.longitude : dentist.longitude,
                        workingHours: {
                            weekdays: settings.weekdays || settings.workingHours?.weekdays || dentist.workingHours?.weekdays || '8:00 AM - 6:00 PM',
                            saturday: settings.saturday || settings.workingHours?.saturday || dentist.workingHours?.saturday || '8:00 AM - 4:00 PM',
                            sunday: settings.workingHours?.sunday || dentist.workingHours?.sunday || 'Closed'
                        }
                    }
                };
                this.updateUser(dentist.id, updatedDentist);
                // Update current user session if this is the logged-in user
                const currentUser = this.getCurrentUser();
                if (currentUser && currentUser.id === dentist.id) {
                    this.setCurrentUser(updatedDentist);
                }
                return updatedDentist.clinicSettings;
            }
        }
        // For admin or global settings, update global settings
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem('toothtrack_settings', JSON.stringify(updated));
        return updated;
    }

    // Analytics Methods
    getAnalytics() {
        const appointments = this.getAppointments();
        const patients = this.getPatients();
        const today = new Date().toISOString().split('T')[0];
        const thisWeek = this.getWeekDates();
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        return {
            todayAppointments: appointments.filter(apt => apt.date === today).length,
            todayPending: appointments.filter(apt => apt.date === today && apt.status === 'pending').length,
            weekAppointments: appointments.filter(apt => thisWeek.includes(apt.date)).length,
            monthCompleted: appointments.filter(apt => {
                if (!apt.date) return false;
                const aptDate = new Date(apt.date);
                return aptDate.getMonth() === thisMonth && 
                       aptDate.getFullYear() === thisYear && 
                       apt.status === 'completed';
            }).length,
            totalPatients: patients.length,
            totalAppointments: appointments.length,
            revenue: this.calculateRevenue(appointments),
            statusBreakdown: this.getStatusBreakdown(appointments)
        };
    }

    getWeekDates() {
        const today = new Date();
        const week = [];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            week.push(date.toISOString().split('T')[0]);
        }
        return week;
    }

    calculateRevenue(appointments) {
        const servicePrices = {
            'Dental Cleaning': 1500,
            'Consultation': 800,
            'Tooth Filling': 2500,
            'Tooth Extraction': 2000,
            'Root Canal': 8000,
            'Braces Consultation': 1200,
            'General Checkup': 800
        };
        
        return appointments
            .filter(apt => apt.status === 'completed')
            .reduce((total, apt) => total + (servicePrices[apt.service] || 0), 0);
    }

    getStatusBreakdown(appointments) {
        return {
            pending: appointments.filter(apt => apt.status === 'pending').length,
            confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
            'in-progress': appointments.filter(apt => apt.status === 'in-progress').length,
            completed: appointments.filter(apt => apt.status === 'completed').length,
            cancelled: appointments.filter(apt => apt.status === 'cancelled').length
        };
    }

    // Utility Methods
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    formatDateTime(date, time) {
        return new Date(date + 'T' + time).toLocaleString();
    }

    // Notification Methods
    createNotification(notification) {
        const notifications = this.getNotifications();
        const newNotification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: notification.userId,
            userRole: notification.userRole,
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            read: false,
            createdAt: new Date().toISOString(),
            relatedId: notification.relatedId || null, // ID of related appointment, record, etc.
            relatedType: notification.relatedType || null // 'appointment', 'record', etc.
        };
        notifications.push(newNotification);
        localStorage.setItem('toothtrack_notifications', JSON.stringify(notifications));
        return newNotification;
    }

    getNotifications(userId = null) {
        const notifications = JSON.parse(localStorage.getItem('toothtrack_notifications') || '[]');
        if (userId) {
            return notifications.filter(n => n.userId === userId);
        }
        return notifications;
    }

    getUnreadNotificationCount(userId) {
        if (!userId) return 0;
        const notifications = this.getNotifications(userId);
        return notifications.filter(n => !n.read).length;
    }

    markNotificationAsRead(notificationId) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('toothtrack_notifications', JSON.stringify(notifications));
            return true;
        }
        return false;
    }

    markAllNotificationsAsRead(userId) {
        if (!userId) return false;
        const notifications = this.getNotifications();
        notifications.forEach(n => {
            if (n.userId === userId && !n.read) {
                n.read = true;
            }
        });
        localStorage.setItem('toothtrack_notifications', JSON.stringify(notifications));
        return true;
    }

    deleteNotification(notificationId) {
        const notifications = this.getNotifications();
        const filtered = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('toothtrack_notifications', JSON.stringify(filtered));
        return filtered.length < notifications.length;
    }
}

// Create global instance
const dataManager = new DataManager();

// Expose clearAllData globally for easy access (with confirmation)
window.clearAllData = function(confirmMessage = 'Are you sure you want to clear ALL data? This action cannot be undone!') {
    if (confirm(confirmMessage)) {
        const success = dataManager.clearAllData();
        if (success) {
            alert('All data has been cleared successfully. The system will now reload with default data.');
            // Redirect to homepage
            if (typeof window !== 'undefined' && window.location) {
                window.location.href = 'homepage.html';
            }
        } else {
            alert('Error clearing data. Please check the console for details.');
        }
        return success;
    }
    return false;
};

