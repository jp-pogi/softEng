// Apply role-based access control
function applyRoleBasedAccess() {
    // Check if dataManager is available
    if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
        return;
    }
    
    const user = dataManager.getCurrentUser();
    if (!user) return;

    // Hide/show navigation items based on role
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        const viewId = item.getAttribute('data-view');
        if (viewId && !rolePermissions.canAccessView(user, viewId)) {
            item.classList.add('hidden');
        } else {
            // For patients, only show specific views
            if (user.role === 'patient') {
                const allowedViews = ['dashboard', 'appointments', 'records', 'settings'];
                if (allowedViews.includes(viewId)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            } else {
                item.classList.remove('hidden');
            }
        }
    });

    // Show User Management only for admin
    const usersNav = document.getElementById('users-nav');
    if (usersNav) {
        if (user.role === 'admin') {
            usersNav.classList.remove('hidden');
        } else {
            usersNav.classList.add('hidden');
        }
    }

    // Admin: restrict navigation to User Management only
    if (user.role === 'admin') {
        const allowedViews = ['users'];
        const allNavItems = document.querySelectorAll('.nav-item[data-view]');
        
        allNavItems.forEach(item => {
            const viewId = item.getAttribute('data-view');
            if (!allowedViews.includes(viewId)) {
                item.classList.add('hidden');
                item.style.display = 'none';
            } else {
                item.classList.remove('hidden');
                item.style.display = '';
            }
        });
    }

    // View toggle is removed - always hidden
    const viewToggle = document.getElementById('view-toggle-section');
    if (viewToggle) {
        viewToggle.classList.add('hidden');
    }

    // Customize dashboard based on role
    if (user.role === 'patient') {
        customizePatientDashboard();
        // Also update navigation labels immediately
        updatePatientNavigationLabels();
    } else if (user.role === 'admin') {
        customizeAdminDashboard();
    } else if (user.role === 'dentist') {
        customizeDentistDashboard();
    }
    
    // Disable homepage link for dentists
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo && user.role === 'dentist') {
        headerLogo.style.cursor = 'default';
        headerLogo.onclick = function(e) {
            e.preventDefault();
            return false;
        };
        // Remove any href if it exists
        const logoLink = headerLogo.closest('a');
        if (logoLink) {
            logoLink.onclick = function(e) {
                e.preventDefault();
                return false;
            };
            logoLink.style.cursor = 'default';
            logoLink.style.pointerEvents = 'none';
        }
    } else if (headerLogo && user.role === 'patient') {
        // Patients can go to homepage - make it clickable
        headerLogo.style.cursor = 'pointer';
        headerLogo.onclick = function() {
            window.location.href = 'homepage.html';
        };
    }
}

function customizePatientDashboard() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;
    
    // Hide revenue and reports for patients
    const revenueCard = document.querySelector('.dashboard-card:nth-child(4)');
    if (revenueCard) revenueCard.classList.add('hidden');
    
    // Hide rating card for patients (only for dentists)
    const ratingCard = document.getElementById('dentist-rating-card');
    if (ratingCard) {
        ratingCard.style.display = 'none';
        ratingCard.classList.add('hidden');
    }
    
    const reportsSection = document.querySelector('.reports-section');
    if (reportsSection) reportsSection.classList.add('hidden');
    
    // Hide clinic info section for patients
    const clinicInfoSection = document.querySelector('.clinic-info');
    if (clinicInfoSection) {
        clinicInfoSection.style.display = 'none';
    }

    // Update dashboard card titles for patients
    const card1Title = document.getElementById('dashboard-card-1-title');
    if (card1Title) card1Title.textContent = "Today's Appointments";
    
    const card1Icon = document.querySelector('.dashboard-card:nth-child(1) .card-icon i');
    if (card1Icon) {
        card1Icon.className = 'fas fa-calendar-day';
    }
    
    const card2Title = document.getElementById('dashboard-card-2-title');
    if (card2Title) card2Title.textContent = "Upcoming Appointments";
    
    const card2Icon = document.querySelector('.dashboard-card:nth-child(2) .card-icon i');
    if (card2Icon) {
        card2Icon.className = 'fas fa-calendar-week';
    }
    
    const card3Title = document.getElementById('dashboard-card-3-title');
    if (card3Title) card3Title.textContent = "Completed Treatments";

    // Update view headers
    const appointmentsTitle = document.getElementById('appointments-title');
    const appointmentsSubtitle = document.getElementById('appointments-subtitle');
    if (appointmentsTitle) appointmentsTitle.textContent = "My Appointments";
    if (appointmentsSubtitle) appointmentsSubtitle.textContent = "View and manage your appointments";

    const patientsTitle = document.getElementById('patients-title');
    const patientsSubtitle = document.getElementById('patients-subtitle');
    if (patientsTitle) patientsTitle.textContent = "My Profile";
    if (patientsSubtitle) patientsSubtitle.textContent = "View and edit your profile information";

    const recordsTitle = document.getElementById('records-title');
    const recordsSubtitle = document.getElementById('records-subtitle');
    if (recordsTitle) recordsTitle.textContent = "My Records";
    if (recordsSubtitle) recordsSubtitle.textContent = "View your dental treatment records";

    // Hide buttons that patients shouldn't see
    hidePatientRestrictedButtons();

    // Hide export buttons for patients
    hidePatientExportButtons();

    // Update dashboard button text using IDs
    const viewFullScheduleBtn = document.getElementById('view-full-schedule-btn');
    if (viewFullScheduleBtn) {
        viewFullScheduleBtn.style.display = 'none'; // Hide "View Full Schedule" for patients
    }

    // Update "View All Appointments" button text
    const viewAllAppointmentsBtn = document.getElementById('view-all-appointments-btn');
    if (viewAllAppointmentsBtn) {
        viewAllAppointmentsBtn.textContent = 'View My Appointments';
    }

    // Update schedule section title for patients
    const scheduleTitle = document.getElementById('dashboard-schedule-title');
    if (scheduleTitle) {
        scheduleTitle.textContent = "Today's Appointments";
    }
    
    // Update pending actions section for patients
    const pendingActionsTitle = document.querySelector('.pending-actions-section h3');
    if (pendingActionsTitle) {
        pendingActionsTitle.textContent = "Pending Appointments";
    }
    const pendingActionsSubtitle = document.querySelector('.pending-actions-section p');
    if (pendingActionsSubtitle) {
        pendingActionsSubtitle.textContent = "Appointments waiting for confirmation";
    }
    
    // Add recent records section for patients (replace or enhance existing sections)
    addPatientRecentRecords();

    // Hide patient filter dropdown in records view (patients only see their own)
    const recordPatientFilter = document.getElementById('record-patient-filter');
    if (recordPatientFilter) {
        recordPatientFilter.style.display = 'none';
        // Also hide the label if it exists
        const filterLabel = recordPatientFilter.previousElementSibling;
        if (filterLabel && filterLabel.tagName === 'LABEL') {
            filterLabel.style.display = 'none';
        }
        // Hide the parent container if it's in a filters-section
        const filtersSection = recordPatientFilter.closest('.filters-section');
        if (filtersSection && filtersSection.querySelectorAll('select, input').length === 1) {
            // If this is the only filter, we might want to hide the whole section
            // But for now, just hide the select
        }
    }
}

