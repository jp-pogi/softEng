/**
 * ToothTrack Database Initialization Script
 * 
 * This script initializes all necessary LocalStorage databases for the ToothTrack system.
 * Run this function when setting up the system on a new device or computer.
 * 
 * Database Structure:
 * - toothtrack_users: User accounts (also stores system ratings as properties)
 * - toothtrack_appointments: Appointment records
 * - toothtrack_patients: Patient profiles
 * - toothtrack_records: Dental treatment records (also stores dentist ratings/reviews)
 * - toothtrack_settings: System/clinic settings
 * - toothtrack_notifications: User notifications
 * 
 * Note: Ratings and reviews are NOT in separate databases:
 * - System ratings: Stored in user objects (systemRating, systemRatingUpdatedAt)
 * - Dentist ratings/reviews: Stored in record objects (rating, review)
 * 
 * Usage:
 * 1. Include this file in an HTML page: <script src="init-database.js"></script>
 * 2. Call the function: initializeToothTrackDatabase()
 * 
 * Or run directly in browser console:
 * - Load the script first, then call: initializeToothTrackDatabase()
 */

/**
 * Initializes all ToothTrack databases with default data
 * @param {boolean} forceReset - If true, clears existing data before initializing (default: false)
 * @returns {Object} Result object with success status and details
 */
