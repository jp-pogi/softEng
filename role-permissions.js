// Role-Based Access Control (RBAC) System

class RolePermissions {
    constructor() {
        this.roles = {
            admin: {
                name: 'Administrator',
                permissions: {
                    // Dashboard
                    viewDashboard: true,
                    viewAllAppointments: true,
                    viewAllPatients: true,
                    viewAllRecords: true,
                    viewReports: true,
                    viewAnalytics: true,
                    
                    // Appointments
                    createAppointment: true,
                    editAppointment: true,
                    deleteAppointment: true,
                    cancelAppointment: true,
                    viewAllAppointments: true,
                    manageAppointmentStatus: true,
                    
                    // Patients
                    createPatient: true,
                    editPatient: true,
                    deletePatient: true,
                    viewAllPatients: true,
                    viewPatientRecords: true,
                    viewPatientHistory: true,
                    
                    // Records
                    createRecord: true,
                    editRecord: true,
                    deleteRecord: true,
                    viewAllRecords: true,
                    
                    // Schedule
                    viewSchedule: true,
                    editSchedule: true,
                    manageSchedule: true,
                    
                    // Settings
                    manageClinicSettings: true,
                    manageUsers: true,
                    manageRoles: true,
                    viewSystemSettings: true,
                    manageDataBackup: true,
                    
                    // Reports
                    viewReports: true,
                    exportReports: true,
                    viewRevenue: true,
                    
                    // Bulk Operations
                    bulkDelete: true,
                    bulkUpdate: true,
                    bulkExport: true
                }
            },
            dentist: {
                name: 'Dentist',
                permissions: {
                    // Dashboard
                    viewDashboard: true,
                    viewOwnAppointments: true,
                    viewAllAppointments: true,
                    viewAllPatients: true,
                    viewAllRecords: true,
                    viewReports: false,
                    viewAnalytics: false,
                    
                    // Appointments
                    createAppointment: true,
                    editAppointment: true,
                    deleteAppointment: false,
                    cancelAppointment: true,
                    viewAllAppointments: true,
                    manageAppointmentStatus: true,
                    
                    // Patients
                    createPatient: true,
                    editPatient: true,
                    deletePatient: false,
                    viewAllPatients: true,
                    viewPatientRecords: true,
                    viewPatientHistory: true,
                    
                    // Records
                    createRecord: true,
                    editRecord: true,
                    deleteRecord: false,
                    viewAllRecords: true,
                    
                    // Schedule
                    viewSchedule: true,
                    editSchedule: true,
                    manageSchedule: true,
                    
                    // Settings
                    manageClinicSettings: true, // Dentists can manage their own clinic settings
                    manageUsers: false,
                    manageRoles: false,
                    viewSystemSettings: false,
                    manageDataBackup: false,
                    editOwnProfile: true,
                    
                    // Reports
                    viewReports: false,
                    exportReports: false,
                    viewRevenue: false,
                    
                    // Bulk Operations
                    bulkDelete: false,
                    bulkUpdate: true,
                    bulkExport: true
                }
            },
            patient: {
                name: 'Patient',
                permissions: {
                    // Dashboard
                    viewDashboard: true,
                    viewOwnAppointments: true,
                    viewAllAppointments: false,
                    viewAllPatients: false,
                    viewAllRecords: false,
                    viewReports: false,
                    viewAnalytics: false,
                    
                    // Appointments
                    createAppointment: true,
                    editAppointment: false, // Can only edit own pending appointments
                    deleteAppointment: false, // Can only cancel own appointments
                    cancelAppointment: true, // Own appointments only
                    viewAllAppointments: false,
                    manageAppointmentStatus: false,
                    
                    // Patients
                    createPatient: false,
                    editPatient: false, // Can only edit own profile
                    deletePatient: false,
                    viewAllPatients: false,
                    viewPatientRecords: false,
                    viewPatientHistory: false,
                    viewOwnProfile: true,
                    editOwnProfile: true,
                    
                    // Records
                    createRecord: false,
                    editRecord: false,
                    deleteRecord: false,
                    viewAllRecords: false,
                    viewOwnRecords: true,
                    
                    // Schedule
                    viewSchedule: false,
                    editSchedule: false,
                    manageSchedule: false,
                    
                    // Settings
                    manageClinicSettings: false,
                    manageUsers: false,
                    manageRoles: false,
                    viewSystemSettings: false,
                    manageDataBackup: false,
                    editOwnProfile: true,
                    
                    // Reports
                    viewReports: false,
                    exportReports: false,
                    viewRevenue: false,
                    
                    // Bulk Operations
                    bulkDelete: false,
                    bulkUpdate: false,
                    bulkExport: false
                }
            }
        };
    }