function updatePatientNavigationLabels() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') {
        // Remove patient class from body if not a patient
        document.body.classList.remove('patient-view');
        return;
    }
    
    // Add patient class to body for CSS targeting
    document.body.classList.add('patient-view');
    
    // Remember which item is currently active before updating
    const activeNavItem = document.querySelector('.nav-item.active');
    const activeViewId = activeNavItem ? activeNavItem.getAttribute('data-view') : null;

    // Update navigation item labels using IDs for better reliability
    const appointmentsLabel = document.getElementById('nav-appointments-label');
    if (appointmentsLabel) appointmentsLabel.textContent = 'My Appointments';
    
    const recordsLabel = document.getElementById('nav-records-label');
    if (recordsLabel) recordsLabel.textContent = 'My Records';
    
    // Ensure only Dashboard, Appointments, Records, and Settings are visible
    const allowedViews = ['dashboard', 'appointments', 'records', 'settings'];
    
    // Get all navigation items - use multiple selectors to be sure
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const allNavItems = document.querySelectorAll('.nav-item');
    
    // Hide all navigation items first, then show only allowed ones
    allNavItems.forEach(item => {
        const viewId = item.getAttribute('data-view');
        
        // Skip logout button
        if (item.classList.contains('logout')) {
            return;
        }
        
        // Hide if not in allowed views
        if (viewId && !allowedViews.includes(viewId)) {
            item.style.display = 'none';
            item.style.visibility = 'hidden';
            item.style.opacity = '0';
            item.style.height = '0';
            item.style.overflow = 'hidden';
            item.style.margin = '0';
            item.style.padding = '0';
            item.classList.add('hidden');
        } else if (viewId && allowedViews.includes(viewId)) {
            item.style.display = '';
            item.style.visibility = '';
            item.style.opacity = '';
            item.style.height = '';
            item.style.overflow = '';
            item.style.margin = '';
            item.style.padding = '';
            item.classList.remove('hidden');
        }
        
        // Update labels
        const span = item.querySelector('span');
        if (span) {
            switch(viewId) {
                case 'appointments':
                    if (!appointmentsLabel) span.textContent = 'My Appointments';
                    break;
                case 'records':
                    if (!recordsLabel) span.textContent = 'My Records';
                    break;
            }
        }
    });
    
    // Explicitly hide specific navigation items by ID - FORCE HIDE
    const patientsNav = document.getElementById('nav-patients');
    if (patientsNav) {
        patientsNav.style.display = 'none';
        patientsNav.style.visibility = 'hidden';
        patientsNav.style.opacity = '0';
        patientsNav.style.height = '0';
        patientsNav.style.overflow = 'hidden';
        patientsNav.style.margin = '0';
        patientsNav.style.padding = '0';
        patientsNav.classList.add('hidden');
        patientsNav.classList.remove('active'); // Remove active if hidden
    }
    
    const scheduleNav = document.getElementById('nav-schedule');
    if (scheduleNav) {
        scheduleNav.style.display = 'none';
        scheduleNav.style.visibility = 'hidden';
        scheduleNav.style.opacity = '0';
        scheduleNav.style.height = '0';
        scheduleNav.style.overflow = 'hidden';
        scheduleNav.style.margin = '0';
        scheduleNav.style.padding = '0';
        scheduleNav.classList.add('hidden');
        scheduleNav.classList.remove('active'); // Remove active if hidden
    }
    
    const usersNav = document.getElementById('users-nav');
    if (usersNav) {
        usersNav.style.display = 'none';
        usersNav.style.visibility = 'hidden';
        usersNav.style.opacity = '0';
        usersNav.style.height = '0';
        usersNav.style.overflow = 'hidden';
        usersNav.style.margin = '0';
        usersNav.style.padding = '0';
        usersNav.classList.add('hidden');
        usersNav.classList.remove('active'); // Remove active if hidden
    }
    
    // Restore active state if it was set before
    if (activeViewId && allowedViews.includes(activeViewId)) {
        const activeItem = document.querySelector(`.nav-item[data-view="${activeViewId}"]`);
        if (activeItem && !activeItem.classList.contains('hidden')) {
            // Remove active from all first
            document.querySelectorAll('.nav-item[data-view]').forEach(nav => {
                nav.classList.remove('active');
                nav.style.borderLeftColor = '';
                nav.style.background = '';
                nav.style.color = '';
            });
            // Then add to the correct item
            activeItem.classList.add('active');
            // Force active styles
            activeItem.style.borderLeftColor = '#2563EB';
            activeItem.style.background = '#EBF4FF';
            activeItem.style.color = '#2563EB';
        }
    } else {
        // If no active view was remembered, check current view and set it
        const currentActiveView = document.querySelector('.content-view.active');
        if (currentActiveView) {
            let currentViewId = null;
            if (currentActiveView.id === 'dashboard-view') currentViewId = 'dashboard';
            else if (currentActiveView.id === 'appointments-view') currentViewId = 'appointments';
            else if (currentActiveView.id === 'records-view') currentViewId = 'records';
            else if (currentActiveView.id === 'settings-view') currentViewId = 'settings';
            
            if (currentViewId && allowedViews.includes(currentViewId)) {
                const activeItem = document.querySelector(`.nav-item[data-view="${currentViewId}"]`);
                if (activeItem && !activeItem.classList.contains('hidden')) {
                    document.querySelectorAll('.nav-item[data-view]').forEach(nav => {
                        nav.classList.remove('active');
                        nav.style.borderLeftColor = '';
                        nav.style.background = '';
                        nav.style.color = '';
                    });
                    activeItem.classList.add('active');
                    activeItem.style.borderLeftColor = '#2563EB';
                    activeItem.style.background = '#EBF4FF';
                    activeItem.style.color = '#2563EB';
                }
            }
        }
    }
}

