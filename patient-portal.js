// Patient Portal - Patient-specific features

class PatientPortal {
    constructor() {
        this.init();
    }

    init() {
        const user = dataManager.getCurrentUser();
        if (user && user.role === 'patient') {
            this.setupPatientDashboard();
            this.setupPatientViews();
        }
    }

    setupPatientDashboard() {
        // Customize dashboard for patients
        const user = dataManager.getCurrentUser();
        if (!user) return;

        // Update welcome message
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            const h2 = welcomeSection.querySelector('h2');
            if (h2) {
                h2.textContent = `Welcome back, ${user.name}!`;
            }
        }

        // Load patient-specific data
        this.loadPatientDashboard();
    }

    loadPatientDashboard() {
        const user = dataManager.getCurrentUser();
        if (!user) return;

        // Get patient's appointments
        const allAppointments = dataManager.getAppointments();
        const patientAppointments = allAppointments.filter(apt => 
            apt.patientId === user.id || apt.email === user.email
        );

        // Use device's local date
        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = now.getMonth() + 1;
        const localDay = now.getDate();
        const today = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
        
        const todayAppointments = patientAppointments.filter(apt => apt.date === today && apt.status !== 'cancelled' && apt.status !== 'completed')
            .sort((a, b) => {
                // Sort by date and time descending (newest first)
                const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
                const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
                return dateB - dateA;
            });
        const upcomingAppointments = patientAppointments
            .filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed')
            .sort((a, b) => {
                // Sort by date and time descending (newest first)
                const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
                const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
                return dateB - dateA;
            })
            .slice(0, 5);

        // Update dashboard cards
        const todayPatients = document.getElementById('today-patients');
        const todayPending = document.getElementById('today-pending');
        const weekAppointments = document.getElementById('week-appointments');
        const completed = document.getElementById('month-completed');
        const revenue = document.getElementById('revenue');

        if (todayPatients) todayPatients.textContent = todayAppointments.length;
        if (todayPending) todayPending.textContent = `${todayAppointments.filter(a => a.status === 'pending').length} pending confirmation.`;
        if (weekAppointments) weekAppointments.textContent = patientAppointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return aptDate >= weekStart && aptDate <= weekEnd;
        }).length;
        if (completed) completed.textContent = patientAppointments.filter(apt => apt.status === 'completed').length;
        if (revenue) {
            // Hide revenue for patients or show their spending
            revenue.textContent = 'N/A';
            const revenueText = document.getElementById('revenue-text');
            if (revenueText) revenueText.textContent = 'Not available';
        }

        // Show upcoming appointments
        this.renderUpcomingAppointments(upcomingAppointments);
    }

    renderUpcomingAppointments(appointments) {
        const container = document.querySelector('.appointments-list');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = '<p class="empty-state">No upcoming appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div class="appointment-item">
                <div class="appointment-time">
                    <i class="fas fa-clock"></i>
                    <span>${apt.time}</span>
                </div>
                <div class="appointment-details">
                    <div class="patient-info">
                        <span class="patient-name">${formatDate(apt.date)}</span>
                        <span class="procedure">${apt.service}</span>
                    </div>
                    <div class="appointment-status">
                        <span class="status-badge ${apt.status}">${apt.status}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    ${apt.status === 'pending' ? `
                        <button class="btn-icon" onclick="patientPortal.cancelAppointment('${apt.id}')" title="Cancel">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon" onclick="patientPortal.viewAppointment('${apt.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupPatientViews() {
        // Patient-specific appointment view
        this.setupPatientAppointmentsView();
        this.setupPatientProfileView();
    }

    setupPatientAppointmentsView() {
        // This will be called when appointments view is shown for patients
    }

    setupPatientProfileView() {
        // Patient profile management
    }

    cancelAppointment(id) {
        const appointment = dataManager.getAppointment(id);
        if (!appointment) return;

        const user = dataManager.getCurrentUser();
        
        // Security check: Patients can only cancel their own appointments
        if (user.role === 'patient') {
            if (appointment.patientId !== user.id && appointment.email !== user.email) {
                showNotification('You can only cancel your own appointments', 'error');
                return;
            }
            // Patients can cancel pending or confirmed appointments
            if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
                if (appointment.status === 'completed') {
                    showNotification('You cannot cancel a completed appointment', 'error');
                } else if (appointment.status === 'cancelled') {
                    showNotification('This appointment is already cancelled', 'error');
                } else {
                    showNotification('You can only cancel pending or confirmed appointments', 'error');
                }
                return;
            }
        }

        showConfirmation('Are you sure you want to cancel this appointment?', () => {
            dataManager.updateAppointment(id, { status: 'cancelled' });
            showNotification('Appointment cancelled successfully', 'success');
            
            // Notify dentist when appointment is cancelled
            if (appointment.dentist) {
                const dentists = dataManager.getUsers({ role: 'dentist' });
                const dentist = dentists.find(d => d.name === appointment.dentist);
                if (dentist) {
                    dataManager.createNotification({
                        userId: dentist.id,
                        userRole: 'dentist',
                        type: 'appointment-cancelled',
                        title: 'Appointment Cancelled',
                        message: `${appointment.patientName} has cancelled their appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
                        relatedId: id,
                        relatedType: 'appointment'
                    });
                    
                    // Update notification badge
                    if (typeof updateNotificationBadge === 'function') {
                        updateNotificationBadge();
                    }
                }
            }
            
            this.loadPatientDashboard();
            if (typeof viewsHandler !== 'undefined' && viewsHandler.loadAppointments) {
                viewsHandler.loadAppointments(1);
            }
        });
    }

    viewAppointment(id) {
        const user = dataManager.getCurrentUser();
        
        // Get appointments - filtered by role
        let allAppointments = dataManager.getAppointments();
        if (user && user.role === 'patient') {
            allAppointments = rolePermissions.filterDataByRole(user, allAppointments, 'appointments');
        }
        
        const appointment = allAppointments.find(apt => apt.id === id);
        if (!appointment) {
            showNotification('Appointment not found', 'error');
            return;
        }
        
        // Security check: Patients can only view their own appointments
        if (user && user.role === 'patient') {
            if (appointment.patientId !== user.id && appointment.email !== user.email) {
                showNotification('You can only view your own appointments', 'error');
                return;
            }
        }

        // Get dentist user object to access profile picture
        const dentistName = appointment.dentist || 'Dr. Juan Dela Cruz';
        const dentists = dataManager.getUsers({ role: 'dentist' });
        const dentistUser = dentists.find(d => d.name === dentistName);
        const dentistProfilePicture = dentistUser?.profilePicture;
        
        // Create dentist display with profile picture
        const dentistDisplay = dentistProfilePicture 
            ? `<div style="display: flex; align-items: center; gap: 12px; margin: 12px 0;">
                <img src="${dentistProfilePicture}" alt="${dentistName}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #2563EB;">
                <div>
                    <div style="font-weight: 600; font-size: 16px; color: #1F2937;">${dentistName}</div>
                    ${dentistUser?.specialties && dentistUser.specialties.length > 0 ? 
                        `<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${dentistUser.specialties.join(', ')}</div>` : ''
                    }
                </div>
               </div>`
            : `<div style="display: flex; align-items: center; gap: 12px; margin: 12px 0;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #2563EB; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; border: 3px solid #2563EB;">
                    ${dentistName.charAt(0)}
                </div>
                <div>
                    <div style="font-weight: 600; font-size: 16px; color: #1F2937;">${dentistName}</div>
                    ${dentistUser?.specialties && dentistUser.specialties.length > 0 ? 
                        `<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${dentistUser.specialties.join(', ')}</div>` : ''
                    }
                </div>
               </div>`;

        const content = `
            <div class="appointment-detail">
                <div class="detail-section">
                    <h4>Appointment Details</h4>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Service:</strong> ${appointment.service}</p>
                    <div style="margin: 12px 0;">
                        <strong>Dentist:</strong>
                        ${dentistDisplay}
                    </div>
                    <p><strong>Status:</strong> <span class="status-badge ${appointment.status}">${appointment.status}</span></p>
                </div>
                ${appointment.notes ? `
                <div class="detail-section">
                    <h4>Notes</h4>
                    <p>${appointment.notes}</p>
                </div>
                ` : ''}
            </div>
        `;

        showModal('Appointment Details', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'close',
                handler: () => {}
            }
        ]);
    }
}

// Initialize patient portal
const patientPortal = new PatientPortal();