function initializeToothTrackDatabase(forceReset = false) {
    try {
        console.log('🚀 Starting ToothTrack Database Initialization...');
        
        // Check if data already exists
        const hasExistingData = localStorage.getItem('toothtrack_users') !== null;
        
        if (hasExistingData && !forceReset) {
            console.warn('⚠️  Database already exists. Use forceReset=true to overwrite.');
            return {
                success: false,
                message: 'Database already exists. Use initializeToothTrackDatabase(true) to reset.',
                existingData: true
            };
        }
        
        // Clear existing data if forceReset is true
        if (forceReset) {
            console.log('🗑️  Clearing existing data...');
            localStorage.removeItem('toothtrack_appointments');
            localStorage.removeItem('toothtrack_patients');
            localStorage.removeItem('toothtrack_users');
            localStorage.removeItem('toothtrack_records');
            localStorage.removeItem('toothtrack_settings');
            localStorage.removeItem('toothtrack_notifications');
            localStorage.removeItem('toothtrack_audit_logs');
            localStorage.removeItem('toothtrack_auto_backups');
            sessionStorage.removeItem('currentUser');
            sessionStorage.clear();
        }
        
        // Initialize Users Database
        // Note: Users can store system ratings (systemRating: 1-5, systemRatingUpdatedAt: timestamp)
        //       System ratings are stored as properties in user objects, not in a separate database
        console.log('👥 Initializing users database...');
        const defaultUsers = [
            {
                id: '1',
                email: 'admin@toothtrack.ph',
                password: 'password123',
                role: 'admin',
                name: 'Admin User',
                roleTitle: 'Administrator',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: '2',
                email: 'dentist@toothtrack.ph',
                password: 'password123',
                role: 'dentist',
                name: 'Dr. Juan Dela Cruz',
                roleTitle: 'Clinic Dentist',
                specialties: ['General Dentistry', 'Orthodontics', 'Oral Surgery'],
                phone: '(077) 123-4567',
                address: '123 Rizal St, Laoag City',
                clinicName: 'Smile Dental Clinic',
                branch: 'Ilocos Norte Branch',
                clinicAddress: '123 Rizal St, Laoag City',
                clinicPhone: '(077) 123-4567',
                clinicEmail: 'dentist@toothtrack.ph',
                latitude: 18.1980,
                longitude: 120.5900,
                workingHours: {
                    weekdays: '8:00 AM - 6:00 PM',
                    saturday: '8:00 AM - 4:00 PM',
                    sunday: 'Closed'
                },
                clinicSettings: {
                    clinicName: 'Smile Dental Clinic',
                    branch: 'Ilocos Norte Branch',
                    address: '123 Rizal St, Laoag City',
                    phone: '(077) 123-4567',
                    email: 'dentist@toothtrack.ph',
                    latitude: 18.1980,
                    longitude: 120.5900,
                    workingHours: {
                        weekdays: '8:00 AM - 6:00 PM',
                        saturday: '8:00 AM - 4:00 PM',
                        sunday: 'Closed'
                    }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: '3',
                email: 'patient@toothtrack.ph',
                password: 'password123',
                role: 'patient',
                name: 'John Doe',
                roleTitle: 'Patient',
                phone: '(077) 123-4567',
                dob: '1990-01-15',
                address: '123 Main St, Laoag City',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            }
        ];
        localStorage.setItem('toothtrack_users', JSON.stringify(defaultUsers));
        console.log('✅ Users database initialized with', defaultUsers.length, 'default users');
        
        // Initialize Appointments Database
        console.log('📅 Initializing appointments database...');
        localStorage.setItem('toothtrack_appointments', JSON.stringify([]));
        console.log('✅ Appointments database initialized');
        
        // Initialize Patients Database
        console.log('🏥 Initializing patients database...');
        localStorage.setItem('toothtrack_patients', JSON.stringify([]));
        console.log('✅ Patients database initialized');
        
        // Initialize Records Database
        // Note: Records can contain dentist ratings and reviews (rating: 1-5, review: text)
        console.log('📋 Initializing records database...');
        localStorage.setItem('toothtrack_records', JSON.stringify([]));
        console.log('✅ Records database initialized');
        
        // Initialize Settings Database
        console.log('⚙️  Initializing settings database...');
        const defaultSettings = {
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
        };
        localStorage.setItem('toothtrack_settings', JSON.stringify(defaultSettings));
        console.log('✅ Settings database initialized');
        
        // Initialize Notifications Database
        console.log('🔔 Initializing notifications database...');
        localStorage.setItem('toothtrack_notifications', JSON.stringify([]));
        console.log('✅ Notifications database initialized');
        
        // Initialize Optional Databases (if needed by system features)
        // Audit Logs (optional - used by audit-log.js)
        if (!localStorage.getItem('toothtrack_audit_logs')) {
            localStorage.setItem('toothtrack_audit_logs', JSON.stringify([]));
            console.log('✅ Audit logs database initialized (optional)');
        }
        
        // Auto Backups (optional - used by data-backup.js)
        if (!localStorage.getItem('toothtrack_auto_backups')) {
            localStorage.setItem('toothtrack_auto_backups', JSON.stringify([]));
            console.log('✅ Auto backups database initialized (optional)');
        }
        
        // Verify all databases were created
        const databases = [
            'toothtrack_users',
            'toothtrack_appointments',
            'toothtrack_patients',
            'toothtrack_records',
            'toothtrack_settings',
            'toothtrack_notifications'
        ];
        
        // Optional databases (not required for core functionality)
        const optionalDatabases = [
            'toothtrack_audit_logs',
            'toothtrack_auto_backups'
        ];
        
        const verification = databases.map(key => ({
            key: key,
            exists: localStorage.getItem(key) !== null,
            itemCount: key === 'toothtrack_settings' ? 1 : JSON.parse(localStorage.getItem(key) || '[]').length
        }));
        
        const allCreated = verification.every(db => db.exists);
        
        if (allCreated) {
            console.log('✅ All core databases initialized successfully!');
            console.log('📊 Database Summary:');
            verification.forEach(db => {
                console.log(`   - ${db.key}: ${db.itemCount} item(s)`);
            });
            
            // Check optional databases
            const optionalVerification = optionalDatabases.map(key => ({
                key: key,
                exists: localStorage.getItem(key) !== null,
                itemCount: JSON.parse(localStorage.getItem(key) || '[]').length
            }));
            
            if (optionalVerification.some(db => db.exists)) {
                console.log('');
                console.log('📊 Optional Databases:');
                optionalVerification.forEach(db => {
                    if (db.exists) {
                        console.log(`   - ${db.key}: ${db.itemCount} item(s)`);
                    }
                });
            }
            
            console.log('');
            console.log('🔑 Default Login Credentials:');
            console.log('   Admin:   admin@toothtrack.ph / password123');
            console.log('   Dentist: dentist@toothtrack.ph / password123');
            console.log('   Patient: patient@toothtrack.ph / password123');
            console.log('');
            console.log('📝 Note: Ratings & Reviews are stored within existing databases:');
            console.log('   - System Ratings: Stored in user objects (systemRating property)');
            console.log('   - Dentist Ratings/Reviews: Stored in records (rating & review properties)');
            console.log('');
            console.log('✨ System is ready to use!');
            
            return {
                success: true,
                message: 'All databases initialized successfully!',
                databases: verification,
                optionalDatabases: optionalVerification.filter(db => db.exists),
                defaultUsers: defaultUsers.map(u => ({
                    email: u.email,
                    role: u.role,
                    name: u.name
                }))
            };
        } else {
            throw new Error('Some databases failed to initialize');
        }
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        return {
            success: false,
            message: 'Failed to initialize database: ' + error.message,
            error: error
        };
    }
}

/**
 * Quick initialization function (alias for convenience)
 * @param {boolean} forceReset - If true, clears existing data before initializing
 */
function initDB(forceReset = false) {
    return initializeToothTrackDatabase(forceReset);
}

// Make function available globally
if (typeof window !== 'undefined') {
    window.initializeToothTrackDatabase = initializeToothTrackDatabase;
    window.initDB = initDB;
}

// Auto-run if this script is loaded in a standalone HTML page
if (typeof window !== 'undefined' && window.location) {
    // Check if we're in a standalone initialization page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto-init') === 'true') {
        document.addEventListener('DOMContentLoaded', () => {
            const forceReset = urlParams.get('reset') === 'true';
            const result = initializeToothTrackDatabase(forceReset);
            
            // Display result on page if there's a result container
            const resultContainer = document.getElementById('init-result');
            if (resultContainer) {
                if (result.success) {
                    resultContainer.innerHTML = `
                        <div style="color: green; padding: 20px; background: #f0f9ff; border: 2px solid green; border-radius: 8px; margin: 20px 0;">
                            <h3>✅ Database Initialization Successful!</h3>
                            <p>${result.message}</p>
                            <h4>Default Login Credentials:</h4>
                            <ul>
                                <li><strong>Admin:</strong> admin@toothtrack.ph / password123</li>
                                <li><strong>Dentist:</strong> dentist@toothtrack.ph / password123</li>
                                <li><strong>Patient:</strong> patient@toothtrack.ph / password123</li>
                            </ul>
                        </div>
                    `;
                } else {
                    resultContainer.innerHTML = `
                        <div style="color: red; padding: 20px; background: #fef2f2; border: 2px solid red; border-radius: 8px; margin: 20px 0;">
                            <h3>❌ Database Initialization Failed</h3>
                            <p>${result.message}</p>
                        </div>
                    `;
                }
            }
        });
    }
}