function hidePatientRestrictedButtons() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Hide add buttons that patients shouldn't see
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const bookAppointmentBtn = document.getElementById('book-appointment-btn');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const addRecordBtn = document.getElementById('add-record-btn');

    // Patients use "Book Appointment" button instead of "New Appointment"
    if (addAppointmentBtn) {
        addAppointmentBtn.classList.add('hidden');
    }
    if (bookAppointmentBtn) {
        if (rolePermissions.canPerformAction(user, 'createAppointment')) {
            bookAppointmentBtn.classList.remove('hidden');
        } else {
            bookAppointmentBtn.classList.add('hidden');
        }
    }
    
    // Patients cannot add other patients
    if (addPatientBtn) {
        addPatientBtn.classList.add('hidden');
    }
    
    // Patients cannot create records
    if (addRecordBtn) {
        addRecordBtn.classList.add('hidden');
    }
}

function hidePatientExportButtons() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Hide all export buttons for patients
    const exportReportBtn = document.getElementById('export-report-btn');
    const exportAppointmentsBtn = document.getElementById('export-appointments-btn');
    
    if (exportReportBtn) exportReportBtn.classList.add('hidden');
    if (exportAppointmentsBtn) exportAppointmentsBtn.classList.add('hidden');
}

function customizePatientView(viewId) {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Block access to patients view (profile is accessed differently)
    if (viewId === 'patients') {
        showNotification('You do not have access to this view', 'error');
        // Redirect to appointments
        const appointmentsNav = document.querySelector('[data-view="appointments"]');
        if (appointmentsNav) {
            appointmentsNav.click();
        }
        return;
    }

    switch(viewId) {
        case 'dashboard':
            customizePatientDashboard();
            break;
        case 'appointments':
            customizePatientAppointmentsView();
            break;
        case 'records':
            customizePatientRecordsView();
            break;
        case 'settings':
            customizePatientSettingsView();
            break;
    }
}

function customizePatientAppointmentsView() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') {
        // For non-patients, hide both buttons (only patients can book appointments)
        const bookAppointmentBtn = document.getElementById('book-appointment-btn');
        const addAppointmentBtn = document.getElementById('add-appointment-btn');
        if (bookAppointmentBtn) {
            bookAppointmentBtn.classList.add('hidden');
        }
        if (addAppointmentBtn) {
            // Hide for dentists, only show for admin if they have permission
            if (user.role === 'admin' && rolePermissions.canPerformAction(user, 'createAppointment')) {
                addAppointmentBtn.classList.remove('hidden');
            } else {
                addAppointmentBtn.classList.add('hidden');
            }
        }
        return;
    }

    // Show "Book Appointment" button for patients, hide "New Appointment" button
    const bookAppointmentBtn = document.getElementById('book-appointment-btn');
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (bookAppointmentBtn) {
        bookAppointmentBtn.classList.remove('hidden');
    }
    if (addAppointmentBtn) {
        addAppointmentBtn.classList.add('hidden');
    }

    // Update table header for patients - show: Date, Service, Location, Doctor, Status, Actions
    const tableHeader = document.getElementById('appointments-table-header');
    if (tableHeader) {
        // Clear existing header
        tableHeader.innerHTML = '';
        
        // Add the 6 columns for patients
        const headers = ['Appointed Date', 'Service Acquired', 'Location', 'Doctor', 'Status', 'Actions'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tableHeader.appendChild(th);
        });
    }
    
    // Also hide status filter for patients (they don't need it)
    const statusFilter = document.getElementById('appointment-status-filter');
    if (statusFilter) {
        statusFilter.style.display = 'none';
    }
}

function customizePatientProfileView() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Ensure "Add Patient" button is hidden
    const addPatientBtn = document.getElementById('add-patient-btn');
    if (addPatientBtn) addPatientBtn.classList.add('hidden');

    // Patients should only see their own profile
    // This is handled by data filtering in views-handler.js
}