    hasPermission(user, permission) {
        if (!user || !user.role) return false;
        
        const role = this.roles[user.role];
        if (!role) return false;
        
        return role.permissions[permission] === true;
    }

    canAccessView(user, viewName) {
        // Patients can access: dashboard, appointments, records, and settings
        if (user && user.role === 'patient') {
            const allowedViews = ['dashboard', 'appointments', 'records', 'settings'];
            return allowedViews.includes(viewName);
        }
        
        const viewPermissions = {
            'dashboard': 'viewDashboard',
            'appointments': 'viewAllAppointments',
            'patients': 'viewAllPatients',
            'schedule': 'viewSchedule',
            'records': 'viewAllRecords', // Will check both viewAllRecords and viewOwnRecords below
            'settings': 'viewSystemSettings'
        };
        
        const permission = viewPermissions[viewName];
        if (!permission) return true; // Allow unknown views
        
        // Special handling for settings - all authenticated users can access settings to edit their profile
        // Admin can access all settings, others can access profile/notifications/preferences
        if (viewName === 'settings') {
            // If user has viewSystemSettings, they can access all settings
            if (this.hasPermission(user, 'viewSystemSettings')) {
                return true;
            }
            // Otherwise, allow access if they can edit their own profile (all roles except unauthenticated)
            return this.hasPermission(user, 'editOwnProfile');
        }
        
        // Special handling for records - patients can view own records
        if (viewName === 'records') {
            return this.hasPermission(user, 'viewAllRecords') || this.hasPermission(user, 'viewOwnRecords');
        }
        
        // Special handling for appointments - patients can view own appointments
        if (viewName === 'appointments') {
            return this.hasPermission(user, 'viewAllAppointments') || this.hasPermission(user, 'viewOwnAppointments');
        }
        
        // Special handling for patients view - patients can view own profile
        if (viewName === 'patients') {
            return this.hasPermission(user, 'viewAllPatients') || this.hasPermission(user, 'viewOwnProfile');
        }
        
        return this.hasPermission(user, permission);
    }

    canPerformAction(user, action, resource = null) {
        // Check if user owns the resource (for patient edits)
        if (resource && user.role === 'patient') {
            if (action === 'editAppointment' || action === 'cancelAppointment') {
                return resource.patientId === user.id || resource.email === user.email;
            }
            if (action === 'editPatient') {
                return resource.id === user.id;
            }
        }
        
        const actionPermissions = {
            'createAppointment': 'createAppointment',
            'editAppointment': 'editAppointment',
            'deleteAppointment': 'deleteAppointment',
            'cancelAppointment': 'cancelAppointment',
            'createPatient': 'createPatient',
            'editPatient': 'editPatient',
            'deletePatient': 'deletePatient',
            'createRecord': 'createRecord',
            'editRecord': 'editRecord',
            'deleteRecord': 'deleteRecord',
            'manageSchedule': 'manageSchedule',
            'viewReports': 'viewReports',
            'viewRevenue': 'viewRevenue',
            'manageUsers': 'manageUsers',
            'manageSettings': 'manageClinicSettings',
            'bulkDelete': 'bulkDelete',
            'bulkUpdate': 'bulkUpdate'
        };
        
        const permission = actionPermissions[action];
        if (!permission) return false;
        
        return this.hasPermission(user, permission);
    }

    getRoleName(role) {
        return this.roles[role]?.name || role;
    }

    getAvailableViews(user) {
        const views = ['dashboard'];
        
        if (this.hasPermission(user, 'viewAllAppointments') || this.hasPermission(user, 'viewOwnAppointments')) {
            views.push('appointments');
        }
        if (this.hasPermission(user, 'viewAllPatients')) {
            views.push('patients');
        }
        if (this.hasPermission(user, 'viewSchedule')) {
            views.push('schedule');
        }
        if (this.hasPermission(user, 'viewAllRecords') || this.hasPermission(user, 'viewOwnRecords')) {
            views.push('records');
        }
        if (this.hasPermission(user, 'viewSystemSettings')) {
            views.push('settings');
        }
        
        return views;
    }