function customizePatientRecordsView() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Hide "Add Record" button
    const addRecordBtn = document.getElementById('add-record-btn');
    if (addRecordBtn) addRecordBtn.classList.add('hidden');

    // Hide patient filter dropdown (patients only see their own records)
    const recordPatientFilter = document.getElementById('record-patient-filter');
    if (recordPatientFilter) {
        recordPatientFilter.style.display = 'none';
        // Also hide the label if it exists
        const filterLabel = recordPatientFilter.previousElementSibling;
        if (filterLabel && filterLabel.tagName === 'LABEL') {
            filterLabel.style.display = 'none';
        }
    }
}

function customizePatientSettingsView() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Hide clinic settings, data management, notifications, and preferences tabs for patients
    const clinicTab = document.querySelector('.settings-tab[data-tab="clinic"]');
    const dataTab = document.querySelector('.settings-tab[data-tab="data"]');
    const notificationsTab = document.querySelector('.settings-tab[data-tab="notifications"]');
    const preferencesTab = document.querySelector('.settings-tab[data-tab="preferences"]');
    
    if (clinicTab) {
        clinicTab.style.display = 'none';
        clinicTab.classList.remove('active');
    }
    if (dataTab) {
        dataTab.style.display = 'none';
        dataTab.classList.remove('active');
    }
    if (notificationsTab) {
        notificationsTab.style.display = 'none';
        notificationsTab.classList.remove('active');
    }
    if (preferencesTab) {
        preferencesTab.style.display = 'none';
        preferencesTab.classList.remove('active');
    }

    // Hide clinic settings panel
    const clinicPanel = document.getElementById('clinic-settings');
    if (clinicPanel) {
        clinicPanel.classList.remove('active');
    }
    
    // Hide notifications settings panel
    const notificationsPanel = document.getElementById('notification-settings');
    if (notificationsPanel) {
        notificationsPanel.classList.remove('active');
        notificationsPanel.style.display = 'none';
    }
    
    // Hide preferences settings panel
    const preferencesPanel = document.getElementById('preferences-settings');
    if (preferencesPanel) {
        preferencesPanel.classList.remove('active');
        preferencesPanel.style.display = 'none';
    }

    // Show only profile tab
    const profileTab = document.querySelector('.settings-tab[data-tab="profile"]');
    const profilePanel = document.getElementById('profile-settings');
    
    // Activate profile tab and panel by default for patients
    if (profileTab && profilePanel) {
        // Remove active from all tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        // Remove active from all panels
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activate profile tab and panel
        profileTab.classList.add('active');
        profilePanel.classList.add('active');
    }
}

function addPatientRecentRecords() {
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'patient') return;

    // Get patient's recent records
    let allRecords = dataManager.getRecords();
    allRecords = rolePermissions.filterDataByRole(user, allRecords, 'records');
    
    // Sort by date (most recent first) and take top 3
    const recentRecords = allRecords
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 3);

    // Add recent records section after pending actions
    const dashboardSections = document.querySelector('.dashboard-sections');
    if (!dashboardSections) return;

    // Check if recent records section already exists
    let recentRecordsSection = document.getElementById('patient-recent-records');
    if (!recentRecordsSection) {
        recentRecordsSection = document.createElement('div');
        recentRecordsSection.id = 'patient-recent-records';
        recentRecordsSection.className = 'recent-records-section';
        dashboardSections.appendChild(recentRecordsSection);
    }

    recentRecordsSection.innerHTML = `
        <h3>Recent Treatments</h3>
        <p>Your recent dental treatments and records</p>
        <div class="records-list-mini">
            ${recentRecords.length > 0 ? recentRecords.map(record => `
                <div class="record-item-mini">
                    <div class="record-date-mini">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(record.date || record.createdAt)}</span>
                    </div>
                    <div class="record-treatment-mini">
                        <strong>${record.treatment || 'Treatment'}</strong>
                        ${record.dentist ? `<small>by ${record.dentist}</small>` : ''}
                    </div>
                    <button class="btn-icon" onclick="viewsHandler.viewRecord('${record.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `).join('') : '<p class="empty-state">No treatment records yet</p>'}
        </div>
        <button class="view-full-btn" onclick="document.querySelector('[data-view=\'records\']')?.click()">View All Records</button>
    `;
}

function customizeAdminDashboard() {
    // Admin sees everything - show all buttons
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const addRecordBtn = document.getElementById('add-record-btn');

    if (addAppointmentBtn) addAppointmentBtn.classList.remove('hidden');
    if (addPatientBtn) addPatientBtn.classList.remove('hidden');
    if (addRecordBtn) addRecordBtn.classList.remove('hidden');
    
    // Update welcome section with admin-specific styling
    const user = dataManager.getCurrentUser();
    if (user) {
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
        }
    }
}

function customizeDentistDashboard() {
    // Dentists can create appointments, patients, and records
    const user = dataManager.getCurrentUser();
    if (!user || user.role !== 'dentist') return;
    
    // Remove reports section for dentists
    const reportsSection = document.querySelector('.reports-section');
    if (reportsSection) {
        reportsSection.remove();
    }
    
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const bookAppointmentBtn = document.getElementById('book-appointment-btn');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const addRecordBtn = document.getElementById('add-record-btn');

    // Hide "New Appointment" button for dentists (only patients can book appointments)
    if (addAppointmentBtn) {
        addAppointmentBtn.classList.add('hidden');
    }
    if (bookAppointmentBtn) {
        bookAppointmentBtn.classList.add('hidden');
    }
    if (addPatientBtn) {
        if (rolePermissions.canPerformAction(user, 'createPatient')) {
            addPatientBtn.classList.remove('hidden');
        } else {
            addPatientBtn.classList.add('hidden');
        }
    }
    if (addRecordBtn) {
        if (rolePermissions.canPerformAction(user, 'createRecord')) {
            addRecordBtn.classList.remove('hidden');
        } else {
            addRecordBtn.classList.add('hidden');
        }
    }

    // Hide revenue for dentists if not allowed
    if (!rolePermissions.hasPermission(user, 'viewRevenue')) {
        const revenueCard = document.querySelector('.dashboard-card:nth-child(4)');
        if (revenueCard) revenueCard.classList.add('hidden');
    }
    
    // Update welcome section with dentist-specific styling
    if (user) {
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)';
        }
    }
}

// Function to update UI based on authentication state
function updateAuthUI() {
    // Check if dataManager is available
    if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
        // If dataManager is not available yet, show login required message
        const loginRequiredMsg = document.getElementById('login-required-message');
        const sidebar = document.querySelector('.sidebar');
        const contentViews = document.querySelectorAll('.content-view');
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (loginRequiredMsg) {
            loginRequiredMsg.classList.remove('hidden');
            loginRequiredMsg.style.display = 'flex';
        }
        if (sidebar) sidebar.style.display = 'none';
        if (contentViews) {
            contentViews.forEach(view => {
                view.style.display = 'none';
                view.classList.remove('active');
            });
        }
        if (loginSection) {
            loginSection.classList.remove('hidden');
            loginSection.style.display = 'block';
        }
        if (userSection) {
            userSection.classList.add('hidden');
            userSection.style.display = 'none';
        }
        return;
    }
    
    const currentUser = dataManager.getCurrentUser();
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const loginRequiredMsg = document.getElementById('login-required-message');
    const viewToggleSection = document.getElementById('view-toggle-section');
    const sidebar = document.querySelector('.sidebar');
    const contentViews = document.querySelectorAll('.content-view');
    
    if (!currentUser) {
        // Not logged in - show login prompt
        if (loginSection) {
            loginSection.classList.remove('hidden');
            loginSection.style.display = 'block';
        }
        if (userSection) {
            userSection.classList.add('hidden');
            userSection.style.display = 'none';
        }
        if (loginRequiredMsg) {
            loginRequiredMsg.classList.remove('hidden');
            loginRequiredMsg.style.display = 'flex';
        }
        if (viewToggleSection) {
            viewToggleSection.classList.add('hidden');
            viewToggleSection.style.display = 'none';
        }
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        contentViews.forEach(view => {
            view.style.display = 'none';
            view.classList.remove('active');
        });
        
        // Add login button handler
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => {
                window.location.href = 'homepage.html';
            };
        }
    } else {
        // Logged in - show dashboard
        if (loginSection) {
            loginSection.classList.add('hidden');
            loginSection.style.display = 'none';
        }
        if (userSection) {
            userSection.classList.remove('hidden');
            userSection.style.display = 'flex';
        }
        if (loginRequiredMsg) {
            loginRequiredMsg.classList.add('hidden');
            loginRequiredMsg.style.display = 'none';
        }
        // View toggle is always hidden - removed
        if (viewToggleSection) {
            viewToggleSection.classList.add('hidden');
            viewToggleSection.style.display = 'none';
        }
        if (sidebar) {
            sidebar.style.display = 'flex';
        }
        // Determine default view based on role
        let defaultView = 'dashboard-view';
        // Admins should land directly on User Management
        if (currentUser && currentUser.role === 'admin') {
            defaultView = 'users-view';
        }
        
        contentViews.forEach(view => {
            if (view.id === defaultView) {
                view.style.display = 'block';
                view.classList.add('active');
            } else {
                view.style.display = 'none';
                view.classList.remove('active');
            }
        });
        
        // Update user info directly (avoid recursive loop with authManager)
        const user = dataManager.getCurrentUser();
        if (user) {
            const userNameEl = document.getElementById('header-user-name');
            const userRoleEl = document.getElementById('header-user-role');
            const userAvatarEl = document.getElementById('header-user-avatar');
            
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
                    const initials = (user.name || 'User').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    userAvatarEl.textContent = initials || 'U';
                }
            }
        }
        
        // Apply role-based access control and update navigation
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            applyRoleBasedAccess();
            
            // If admin, ensure User Management nav is active and data is loaded
            if (currentUser && currentUser.role === 'admin') {
                const usersNav = document.querySelector('.nav-item[data-view="users"]');
                if (usersNav) {
                    // Mark as active
                    document.querySelectorAll('.nav-item[data-view]').forEach(nav => {
                        nav.classList.remove('active');
                    });
                    usersNav.classList.add('active');
                }
                
                // Notify views that User Management is the active view
                document.dispatchEvent(new CustomEvent('viewChanged', {
                    detail: { view: 'users' }
                }));
            }
            
            // For patients, ensure navigation is properly updated
            if (currentUser && currentUser.role === 'patient') {
                updatePatientNavigationLabels();
            }
        }, 100);
    }
}

// Theme Management Functions
function initTheme() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true';
    
    // Apply theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update theme toggle button icon
    updateThemeIcon(isDarkMode);
    
    // Update settings checkbox if it exists
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = isDarkMode;
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newTheme = !isDarkMode;
    
    // Toggle theme
    if (newTheme) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', newTheme);
    
    // Update icon
    updateThemeIcon(newTheme);
    
    // Update settings checkbox if it exists
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = newTheme;
    }
    
    showNotification(newTheme ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

function updateThemeIcon(isDarkMode) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        if (isDarkMode) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme on page load
    initTheme();
    
    // Setup theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Update notification badge on page load (with error handling)
    if (typeof updateNotificationBadge === 'function') {
        setTimeout(() => {
            try {
                updateNotificationBadge();
            } catch (error) {
                console.error('Error updating notification badge:', error);
                // Silently fail - badge will update when user logs in
            }
        }, 500);
    }
    
    // Initial auth check and UI update
    updateAuthUI();
    
    // Customize dashboard based on role after auth UI update
    setTimeout(() => {
        if (typeof dataManager !== 'undefined' && dataManager.getCurrentUser) {
            const user = dataManager.getCurrentUser();
            if (user) {
                if (user.role === 'dentist' && typeof customizeDentistDashboard === 'function') {
                    customizeDentistDashboard();
                }
            }
        }
    }, 100);
    
    // Also listen for storage changes (in case login happens in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser' || e.key === null) {
            updateAuthUI();
            // Re-apply dashboard customization
            setTimeout(() => {
                if (typeof dataManager !== 'undefined' && dataManager.getCurrentUser) {
                    const user = dataManager.getCurrentUser();
                    if (user && user.role === 'dentist' && typeof customizeDentistDashboard === 'function') {
                        customizeDentistDashboard();
                    }
                }
            }, 100);
        }
    });

    // Keyboard shortcuts help button
    const shortcutsBtn = document.getElementById('shortcuts-help-btn');
    if (shortcutsBtn) {
        shortcutsBtn.addEventListener('click', () => {
            if (typeof keyboardShortcuts !== 'undefined') {
                keyboardShortcuts.showShortcutsHelp();
            }
        });
    }
    
    // Get navigation items - exclude logout button
    const navItems = document.querySelectorAll('.nav-item[data-view]'); // Only items with data-view attribute
    const logoutBtn = document.querySelector('.nav-item.logout'); // Logout button separately
    const contentViews = document.querySelectorAll('.content-view');

    // Apply role-based access control only if user is logged in
    if (typeof dataManager !== 'undefined' && dataManager.getCurrentUser) {
        const currentUser = dataManager.getCurrentUser();
        if (currentUser) {
            applyRoleBasedAccess();
            
            // For patients, ensure navigation is properly updated - call multiple times to ensure it works
            if (currentUser.role === 'patient') {
                updatePatientNavigationLabels(); // Ensure navigation labels and visibility are correct
                
                // Call again after a short delay to ensure it sticks
                setTimeout(() => {
                    updatePatientNavigationLabels();
                }, 200);
                
                // Call one more time after views are initialized
                setTimeout(() => {
                    updatePatientNavigationLabels();
                }, 500);
            }
        }
    }

    // Handle logout button separately - ensure it works for all users
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (typeof showLogoutConfirmation === 'function') {
                showLogoutConfirmation();
            } else {
                // Fallback: direct logout
                if (typeof dataManager !== 'undefined' && dataManager.logout) {
                    dataManager.logout();
                    window.location.href = 'homepage.html';
                } else {
                    // Last resort: clear storage and redirect
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'homepage.html';
                }
            }
        });
    }

    // Navigation switching - use event delegation to handle dynamically shown/hidden items
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item[data-view]');
        if (!navItem) return;
        
        e.preventDefault();
        
        const viewId = navItem.getAttribute('data-view');
        
        // Check permission
        if (typeof dataManager !== 'undefined' && typeof rolePermissions !== 'undefined') {
            const user = dataManager.getCurrentUser();
            if (user && !rolePermissions.canAccessView(user, viewId)) {
                if (typeof showNotification !== 'undefined') {
                    showNotification('You do not have permission to access this view', 'error');
                }
                return;
            }
        }
        
        // Remove active class from ALL nav items (including those that might be hidden)
        const allNavItems = document.querySelectorAll('.nav-item[data-view]');
        allNavItems.forEach(nav => {
            nav.classList.remove('active');
            // Clear any inline styles that might interfere
            nav.style.borderLeftColor = '';
        });
        
        // Add active class to clicked item
        navItem.classList.add('active');
        
        // Force the active styles with !important via inline style if needed
        navItem.style.borderLeftColor = '#2563EB';
        navItem.style.background = '#EBF4FF';
        navItem.style.color = '#2563EB';
        
        // Also ensure the active state is visible (in case item was hidden and shown)
        navItem.style.display = '';
        navItem.style.visibility = '';
        navItem.style.opacity = '';
        navItem.style.height = '';
        navItem.style.overflow = '';
        navItem.style.margin = '';
        navItem.style.padding = '';
        navItem.classList.remove('hidden');
        
        // Hide all content views FIRST - ensure only one is visible
        const allContentViews = document.querySelectorAll('.content-view');
        allContentViews.forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
            view.style.visibility = 'hidden';
        });
        
        // Show the selected view
        let targetView = null;
        if (viewId === 'dashboard') {
            targetView = document.getElementById('dashboard-view');
        } else if (viewId === 'appointments') {
            targetView = document.getElementById('appointments-view');
        } else if (viewId === 'patients') {
            targetView = document.getElementById('patients-view');
        } else if (viewId === 'schedule') {
            targetView = document.getElementById('schedule-view');
        } else if (viewId === 'records') {
            targetView = document.getElementById('records-view');
        } else if (viewId === 'settings') {
            targetView = document.getElementById('settings-view');
        } else if (viewId === 'users') {
            targetView = document.getElementById('users-view');
        }
        
        if (targetView) {
            // Hide ALL other views explicitly
            allContentViews.forEach(view => {
                if (view.id !== targetView.id) {
                    view.classList.remove('active');
                    view.style.display = 'none';
                    view.style.visibility = 'hidden';
                }
            });
            
            // Show the target view
            targetView.classList.add('active');
            targetView.style.display = 'block';
            targetView.style.visibility = 'visible';
            
            // Force load data for the specific view AFTER showing it
            setTimeout(() => {
                if (typeof viewsHandler !== 'undefined') {
                    if (viewId === 'dashboard') {
                        viewsHandler.loadDashboardData();
                    } else if (viewId === 'appointments') {
                        // Apply customization first, then load
                        const currentUser = dataManager.getCurrentUser();
                        if (currentUser && currentUser.role === 'patient' && typeof customizePatientAppointmentsView === 'function') {
                            customizePatientAppointmentsView();
                        }
                        viewsHandler.loadAppointments(1);
                    } else if (viewId === 'records') {
                        // Apply customization first, then load
                        const currentUser = dataManager.getCurrentUser();
                        if (currentUser && currentUser.role === 'patient' && typeof customizePatientRecordsView === 'function') {
                            customizePatientRecordsView();
                        }
                        viewsHandler.loadRecords(1);
                    } else if (viewId === 'patients') {
                        viewsHandler.loadPatients(1);
                    } else if (viewId === 'schedule') {
                        viewsHandler.loadSchedule();
                    } else if (viewId === 'settings') {
                        // Initialize settings and apply patient customization
                        if (typeof viewsHandler !== 'undefined' && viewsHandler.initSettings) {
                            viewsHandler.initSettings();
                        }
                        // Re-setup tab listeners with a small delay to ensure DOM is ready
                        setTimeout(() => {
                            if (typeof viewsHandler !== 'undefined' && viewsHandler.setupSettingsTabs) {
                                viewsHandler.setupSettingsTabs();
                            }
                        }, 50);
                        // Apply patient customization
                        const currentUser = dataManager.getCurrentUser();
                        if (currentUser && currentUser.role === 'patient' && typeof customizePatientSettingsView === 'function') {
                            customizePatientSettingsView();
                        }
                    }
                }
            }, 100);
        }

        // Re-apply patient customization when view changes
        const user = dataManager.getCurrentUser();
        if (user && user.role === 'patient') {
            customizePatientView(viewId);
        }

        // Dispatch view change event
        document.dispatchEvent(new CustomEvent('viewChanged', { 
            detail: { view: viewId } 
        }));
        
        // Force update active state after a brief delay to ensure it sticks
        setTimeout(() => {
            // Remove active from all
            const allNavItems = document.querySelectorAll('.nav-item[data-view]');
            allNavItems.forEach(nav => {
                nav.classList.remove('active');
                nav.style.borderLeftColor = '';
                nav.style.background = '';
                nav.style.color = '';
            });
            
            // Add active to clicked item
            const clickedItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
            if (clickedItem) {
                clickedItem.classList.add('active');
                // Force active styles with inline styles
                clickedItem.style.borderLeftColor = '#2563EB';
                clickedItem.style.background = '#EBF4FF';
                clickedItem.style.color = '#2563EB';
            }
        }, 50);
    });

    // View toggle removed - views are now role-based only

    // Booking view navigation
    const bookAppointmentLink = document.querySelector('a[href*="book-appointment"]');
    if (bookAppointmentLink) {
        bookAppointmentLink.addEventListener('click', (e) => {
            e.preventDefault();
            contentViews.forEach(view => view.classList.remove('active'));
            document.getElementById('book-appointment-view').classList.add('active');
        });
    }

    // Back button functionality for booking
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            const user = dataManager.getCurrentUser();
            // Go back to dashboard (or appointments for patients)
            navItems.forEach(nav => nav.classList.remove('active'));
            
            if (user && user.role === 'patient') {
                // Patients go to appointments view
                const appointmentsNav = document.querySelector('[data-view="appointments"]');
                if (appointmentsNav) {
                    appointmentsNav.classList.add('active');
                    appointmentsNav.click();
                }
            } else {
                // Other roles go to dashboard
                const dashboardNav = document.querySelector('[data-view="dashboard"]');
                if (dashboardNav) {
                    dashboardNav.classList.add('active');
                    dashboardNav.click();
                }
            }
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
    try {
        // Check if user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) {
            return;
        }

        // Check if notification methods exist
        if (typeof dataManager.getNotifications !== 'function') {
            console.warn('Notification methods not available');
            return;
        }

        // Remove existing dropdown
        const existingDropdown = document.querySelector('.notification-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        // Get user-specific notifications
        const notifications = dataManager.getNotifications(user.id);
        const unreadNotifications = notifications.filter(n => !n.read);
        const recentNotifications = notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10); // Show last 10 notifications

        // Helper function to format time ago
        const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            return date.toLocaleDateString();
        };

        // Helper function to get notification icon
        const getNotificationIcon = (type) => {
        const icons = {
            'appointment': 'fa-calendar-check',
            'appointment-confirmed': 'fa-calendar-check',
            'appointment-cancelled': 'fa-calendar-times',
            'appointment-reminder': 'fa-bell',
            'record': 'fa-file-medical',
            'review': 'fa-star',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle',
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle'
        };
            return icons[type] || icons['info'];
        };

        // Create notification dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        
        const notificationsHTML = recentNotifications.length > 0 
        ? recentNotifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(n.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${n.title || 'Notification'}</h4>
                    <p>${n.message || ''}</p>
                    <span class="notification-time">${formatTimeAgo(n.createdAt)}</span>
                </div>
            </div>
        `).join('')
            : '<div class="notification-empty"><p>No notifications</p></div>';

        dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications${unreadNotifications.length > 0 ? ` <span class="unread-count">${unreadNotifications.length}</span>` : ''}</h3>
            <div>
                ${unreadNotifications.length > 0 ? `<button class="mark-all-read-btn" title="Mark all as read">Mark all read</button>` : ''}
                <button class="close-notifications">&times;</button>
            </div>
        </div>
        <div class="notification-list">
            ${notificationsHTML}
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
        
        .notification-item.unread {
            background: #F0F9FF;
            border-left: 3px solid #2563EB;
        }
        
        .notification-item.unread .notification-content h4 {
            font-weight: 700;
        }
        
        .notification-empty {
            padding: 40px 20px;
            text-align: center;
            color: #9CA3AF;
        }
        
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .unread-count {
            background: #EF4444;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .mark-all-read-btn {
            background: none;
            border: none;
            color: #2563EB;
            font-size: 12px;
            cursor: pointer;
            padding: 4px 8px;
            margin-right: 8px;
        }
        
        .mark-all-read-btn:hover {
            text-decoration: underline;
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

        // Mark all as read
        const markAllReadBtn = dropdown.querySelector('.mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                dataManager.markAllNotificationsAsRead(user.id);
                updateNotificationBadge();
                showNotificationDropdown(); // Refresh dropdown
            });
        }

        // Mark individual notification as read when clicked
        dropdown.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                if (notificationId) {
                    dataManager.markNotificationAsRead(notificationId);
                    this.classList.remove('unread');
                    updateNotificationBadge();
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !document.querySelector('.notifications').contains(e.target)) {
                dropdown.remove();
            }
        });
    } catch (error) {
        console.error('Error in showNotificationDropdown:', error);
        if (typeof showNotification !== 'undefined') {
            showNotification('Failed to load notifications', 'error');
        }
    }
}