    filterDataByRole(user, data, dataType) {
        if (!user) return [];
        
        if (user.role === 'patient') {
            if (dataType === 'appointments') {
                return data.filter(item => item.patientId === user.id || item.email === user.email);
            }
            if (dataType === 'records') {
                return data.filter(item => item.patientId === user.id);
            }
            if (dataType === 'patients') {
                return data.filter(item => item.id === user.id);
            }
        }
        
        if (user.role === 'dentist') {
            if (dataType === 'appointments') {
                // Dentists can only see appointments assigned to them
                // Match by dentist name (exact match only to prevent false positives)
                const dentistName = (user.name || '').trim().toLowerCase();
                const dentistRoleTitle = (user.roleTitle || '').trim().toLowerCase();
                
                return data.filter(item => {
                    if (!item.dentist) return false;
                    
                    const appointmentDentist = item.dentist.trim().toLowerCase();
                    
                    // Primary: Check exact match with dentist name
                    if (appointmentDentist === dentistName) return true;
                    
                    // Secondary: Check exact match with role title (if different from name)
                    if (dentistRoleTitle && dentistRoleTitle !== dentistName && appointmentDentist === dentistRoleTitle) {
                        return true;
                    }
                    
                    // Tertiary: Check if names match when removing common prefixes/suffixes
                    // Remove "Dr.", "Dr", "Dentist" prefixes for comparison
                    const cleanAppointmentDentist = appointmentDentist
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    const cleanDentistName = dentistName
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    
                    if (cleanAppointmentDentist === cleanDentistName) return true;
                    
                    // If none match, exclude this appointment
                    return false;
                });
            }
            
            if (dataType === 'records') {
                // Dentists can only see records they created (records assigned to them)
                // Match by dentist name (exact match only to prevent false positives)
                const dentistName = (user.name || '').trim().toLowerCase();
                const dentistRoleTitle = (user.roleTitle || '').trim().toLowerCase();
                
                return data.filter(item => {
                    if (!item.dentist) return false;
                    
                    const recordDentist = item.dentist.trim().toLowerCase();
                    
                    // Primary: Check exact match with dentist name
                    if (recordDentist === dentistName) return true;
                    
                    // Secondary: Check exact match with role title (if different from name)
                    if (dentistRoleTitle && dentistRoleTitle !== dentistName && recordDentist === dentistRoleTitle) {
                        return true;
                    }
                    
                    // Tertiary: Check if names match when removing common prefixes/suffixes
                    // Remove "Dr.", "Dr", "Dentist" prefixes for comparison
                    const cleanRecordDentist = recordDentist
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    const cleanDentistName = dentistName
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    
                    if (cleanRecordDentist === cleanDentistName) return true;
                    
                    // If none match, exclude this record
                    return false;
                });
            }
            
            if (dataType === 'patients') {
                // Dentists can only see patients who have appointments with them
                const dentistName = (user.name || '').trim().toLowerCase();
                const dentistRoleTitle = (user.roleTitle || '').trim().toLowerCase();
                
                // Get all appointments assigned to this dentist (using strict matching)
                const allAppointments = dataManager.getAppointments();
                const dentistAppointments = allAppointments.filter(apt => {
                    if (!apt.dentist || apt.status === 'cancelled') return false;
                    const appointmentDentist = apt.dentist.trim().toLowerCase();
                    
                    // Check exact match with name
                    if (appointmentDentist === dentistName) return true;
                    
                    // Check exact match with role title
                    if (dentistRoleTitle && appointmentDentist === dentistRoleTitle) return true;
                    
                    // Check if names match when removing common prefixes/suffixes
                    const cleanAppointmentDentist = appointmentDentist
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    const cleanDentistName = dentistName
                        .replace(/^(dr\.?|dentist)\s+/i, '')
                        .trim();
                    
                    if (cleanAppointmentDentist === cleanDentistName) return true;
                    
                    return false;
                });
                
                // Extract unique patient IDs and emails from appointments
                const patientIds = new Set();
                const patientEmails = new Set();
                
                dentistAppointments.forEach(apt => {
                    if (apt.patientId) {
                        patientIds.add(apt.patientId);
                    }
                    if (apt.email) {
                        patientEmails.add(apt.email.trim().toLowerCase());
                    }
                });
                
                // Filter patients to only show those with appointments with this dentist
                return data.filter(patient => {
                    if (!patient) return false;
                    
                    // Check by patient ID
                    if (patient.id && patientIds.has(patient.id)) {
                        return true;
                    }
                    
                    // Check by email
                    if (patient.email && patientEmails.has(patient.email.trim().toLowerCase())) {
                        return true;
                    }
                    
                    return false;
                });
            }
        }
        
        return data;
    }
}

// Global role permissions manager
const rolePermissions = new RolePermissions();