// Update notification badge count
function updateNotificationBadge() {
    try {
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) {
            return;
        }

        // Check if notification methods exist
        if (typeof dataManager.getUnreadNotificationCount !== 'function') {
            return;
        }

        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const count = dataManager.getUnreadNotificationCount(user.id);
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.style.display = 'flex';
                // Adjust badge size for larger numbers
                if (count > 9) {
                    badge.style.minWidth = '20px';
                    badge.style.borderRadius = '10px';
                } else {
                    badge.style.minWidth = '18px';
                    badge.style.borderRadius = '50%';
                }
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error in updateNotificationBadge:', error);
        // Silently fail - don't show error to user
    }
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

// Smooth scrolling for sidebar navigation - REMOVED duplicate handler
// Navigation click handling is now done via event delegation above

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
    // Load dashboard data after a short delay - use viewsHandler if available
    setTimeout(() => {
        if (typeof viewsHandler !== 'undefined' && viewsHandler.loadDashboardData) {
            viewsHandler.loadDashboardData();
        } else if (typeof loadDashboardData !== 'undefined') {
            loadDashboardData();
        }
    }, 500);
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
document.querySelectorAll('.nav-item, .service-item').forEach(element => {
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
`;
document.head.appendChild(focusStyle);

// Logout functionality - ensure it works for all users
document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation to catch logout clicks even if button is recreated
    document.addEventListener('click', function(e) {
        const logoutBtn = e.target.closest('.nav-item.logout');
        if (logoutBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Show logout confirmation
            if (typeof showLogoutConfirmation === 'function') {
                showLogoutConfirmation();
            } else {
                // Fallback: direct logout
                if (typeof dataManager !== 'undefined' && dataManager.logout) {
                    dataManager.logout();
                    window.location.href = 'homepage.html';
                } else {
                    // Last resort: clear storage and redirect
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'homepage.html';
                }
            }
        }
    });
    
    // Also add direct event listener as backup
    const logoutBtn = document.querySelector('.nav-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Show logout confirmation
            if (typeof showLogoutConfirmation === 'function') {
                showLogoutConfirmation();
            } else {
                // Fallback: direct logout
                if (typeof dataManager !== 'undefined' && dataManager.logout) {
                    dataManager.logout();
                    window.location.href = 'homepage.html';
                }
            }
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
        
        // Actually logout - clear session
        if (typeof dataManager !== 'undefined' && dataManager.logout) {
            dataManager.logout();
        } else {
            // Fallback: clear storage manually
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
        }
        
        // Redirect to homepage after logout
        setTimeout(() => {
            window.location.href = 'homepage.html';
        }, 500);
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

// Global function for settings tab switching - always available
function switchSettingsTab(tabName) {
    // Check if viewsHandler is available
    if (typeof viewsHandler !== 'undefined' && viewsHandler.switchSettingsTab) {
        viewsHandler.switchSettingsTab(tabName);
    } else {
        // Fallback: direct DOM manipulation
        if (!tabName) return;
        
        // Update tab active states
        document.querySelectorAll('.settings-tab').forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            if (isActive) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update panel active states
        document.querySelectorAll('.settings-panel').forEach(panel => {
            let isActive = false;
            
            if (panel.id === `${tabName}-settings`) {
                isActive = true;
            } 
            // Special case: notifications tab -> notification-settings panel (singular)
            else if (tabName === 'notifications' && panel.id === 'notification-settings') {
                isActive = true;
            }
            else if (tabName === 'clinic' && panel.id === 'clinic-settings') {
                isActive = true;
            } else if (tabName === 'data' && panel.id === 'data-settings') {
                isActive = true;
            }
            
            if (isActive) {
                panel.classList.add('active');
                panel.style.display = 'block';
            } else {
                panel.classList.remove('active');
                panel.style.display = 'none';
            }
        });
        
        // Reload settings when switching to profile tab
        if (tabName === 'profile' && typeof viewsHandler !== 'undefined' && viewsHandler.loadSettings) {
            viewsHandler.loadSettings();
        }
    }
}