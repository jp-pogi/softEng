// Views Handler - Manages all view functionality

class ViewsHandler {
    constructor() {
        this.currentBookingStep = 1;
        this.profilePictureData = null;
        this.profilePictureRemoved = false;
        this.bookingData = {};
        this.systemRatingSetupDone = false;
        this.systemRatingRetryAttempted = false;
        this.init();
    }

    init() {
        // Only initialize if user is logged in and dataManager is available
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) {
            return;
        }
        
        try {
        this.initDashboard();
        this.initAppointments();
        this.initPatients();
        this.initSchedule();
        this.initRecords();
        this.initSettings();
        this.initBooking();
        } catch (error) {
            console.error('Error initializing views:', error);
            // Don't show error notification if user is not logged in
            if (user) {
                if (typeof showNotification === 'function') {
                    showNotification('An error occurred while initializing the dashboard', 'error');
                }
            }
        }
    }

    // Dashboard View
    initDashboard() {
        // Only initialize if user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        this.loadDashboardData();
        
        // Refresh dashboard when view is shown
        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'dashboard') {
                this.loadDashboardData();
            }
        });
    }

    loadDashboardData() {
        // Check if dataManager is available
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;

        // Personalize welcome section
        this.updateWelcomeSection(user);
        
        // Update sidebar clinic info for dentists, hide for patients
        const clinicInfoSection = document.querySelector('.clinic-info');
        if (clinicInfoSection) {
            if (user.role === 'dentist') {
                clinicInfoSection.style.display = 'block';
                this.updateSidebarClinicInfo(user);
            } else {
                // Hide clinic info for patients and other roles
                clinicInfoSection.style.display = 'none';
            }
        }

        // Get analytics based on user role
        let analytics, appointments, today;
        
        if (user.role === 'patient') {
            // Patient-specific data
            // Use device's local date and time (not UTC)
            const now = new Date();
            const localYear = now.getFullYear();
            const localMonth = now.getMonth() + 1;
            const localDay = now.getDate();
            today = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
            const allAppointments = dataManager.getAppointments();
            appointments = allAppointments.filter(apt => 
                (apt.patientId === user.id || apt.email === user.email) && apt.date === today
            ).sort((a, b) => {
                // Sort by date and time descending (newest first)
                const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
                const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
                return dateB - dateA;
            });
            
            const patientAppointments = allAppointments.filter(apt => 
                apt.patientId === user.id || apt.email === user.email
            );
            
            analytics = {
                todayAppointments: appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length,
                todayPending: appointments.filter(a => a.status === 'pending').length,
                weekAppointments: patientAppointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return aptDate >= weekStart && aptDate <= weekEnd && apt.status !== 'cancelled' && apt.status !== 'completed';
                }).length,
                monthCompleted: patientAppointments.filter(apt => apt.status === 'completed').length,
                revenue: 0
            };
        } else {
            // Staff/Dentist/Admin data
            // Use device's local date and time (not UTC)
            const now = new Date();
            const localYear = now.getFullYear();
            const localMonth = now.getMonth() + 1; // getMonth() returns 0-11
            const localDay = now.getDate();
            
            // Format as YYYY-MM-DD using local date
            today = `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`;
            
            // Also create alternative date formats for comparison
            const todayMMDDYYYY = `${String(localMonth).padStart(2, '0')}/${String(localDay).padStart(2, '0')}/${localYear}`;
            const todayMDYYYY = `${localMonth}/${localDay}/${localYear}`;
            
            let allAppointments = dataManager.getAppointments();
            
            // Apply role-based filtering (dentists only see their appointments)
            allAppointments = rolePermissions.filterDataByRole(user, allAppointments, 'appointments');
            
            // Helper function to normalize date to YYYY-MM-DD format
            const normalizeDate = (dateStr) => {
                if (!dateStr) return null;
                const trimmed = dateStr.trim();
                
                // If already in YYYY-MM-DD format, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                    return trimmed;
                }
                
                // Try to parse MM/DD/YYYY or M/D/YYYY format
                const parts = trimmed.split('/');
                if (parts.length === 3) {
                    const month = parseInt(parts[0], 10);
                    const day = parseInt(parts[1], 10);
                    const year = parseInt(parts[2], 10);
                    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    }
                }
                
                // Try to parse as Date object and convert to local date
                const dateObj = new Date(trimmed);
                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = dateObj.getMonth() + 1;
                    const day = dateObj.getDate();
                    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
                
                return null;
            };
            
            // Get today's appointments (already filtered) - normalize dates for comparison
            appointments = allAppointments.filter(apt => {
                if (!apt.date) return false;
                const normalizedAptDate = normalizeDate(apt.date);
                return normalizedAptDate === today;
            }).sort((a, b) => {
                // Sort by date and time descending (newest first)
                const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
                const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
                return dateB - dateA;
            });
            
            // Debug logging
            console.log('Device local date:', {
                year: localYear,
                month: localMonth,
                day: localDay,
                todayYYYYMMDD: today,
                todayMMDDYYYY: todayMMDDYYYY,
                todayMDYYYY: todayMDYYYY,
                deviceTime: now.toString()
            });
            console.log('All appointments after role filter:', allAppointments.length);
            console.log('All appointments dates:', allAppointments.map(apt => ({ 
                date: apt.date, 
                normalizedDate: normalizeDate(apt.date),
                status: apt.status, 
                patient: apt.patientName
            })));
            console.log('Today appointments:', appointments.length);
            console.log('Today appointments details:', appointments.map(apt => ({ 
                date: apt.date, 
                normalizedDate: normalizeDate(apt.date),
                status: apt.status, 
                patient: apt.patientName,
                dentist: apt.dentist
            })));
            
            // Calculate analytics from filtered appointments
            const thisWeek = dataManager.getWeekDates();
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            
            // For revenue calculation, admins see all appointments, others see filtered
            const revenueAppointments = user.role === 'admin' ? dataManager.getAppointments() : allAppointments;
            
            // Calculate dentist rating if user is a dentist
            let dentistRating = null;
            if (user.role === 'dentist') {
                const ratingData = dataManager.calculateDentistAverageRating(user.name);
                dentistRating = ratingData;
            }
            
            analytics = {
                todayAppointments: appointments.filter(apt => apt.status === 'pending' || apt.status === 'in-progress' || apt.status === 'confirmed').length,
                todayPending: appointments.filter(apt => apt.status === 'pending').length,
                weekAppointments: allAppointments.filter(apt => 
                    thisWeek.includes(apt.date) && apt.status !== 'cancelled' && apt.status !== 'completed'
                ).length,
                monthCompleted: allAppointments.filter(apt => {
                    if (!apt.date) return false;
                    const aptDate = new Date(apt.date);
                    return aptDate.getMonth() === thisMonth && 
                           aptDate.getFullYear() === thisYear && 
                           apt.status === 'completed';
                }).length,
                totalPatients: user.role === 'admin' ? dataManager.getPatients().length : 
                              (user.role === 'dentist' ? rolePermissions.filterDataByRole(user, dataManager.getPatients(), 'patients').length : 0),
                totalAppointments: allAppointments.length,
                revenue: user.role === 'admin' ? dataManager.calculateRevenue(revenueAppointments) : 0,
                statusBreakdown: dataManager.getStatusBreakdown(allAppointments),
                dentistRating: dentistRating
            };
        }

        // Update cards
        const todayPatients = document.getElementById('today-patients');
        const todayPending = document.getElementById('today-pending');
        const weekAppointments = document.getElementById('week-appointments');
        const weekSchedule = document.getElementById('week-schedule');
        const completed = document.getElementById('month-completed');
        const monthText = document.getElementById('month-text');
        const revenue = document.getElementById('revenue');
        const revenueText = document.getElementById('revenue-text');

        if (todayPatients) todayPatients.textContent = analytics.todayAppointments;
        if (todayPending) todayPending.textContent = `${analytics.todayPending} pending confirmation.`;
        if (weekAppointments) weekAppointments.textContent = analytics.weekAppointments;
        if (weekSchedule) weekSchedule.textContent = `${analytics.weekAppointments} appointment schedule.`;
        if (completed) completed.textContent = analytics.monthCompleted;
        if (monthText) monthText.textContent = `${analytics.monthCompleted} this month.`;
        if (revenue) {
            if (user.role === 'patient' || (user.role === 'dentist' && !rolePermissions.hasPermission(user, 'viewRevenue'))) {
                revenue.textContent = 'N/A';
            } else {
                revenue.textContent = `₱ ${analytics.revenue.toLocaleString()}`;
            }
        }
        if (revenueText) {
            if (user.role === 'patient') {
                revenueText.textContent = 'Not available';
            } else {
                revenueText.textContent = 'Total revenue.';
            }
        }
        
        // Display dentist rating if available (only for dentists)
        const ratingCard = document.getElementById('dentist-rating-card');
        if (user.role === 'dentist') {
            const ratingValue = document.getElementById('dentist-rating-value');
            const ratingCount = document.getElementById('dentist-rating-count');
            
            if (ratingCard) {
                ratingCard.classList.remove('hidden');
                ratingCard.style.display = 'block';
            }
            if (analytics.dentistRating) {
                if (ratingValue) {
                    ratingValue.textContent = analytics.dentistRating.average > 0 ? analytics.dentistRating.average.toFixed(1) : 'N/A';
                }
                if (ratingCount) {
                    ratingCount.textContent = analytics.dentistRating.count > 0 
                        ? `${analytics.dentistRating.count} ${analytics.dentistRating.count === 1 ? 'review' : 'reviews'}` 
                        : 'No reviews yet';
                }
            } else {
                if (ratingValue) ratingValue.textContent = 'N/A';
                if (ratingCount) ratingCount.textContent = 'No reviews yet';
            }
            
            // Render reviews section
            this.renderDentistReviews(user);
        } else {
            // Hide rating card for patients and other non-dentist roles
            if (ratingCard) {
                ratingCard.style.display = 'none';
                ratingCard.classList.add('hidden');
            }
        }

        // Update today's schedule
        this.renderTodaysSchedule(appointments);
        this.renderPendingActions();
        
        // Only show reports if user has permission and is not a dentist
        if (rolePermissions.hasPermission(user, 'viewReports') && user.role !== 'dentist') {
            this.renderReports();
        } else if (user.role === 'dentist') {
            // Remove reports section for dentists
            const reportsSection = document.querySelector('.reports-section');
            if (reportsSection) {
                reportsSection.remove();
            }
        }
        
        // Add patient-specific sections
        if (user.role === 'patient' && typeof addPatientRecentRecords === 'function') {
            setTimeout(() => {
                addPatientRecentRecords();
            }, 100);
        }
    }

    updateWelcomeSection(user) {
        if (!user) return;

        // Get greeting based on time of day
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) {
            greeting = 'Good morning';
        } else if (hour < 18) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }

        // Update welcome greeting
        const welcomeGreeting = document.getElementById('welcome-greeting');
        const welcomeMessage = document.getElementById('welcome-message');
        const avatarInitials = document.getElementById('avatar-initials');
        const welcomeActions = document.getElementById('welcome-actions');

        if (welcomeGreeting) {
            welcomeGreeting.textContent = `${greeting}, ${user.name}!`;
        }

        // Update welcome avatar - check for profile picture
        const welcomeAvatar = document.getElementById('welcome-avatar');
        if (welcomeAvatar) {
            if (user.profilePicture) {
                // Display profile picture
                welcomeAvatar.style.backgroundImage = `url(${user.profilePicture})`;
                welcomeAvatar.style.backgroundSize = 'cover';
                welcomeAvatar.style.backgroundPosition = 'center';
                if (avatarInitials) {
                    avatarInitials.textContent = '';
                    avatarInitials.style.display = 'none';
                }
            } else {
                // Display initials
                welcomeAvatar.style.backgroundImage = 'none';
                if (avatarInitials) {
                    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    avatarInitials.textContent = initials || 'U';
                    avatarInitials.style.display = 'flex';
                }
            }
        } else if (avatarInitials) {
            // Fallback if welcome-avatar doesn't exist
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            avatarInitials.textContent = initials || 'U';
        }

        // Role-specific welcome message
        if (welcomeMessage) {
            let message = '';
            if (user.role === 'patient') {
                message = 'Here\'s your appointment overview and upcoming visits.';
            } else if (user.role === 'dentist') {
                message = 'Here\'s your schedule and patient information for today.';
            } else if (user.role === 'admin') {
                message = 'Welcome to the admin dashboard. Manage all clinic operations.';
            } else {
                message = 'Here\'s what\'s happening at the clinic today.';
            }
            welcomeMessage.textContent = message;
        }

        // Add quick action buttons based on role
        if (welcomeActions) {
            let actions = [];
            
            if (user.role === 'patient') {
                // No quick action buttons for patients
                actions = [];
            } else if (user.role === 'dentist') {
                // No quick action buttons for dentists
                actions = [];
            } else if (user.role === 'admin') {
                actions = [
                    { icon: 'fa-users', text: 'Manage Users', action: () => {
                        document.querySelector('[data-view="users"]')?.click();
                    }},
                    { icon: 'fa-cog', text: 'Settings', action: () => {
                        document.querySelector('[data-view="settings"]')?.click();
                    }}
                ];
            } else {
                actions = [
                    { icon: 'fa-user-plus', text: 'Add Patient', action: () => {
                        document.querySelector('[data-view="patients"]')?.click();
                        setTimeout(() => {
                            document.getElementById('add-patient-btn')?.click();
                        }, 300);
                    }}
                ];
            }

            // Clear existing buttons
            welcomeActions.innerHTML = '';
            
            // Create buttons with proper event listeners
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'welcome-action-btn';
                button.innerHTML = `<i class="fas ${action.icon}"></i> ${action.text}`;
                button.addEventListener('click', action.action);
                welcomeActions.appendChild(button);
            });
        }
    }

    renderReports() {
        const analytics = dataManager.getAnalytics();
        const appointments = dataManager.getAppointments();

        // Status breakdown
        const statusChart = document.getElementById('status-chart');
        if (statusChart) {
            const breakdown = analytics.statusBreakdown;
            const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
            
            statusChart.innerHTML = Object.entries(breakdown).map(([status, count]) => {
                const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                return `
                    <div class="chart-item">
                        <div class="chart-label">
                            <span class="status-badge ${status}">${status}</span>
                            <span class="chart-value">${count}</span>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-fill" style="width: ${percentage}%; background: ${this.getStatusColor(status)}"></div>
                        </div>
                        <span class="chart-percentage">${percentage}%</span>
                    </div>
                `;
            }).join('');
        }

        // Service popularity
        const serviceChart = document.getElementById('service-chart');
        if (serviceChart) {
            const serviceCounts = {};
            appointments.forEach(apt => {
                serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
            });
            
            const sortedServices = Object.entries(serviceCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            const maxCount = Math.max(...sortedServices.map(s => s[1]), 1);
            
            serviceChart.innerHTML = sortedServices.map(([service, count]) => {
                const percentage = (count / maxCount * 100).toFixed(1);
                return `
                    <div class="chart-item">
                        <div class="chart-label">
                            <span>${service}</span>
                            <span class="chart-value">${count}</span>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-fill" style="width: ${percentage}%; background: #2563EB"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<p class="empty-state">No data available</p>';
        }

        // Export report button
        const exportBtn = document.getElementById('export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const reportData = {
                    analytics: analytics,
                    statusBreakdown: analytics.statusBreakdown,
                    totalAppointments: appointments.length,
                    totalPatients: dataManager.getPatients().length,
                    revenue: analytics.revenue
                };
                exportToCSV([reportData], 'dashboard-report.csv');
            });
        }
    }

    getStatusColor(status) {
        const colors = {
            pending: '#6B7280',
            confirmed: '#10B981',
            'in-progress': '#2563EB',
            completed: '#16A34A',
            cancelled: '#EF4444'
        };
        return colors[status] || '#6B7280';
    }

    renderTodaysSchedule(appointments) {
        const container = document.querySelector('.appointments-list');
        if (!container) return;

        const user = dataManager.getCurrentUser();
        const isPatient = user && user.role === 'patient';

        // Update date text
        const dateText = document.getElementById('schedule-date-text');
        if (dateText) {
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            if (isPatient) {
                dateText.textContent = `Your appointments for ${today.toLocaleDateString('en-US', options)}`;
            } else {
                dateText.textContent = `${today.toLocaleDateString('en-US', options)} appointments`;
            }
        }

        // Sort appointments by date and time descending (newest first)
        if (appointments && appointments.length > 0) {
            appointments = [...appointments].sort((a, b) => {
                const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
                const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
                return dateB - dateA;
            });
        }

        if (!appointments || appointments.length === 0) {
            if (isPatient) {
                container.innerHTML = '<p class="empty-state">No appointments scheduled for today</p>';
            } else {
                container.innerHTML = '<p class="empty-state">No appointments scheduled for today</p>';
            }
            return;
        }

        container.innerHTML = appointments.map(apt => {
            if (!apt) return '';
            
            // For patients, show different format
            if (isPatient) {
                return `
                <div class="appointment-item">
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span>${apt.time || 'N/A'}</span>
                    </div>
                    <div class="appointment-details">
                        <div class="patient-info">
                            <span class="patient-name">${apt.service || 'N/A'}</span>
                            <span class="procedure">${apt.dentist || 'Dr. Juan Dela Cruz'}</span>
                        </div>
                        <div class="appointment-status">
                            <span class="status-badge ${apt.status || 'pending'}">${apt.status || 'pending'}</span>
                        </div>
                    </div>
                    ${(apt.status === 'pending' || apt.status === 'confirmed') ? `
                    <div class="appointment-actions">
                        <button class="btn-icon danger" onclick="patientPortal.cancelAppointment('${apt.id}')" title="Cancel Appointment">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
                `;
            } else {
                // Get current phone number from patient's profile
                let currentPhone = apt.phone || '';
                if (apt.patientId) {
                    const patientUser = dataManager.getUser(apt.patientId);
                    if (patientUser && patientUser.phone) {
                        currentPhone = patientUser.phone;
                    } else {
                        // Try patient record
                        const patient = dataManager.getPatient(apt.patientId);
                        if (patient && patient.phone) {
                            currentPhone = patient.phone;
                        }
                    }
                } else if (apt.email) {
                    // Try to find by email
                    const patientUser = dataManager.getUsers().find(u => u.email === apt.email && u.role === 'patient');
                    if (patientUser && patientUser.phone) {
                        currentPhone = patientUser.phone;
                    } else {
                        const patients = dataManager.getPatients();
                        const patient = patients.find(p => p.email && p.email.toLowerCase() === apt.email.toLowerCase());
                        if (patient && patient.phone) {
                            currentPhone = patient.phone;
                        }
                    }
                }
                
                return `
                <div class="appointment-item">
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span>${apt.time || 'N/A'}</span>
                    </div>
                    <div class="appointment-details">
                        <div class="patient-info">
                            <span class="patient-name">${apt.patientName || 'Unknown'}</span>
                            <span class="procedure">${apt.service || 'N/A'}</span>
                        </div>
                        <div class="appointment-status">
                            <span class="status-badge ${apt.status || 'pending'}">${apt.status || 'pending'}</span>
                        </div>
                    </div>
                    <div class="appointment-contact">
                        <i class="fas fa-phone"></i>
                        <span>${currentPhone || 'N/A'}</span>
                    </div>
                </div>
                `;
            }
        }).filter(html => html).join('');
    }

    renderDentistReviews(user) {
        if (!user || user.role !== 'dentist') return;
        
        // Get all reviews for this dentist
        const reviews = dataManager.getDentistRatings(user.name);
        
        // Find or create reviews section
        let reviewsSection = document.getElementById('dentist-reviews-section');
        if (!reviewsSection) {
            // Find the dashboard sections container
            const dashboardSections = document.querySelector('.dashboard-sections');
            if (!dashboardSections) return;
            
            // Create reviews section
            reviewsSection = document.createElement('div');
            reviewsSection.id = 'dentist-reviews-section';
            reviewsSection.className = 'reviews-section';
            reviewsSection.style.cssText = 'margin-top: 30px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);';
            dashboardSections.appendChild(reviewsSection);
        }
        
        if (reviews.length === 0) {
            reviewsSection.innerHTML = `
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1F2937;">Patient Reviews</h3>
                <p class="empty-state" style="color: #6B7280; text-align: center; padding: 20px;">No reviews yet. Reviews will appear here when patients rate your services.</p>
            `;
            return;
        }
        
        // Sort reviews by date (newest first)
        const sortedReviews = reviews.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
        
        // Show only the 5 most recent reviews
        const recentReviews = sortedReviews.slice(0, 5);
        
        reviewsSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1F2937;">Patient Reviews</h3>
                <span style="color: #6B7280; font-size: 14px;">${reviews.length} total ${reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
            <div class="reviews-list" style="display: flex; flex-direction: column; gap: 16px;">
                ${recentReviews.map(review => `
                    <div class="review-item" style="padding: 16px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #2563EB;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <strong style="color: #1F2937; font-size: 14px;">${review.patientName || 'Anonymous'}</strong>
                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                    <div style="display: flex; gap: 2px;">
                                        ${Array.from({ length: 5 }, (_, i) => `
                                            <i class="fas fa-star" style="font-size: 14px; color: ${i < review.rating ? '#FBBF24' : '#D1D5DB'};"></i>
                                        `).join('')}
                                    </div>
                                    <span style="font-weight: 600; color: #1F2937; font-size: 14px;">${review.rating}/5</span>
                                </div>
                            </div>
                            <span style="color: #6B7280; font-size: 12px;">${formatDate(review.date)}</span>
                        </div>
                        ${review.treatment ? `
                        <div style="margin-bottom: 8px;">
                            <span style="color: #6B7280; font-size: 12px;">Treatment: </span>
                            <span style="color: #374151; font-size: 12px; font-weight: 500;">${review.treatment}</span>
                        </div>
                        ` : ''}
                        ${review.review ? `
                        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${review.review}</p>
                        ` : '<p style="margin: 0; color: #6B7280; font-size: 14px; font-style: italic;">No review text provided</p>'}
                    </div>
                `).join('')}
            </div>
            ${reviews.length > 5 ? `
            <div style="margin-top: 16px; text-align: center;">
                <button class="btn btn-outline" onclick="viewsHandler.viewAllReviews()" style="padding: 8px 16px; font-size: 14px;">
                    View All Reviews (${reviews.length})
                </button>
            </div>
            ` : ''}
        `;
    }

    viewAllReviews() {
        const user = dataManager.getCurrentUser();
        if (!user || user.role !== 'dentist') return;
        
        const reviews = dataManager.getDentistRatings(user.name);
        const sortedReviews = reviews.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
        
        const content = `
            <div style="max-height: 60vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1F2937;">All Patient Reviews (${reviews.length})</h3>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${sortedReviews.length > 0 ? sortedReviews.map(review => `
                        <div style="padding: 16px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #2563EB;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <div>
                                    <strong style="color: #1F2937; font-size: 14px;">${review.patientName || 'Anonymous'}</strong>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                        <div style="display: flex; gap: 2px;">
                                            ${Array.from({ length: 5 }, (_, i) => `
                                                <i class="fas fa-star" style="font-size: 14px; color: ${i < review.rating ? '#FBBF24' : '#D1D5DB'};"></i>
                                            `).join('')}
                                        </div>
                                        <span style="font-weight: 600; color: #1F2937; font-size: 14px;">${review.rating}/5</span>
                                    </div>
                                </div>
                                <span style="color: #6B7280; font-size: 12px;">${formatDate(review.date)}</span>
                            </div>
                            ${review.treatment ? `
                            <div style="margin-bottom: 8px;">
                                <span style="color: #6B7280; font-size: 12px;">Treatment: </span>
                                <span style="color: #374151; font-size: 12px; font-weight: 500;">${review.treatment}</span>
                            </div>
                            ` : ''}
                            ${review.review ? `
                            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${review.review}</p>
                            ` : '<p style="margin: 0; color: #6B7280; font-size: 14px; font-style: italic;">No review text provided</p>'}
                        </div>
                    `).join('') : '<p class="empty-state">No reviews yet</p>'}
                </div>
            </div>
        `;
        
        showModal('All Patient Reviews', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'close',
                handler: () => {
                    return true;
                }
            }
        ]);
    }

    renderPendingActions() {
        const container = document.querySelector('.actions-list');
        if (!container) return;

        const user = dataManager.getCurrentUser();
        let appointments = dataManager.getAppointments({ status: 'pending' });
        
        // Filter by role - patients and dentists only see their own pending appointments
        if (user && (user.role === 'patient' || user.role === 'dentist')) {
            appointments = rolePermissions.filterDataByRole(user, appointments, 'appointments');
        }
        
        // Sort by date and time descending (newest first)
        appointments = appointments.sort((a, b) => {
            const dateA = new Date((a.date || '') + ' ' + (a.time || ''));
            const dateB = new Date((b.date || '') + ' ' + (b.time || ''));
            return dateB - dateA;
        });
        
        const pending = appointments.slice(0, 3);

        if (pending.length === 0) {
            container.innerHTML = '<p class="empty-state">No pending actions</p>';
            return;
        }

        container.innerHTML = pending.map(apt => `
            <div class="action-item">
                <div class="action-icon high">
                    <i class="fas fa-exclamation"></i>
                </div>
                <div class="action-details">
                    <span class="action-title">Confirm appointment</span>
                    <span class="action-description">${apt.patientName}, ${formatDate(apt.date)}, ${apt.time}</span>
                </div>
                <div class="action-priority">
                    <span class="priority-badge high">high</span>
                </div>
            </div>
        `).join('');
    }

    // Appointments View
    initAppointments() {
        // Check if dataManager is available and user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        // Apply patient customization if user is a patient
        if (user.role === 'patient' && typeof customizePatientAppointmentsView === 'function') {
            customizePatientAppointmentsView();
        }
        
        this.loadAppointments();
        
        // Search
        const searchInput = document.getElementById('appointment-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.loadAppointments(1);
            }, 300));
        }

        // Filters
        const statusFilter = document.getElementById('appointment-status-filter');
        const dateFilter = document.getElementById('appointment-date-filter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadAppointments(1));
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.loadAppointments(1));
        }

        // Add appointment button

        // View change handler
        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'appointments') {
                // Apply patient customization FIRST
                const user = dataManager.getCurrentUser();
                if (user && user.role === 'patient' && typeof customizePatientAppointmentsView === 'function') {
                    customizePatientAppointmentsView();
                }
                // Then load appointments
                setTimeout(() => {
                    this.loadAppointments(1);
                }, 100);
            }
        });
    }

    loadAppointments(page = 1) {
        const search = document.getElementById('appointment-search')?.value || '';
        const status = document.getElementById('appointment-status-filter')?.value || '';
        const date = document.getElementById('appointment-date-filter')?.value || '';

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (date) filters.date = date;

        let allAppointments = dataManager.getAppointments(filters);
        
        // Apply advanced filters if available
        if (typeof advancedSearch !== 'undefined') {
            allAppointments = advancedSearch.filterData(allAppointments, 'appointment');
        }
        
        // Filter by role permissions
        const user = dataManager.getCurrentUser();
        if (user) {
            allAppointments = rolePermissions.filterDataByRole(user, allAppointments, 'appointments');
        }
        
        // Ensure appointments are sorted from latest to oldest (by date and time)
        allAppointments = allAppointments.sort((a, b) => {
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
            
            return dateTimeB.getTime() - dateTimeA.getTime(); // Descending order (newest first)
        });
        
        // Paginate
        const paginationData = paginationManager.paginate(allAppointments, page);
        this.renderAppointmentsTable(paginationData.items);
        
        // Add IDs for bulk operations
        const tbody = document.getElementById('appointments-tbody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach((row, index) => {
                const appointment = paginationData.items[index];
                if (appointment) {
                    row.setAttribute('data-id', appointment.id);
                }
            });
            
            // Initialize bulk operations (only if user has permission)
            // Note: user is already declared at the top of this function
            if (user && (rolePermissions.hasPermission(user, 'bulkDelete') || rolePermissions.hasPermission(user, 'bulkUpdate'))) {
                bulkOps.initCheckboxes(tbody, paginationData.items, (selected) => {
                    // Selection changed callback
                });
            }
        }
        
        // Render pagination
        const paginationContainer = document.getElementById('appointments-pagination');
        if (paginationContainer) {
            paginationManager.renderPagination(paginationContainer, paginationData, (newPage) => {
                this.loadAppointments(newPage);
            });
        }
    }

    renderAppointmentsTable(appointments) {
        const tbody = document.getElementById('appointments-tbody');
        if (!tbody) return;

        const user = dataManager.getCurrentUser();
        const isPatient = user && user.role === 'patient';

        if (isPatient) {
            // Patient view - show: Date, Service, Location, Doctor, Status, Actions
            const colspan = 6;
            
            if (appointments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No appointments found.</td></tr>`;
                return;
            }

            tbody.innerHTML = appointments.map(apt => {
                // Get dentist user object to access profile picture and clinic address
                const dentistName = apt.dentist || 'Dr. Juan Dela Cruz';
                const dentists = dataManager.getUsers({ role: 'dentist' });
                const dentistUser = dentists.find(d => {
                    // Match by exact name
                    if (d.name === dentistName) return true;
                    // Match by role title (e.g., "Dentist Trillo" matches "Trillo")
                    const cleanDentistName = dentistName.replace(/^(dr\.?|dentist)\s+/i, '').trim().toLowerCase();
                    const cleanUserName = (d.name || '').replace(/^(dr\.?|dentist)\s+/i, '').trim().toLowerCase();
                    if (cleanDentistName === cleanUserName) return true;
                    // Match by role title
                    if (d.roleTitle && d.roleTitle.toLowerCase() === cleanDentistName) return true;
                    return false;
                });
                const dentistProfilePicture = dentistUser?.profilePicture;
                
                // Get clinic address from dentist's profile
                const clinicLocation = dentistUser?.clinicAddress || 
                                     dentistUser?.clinicSettings?.address || 
                                     dentistUser?.address || 
                                     'Address not available';
                
                // Get dentist's coordinates for map
                const dentistLat = dentistUser?.latitude || dentistUser?.clinicSettings?.latitude;
                const dentistLng = dentistUser?.longitude || dentistUser?.clinicSettings?.longitude;
                const hasLocation = dentistLat && dentistLng;
                
                // Create dentist display with profile picture
                const dentistDisplay = dentistProfilePicture 
                    ? `<div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${dentistProfilePicture}" alt="${dentistName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;">
                        <span>${dentistName}</span>
                       </div>`
                    : `<div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563EB; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px;">
                            ${dentistName.charAt(0)}
                        </div>
                        <span>${dentistName}</span>
                       </div>`;
                
                // Show cancel button for pending and confirmed appointments
                const canCancel = apt.status === 'pending' || apt.status === 'confirmed';
                const actionsHTML = canCancel 
                    ? `<div class="action-buttons">
                        <button class="btn-icon danger" onclick="patientPortal.cancelAppointment('${apt.id}')" title="Cancel Appointment">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-icon" onclick="patientPortal.viewAppointment('${apt.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>`
                    : `<div class="action-buttons">
                        <button class="btn-icon" onclick="patientPortal.viewAppointment('${apt.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>`;
                
                return `
                <tr data-id="${apt.id}">
                    <td>
                        <strong>${formatDate(apt.date)}</strong><br>
                        <small style="color: #6B7280;">${apt.time || 'Time TBD'}</small>
                    </td>
                    <td>${apt.service || 'N/A'}</td>
                    <td>
                        ${hasLocation ? `
                        <span class="location-link" 
                              style="cursor: pointer; color: #2563EB; text-decoration: underline;" 
                              data-dentist-name="${(dentistName || '').replace(/"/g, '&quot;')}"
                              data-latitude="${dentistLat}"
                              data-longitude="${dentistLng}"
                              data-address="${(clinicLocation || '').replace(/"/g, '&quot;')}"
                              title="Click to view location on map">
                            <i class="fas fa-map-marker-alt" style="color: #2563EB; margin-right: 6px;"></i>
                            ${clinicLocation}
                        </span>
                        ` : `
                        <i class="fas fa-map-marker-alt" style="color: #6B7280; margin-right: 6px;"></i>
                        ${clinicLocation}
                        `}
                    </td>
                    <td>${dentistDisplay}</td>
                    <td><span class="status-badge ${apt.status || 'pending'}">${(apt.status || 'pending').charAt(0).toUpperCase() + (apt.status || 'pending').slice(1)}</span></td>
                    <td>${actionsHTML}</td>
                </tr>
                `;
            }).join('');
            
            // Add event delegation for location links
            setTimeout(() => {
                const locationLinks = tbody.querySelectorAll('.location-link');
                locationLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const dentistName = link.getAttribute('data-dentist-name');
                        const latitude = parseFloat(link.getAttribute('data-latitude'));
                        const longitude = parseFloat(link.getAttribute('data-longitude'));
                        const address = link.getAttribute('data-address');
                        
                        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
                            this.showDentistLocationMap(dentistName, latitude, longitude, address);
                        } else {
                            showNotification('Location coordinates are not available', 'error');
                        }
                    });
                });
            }, 100);
        } else {
            // Staff/Dentist/Admin view - full table
            const showPatientColumn = true;
            const colspan = 7;

            if (appointments.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No appointments found</td></tr>`;
                return;
            }

            tbody.innerHTML = appointments.map(apt => {
                const canEdit = rolePermissions.canPerformAction(user, 'editAppointment', apt) && apt.status !== 'cancelled' && apt.status !== 'completed';
                const canDelete = rolePermissions.canPerformAction(user, 'deleteAppointment', apt);
                const canUpdateStatus = rolePermissions.canPerformAction(user, 'manageAppointmentStatus', apt) && apt.status !== 'cancelled' && apt.status !== 'completed';
                
                const notesDisplay = apt.notes ? 
                    `<div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${apt.notes.replace(/"/g, '&quot;')}">
                        <i class="fas fa-sticky-note" style="color: #6B7280; margin-right: 4px;"></i>
                        ${apt.notes.length > 30 ? apt.notes.substring(0, 30) + '...' : apt.notes}
                    </div>` : 
                    '<span style="color: #9CA3AF;">-</span>';
                
                return `
                <tr data-id="${apt.id}">
                    <td>${formatDate(apt.date)}<br><small>${apt.time}</small></td>
                    <td>${apt.patientName}</td>
                    <td>${apt.service}</td>
                    <td>${apt.dentist || 'Dr. Juan Dela Cruz'}</td>
                    <td>${notesDisplay}</td>
                    <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${canEdit ? `
                            <button class="btn-icon" onclick="viewsHandler.editAppointment('${apt.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            ` : ''}
                            ${canUpdateStatus ? `
                            <button class="btn-icon" onclick="viewsHandler.updateAppointmentStatus('${apt.id}')" title="Update Status">
                                <i class="fas fa-sync"></i>
                            </button>
                            ` : ''}
                            ${canDelete ? `
                            <button class="btn-icon danger" onclick="viewsHandler.deleteAppointment('${apt.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
                `;
            }).join('');
        }
        
        // Re-initialize bulk operations after render (only if user has permission)
        // Note: user is already declared at the top of this function
        if (user && (rolePermissions.hasPermission(user, 'bulkDelete') || rolePermissions.hasPermission(user, 'bulkUpdate'))) {
            bulkOps.initCheckboxes(tbody, appointments);
        }
    }

    showAddAppointmentModal() {
        const user = dataManager.getCurrentUser();
        if (!rolePermissions.canPerformAction(user, 'createAppointment')) {
            showNotification('You do not have permission to create appointments', 'error');
            return;
        }

        const today = getTodayDate();
        const isPatient = user && user.role === 'patient';
        
        // Get patients - filtered by role (patients can't see other patients)
        let patients = dataManager.getPatients();
        if (isPatient) {
            patients = rolePermissions.filterDataByRole(user, patients, 'patients');
        }
        
        // Get all dentists for dropdown
        const allDentists = dataManager.getUsers({ role: 'dentist' });
        
        // Build patient selection (only for non-patients)
        const patientSelection = isPatient ? '' : `
            <div class="form-group">
                <label>Patient *</label>
                <select name="patientId" id="appointment-patient-select" required>
                    <option value="">Select Patient</option>
                    ${patients.map(p => `<option value="${p.id}" data-name="${p.name}" data-phone="${p.phone || ''}" data-email="${p.email || ''}">${p.name}</option>`).join('')}
                </select>
                <small>Or <a href="#" id="add-new-patient-link">add new patient</a></small>
            </div>
            <div class="form-group">
                <label>Patient Name *</label>
                <input type="text" name="patientName" id="appointment-patient-name" required>
            </div>
        `;
        
        // Build status selection (only for non-patients)
        const statusSelection = isPatient ? '' : `
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        `;
        
        // Build dentist selection - custom dropdown with profile pictures for patients, text input for staff
        const dentistSelection = isPatient ? `
            <div class="form-group">
                <label>Dentist *</label>
                <div id="dentist-select-wrapper" style="position: relative;">
                    <div id="dentist-select-display" style="padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="viewsHandler.toggleDentistDropdown()">
                        <span id="dentist-select-text" style="color: #6B7280;">Select Dentist (choose service first)</span>
                        <i class="fas fa-chevron-down" id="dentist-select-arrow"></i>
                    </div>
                    <div id="dentist-select-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #D1D5DB; border-radius: 6px; margin-top: 4px; max-height: 300px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <div id="dentist-select-options" style="padding: 8px;">
                            <div style="padding: 12px; text-align: center; color: #6B7280;">Select a service first</div>
                        </div>
                    </div>
                    <input type="hidden" name="dentist" id="appointment-dentist-select" required>
                </div>
                <small style="color: #6B7280; display: block; margin-top: 4px;">Select a service first to see available dentists</small>
            </div>
        ` : `
            <div class="form-group">
                <label>Dentist</label>
                <input type="text" name="dentist" value="Dr. Juan Dela Cruz">
            </div>
        `;
        
        const content = `
            <form id="add-appointment-form">
                ${patientSelection}
                <div class="form-group">
                    <label>Service *</label>
                    <select name="service" id="appointment-service" required>
                        <option value="">Select Service</option>
                        <option value="Dental Cleaning">Dental Cleaning</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Tooth Filling">Tooth Filling</option>
                        <option value="Tooth Extraction">Tooth Extraction</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Braces Consultation">Braces Consultation</option>
                    </select>
                </div>
                ${dentistSelection}
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" name="date" id="appointment-date" min="${today}" required>
                </div>
                <div class="form-group">
                    <label>Time *</label>
                    <input type="time" name="time" id="appointment-time" step="1800" required>
                    <small class="error-message" id="appointment-validation-error"></small>
                </div>
                ${statusSelection}
                ${isPatient ? '' : `
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" id="appointment-phone">
                </div>
                `}
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="3" placeholder="${isPatient ? 'Any additional information or concerns...' : ''}"></textarea>
                </div>
            </form>
        `;

        const modal = showModal('Add New Appointment', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Create Appointment',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    const form = document.getElementById('add-appointment-form');
                    const validation = validateForm(form);
                    if (!validation.isValid) {
                        showNotification(validation.errors[0], 'error');
                        return;
                    }

                    const formData = new FormData(form);
                    const appointment = Object.fromEntries(formData);
                    
                    // For patients, auto-fill their own information
                    if (isPatient) {
                        appointment.patientId = user.id;
                        appointment.patientName = user.name;
                        appointment.email = user.email || '';
                        appointment.phone = user.phone || '';
                        appointment.status = 'pending'; // Patients can only create pending appointments
                    } else {
                        // Get patient info if selected (for staff/admin)
                        const patientSelect = document.getElementById('appointment-patient-select');
                        if (patientSelect && patientSelect.value) {
                            const selectedOption = patientSelect.options[patientSelect.selectedIndex];
                            appointment.patientId = patientSelect.value;
                            appointment.patientName = selectedOption.getAttribute('data-name');
                            appointment.phone = selectedOption.getAttribute('data-phone') || appointment.phone;
                            appointment.email = selectedOption.getAttribute('data-email') || '';
                        }
                    }
                    
                    // Validate appointment
                    const appointmentValidation = validationManager.validateAppointment(appointment);
                    if (!appointmentValidation.isValid) {
                        showNotification(appointmentValidation.errors[0], 'error');
                        return;
                    }
                    
                    const result = dataManager.createAppointment(appointment);
                    if (result) {
                        showNotification('Appointment created successfully', 'success');
                        
                        // Create notifications
                        // Notify patient if appointment was created by staff/admin
                        if (!isPatient && appointment.patientId) {
                            const patientUser = dataManager.getUser(appointment.patientId);
                            if (patientUser) {
                                dataManager.createNotification({
                                    userId: patientUser.id,
                                    userRole: 'patient',
                                    type: 'appointment',
                                    title: 'New Appointment Created',
                                    message: `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been created.`,
                                    relatedId: result.id,
                                    relatedType: 'appointment'
                                });
                            }
                        }
                        
                        // Notify dentist if appointment was created by patient/staff
                        if (appointment.dentist) {
                            const dentists = dataManager.getUsers({ role: 'dentist' });
                            const dentist = dentists.find(d => d.name === appointment.dentist);
                            if (dentist) {
                                dataManager.createNotification({
                                    userId: dentist.id,
                                    userRole: 'dentist',
                                    type: 'appointment',
                                    title: 'New Appointment',
                                    message: `${appointment.patientName} has booked an appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
                                    relatedId: result.id,
                                    relatedType: 'appointment'
                                });
                            }
                        }
                        
                        // Update notification badge
                        if (typeof updateNotificationBadge === 'function') {
                            updateNotificationBadge();
                        }
                        
                        this.loadAppointments(1);
                        if (typeof closeModal !== 'undefined') {
                            closeModal();
                        }
                    } else {
                        showNotification('Failed to create appointment', 'error');
                    }
                }
            }
        ]);

        // Setup patient select change (only for non-patients)
        setTimeout(() => {
            if (!isPatient) {
                const patientSelect = document.getElementById('appointment-patient-select');
                const patientNameInput = document.getElementById('appointment-patient-name');
                const phoneInput = document.getElementById('appointment-phone');
                
                if (patientSelect && patientNameInput) {
                    patientSelect.addEventListener('change', function() {
                        if (this.value && this.selectedIndex >= 0) {
                            const selectedOption = this.options[this.selectedIndex];
                            if (selectedOption) {
                                patientNameInput.value = selectedOption.getAttribute('data-name') || '';
                                if (phoneInput) {
                                    phoneInput.value = selectedOption.getAttribute('data-phone') || '';
                                }
                                patientNameInput.readOnly = true;
                            }
                        } else {
                            patientNameInput.readOnly = false;
                        }
                    });
                }
            }
            
            // Setup service-to-dentist filtering for patients
            if (isPatient) {
                const serviceSelect = document.getElementById('appointment-service');
                const dentistSelect = document.getElementById('appointment-dentist-select');
                
                if (serviceSelect && dentistSelect) {
                    serviceSelect.addEventListener('change', () => {
                        const selectedService = serviceSelect.value;
                        this.updateDentistDropdownForService(selectedService, dentistSelect);
                    });
                }
                
                // Close dropdown when clicking outside
                setTimeout(() => {
                    document.addEventListener('click', (e) => {
                        const wrapper = document.getElementById('dentist-select-wrapper');
                        const dropdown = document.getElementById('dentist-select-dropdown');
                        if (wrapper && dropdown && !wrapper.contains(e.target)) {
                            dropdown.style.display = 'none';
                            const arrow = document.getElementById('dentist-select-arrow');
                            if (arrow) arrow.style.transform = 'rotate(0deg)';
                        }
                    });
                }, 100);
            }

            // Real-time validation
            const dateInput = document.getElementById('appointment-date');
            const timeInput = document.getElementById('appointment-time');
            const serviceSelect = document.getElementById('appointment-service');
            const errorMsg = document.getElementById('appointment-validation-error');
            
            const validateOnChange = () => {
                if (dateInput.value && timeInput.value && serviceSelect.value) {
                    const testAppointment = {
                        date: dateInput.value,
                        time: timeInput.value,
                        service: serviceSelect.value
                    };
                    const validation = validationManager.validateAppointment(testAppointment);
                    if (validation.errors.length > 0) {
                        errorMsg.textContent = validation.errors[0];
                        errorMsg.style.display = 'block';
                    } else {
                        errorMsg.textContent = '';
                        errorMsg.style.display = 'none';
                    }
                }
            };

            if (dateInput) dateInput.addEventListener('change', validateOnChange);
            if (timeInput) timeInput.addEventListener('change', validateOnChange);
            if (serviceSelect) serviceSelect.addEventListener('change', validateOnChange);
        }, 100);
    }

    editAppointment(id) {
        const appointment = dataManager.getAppointment(id);
        if (!appointment) return;

        const user = dataManager.getCurrentUser();
        
        // Security check: Patients can only edit their own appointments (and only pending ones)
        if (user && user.role === 'patient') {
            if (appointment.patientId !== user.id && appointment.email !== user.email) {
                showNotification('You can only edit your own appointments', 'error');
                return;
            }
            // Patients can only cancel pending appointments, not edit them
            if (appointment.status !== 'pending') {
                showNotification('You can only cancel pending appointments', 'error');
                return;
            }
        }
        
        if (!rolePermissions.canPerformAction(user, 'editAppointment', appointment)) {
            showNotification('You do not have permission to edit this appointment', 'error');
            return;
        }

        // Check if user is a dentist - they can only edit status
        const isDentist = user && user.role === 'dentist';
        const isAdmin = user && user.role === 'admin';

        const content = `
            <form id="edit-appointment-form">
                <div class="form-group">
                    <label>Patient Name ${isDentist ? '' : '*'}</label>
                    <input type="text" name="patientName" value="${appointment.patientName}" ${isDentist ? 'readonly style="background: #F3F4F6; cursor: not-allowed;"' : 'required'}>
                </div>
                <div class="form-group">
                    <label>Service ${isDentist ? '' : '*'}</label>
                    <select name="service" ${isDentist ? 'disabled style="background: #F3F4F6; cursor: not-allowed;"' : 'required'}>
                        <option value="Dental Cleaning" ${appointment.service === 'Dental Cleaning' ? 'selected' : ''}>Dental Cleaning</option>
                        <option value="Consultation" ${appointment.service === 'Consultation' ? 'selected' : ''}>Consultation</option>
                        <option value="Tooth Filling" ${appointment.service === 'Tooth Filling' ? 'selected' : ''}>Tooth Filling</option>
                        <option value="Tooth Extraction" ${appointment.service === 'Tooth Extraction' ? 'selected' : ''}>Tooth Extraction</option>
                        <option value="Root Canal" ${appointment.service === 'Root Canal' ? 'selected' : ''}>Root Canal</option>
                        <option value="Braces Consultation" ${appointment.service === 'Braces Consultation' ? 'selected' : ''}>Braces Consultation</option>
                    </select>
                    ${isDentist ? '<input type="hidden" name="service" value="' + appointment.service + '">' : ''}
                </div>
                <div class="form-group">
                    <label>Date ${isDentist ? '' : '*'}</label>
                    <input type="date" name="date" value="${appointment.date}" ${isDentist ? 'readonly style="background: #F3F4F6; cursor: not-allowed;"' : 'required'}>
                </div>
                <div class="form-group">
                    <label>Time ${isDentist ? '' : '*'}</label>
                    <input type="time" name="time" value="${appointment.time}" ${isDentist ? 'readonly style="background: #F3F4F6; cursor: not-allowed;"' : 'required'}>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" ${appointment.status === 'completed' || appointment.status === 'cancelled' ? 'disabled' : ''}>
                        ${appointment.status === 'pending' ? `
                        <option value="pending" selected>Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        ` : appointment.status === 'confirmed' ? `
                        <option value="pending" disabled>Pending</option>
                        <option value="confirmed" selected>Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        ` : appointment.status === 'in-progress' ? `
                        <option value="pending" disabled>Pending</option>
                        <option value="confirmed" disabled>Confirmed</option>
                        <option value="in-progress" selected>In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        ` : appointment.status === 'completed' ? `
                        <option value="pending" disabled>Pending</option>
                        <option value="confirmed" disabled>Confirmed</option>
                        <option value="completed" selected>Completed</option>
                        <option value="cancelled" disabled>Cancelled</option>
                        ` : appointment.status === 'cancelled' ? `
                        <option value="pending" disabled>Pending</option>
                        <option value="confirmed" disabled>Confirmed</option>
                        <option value="completed" disabled>Completed</option>
                        <option value="cancelled" selected>Cancelled</option>
                        ` : `
                        <option value="pending" ${appointment.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${appointment.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        `}
                    </select>
                    ${appointment.status === 'completed' ? '<input type="hidden" name="status" value="completed">' : ''}
                    ${appointment.status === 'cancelled' ? '<input type="hidden" name="status" value="cancelled">' : ''}
                    ${appointment.status === 'completed' ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Completed appointments cannot be changed. Status is final.</small>' : ''}
                    ${appointment.status === 'cancelled' ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cancelled appointments cannot be changed. Status is final.</small>' : ''}
                    ${appointment.status === 'confirmed' ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot change back to pending. Status can only progress forward.</small>' : ''}
                </div>
                ${appointment.notes ? `
                <div class="form-group" style="margin-top: 16px; padding: 12px; background: #F9FAFB; border-radius: 6px; border-left: 3px solid #2563EB;">
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; color: #1F2937;">
                        <i class="fas fa-sticky-note" style="color: #2563EB;"></i>
                        Patient Notes
                    </label>
                    <div style="color: #374151; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${appointment.notes}</div>
                </div>
                ` : ''}
            </form>
        `;

        const modal = showModal('Edit Appointment', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Save Changes',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    try {
                    const form = document.getElementById('edit-appointment-form');
                        if (!form) {
                            showNotification('Form not found', 'error');
                            // Prevent modal from closing on error
                            return false;
                        }
                        
                        const appointment = dataManager.getAppointment(id);
                        if (!appointment) {
                            showNotification('Appointment not found', 'error');
                            return false;
                        }
                        
                        // Prevent editing completed or cancelled appointments
                        if (appointment.status === 'completed') {
                            showNotification('Completed appointments cannot be edited. They are final.', 'error');
                            return false;
                        }
                        
                        if (appointment.status === 'cancelled') {
                            showNotification('Cancelled appointments cannot be edited. They are final.', 'error');
                            return false;
                        }
                        
                        // For dentists, only allow status changes
                        if (user && user.role === 'dentist') {
                            // Only update status for dentists
                            const formData = new FormData(form);
                            const newStatus = formData.get('status');
                            
                            if (!newStatus || newStatus === appointment.status) {
                                // No change or invalid status
                                if (newStatus === appointment.status) {
                                    showNotification('No changes made', 'info');
                                    return true; // Close modal
                                }
                                return false;
                            }
                            
                            // Prevent changing from cancelled to any other status
                            if (appointment.status === 'cancelled' && newStatus !== 'cancelled') {
                                showNotification('Cancelled appointments cannot be changed to other statuses.', 'error');
                                return false;
                            }
                            
                            // If changing to completed, show the complete appointment modal
                            if (newStatus === 'completed') {
                                // Close this modal first
                                const modal = document.querySelector('.modal');
                                if (modal) {
                                    modal.remove();
                                }
                                // Show complete appointment modal - pass the appointment object
                                this.showCompleteAppointmentModal(id, appointment);
                                return true;
                            }
                            
                            // For other status changes, update directly
                            try {
                                const updated = dataManager.updateAppointment(id, { status: newStatus });
                                if (updated) {
                                    showNotification('Appointment status updated successfully', 'success');
                                    // Notify patient of status change - use updated appointment object
                                    this.notifyPatientOfStatusChange(id, newStatus, updated);
                                    this.loadAppointments(1);
                                    this.loadDashboardData();
                                    this.loadSchedule();
                                    return true;
                                } else {
                                    showNotification('Failed to update appointment status', 'error');
                                    return false;
                                }
                            } catch (error) {
                                console.error('Error updating appointment:', error);
                                showNotification('An error occurred: ' + (error.message || 'Please try again.'), 'error');
                                return false;
                            }
                        }
                        
                        // For non-dentist users, process all fields normally
                        const formData = new FormData(form);
                        const updates = Object.fromEntries(formData);
                        
                        // If marking as completed, show completion modal instead
                        if (updates.status === 'completed' && appointment.status !== 'completed') {
                            // Close edit modal first
                            if (modal && typeof closeModal === 'function') {
                                closeModal(modal);
                            }
                            
                            // Show completion modal with treatment notes
                            setTimeout(() => {
                                this.showCompleteAppointmentModal(id, appointment);
                            }, 300);
                            return true; // Allow modal to close
                        }
                        
                        // Prevent changing cancelled appointments
                        if (appointment.status === 'cancelled' && updates.status !== 'cancelled') {
                            showNotification('Cancelled appointments cannot be changed to other statuses. They are final.', 'error');
                            return false;
                        }
                        
                        // Prevent backward status changes
                        const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled'];
                        const currentStatusIndex = statusOrder.indexOf(appointment.status);
                        const newStatusIndex = statusOrder.indexOf(updates.status);
                        
                        // Only allow forward progression (except cancelled can be set from any status, but once cancelled, cannot be changed)
                        if (updates.status !== 'cancelled' && newStatusIndex < currentStatusIndex) {
                            showNotification('Cannot change status backwards. Status can only progress forward (pending → confirmed → completed).', 'error');
                            return false;
                        }
                        
                        // Update appointment (excluding status if it's completed)
                        if (updates.status === 'completed') {
                            delete updates.status; // Don't update status here, use completion modal
                        }
                    
                    const result = dataManager.updateAppointment(id, updates);
                    if (result) {
                        showNotification('Appointment updated successfully', 'success');
                        
                        // Notify patient if status changed - use updated appointment object
                        if (updates.status && updates.status !== appointment.status) {
                            this.notifyPatientOfStatusChange(id, updates.status, result);
                        }
                        
                        this.loadAppointments(1);
                            // Refresh schedule if visible
                            if (document.getElementById('schedule-view')?.classList.contains('active')) {
                                this.loadSchedule();
                        }
                            return true; // Allow modal to close
                    } else {
                        showNotification('Failed to update appointment', 'error');
                            return false;
                        }
                    } catch (error) {
                        console.error('Error updating appointment:', error);
                        showNotification('An unexpected error occurred: ' + (error.message || 'Please try again.'), 'error');
                        return false;
                    }
                }
            }
        ]);
    }

    /**
     * Helper function to notify patient when appointment status changes
     * @param {string} appointmentId - The appointment ID
     * @param {string} newStatus - The new status (confirmed, cancelled, completed, etc.)
     * @param {Object} appointment - The appointment object (optional, will fetch if not provided)
     */
    notifyPatientOfStatusChange(appointmentId, newStatus, appointment = null) {
        if (!appointment) {
            appointment = dataManager.getAppointment(appointmentId);
        }
        if (!appointment) return;

        // Try to find patient user by ID first, then by email
        let patientUser = null;
        if (appointment.patientId) {
            patientUser = dataManager.getUser(appointment.patientId);
        }
        
        // If not found by ID, try to find by email
        if (!patientUser && appointment.email) {
            patientUser = dataManager.getUserByEmail(appointment.email);
        }
        
        // If still not found, we can't send a notification
        if (!patientUser) {
            console.warn('Could not find patient user for appointment notification:', {
                appointmentId,
                patientId: appointment.patientId,
                email: appointment.email,
                patientName: appointment.patientName
            });
            return;
        }
        
        // Debug logging
        console.log('Sending notification to patient:', {
            patientId: patientUser.id,
            patientEmail: patientUser.email,
            appointmentId,
            newStatus,
            appointmentService: appointment.service,
            appointmentDate: appointment.date
        });

        let title = 'Appointment Status Updated';
        let message = '';
        
        if (newStatus === 'confirmed') {
            title = 'Appointment Confirmed';
            message = `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been confirmed.`;
        } else if (newStatus === 'cancelled') {
            title = 'Appointment Cancelled';
            message = `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been cancelled.`;
            
            // Notify dentist when appointment is cancelled by admin/dentist
            // (Patient cancellations are handled in patient-portal.js)
            const user = dataManager.getCurrentUser();
            if (user && user.role !== 'patient' && appointment.dentist) {
                const dentists = dataManager.getUsers({ role: 'dentist' });
                const dentist = dentists.find(d => d.name === appointment.dentist);
                if (dentist) {
                    dataManager.createNotification({
                        userId: dentist.id,
                        userRole: 'dentist',
                        type: 'appointment-cancelled',
                        title: 'Appointment Cancelled',
                        message: `${appointment.patientName}'s appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been cancelled.`,
                        relatedId: appointmentId,
                        relatedType: 'appointment'
                    });
                }
            }
        } else if (newStatus === 'completed') {
            title = 'Appointment Completed';
            message = `Your appointment for ${appointment.service} on ${appointment.date} has been completed. Check your records for details.`;
        } else {
            message = `Your appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} status has been updated to ${newStatus}.`;
        }
        
        const notification = dataManager.createNotification({
            userId: patientUser.id,
            userRole: patientUser.role || 'patient',
            type: `appointment-${newStatus}`,
            title: title,
            message: message,
            relatedId: appointmentId,
            relatedType: 'appointment'
        });
        
        console.log('Notification created:', notification);
        
        // Update notification badge
        if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge();
        }
    }

    updateAppointmentStatus(id) {
        const appointment = dataManager.getAppointment(id);
        if (!appointment) return;

        const user = dataManager.getCurrentUser();
        
        // Security check: Patients cannot update appointment status
        if (user && user.role === 'patient') {
            showNotification('You cannot update appointment status. You can only cancel pending appointments.', 'error');
            return;
        }
        
        // Prevent changing cancelled appointments
        if (appointment.status === 'cancelled') {
            showNotification('Cancelled appointments cannot be changed. They are final.', 'error');
            return;
        }

        const statuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
        const currentIndex = statuses.indexOf(appointment.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        const result = dataManager.updateAppointment(id, { status: nextStatus });
        if (result) {
            showNotification(`Appointment status updated to ${nextStatus}`, 'success');
            
            // Notify patient of status change - use updated appointment object
            this.notifyPatientOfStatusChange(id, nextStatus, result);
            
            this.loadAppointments(1);
        } else {
            showNotification('Failed to update appointment status', 'error');
        }
    }

    showCompleteAppointmentModal(appointmentId, appointment) {
        // If appointment object is not provided, fetch it from appointmentId
        if (!appointment && appointmentId) {
            appointment = dataManager.getAppointment(appointmentId);
        }
        
        // If still no appointment found, show error
        if (!appointment) {
            showNotification('Appointment not found', 'error');
            return;
        }
        
        const content = `
            <form id="complete-appointment-form">
                <div class="form-group">
                    <label>Patient</label>
                    <input type="text" value="${appointment.patientName || 'N/A'}" readonly style="background: #F3F4F6;">
                </div>
                <div class="form-group">
                    <label>Service</label>
                    <input type="text" value="${appointment.service || 'N/A'}" readonly style="background: #F3F4F6;">
                </div>
                <div class="form-group">
                    <label>Date & Time</label>
                    <input type="text" value="${appointment.date ? (typeof formatDate !== 'undefined' ? formatDate(appointment.date) : appointment.date) : 'N/A'} at ${appointment.time || 'N/A'}" readonly style="background: #F3F4F6;">
                </div>
                <div class="form-group">
                    <label>Treatment Notes *</label>
                    <textarea name="treatmentNotes" rows="6" placeholder="Enter treatment details, procedures performed, recommendations, follow-up instructions, etc." required></textarea>
                    <small style="color: #6B7280; display: block; margin-top: 4px;">This will be saved to the patient's dental record</small>
                </div>
            </form>
        `;

        // Create modal manually to have better control over closing
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Complete Appointment - Add Treatment Notes</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" id="cancel-complete-btn">Cancel</button>
                    <button class="btn btn-primary" id="confirm-complete-btn">Mark as Completed</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-complete-btn');
        const confirmBtn = modal.querySelector('#confirm-complete-btn');
        
        const closeModalFunc = () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeModalFunc);
        cancelBtn.addEventListener('click', closeModalFunc);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModalFunc();
        });
        
        // Prevent modal content clicks from closing
        const modalContent = modal.querySelector('.modal-content');
        modalContent.addEventListener('click', (e) => e.stopPropagation());
        
        // Confirm handler
        confirmBtn.addEventListener('click', () => {
            try {
                const form = document.getElementById('complete-appointment-form');
                if (!form) {
                    showNotification('Form not found', 'error');
                    return;
                }

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const formData = new FormData(form);
                const treatmentNotes = formData.get('treatmentNotes');
                
                if (!treatmentNotes || !treatmentNotes.trim()) {
                    showNotification('Please enter treatment notes', 'error');
                    return;
                }

                const notes = treatmentNotes.trim();

                // Update appointment status to completed
                const result = dataManager.updateAppointment(appointmentId, { status: 'completed' });
                if (!result) {
                    showNotification('Failed to update appointment status', 'error');
                    return;
                }
                
                // Notify patient that appointment is completed
                this.notifyPatientOfStatusChange(appointmentId, 'completed', appointment);
                
                // Immediately refresh dashboard and schedule after status update
                // This ensures the UI updates right away
                this.loadDashboardData();
                this.loadSchedule();
                this.loadAppointments(1);

                // Get patient ID
                let patientId = appointment.patientId;
                if (!patientId && appointment.email) {
                    const patients = dataManager.getPatients();
                    const patient = patients.find(p => p && p.email === appointment.email);
                    if (patient) {
                        patientId = patient.id;
                    }
                }

                // Create dental record (always create, even if patientId not found - use email for matching)
                // Normalize email (lowercase, trim) for consistent matching
                const normalizedEmail = appointment.email ? appointment.email.toLowerCase().trim() : null;
                
                const record = {
                    patientId: patientId || null, // Can be null if patient not found
                    patientName: appointment.patientName,
                    email: normalizedEmail, // Store normalized email for matching (critical for patient records)
                    treatment: appointment.service,
                    date: appointment.date,
                    time: appointment.time, // Store appointment time
                    notes: notes,
                    dentist: appointment.dentist || (dataManager.getCurrentUser()?.name || 'Unknown'),
                    appointmentId: appointmentId
                };

                const recordResult = dataManager.createRecord(record);
                if (recordResult) {
                    showNotification('Appointment marked as completed and record created successfully', 'success');
                    
                    // Notify patient when record is created
                    if (appointment.patientId) {
                        const patientUser = dataManager.getUser(appointment.patientId);
                        if (patientUser) {
                            dataManager.createNotification({
                                userId: patientUser.id,
                                userRole: 'patient',
                                type: 'record',
                                title: 'New Dental Record',
                                message: `A new dental record has been added for your ${appointment.service} appointment on ${appointment.date}. Check your records for details.`,
                                relatedId: recordResult.id,
                                relatedType: 'record'
                            });
                            
                            // Update notification badge
                            if (typeof updateNotificationBadge === 'function') {
                                updateNotificationBadge();
                            }
                        }
                    }
                } else {
                    showNotification('Appointment completed, but failed to create record', 'warning');
                }

                // Close modal on success
                closeModalFunc();

                // Refresh all views immediately after record creation
                // Refresh function that forces a complete reload
                const refreshAllViews = () => {
                    // Force reload appointments from localStorage
                    this.loadAppointments(1);
                    
                    // Force reload dashboard - this will recalculate all statistics from fresh data
                    this.loadDashboardData();
                    
                    // Force reload schedule
                    this.loadSchedule();
                    
                    // Refresh patient dashboard if patient portal exists
                    if (typeof patientPortal !== 'undefined' && patientPortal.loadPatientDashboard) {
                        patientPortal.loadPatientDashboard();
                    }
                    
                    // Refresh records if visible
                    if (document.getElementById('records-view')?.classList.contains('active')) {
                        this.loadRecords(1);
                    }
                };

                // Refresh immediately
                refreshAllViews();
                
                // Refresh again after a delay to ensure localStorage persistence is complete
                setTimeout(() => {
                    refreshAllViews();
                }, 200);
            } catch (error) {
                console.error('Error completing appointment:', error);
                showNotification('An error occurred while completing the appointment: ' + (error.message || 'Please try again.'), 'error');
            }
        });
    }

    deleteAppointment(id) {
        const appointment = dataManager.getAppointment(id);
        if (!appointment) return;

        const user = dataManager.getCurrentUser();
        
        // Security check: Patients cannot delete appointments (they can only cancel)
        if (user && user.role === 'patient') {
            showNotification('You cannot delete appointments. You can cancel pending appointments instead.', 'error');
            return;
        }
        
        if (!rolePermissions.canPerformAction(user, 'deleteAppointment', appointment)) {
            showNotification('You do not have permission to delete this appointment', 'error');
            return;
        }

        showConfirmation('Are you sure you want to delete this appointment?', () => {
            const deleted = dataManager.deleteAppointment(id);
            if (deleted) {
                showNotification('Appointment deleted successfully', 'success');
                this.loadAppointments(1);
            } else {
                showNotification('Failed to delete appointment', 'error');
            }
        });
    }

    // Patients View
    initPatients() {
        // Check if dataManager is available and user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        this.loadPatients(1);

        const searchInput = document.getElementById('patient-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.loadPatients(1);
            }, 300));
        }

        const addBtn = document.getElementById('add-patient-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddPatientModal();
            });
        }

        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'patients') {
                // Apply patient customization
                const user = dataManager.getCurrentUser();
                if (user && user.role === 'patient' && typeof customizePatientProfileView === 'function') {
                    customizePatientProfileView();
                }
                this.loadPatients(1);
            }
        });
    }

    loadPatients(page = 1) {
        const search = document.getElementById('patient-search')?.value || '';
        const filters = search ? { search } : {};
        let allPatients = dataManager.getPatients(filters);
        
        // Apply advanced filters if available
        if (typeof advancedSearch !== 'undefined') {
            allPatients = advancedSearch.filterData(allPatients, 'patient');
        }
        
        // Filter by role permissions
        const user = dataManager.getCurrentUser();
        if (user) {
            allPatients = rolePermissions.filterDataByRole(user, allPatients, 'patients');
        }
        
        // Paginate
        const paginationData = paginationManager.paginate(allPatients, page);
        this.renderPatients(paginationData.items);
        
        // Render pagination
        const paginationContainer = document.getElementById('patients-pagination');
        if (paginationContainer) {
            paginationManager.renderPagination(paginationContainer, paginationData, (newPage) => {
                this.loadPatients(newPage);
            });
        }
    }

    renderPatients(patients) {
        const grid = document.getElementById('patients-grid');
        if (!grid) return;

        const user = dataManager.getCurrentUser();

        if (patients.length === 0) {
            const emptyMessage = user && user.role === 'patient' 
                ? 'Profile information not available' 
                : 'No patients found';
            grid.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }

        grid.innerHTML = patients.map(patient => {
            const canEdit = rolePermissions.canPerformAction(user, 'editPatient', patient);
            const canView = rolePermissions.canPerformAction(user, 'viewAllPatients') || 
                           (user.role === 'patient' && patient.id === user.id);
            
            // Get user object to access profile picture
            const patientUser = dataManager.getUser(patient.id);
            const profilePicture = patientUser?.profilePicture;
            
            return `
            <div class="patient-card" data-id="${patient.id}">
                <div class="patient-avatar" style="${profilePicture ? `background-image: url(${profilePicture}); background-size: cover; background-position: center;` : ''}">
                    ${!profilePicture ? patient.name.charAt(0).toUpperCase() : ''}
                </div>
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p><i class="fas fa-envelope"></i> ${patient.email || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${patient.phone || 'N/A'}</p>
                    ${user.role !== 'patient' ? `<p><i class="fas fa-calendar"></i> Joined ${formatDate(patient.createdAt)}</p>` : ''}
                </div>
                <div class="patient-actions">
                    ${canView ? `
                    <button class="btn btn-sm btn-primary" onclick="viewsHandler.viewPatient('${patient.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ` : ''}
                    ${canEdit ? `
                    <button class="btn btn-sm btn-outline" onclick="viewsHandler.editPatient('${patient.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
        
        // Initialize bulk operations only if user has permission
        if (rolePermissions.hasPermission(user, 'bulkDelete') || rolePermissions.hasPermission(user, 'bulkUpdate')) {
            bulkOps.initCheckboxes(grid, patients);
        }
    }

    showAddPatientModal() {
        const user = dataManager.getCurrentUser();
        if (!rolePermissions.canPerformAction(user, 'createPatient')) {
            showNotification('You do not have permission to add patients', 'error');
            return;
        }

        const content = `
            <form id="add-patient-form">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" required>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Medical History</label>
                    <textarea name="medicalHistory" rows="4"></textarea>
                </div>
            </form>
        `;

        showModal('Add New Patient', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Create Patient',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    const form = document.getElementById('add-patient-form');
                    const validation = validateForm(form);
                    if (!validation.isValid) {
                        showNotification(validation.errors[0], 'error');
                        return;
                    }

                    const formData = new FormData(form);
                    const patient = Object.fromEntries(formData);
                    
                    const result = dataManager.createPatient(patient);
                    if (result) {
                        showNotification('Patient created successfully', 'success');
                        this.loadPatients(1);
                        if (typeof closeModal !== 'undefined') {
                            closeModal();
                        }
                    } else {
                        showNotification('Failed to create patient', 'error');
                    }
                }
            }
        ]);
    }

    viewPatient(id) {
        const patient = dataManager.getPatient(id);
        if (!patient) return;

        // Security check: Patients can only view their own profile
        const user = dataManager.getCurrentUser();
        if (user && user.role === 'patient' && patient.id !== user.id) {
            showNotification('You can only view your own profile', 'error');
            return;
        }

        // Get user object to access profile picture
        const patientUser = dataManager.getUser(id);
        const profilePicture = patientUser?.profilePicture;

        // Filter appointments and records for patients
        let appointments = dataManager.getAppointments({ patientId: id });
        let records = dataManager.getRecords({ patientId: id });
        
        // Additional security: Ensure patients only see their own data
        if (user && user.role === 'patient') {
            appointments = appointments.filter(apt => 
                apt.patientId === user.id || apt.email === user.email
            );
            records = records.filter(record => record.patientId === user.id);
        }

        const content = `
            <div class="patient-detail">
                ${profilePicture ? `
                <div class="detail-section" style="text-align: center; margin-bottom: 20px;">
                    <img src="${profilePicture}" alt="${patient.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #2563EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                </div>
                ` : ''}
                <div class="detail-section">
                    <h4>Personal Information</h4>
                    <p><strong>Name:</strong> ${patient.name}</p>
                    <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${patient.phone || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${patient.dob ? formatDate(patient.dob) : 'N/A'}</p>
                    <p><strong>Address:</strong> ${patient.address || 'N/A'}</p>
                </div>
                <div class="detail-section">
                    <h4>Medical History</h4>
                    <p>${patient.medicalHistory || 'No medical history recorded'}</p>
                </div>
                <div class="detail-section">
                    <h4>Appointments (${appointments.length})</h4>
                    ${appointments.length > 0 ? appointments.map(apt => `
                        <p>${formatDate(apt.date)} - ${apt.service} (${apt.status})</p>
                    `).join('') : '<p>No appointments</p>'}
                </div>
                <div class="detail-section">
                    <h4>Records (${records.length})</h4>
                    ${records.length > 0 ? records.map(record => `
                        <p>${formatDate(record.date)} - ${record.treatment}</p>
                    `).join('') : '<p>No records</p>'}
                </div>
            </div>
        `;

        showModal('Patient Details', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'close',
                handler: () => {}
            }
        ]);
    }

    editPatient(id) {
        const patient = dataManager.getPatient(id);
        if (!patient) return;

        const user = dataManager.getCurrentUser();
        
        // Security check: Patients can only edit their own profile
        if (user && user.role === 'patient' && patient.id !== user.id) {
            showNotification('You can only edit your own profile', 'error');
            return;
        }
        
        if (!rolePermissions.canPerformAction(user, 'editPatient', patient)) {
            showNotification('You do not have permission to edit this patient', 'error');
            return;
        }

        // For dentists, only allow editing medical history
        const isDentist = user && user.role === 'dentist';
        
        const content = `
            <form id="edit-patient-form">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value="${patient.name}" required ${isDentist ? 'readonly style="background: #F3F4F6;"' : ''}>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot be changed</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value="${patient.email || ''}" required ${isDentist ? 'readonly style="background: #F3F4F6;"' : ''}>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot be changed</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" value="${patient.phone || ''}" required ${isDentist ? 'readonly style="background: #F3F4F6;"' : ''}>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot be changed</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value="${patient.dob || ''}" ${isDentist ? 'readonly style="background: #F3F4F6;"' : ''}>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot be changed</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea name="address" rows="3" ${isDentist ? 'readonly style="background: #F3F4F6;"' : ''}>${patient.address || ''}</textarea>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">Cannot be changed</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Medical History *</label>
                    <textarea name="medicalHistory" rows="4" placeholder="Enter patient medical history, allergies, medications, etc." required>${patient.medicalHistory || ''}</textarea>
                    ${isDentist ? '<small style="color: #6B7280; display: block; margin-top: 4px;">As a dentist, you can only edit the medical history.</small>' : ''}
                </div>
            </form>
        `;

        const modal = showModal('Edit Patient', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Save Changes',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    try {
                        const form = document.getElementById('edit-patient-form');
                        if (!form) {
                            showNotification('Form not found', 'error');
                            return false;
                        }
                        
                        if (!form.checkValidity()) {
                            form.reportValidity();
                            return false;
                        }
                        
                        const formData = new FormData(form);
                        
                        // For dentists, only allow updating medical history
                        let updates;
                        if (isDentist) {
                            updates = {
                                medicalHistory: formData.get('medicalHistory') || ''
                            };
                        } else {
                            updates = Object.fromEntries(formData);
                        }
                        
                        const result = dataManager.updatePatient(id, updates);
                        if (result) {
                            showNotification('Patient updated successfully', 'success');
                            this.loadPatients(1);
                            return true; // Allow modal to close
                        } else {
                            showNotification('Failed to update patient', 'error');
                            return false;
                        }
                    } catch (error) {
                        console.error('Error updating patient:', error);
                        showNotification('An unexpected error occurred: ' + (error.message || 'Please try again.'), 'error');
                        return false;
                    }
                }
            }
        ]);
    }

    // Schedule View
    initSchedule() {
        // Check if dataManager is available and user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        this.currentWeekStart = this.getWeekStart(new Date());
        this.loadSchedule();

        const prevBtn = document.getElementById('prev-week-btn');
        const nextBtn = document.getElementById('next-week-btn');
        const todayBtn = document.getElementById('today-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
            this.loadSchedule();
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
            this.loadSchedule();
        });

        if (todayBtn) todayBtn.addEventListener('click', () => {
            this.currentWeekStart = this.getWeekStart(new Date());
            this.loadSchedule();
        });

        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'schedule') {
                this.loadSchedule();
            }
        });
        
        // Refresh schedule when settings are updated
        window.addEventListener('settingsUpdated', () => {
            if (document.getElementById('schedule-view')?.classList.contains('active')) {
                this.loadSchedule();
            }
            // Update sidebar clinic info for dentists when settings are updated
            const user = dataManager.getCurrentUser();
            if (user && user.role === 'dentist') {
                this.updateSidebarClinicInfo(user);
            }
        });
    }

    getWeekStart(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    loadSchedule() {
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(this.currentWeekStart.getDate() + i);
            weekDates.push(date.toISOString().split('T')[0]);
        }

        let appointments = dataManager.getAppointments();
        const user = dataManager.getCurrentUser();
        if (user) {
            appointments = rolePermissions.filterDataByRole(user, appointments, 'appointments');
        }
        
        const weekAppointments = appointments.filter(apt => weekDates.includes(apt.date));

        this.renderSchedule(weekDates, weekAppointments);

        // Update date range display
        const dateRangeEl = document.getElementById('schedule-date-range');
        if (dateRangeEl) {
            const start = formatDate(weekDates[0]);
            const end = formatDate(weekDates[6]);
            dateRangeEl.textContent = `${start} - ${end}`;
        }
    }

    renderSchedule(weekDates, appointments) {
        const container = document.getElementById('calendar-view');
        if (!container) return;

        // Get current user's working hours - always get fresh user data
        let user = dataManager.getCurrentUser();
        // If user exists, get the latest user data from storage to ensure we have updated settings
        if (user && user.id) {
            const latestUser = dataManager.getUser(user.id);
            if (latestUser) {
                user = latestUser;
            }
        }
        
        // Determine working hours for each day in the week
        const dayWorkingHours = {};
        weekDates.forEach(date => {
            const dayOfWeek = new Date(date).getDay();
            let dayHours = null;
            
            if (user && user.role === 'dentist') {
                const settings = dataManager.getSettings(user);
                if (settings && settings.workingHours) {
                    if (dayOfWeek === 6) { // Saturday
                        dayHours = settings.workingHours.saturday || settings.workingHours.weekdays;
                    } else if (dayOfWeek === 0) { // Sunday
                        dayHours = settings.workingHours.sunday || 'Closed';
                    } else { // Weekdays (Monday-Friday)
                        dayHours = settings.workingHours.weekdays;
                    }
                }
            }
            dayWorkingHours[date] = dayHours;
        });
        
        // Get all possible time slots from all days (use the widest range to show all possible slots)
        const allHours = new Set();
        Object.values(dayWorkingHours).forEach(wh => {
            if (wh && wh.toLowerCase() !== 'closed') {
                const slots = typeof getScheduleTimeSlots === 'function' ? getScheduleTimeSlots(wh) : [];
                slots.forEach(slot => allHours.add(slot));
            }
        });
        let allTimeSlots = Array.from(allHours).sort();
        
        // If no working hours found, use default (8 AM - 6 PM)
        if (allTimeSlots.length === 0) {
            allTimeSlots = typeof getScheduleTimeSlots === 'function' ? getScheduleTimeSlots() : getTimeSlots().filter((_, index) => index % 2 === 0);
        }
        
        // Create a map of appointments by date and time slots they occupy
        // Appointments can span multiple hours based on service duration
        const appointmentsBySlot = {};
        const appointmentSpans = {}; // Track which slots each appointment spans
        
        appointments.forEach(apt => {
            if (!apt.date || !apt.time || !apt.service) return;
            const normalizedTime = typeof normalizeTimeToHour === 'function' ? normalizeTimeToHour(apt.time) : apt.time.split(':')[0] + ':00';
            
            // Calculate how many hours this appointment should occupy
            const hours = typeof getAppointmentHours === 'function' ? getAppointmentHours(apt.service) : 1;
            
            // Find the starting slot index
            const startIndex = allTimeSlots.findIndex(slot => slot === normalizedTime);
            if (startIndex === -1) return;
            
            // Mark all slots this appointment occupies
            // 2-hour appointments should visually span 2 hours, 1-hour appointments should only span 1 hour
            for (let i = 0; i < hours && (startIndex + i) < allTimeSlots.length; i++) {
                const slotTime = allTimeSlots[startIndex + i];
                const key = `${apt.date}_${slotTime}`;
                if (!appointmentsBySlot[key]) {
                    appointmentsBySlot[key] = [];
                }
                // Only add the appointment once, but track which slots it spans
                if (i === 0) {
                    appointmentsBySlot[key].push(apt);
                } else {
                    // For subsequent hours (2-hour appointments), add a placeholder to mark the slot as occupied
                    appointmentsBySlot[key].push({ ...apt, isSpanning: true, originalSlot: normalizedTime });
                }
            }
            
            // Store span information for rendering
            appointmentSpans[apt.id] = {
                startSlot: normalizedTime,
                hours: hours,
                date: apt.date
            };
        });
        
        container.innerHTML = `
            <div class="schedule-grid">
                <div class="schedule-header">
                    <div class="time-column"></div>
                    ${weekDates.map(date => `
                        <div class="day-header">
                            <div class="day-name">${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div class="day-date">${new Date(date).getDate()}</div>
                        </div>
                    `).join('')}
                </div>
                ${allTimeSlots.map(time => {
                    // Check if this time slot is within working hours for each day
                    const isWithinHours = (date, timeStr) => {
                        const dayHours = dayWorkingHours[date];
                        if (!dayHours || dayHours.toLowerCase() === 'closed') return false;
                        
                        // Parse working hours string
                        let parsed = { start: 8, end: 18 };
                        if (typeof parseWorkingHours === 'function') {
                            parsed = parseWorkingHours(dayHours);
                        } else {
                            // Fallback parsing
                            const match = dayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            if (match) {
                                let startHour = parseInt(match[1]);
                                const startPeriod = match[3].toUpperCase();
                                let endHour = parseInt(match[4]);
                                const endMinute = parseInt(match[5]);
                                const endPeriod = match[6].toUpperCase();
                                
                                if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
                                else if (startPeriod === 'AM' && startHour === 12) startHour = 0;
                                
                                if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
                                else if (endPeriod === 'AM' && endHour === 12) endHour = 0;
                                
                                parsed = { start: startHour, end: endHour + (endMinute > 0 ? 1 : 0) };
                            }
                        }
                        
                        const [hour] = timeStr.split(':').map(Number);
                        return hour >= parsed.start && hour < parsed.end;
                    };
                    
                    return `
                    <div class="schedule-row">
                        <div class="time-slot">${time}</div>
                        ${weekDates.map(date => {
                            const key = `${date}_${time}`;
                            const apts = appointmentsBySlot[key] || [];
                            const isWorkingHour = isWithinHours(date, time);
                            const cellClass = !isWorkingHour ? 'schedule-cell-outside-hours' : '';
                            
                            // Filter appointments: show only those that start at this time slot
                            // For multi-hour appointments, mark subsequent slots as occupied
                            const displayApts = apts.filter(apt => {
                                // Show appointment only in its starting time slot
                                if (apt.isSpanning) {
                                    return false; // Don't show duplicate content in spanning slots
                                }
                                return true;
                            });
                            
                            // Check if this slot is occupied by a 2-hour appointment starting earlier
                            const spanningApt = apts.find(apt => apt.isSpanning && apt.originalSlot !== time);
                            const isOccupiedBySpanning = spanningApt && !spanningApt.isVisualExtension; // Only for 2-hour appointments
                            
                            return `
                                <div class="schedule-cell ${cellClass}" data-date="${date}" data-time="${time}" style="${!isWorkingHour ? 'opacity: 0.4; background: #F9FAFB;' : ''} ${isOccupiedBySpanning ? 'background: rgba(37, 99, 235, 0.1) !important; border-left: 3px solid #2563EB;' : ''} position: relative; overflow: visible;">
                                    ${displayApts.map(apt => {
                                        const statusClass = apt?.status === 'completed' ? 'completed' : apt?.status === 'cancelled' ? 'cancelled' : '';
                                        const spanInfo = appointmentSpans[apt.id];
                                        const hours = spanInfo ? spanInfo.hours : 1;
                                        
                                        // For 2-hour appointments, only fill the first hour slot
                                        // The second hour will show the indicator separately
                                        // For 1-hour appointments, fill the single slot
                                        const visualHeight = hours === 1 ? 40 : 40; // Always fill just one slot height
                                        
                                        return `
                                            <div class="appointment-block ${statusClass}" data-id="${apt.id}" data-hours="${hours}" style="position: relative; margin-bottom: 4px; min-height: ${visualHeight}px; height: ${visualHeight}px; display: flex; flex-direction: column; justify-content: flex-start; padding-top: 6px; box-sizing: border-box;">
                                                <strong>${apt.patientName}</strong>
                                                <small>${apt.service} ${apt.time !== time ? `(${apt.time})` : ''}</small>
                                                ${apt.status === 'completed' ? '<i class="fas fa-check-circle" style="margin-left: 4px; color: #10B981;"></i>' : ''}
                                                ${apt.status === 'cancelled' ? '<i class="fas fa-times-circle" style="margin-left: 4px; color: #EF4444;"></i>' : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                    ${isOccupiedBySpanning && spanningApt ? `
                                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #2563EB; font-size: 11px; font-weight: 600; opacity: 0.8; pointer-events: none; position: relative; z-index: 10;">
                                            <i class="fas fa-arrow-up" style="margin-right: 4px;"></i>
                                            ${spanningApt.service || 'Continuing'}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                }).join('')}
            </div>
        `;
        
        // Add click handlers to appointment blocks in schedule
        container.querySelectorAll('.appointment-block').forEach(block => {
            block.style.cursor = 'pointer';
            block.addEventListener('click', (e) => {
                e.stopPropagation();
                const appointmentId = block.getAttribute('data-id');
                if (appointmentId) {
                    this.viewAppointmentFromSchedule(appointmentId);
                }
            });
        });
    }
    
    viewAppointmentFromSchedule(id) {
        const appointment = dataManager.getAppointment(id);
        if (!appointment) return;
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        const content = `
            <div class="appointment-detail">
                <div class="detail-section">
                    <h4>Appointment Details</h4>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Patient:</strong> ${appointment.patientName}</p>
                    <p><strong>Service:</strong> ${appointment.service}</p>
                    <p><strong>Dentist:</strong> ${appointment.dentist || 'N/A'}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${appointment.status}">${appointment.status}</span></p>
                </div>
                ${appointment.notes ? `
                <div class="detail-section" style="margin-top: 16px; padding: 12px; background: #F9FAFB; border-radius: 6px; border-left: 3px solid #2563EB;">
                    <h4 style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-sticky-note" style="color: #2563EB;"></i>
                        Patient Notes
                    </h4>
                    <p style="color: #374151; white-space: pre-wrap; margin: 0;">${appointment.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
        
        const actions = [
            {
                label: 'Close',
                class: 'btn-outline',
                action: 'close',
                handler: () => {}
            }
        ];
        
        // Add edit button if user has permission
        if (rolePermissions.canPerformAction(user, 'editAppointment', appointment)) {
            actions.push({
                label: 'Edit',
                class: 'btn-primary',
                action: 'edit',
                handler: () => {
                    this.editAppointment(id);
                }
            });
        }
        
        showModal('Appointment Details', content, actions);
    }

    // Records View
    initRecords() {
        // Check if dataManager is available and user is logged in
        if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
            return;
        }
        
        const user = dataManager.getCurrentUser();
        if (!user) return;
        
        this.loadRecords();

        const searchInput = document.getElementById('record-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.loadRecords(1);
            }, 300));
        }


        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'records') {
                // Apply patient customization
                const user = dataManager.getCurrentUser();
                if (user && user.role === 'patient' && typeof customizePatientRecordsView === 'function') {
                    customizePatientRecordsView();
                }
                this.loadRecords(1);
            }
        });
    }

    loadRecords(page = 1) {
        const search = document.getElementById('record-search')?.value || '';
        const filters = search ? { search } : {};
        let allRecords = dataManager.getRecords(filters);
        
        // Apply advanced filters if available
        if (typeof advancedSearch !== 'undefined') {
            allRecords = advancedSearch.filterData(allRecords, 'record');
        }
        
        // Filter by role permissions
        const user = dataManager.getCurrentUser();
        if (user) {
            allRecords = rolePermissions.filterDataByRole(user, allRecords, 'records');
        }
        
        // Sort by date (latest to oldest) - ensure sorting after filtering
        // Use date + time if available, otherwise use createdAt
        allRecords = allRecords.sort((a, b) => {
            // Try to create a date from date + time, or use createdAt
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
        
        // Paginate
        const paginationData = paginationManager.paginate(allRecords, page);
        this.renderRecords(paginationData.items);
        
        // Render pagination
        const paginationContainer = document.getElementById('records-pagination');
        if (paginationContainer) {
            paginationManager.renderPagination(paginationContainer, paginationData, (newPage) => {
                this.loadRecords(newPage);
            });
        }
    }

    renderRecords(records) {
        const container = document.getElementById('records-list');
        if (!container) return;

        const user = dataManager.getCurrentUser();

        if (records.length === 0) {
            const emptyMessage = user && user.role === 'patient' 
                ? 'No treatment records yet. Your dental treatment history will appear here.' 
                : 'No records found';
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }

        container.innerHTML = records.map(record => {
            const canDelete = rolePermissions.canPerformAction(user, 'deleteRecord', record);
            
            return `
            <div class="record-card" data-id="${record.id}">
                <div class="record-header">
                    <h3>${user.role === 'patient' ? 'Treatment' : record.patientName}</h3>
                    <span class="record-date">${formatDate(record.date)}</span>
                </div>
                <div class="record-body">
                    <p><strong>Treatment:</strong> ${record.treatment}</p>
                    <p><strong>Notes:</strong> ${record.notes || 'N/A'}</p>
                    ${user.role !== 'patient' ? `<p><strong>Dentist:</strong> ${record.dentist || 'Dr. Juan Dela Cruz'}</p>` : ''}
                </div>
                <div class="record-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewsHandler.viewRecord('${record.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${canDelete ? `
                    <button class="btn btn-sm btn-outline" onclick="viewsHandler.deleteRecord('${record.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
        
        // Initialize bulk operations only if user has permission
        if (rolePermissions.hasPermission(user, 'bulkDelete')) {
            bulkOps.initCheckboxes(container, records);
        }
    }

    showAddRecordModal() {
        const user = dataManager.getCurrentUser();
        if (!rolePermissions.canPerformAction(user, 'createRecord')) {
            showNotification('You do not have permission to create records', 'error');
            return;
        }

        // Patients cannot create records, but if they somehow access this, filter patients
        const patients = dataManager.getPatients();
        // Note: Patients should not be able to access this modal due to permission check above
        
        const content = `
            <form id="add-record-form">
                <div class="form-group">
                    <label>Patient *</label>
                    <select name="patientId" required>
                        <option value="">Select Patient</option>
                        ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" name="date" required>
                </div>
                <div class="form-group">
                    <label>Treatment *</label>
                    <input type="text" name="treatment" required>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label>Dentist</label>
                    <input type="text" name="dentist" value="Dr. Juan Dela Cruz">
                </div>
            </form>
        `;

        showModal('Add New Record', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Create Record',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    const form = document.getElementById('add-record-form');
                    const validation = validateForm(form);
                    if (!validation.isValid) {
                        showNotification(validation.errors[0], 'error');
                        return;
                    }

                    const formData = new FormData(form);
                    const record = Object.fromEntries(formData);
                    const patient = dataManager.getPatient(record.patientId);
                    record.patientName = patient ? patient.name : 'Unknown';
                    
                    const result = dataManager.createRecord(record);
                    if (result) {
                        showNotification('Record created successfully', 'success');
                        this.loadRecords(1);
                        if (typeof closeModal !== 'undefined') {
                            closeModal();
                        }
                    } else {
                        showNotification('Failed to create record', 'error');
                    }
                }
            }
        ]);
    }

    viewRecord(id) {
        const user = dataManager.getCurrentUser();
        
        // Get records - filtered by role
        let allRecords = dataManager.getRecords();
        if (user && (user.role === 'patient' || user.role === 'dentist')) {
            allRecords = rolePermissions.filterDataByRole(user, allRecords, 'records');
        }
        
        const record = allRecords.find(r => r.id === id);
        if (!record) {
            showNotification('Record not found', 'error');
            return;
        }

        // Security check: Patients can only view their own records
        if (user && user.role === 'patient' && record.patientId !== user.id) {
            showNotification('You can only view your own records', 'error');
            return;
        }
        
        // Security check: Dentists can only view their own records
        if (user && user.role === 'dentist' && record.dentist) {
            const dentistName = (user.name || '').trim().toLowerCase();
            const dentistRoleTitle = (user.roleTitle || '').trim().toLowerCase();
            const recordDentist = record.dentist.trim().toLowerCase();
            
            // Check if record belongs to this dentist
            const isMatch = recordDentist === dentistName ||
                          (dentistRoleTitle && recordDentist === dentistRoleTitle) ||
                          recordDentist.replace(/^(dr\.?|dentist)\s+/i, '').trim() === 
                          dentistName.replace(/^(dr\.?|dentist)\s+/i, '').trim();
            
            if (!isMatch) {
                showNotification('You can only view your own records', 'error');
                return;
            }
        }

        const patient = dataManager.getPatient(record.patientId);
        
        const content = `
            <div class="record-details">
                <div class="detail-section">
                    <h3>Patient Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${patient ? patient.name : record.patientName || 'Unknown'}</span>
                        </div>
                        ${patient && patient.email ? `
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${patient.email}</span>
                        </div>
                        ` : ''}
                        ${patient && patient.phone ? `
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${patient.phone}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Treatment Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${formatDate(record.date || record.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Treatment:</label>
                            <span>${record.treatment || 'N/A'}</span>
                        </div>
                        ${record.dentist ? `
                        <div class="detail-item">
                            <label>Dentist:</label>
                            <span>${record.dentist}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ${record.notes ? `
                <div class="detail-section">
                    <h3>Notes</h3>
                    <p>${record.notes}</p>
                </div>
                ` : ''}
                ${user && user.role === 'patient' && record.dentist ? `
                <div class="detail-section">
                    <h3>Rate & Review</h3>
                    ${record.rating ? `
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <strong>Your Rating:</strong>
                            <div class="star-rating-display" style="display: flex; gap: 4px;">
                                ${Array.from({ length: 5 }, (_, i) => `
                                    <i class="fas fa-star ${i < record.rating ? 'star-filled' : 'star-empty'}" style="color: ${i < record.rating ? '#FBBF24' : '#D1D5DB'}; font-size: 18px;"></i>
                                `).join('')}
                            </div>
                            <span style="font-weight: 600; color: #1F2937;">${record.rating}/5</span>
                        </div>
                        ${record.review ? `
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; margin-top: 8px;">
                            <strong>Your Review:</strong>
                            <p style="margin: 8px 0 0 0; color: #374151;">${record.review}</p>
                        </div>
                        ` : ''}
                    </div>
                    ` : `
                    <form id="rating-review-form" style="margin-top: 12px;">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Rate this dentist *</label>
                            <div class="star-rating-input" style="display: flex; gap: 8px; align-items: center;">
                                ${Array.from({ length: 5 }, (_, i) => `
                                    <i class="fas fa-star star-rating-star" data-rating="${i + 1}" style="font-size: 28px; color: #D1D5DB; cursor: pointer; transition: color 0.2s;"></i>
                                `).join('')}
                                <span id="rating-value" style="margin-left: 12px; font-weight: 600; color: #1F2937; min-width: 40px;">0/5</span>
                            </div>
                            <input type="hidden" name="rating" id="rating-input" value="0" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Write a Review (Optional)</label>
                            <textarea name="review" id="review-input" rows="4" placeholder="Share your experience with this dentist..." style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; resize: vertical; font-family: inherit;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-star" style="margin-right: 8px;"></i>
                            Submit Rating & Review
                        </button>
                    </form>
                    `}
                </div>
                ` : ''}
            </div>
        `;

        // Build modal actions based on user role
        const modalActions = [
            {
                label: 'Close',
                class: 'btn-outline',
                action: 'close',
                handler: () => {
                    return true;
                }
            }
        ];
        
        // Add Edit button only for non-patients
        if (user && user.role !== 'patient') {
            modalActions.push({
                label: 'Edit',
                class: 'btn-primary',
                action: 'edit',
                handler: () => {
                    // Close detail modal first
                    if (detailModal && typeof closeModal === 'function') {
                        closeModal(detailModal);
                    }
                    // Show edit modal
                    setTimeout(() => {
                        this.editRecord(id);
                    }, 300);
                    return true;
                }
            });
        }
        
        const detailModal = showModal('Record Details', content, modalActions);
        
        // Setup star rating for patients
        if (user && user.role === 'patient' && !record.rating) {
            const stars = detailModal.querySelectorAll('.star-rating-star');
            const ratingValue = detailModal.querySelector('#rating-value');
            const ratingInput = detailModal.querySelector('#rating-input');
            let currentRating = 0;
            
            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    const rating = index + 1;
                    stars.forEach((s, i) => {
                        s.style.color = i < rating ? '#FBBF24' : '#D1D5DB';
                    });
                });
                
                star.addEventListener('mouseleave', () => {
                    stars.forEach((s, i) => {
                        s.style.color = i < currentRating ? '#FBBF24' : '#D1D5DB';
                    });
                });
                
                star.addEventListener('click', () => {
                    currentRating = index + 1;
                    ratingInput.value = currentRating;
                    ratingValue.textContent = `${currentRating}/5`;
                    stars.forEach((s, i) => {
                        s.style.color = i < currentRating ? '#FBBF24' : '#D1D5DB';
                    });
                });
            });
            
            // Handle form submission
            const ratingForm = detailModal.querySelector('#rating-review-form');
            if (ratingForm) {
                ratingForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(ratingForm);
                    const rating = parseInt(formData.get('rating') || '0');
                    const review = formData.get('review') || '';
                    
                    if (rating === 0) {
                        showNotification('Please select a rating', 'error');
                        return;
                    }
                    
                    // Update record with rating and review
                    const updates = {
                        rating: rating,
                        review: review.trim() || null,
                        ratedAt: new Date().toISOString()
                    };
                    
                    const result = dataManager.updateRecord(id, updates);
                    if (result) {
                        showNotification('Thank you for your rating and review!', 'success');
                        
                        // Notify dentist when a review/rating is submitted
                        if (record.dentist) {
                            const dentists = dataManager.getUsers({ role: 'dentist' });
                            const dentist = dentists.find(d => d.name === record.dentist);
                            if (dentist) {
                                const reviewText = review.trim() ? ` with review: "${review.trim().substring(0, 50)}${review.trim().length > 50 ? '...' : ''}"` : '';
                                dataManager.createNotification({
                                    userId: dentist.id,
                                    userRole: 'dentist',
                                    type: 'review',
                                    title: 'New Review Received',
                                    message: `${record.patientName} has rated you ${rating} out of 5 stars${reviewText}.`,
                                    relatedId: id,
                                    relatedType: 'record'
                                });
                                
                                // Update notification badge
                                if (typeof updateNotificationBadge === 'function') {
                                    updateNotificationBadge();
                                }
                            }
                        }
                        
                        // Refresh records view
                        this.loadRecords(1);
                        // Refresh dashboard to update ratings
                        if (document.getElementById('dashboard-view')?.classList.contains('active')) {
                            this.loadDashboardData();
                        }
                        // Close modal and reopen to show the rating
                        if (detailModal && typeof closeModal === 'function') {
                            closeModal(detailModal);
                        }
                        setTimeout(() => {
                            this.viewRecord(id);
                        }, 300);
                    } else {
                        showNotification('Failed to submit rating. Please try again.', 'error');
                    }
                });
            }
        }
    }

    editRecord(id) {
        const record = dataManager.getRecord(id);
        if (!record) {
            showNotification('Record not found', 'error');
            return;
        }

        const user = dataManager.getCurrentUser();
        
        // Security check: Only dentists and admins can edit records
        if (!user || (user.role !== 'dentist' && user.role !== 'admin')) {
            showNotification('You do not have permission to edit records', 'error');
            return;
        }
        
        // Security check: Dentists can only edit their own records
        if (user.role === 'dentist' && record.dentist) {
            const dentistName = (user.name || '').trim().toLowerCase();
            const dentistRoleTitle = (user.roleTitle || '').trim().toLowerCase();
            const recordDentist = record.dentist.trim().toLowerCase();
            
            const isMatch = recordDentist === dentistName ||
                          (dentistRoleTitle && recordDentist === dentistRoleTitle) ||
                          recordDentist.replace(/^(dr\.?|dentist)\s+/i, '').trim() === 
                          dentistName.replace(/^(dr\.?|dentist)\s+/i, '').trim();
            
            if (!isMatch) {
                showNotification('You can only edit your own records', 'error');
                return;
            }
        }
        
        if (!rolePermissions.canPerformAction(user, 'editRecord', record)) {
            showNotification('You do not have permission to edit this record', 'error');
            return;
        }

        // For dentists, only show medical history/notes field as editable
        const isDentist = user.role === 'dentist';
        
        const content = `
            <form id="edit-record-form">
                <div class="form-group">
                    <label>Patient Name *</label>
                    <input type="text" name="patientName" value="${record.patientName || ''}" required readonly style="background: #F3F4F6;">
                    <small style="color: #6B7280; display: block; margin-top: 4px;">Patient name cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Treatment *</label>
                    <input type="text" name="treatment" value="${record.treatment || ''}" required readonly style="background: #F3F4F6;">
                    <small style="color: #6B7280; display: block; margin-top: 4px;">Treatment cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" name="date" value="${record.date || ''}" required readonly style="background: #F3F4F6;">
                    <small style="color: #6B7280; display: block; margin-top: 4px;">Date cannot be changed</small>
                </div>
                <div class="form-group">
                    <label>Medical History / Treatment Notes *</label>
                    <textarea name="notes" rows="6" placeholder="Enter medical history, treatment notes, recommendations, follow-up instructions, etc." required ${isDentist ? '' : ''}>${record.notes || ''}</textarea>
                    <small style="color: #6B7280; display: block; margin-top: 4px;">${isDentist ? 'As a dentist, you can only edit the medical history and treatment notes.' : 'You can edit the treatment notes'}</small>
                </div>
            </form>
        `;

        const modal = showModal('Edit Record', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Save Changes',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    try {
                        const form = document.getElementById('edit-record-form');
                        if (!form) {
                            showNotification('Form not found', 'error');
                            return false;
                        }
                        
                        if (!form.checkValidity()) {
                            form.reportValidity();
                            return false;
                        }
                        
                        const formData = new FormData(form);
                        
                        // For dentists, only allow editing notes (medical history)
                        // For admins, they can edit other fields if needed in the future
                        const updates = {
                            notes: formData.get('notes') || ''
                        };
                        
                        // Ensure dentists can only update notes (medical history)
                        // All other fields are already read-only in the form
                        const result = dataManager.updateRecord(id, updates);
                        if (result) {
                            showNotification('Record updated successfully', 'success');
                            this.loadRecords(1);
                            return true; // Allow modal to close
                        } else {
                            showNotification('Failed to update record', 'error');
                            return false;
                        }
                    } catch (error) {
                        console.error('Error updating record:', error);
                        showNotification('An unexpected error occurred: ' + (error.message || 'Please try again.'), 'error');
                        return false;
                    }
                }
            }
        ]);
    }

    deleteRecord(id) {
        const records = dataManager.getRecords();
        const record = records.find(r => r.id === id);
        if (!record) return;

        const user = dataManager.getCurrentUser();
        if (!rolePermissions.canPerformAction(user, 'deleteRecord', record)) {
            showNotification('You do not have permission to delete this record', 'error');
            return;
        }

        showConfirmation('Are you sure you want to delete this record?', () => {
            const deleted = dataManager.deleteRecord(id);
            if (deleted) {
                showNotification('Record deleted successfully', 'success');
                this.loadRecords(1);
            } else {
                showNotification('Failed to delete record', 'error');
            }
        });
    }

    // Show dentist location on map (for patients)
    showDentistLocationMap(dentistName, latitude, longitude, address) {
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            showNotification('Map feature is not available. Please refresh the page.', 'error');
            return;
        }
        
        // Validate coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
            showNotification('Invalid location coordinates. Please contact the clinic.', 'error');
            return;
        }
        
        // Validate coordinate ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            showNotification('Invalid location coordinates. Please contact the clinic.', 'error');
            return;
        }
        
        // Use a unique ID for each map instance to avoid conflicts
        const mapId = 'dentist-location-map-view-' + Date.now();
        
        const content = `
            <div style="margin-bottom: 16px;">
                <p><strong>Dentist:</strong> ${dentistName}</p>
                <p><strong>Address:</strong> ${address}</p>
            </div>
            <div id="${mapId}" style="height: 400px; width: 100%; border-radius: 8px; border: 1px solid #D1D5DB; margin-top: 12px;"></div>
        `;
        
        // Clean up any existing map first
        if (this.dentistLocationMap) {
            try {
                this.dentistLocationMap.remove();
            } catch (e) {
                // Map might already be removed, ignore error
            }
            this.dentistLocationMap = null;
            this.dentistLocationMarker = null;
        }
        
        
        const modal = showModal('Clinic Location', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'cancel',
                handler: () => {
                    this.cleanupDentistLocationMap();
                }
            }
        ]);
        
        // Add cleanup function
        this.cleanupDentistLocationMap = () => {
            if (this.dentistLocationMap) {
                this.dentistLocationMap.remove();
                this.dentistLocationMap = null;
                this.dentistLocationMarker = null;
            }
        };
        
        // Add event listener for modal close (clicking outside, ESC key, etc.)
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            const closeHandler = () => {
                this.cleanupDentistLocationMap();
                modalOverlay.removeEventListener('click', closeHandler);
            };
            
            // Close on overlay click (outside modal content)
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeHandler();
                }
            });
            
            // Close on close button
            const closeBtn = modalOverlay.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeHandler);
            }
        }
        
        // Initialize map after modal is shown
        setTimeout(() => {
            const mapContainer = document.getElementById(mapId);
            if (!mapContainer) {
                console.error('Map container not found');
                return;
            }
            
            // Clean up our stored reference if it exists
            if (this.dentistLocationMap) {
                try {
                    this.dentistLocationMap.remove();
                } catch (e) {
                    // Map might already be removed, ignore
                }
                this.dentistLocationMap = null;
                this.dentistLocationMarker = null;
            }
            
            // Create map centered on dentist's location (lat and lng already validated above)
            // Using unique ID prevents "already initialized" errors
            let map;
            try {
                map = L.map(mapId).setView([lat, lng], 15);
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
                
                // Add marker at dentist's location
                const marker = L.marker([lat, lng]).addTo(map);
                
                // Add popup with address
                marker.bindPopup(`
                    <strong>${dentistName}</strong><br>
                    ${address}
                `).openPopup();
                
                // Store map reference for cleanup
                this.dentistLocationMap = map;
                this.dentistLocationMarker = marker;
            } catch (error) {
                console.error('Error initializing map:', error);
                showNotification('Failed to load map. Please try again.', 'error');
            }
        }, 100);
    }

    // Settings View
    initSettings() {
        this.loadSettings();
        
        // Initialize map for clinic location (only for dentists)
        this.initClinicLocationMap();
        
        // Setup tabs with a small delay to ensure DOM is ready
        setTimeout(() => {
            this.setupSettingsTabs();
        }, 100);

        // Setup data backup buttons
        const backupRestoreBtn = document.getElementById('backup-restore-btn');
        if (backupRestoreBtn && typeof dataBackup !== 'undefined') {
            backupRestoreBtn.addEventListener('click', () => {
                if (dataBackup.showBackupRestoreUI) {
                    dataBackup.showBackupRestoreUI();
                }
            });
        }

        const exportAllBtn = document.getElementById('export-all-data-btn');
        if (exportAllBtn && typeof dataBackup !== 'undefined') {
            exportAllBtn.addEventListener('click', () => {
                if (dataBackup.exportAllData) {
                    dataBackup.exportAllData();
                }
            });
        }

        // Apply role-based settings access
        const user = dataManager.getCurrentUser();
        if (user) {
            // Get all settings tabs
            const clinicTab = document.querySelector('.settings-tab[data-tab="clinic"]');
            const dataTab = document.querySelector('.settings-tab[data-tab="data"]');
            const preferencesTab = document.querySelector('.settings-tab[data-tab="preferences"]');
            const notificationsTab = document.querySelector('.settings-tab[data-tab="notifications"]');
            
            // Hide notifications tab for patients and dentists
            if (notificationsTab && (user.role === 'patient' || user.role === 'dentist')) {
                notificationsTab.style.display = 'none';
            }
            
            // For dentists: Show Clinic Info, Profile; Hide Notifications, Preferences and Data Management
            if (user.role === 'dentist') {
                // Show clinic tab for dentists (they can view but may not be able to edit)
                if (clinicTab) {
                    clinicTab.style.display = '';
                }
                
                // Hide data management tab
                if (dataTab) {
                    dataTab.style.display = 'none';
                }
                
                // Hide preferences tab
                if (preferencesTab) {
                    preferencesTab.style.display = 'none';
                }
            } else {
                // For other roles, use permission-based visibility
                // Hide clinic tab if user doesn't have permission (except patients who have their own handler)
                if (clinicTab && user.role !== 'patient' && !rolePermissions.hasPermission(user, 'manageClinicSettings')) {
                    clinicTab.style.display = 'none';
                }
                
                // Hide data management tab if user doesn't have permission
                if (dataTab && !rolePermissions.hasPermission(user, 'manageDataBackup')) {
                    dataTab.style.display = 'none';
                }
            }
            
            // Apply patient-specific settings customization
            if (user.role === 'patient' && typeof customizePatientSettingsView === 'function') {
                customizePatientSettingsView();
            }
        }

        // Tab switching - setup after role-based hiding is done
        // Use setTimeout to ensure DOM is ready and tabs are properly shown/hidden
        setTimeout(() => {
            this.setupSettingsTabs();
        }, 150);

        // Form submissions
        const clinicForm = document.getElementById('clinic-settings-form');
        if (clinicForm) {
            clinicForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = dataManager.getCurrentUser();
                if (!rolePermissions.canPerformAction(user, 'manageSettings')) {
                    showNotification('You do not have permission to modify clinic settings', 'error');
                    return;
                }
                const formData = new FormData(clinicForm);
                const settings = Object.fromEntries(formData);
                
                // Helper function to convert 24-hour time (HH:MM) to 12-hour format (HH:MM AM/PM)
                const formatTimeTo12Hour = (time24) => {
                    if (!time24) return '';
                    const [hours, minutes] = time24.split(':').map(Number);
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12;
                    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
                };
                
                // Convert time picker values to the expected format
                if (settings['weekdays-start'] && settings['weekdays-end']) {
                    settings.workingHours = {
                        weekdays: `${formatTimeTo12Hour(settings['weekdays-start'])} - ${formatTimeTo12Hour(settings['weekdays-end'])}`,
                        saturday: (settings['saturday-start'] && settings['saturday-end']) ? 
                            `${formatTimeTo12Hour(settings['saturday-start'])} - ${formatTimeTo12Hour(settings['saturday-end'])}` : 
                            '8:00 AM - 4:00 PM',
                        sunday: 'Closed'
                    };
                    // Remove the individual time picker fields from settings
                    delete settings['weekdays-start'];
                    delete settings['weekdays-end'];
                    delete settings['saturday-start'];
                    delete settings['saturday-end'];
                }
                
                // Save latitude and longitude if available
                const latInput = clinicForm.querySelector('[name="latitude"]');
                const lngInput = clinicForm.querySelector('[name="longitude"]');
                if (latInput && latInput.value) {
                    settings.latitude = latInput.value;
                }
                if (lngInput && lngInput.value) {
                    settings.longitude = lngInput.value;
                }
                
                // Pass user to updateSettings so it knows to update per-dentist settings
                dataManager.updateSettings(settings, user);
                showNotification('Clinic settings saved', 'success');
                // Reload settings to reflect changes
                this.loadSettings();
                // Reinitialize map to show updated location
                if (user.role === 'dentist') {
                    setTimeout(() => {
                        this.initClinicLocationMap();
                    }, 100);
                }
                // Update sidebar clinic info for dentists
                if (user.role === 'dentist') {
                    // Refresh user object to get updated clinic info
                    const updatedUser = dataManager.getCurrentUser();
                    if (updatedUser) {
                        this.updateSidebarClinicInfo(updatedUser);
                    }
                }
                // Refresh schedule if it's currently visible
                if (document.getElementById('schedule-view')?.classList.contains('active')) {
                    this.loadSchedule();
                }
                // Dispatch event to refresh schedule if needed
                window.dispatchEvent(new CustomEvent('settingsUpdated'));
            });
        }

        // Profile picture upload handler
        const profilePictureInput = document.getElementById('profile-picture-input');
        const profilePictureImg = document.getElementById('profile-picture-img');
        const profilePicturePlaceholder = document.getElementById('profile-picture-placeholder');
        const removeProfilePictureBtn = document.getElementById('remove-profile-picture-btn');

        if (profilePictureInput) {
            profilePictureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validate file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        showNotification('Image size must be less than 2MB', 'error');
                        e.target.value = '';
                        return;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        showNotification('Please select a valid image file', 'error');
                        e.target.value = '';
                        return;
                    }

                    // Read file as base64
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.profilePictureData = event.target.result;
                        this.profilePictureRemoved = false;
                        profilePictureImg.src = this.profilePictureData;
                        profilePictureImg.style.display = 'block';
                        profilePicturePlaceholder.style.display = 'none';
                        if (removeProfilePictureBtn) {
                            removeProfilePictureBtn.style.display = 'inline-block';
                        }
                    };
                    reader.onerror = () => {
                        showNotification('Error reading image file', 'error');
                        e.target.value = '';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Remove profile picture handler
        if (removeProfilePictureBtn) {
            removeProfilePictureBtn.addEventListener('click', () => {
                this.profilePictureData = null;
                this.profilePictureRemoved = true;
                profilePictureImg.src = '';
                profilePictureImg.style.display = 'none';
                profilePicturePlaceholder.style.display = 'flex';
                removeProfilePictureBtn.style.display = 'none';
                if (profilePictureInput) {
                    profilePictureInput.value = '';
                }
            });
        }

        // Profile settings form submission
        const profileForm = document.getElementById('profile-settings-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = dataManager.getCurrentUser();
                if (!user) {
                    showNotification('You must be logged in to update your profile', 'error');
                    return;
                }

                const formData = new FormData(profileForm);
                const updates = {
                    name: formData.get('name').trim(),
                    email: formData.get('email').trim(),
                    phone: formData.get('phone')?.trim() || '',
                    address: formData.get('address')?.trim() || ''
                };
                
                // Update system rating for dentists and patients
                if (user.role === 'dentist' || user.role === 'patient') {
                    const systemRating = parseInt(formData.get('systemRating') || '0');
                    if (systemRating > 0) {
                        updates.systemRating = systemRating;
                        updates.systemRatingUpdatedAt = new Date().toISOString();
                    }
                }

                // Update specialties for dentists
                if (user.role === 'dentist') {
                    const specialtyTags = document.querySelectorAll('.specialty-tag');
                    const specialties = Array.from(specialtyTags).map(tag => tag.getAttribute('data-specialty'));
                    updates.specialties = specialties;
                }

                // Update profile picture if a new one was selected or removed
                if (this.profilePictureData !== null) {
                    updates.profilePicture = this.profilePictureData;
                } else if (this.profilePictureRemoved) {
                    updates.profilePicture = null;
                }

                // Only update password if provided
                const newPassword = formData.get('password');
                if (newPassword && newPassword.trim() !== '') {
                    const trimmedPassword = newPassword.trim();
                    // Basic password validation
                    if (trimmedPassword.length < 8) {
                        showNotification('Password must be at least 8 characters long', 'error');
                        return;
                    }
                    updates.password = trimmedPassword;
                }

                try {
                    // Update user record
                    const updatedUser = dataManager.updateUser(user.id, updates);
                    
                    // If user is a patient, also update patient record
                    if (user.role === 'patient') {
                        const patientUpdates = {
                            name: updates.name,
                            email: updates.email,
                            phone: updates.phone,
                            address: updates.address
                        };
                        
                        // Check if patient record exists, create if it doesn't
                        let patient = dataManager.getPatient(user.id);
                        if (!patient) {
                            // Create patient record if it doesn't exist
                            // We need to manually add to patients array to preserve user ID
                            const patients = dataManager.getPatients();
                            const newPatient = {
                                id: user.id,
                                name: updates.name,
                                email: updates.email,
                                phone: updates.phone,
                                address: updates.address,
                                dateOfBirth: user.dateOfBirth || '',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                            patients.push(newPatient);
                            localStorage.setItem('toothtrack_patients', JSON.stringify(patients));
                        } else {
                            // Update existing patient record
                            dataManager.updatePatient(user.id, patientUpdates);
                        }
                    }

                    // Update current user in session
                    dataManager.setCurrentUser(updatedUser);

                    // Update user info display in header
                    if (typeof authManager !== 'undefined' && authManager.updateUserInfo) {
                        authManager.updateUserInfo();
                    }

                    // Reload settings to reflect changes
                    this.loadSettings();
                    
                    // Update system rating display on homepage if it exists
                    if (typeof updateSystemRatingDisplay === 'function') {
                        updateSystemRatingDisplay();
                    }

                    showNotification('Profile updated successfully', 'success');
                } catch (error) {
                    showNotification(error.message || 'Failed to update profile', 'error');
                }
            });
        }

        // Dark mode toggle in settings
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            // Load current theme preference
            const savedTheme = localStorage.getItem('darkMode');
            const isDarkMode = savedTheme === 'true';
            darkModeToggle.checked = isDarkMode;
            
            // Update theme when toggle changes
            darkModeToggle.addEventListener('change', (e) => {
                const newTheme = e.target.checked;
                
                if (newTheme) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
                
                localStorage.setItem('darkMode', newTheme);
                
                // Update header icon if it exists
                if (typeof updateThemeIcon === 'function') {
                    updateThemeIcon(newTheme);
                }
                
                showNotification(newTheme ? 'Dark mode enabled' : 'Light mode enabled', 'success');
            });
        }
    }

    initClinicLocationMap() {
        const mapContainer = document.getElementById('clinic-location-map');
        if (!mapContainer) return; // Map container doesn't exist (not a dentist or settings not loaded)
        
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.warn('Leaflet library not loaded');
            return;
        }
        
        // Destroy existing map if it exists
        if (this.clinicMap) {
            this.clinicMap.remove();
            this.clinicMap = null;
            this.clinicMarker = null;
        }
        
        // Initialize map - default to Philippines (Laoag City)
        const defaultLat = 18.1980;
        const defaultLng = 120.5900;
        
        // Get existing location from settings
        const currentUser = dataManager.getCurrentUser();
        const settings = dataManager.getSettings(currentUser);
        let initialLat = defaultLat;
        let initialLng = defaultLng;
        
        if (settings && settings.latitude && settings.longitude) {
            initialLat = parseFloat(settings.latitude);
            initialLng = parseFloat(settings.longitude);
        }
        
        // Create map
        const map = L.map('clinic-location-map').setView([initialLat, initialLng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Create marker
        let marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        
        // Function to update coordinates only (no address autofill)
        const updateCoordinates = (lat, lng) => {
            const latInput = document.getElementById('clinic-latitude');
            const lngInput = document.getElementById('clinic-longitude');
            if (latInput) latInput.value = lat;
            if (lngInput) lngInput.value = lng;
        };
        
        // Update coordinates when marker is dragged
        marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            updateCoordinates(position.lat, position.lng);
        });
        
        // Update coordinates when map is clicked
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            marker.setLatLng([lat, lng]);
            updateCoordinates(lat, lng);
        });
        
        // Store map and marker for later use
        this.clinicMap = map;
        this.clinicMarker = marker;
    }

    loadSettings() {
        try {
            const currentUser = dataManager.getCurrentUser();
            // Get settings - will return per-dentist settings if user is a dentist
            const settings = dataManager.getSettings(currentUser);
        const form = document.getElementById('clinic-settings-form');
        if (form) {
                // Populate form fields
                if (settings && settings.clinicName) {
                    const clinicNameInput = form.querySelector('[name="clinicName"]');
                    if (clinicNameInput) clinicNameInput.value = settings.clinicName;
                }
                if (settings && settings.branch) {
                    const branchInput = form.querySelector('[name="branch"]');
                    if (branchInput) branchInput.value = settings.branch;
                }
                if (settings && settings.address) {
                    const addressInput = form.querySelector('[name="address"]');
                    if (addressInput) addressInput.value = settings.address;
                }
                // Load latitude and longitude
                if (settings && settings.latitude) {
                    const latInput = form.querySelector('[name="latitude"]');
                    if (latInput) latInput.value = settings.latitude;
                }
                if (settings && settings.longitude) {
                    const lngInput = form.querySelector('[name="longitude"]');
                    if (lngInput) lngInput.value = settings.longitude;
                }
                // Update map if it exists
                if (this.clinicMap && this.clinicMarker && settings.latitude && settings.longitude) {
                    const lat = parseFloat(settings.latitude);
                    const lng = parseFloat(settings.longitude);
                    this.clinicMarker.setLatLng([lat, lng]);
                    this.clinicMap.setView([lat, lng], 15);
                }
                if (settings && settings.phone) {
                    const phoneInput = form.querySelector('[name="phone"]');
                    if (phoneInput) phoneInput.value = settings.phone;
                }
                if (settings && settings.email) {
                    const emailInput = form.querySelector('[name="email"]');
                    if (emailInput) emailInput.value = settings.email;
                }
                // Helper function to convert 12-hour format (HH:MM AM/PM) to 24-hour format (HH:MM)
                const parse12HourTo24Hour = (time12) => {
                    if (!time12) return '';
                    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                    if (!match) return '';
                    let hours = parseInt(match[1]);
                    const minutes = match[2];
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hours !== 12) hours += 12;
                    else if (period === 'AM' && hours === 12) hours = 0;
                    return `${hours.toString().padStart(2, '0')}:${minutes}`;
                };
                
                // Parse working hours and populate time pickers
                if (settings && settings.workingHours) {
                    if (settings.workingHours.weekdays) {
                        const match = settings.workingHours.weekdays.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (match) {
                            const startTime = parse12HourTo24Hour(`${match[1]}:${match[2]} ${match[3]}`);
                            const endTime = parse12HourTo24Hour(`${match[4]}:${match[5]} ${match[6]}`);
                            const weekdaysStartInput = form.querySelector('[name="weekdays-start"]');
                            const weekdaysEndInput = form.querySelector('[name="weekdays-end"]');
                            if (weekdaysStartInput) weekdaysStartInput.value = startTime;
                            if (weekdaysEndInput) weekdaysEndInput.value = endTime;
                        }
                    }
                    if (settings.workingHours.saturday) {
                        const match = settings.workingHours.saturday.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (match) {
                            const startTime = parse12HourTo24Hour(`${match[1]}:${match[2]} ${match[3]}`);
                            const endTime = parse12HourTo24Hour(`${match[4]}:${match[5]} ${match[6]}`);
                            const saturdayStartInput = form.querySelector('[name="saturday-start"]');
                            const saturdayEndInput = form.querySelector('[name="saturday-end"]');
                            if (saturdayStartInput) saturdayStartInput.value = startTime;
                            if (saturdayEndInput) saturdayEndInput.value = endTime;
                        }
                    }
                }
            }

        const profileForm = document.getElementById('profile-settings-form');
            if (profileForm && currentUser) {
            // Load profile picture
            const profilePictureImg = document.getElementById('profile-picture-img');
            const profilePicturePlaceholder = document.getElementById('profile-picture-placeholder');
            const removeProfilePictureBtn = document.getElementById('remove-profile-picture-btn');
            
            if (currentUser.profilePicture) {
                if (profilePictureImg) {
                    profilePictureImg.src = currentUser.profilePicture;
                    profilePictureImg.style.display = 'block';
                }
                if (profilePicturePlaceholder) {
                    profilePicturePlaceholder.style.display = 'none';
                }
                if (removeProfilePictureBtn) {
                    removeProfilePictureBtn.style.display = 'inline-block';
                }
            } else {
                if (profilePictureImg) {
                    profilePictureImg.src = '';
                    profilePictureImg.style.display = 'none';
                }
                if (profilePicturePlaceholder) {
                    profilePicturePlaceholder.style.display = 'flex';
                }
                if (removeProfilePictureBtn) {
                    removeProfilePictureBtn.style.display = 'none';
                }
            }
            
            // Reset profile picture tracking variables
            this.profilePictureData = null;
            this.profilePictureRemoved = false;
            
            // Load name - check both user record and patient record
            const nameField = profileForm.querySelector('[name="name"]');
            if (nameField) {
                let name = currentUser.name || '';
                // If user is a patient, also check patient record
                if (currentUser.role === 'patient') {
                    const patient = dataManager.getPatient(currentUser.id);
                    if (patient && patient.name) {
                        name = patient.name;
                    }
                }
                nameField.value = name;
            }
            
            profileForm.querySelector('[name="email"]').value = currentUser.email || '';
            
            // Load phone - check both user record and patient record
            const phoneField = profileForm.querySelector('[name="phone"]');
            if (phoneField) {
                let phone = currentUser.phone || '';
                // If user is a patient, also check patient record
                if (currentUser.role === 'patient') {
                    const patient = dataManager.getPatient(currentUser.id);
                    if (patient && patient.phone) {
                        phone = patient.phone;
                    }
                }
                phoneField.value = phone;
            }
            
            // Load address - check both user record and patient record
            const addressField = profileForm.querySelector('[name="address"]');
            if (addressField) {
                let address = currentUser.address || '';
                // If user is a patient, also check patient record
                if (currentUser.role === 'patient') {
                    const patient = dataManager.getPatient(currentUser.id);
                    if (patient && patient.address) {
                        address = patient.address;
                    }
                }
                addressField.value = address;
            }
            
            // Clear password field (never show existing password)
            const passwordField = profileForm.querySelector('[name="password"]');
            if (passwordField) {
                passwordField.value = '';
            }
            
                const roleField = profileForm.querySelector('[name="role"]');
                if (roleField) {
                    roleField.value = currentUser.roleTitle || currentUser.role || '';
                }
            
            // Load specialties for dentists
            const specialtiesGroup = document.getElementById('dentist-specialties-group');
            const specialtiesContainer = document.getElementById('specialties-container');
            if (specialtiesGroup && specialtiesContainer) {
                    if (currentUser.role === 'dentist') {
                    specialtiesGroup.style.display = 'block';
                        this.loadSpecialties(currentUser.specialties || []);
                } else {
                    specialtiesGroup.style.display = 'none';
                }
            }
            
            // Load system rating for dentists and patients
            const systemRatingGroup = document.getElementById('system-rating-group');
            const systemRatingValue = document.getElementById('system-rating-value');
            const systemRatingText = document.getElementById('system-rating-text');
            if (systemRatingGroup && (currentUser.role === 'dentist' || currentUser.role === 'patient')) {
                systemRatingGroup.style.display = 'block';
                const currentRating = currentUser.systemRating || 0;
                if (systemRatingValue) {
                    systemRatingValue.value = currentRating;
                }
                // Reset setup flag when loading settings
                this.systemRatingSetupDone = false;
                // Setup system rating star interaction
                setTimeout(() => {
                    this.setupSystemRatingStars();
                    // Then update the display
                    this.updateSystemRatingDisplay(currentRating);
                }, 100);
            } else if (systemRatingGroup) {
                systemRatingGroup.style.display = 'none';
                this.systemRatingSetupDone = false;
            }
        }
        
        // Setup specialties management
        this.setupSpecialtiesManagement();
        } catch (error) {
            console.error('Error loading settings:', error);
            // Don't show error to user unless it's critical
        }
    }

    loadSpecialties(specialties) {
        const container = document.getElementById('specialties-container');
        if (!container) return;
        
        container.innerHTML = specialties.map(specialty => `
            <span class="specialty-tag" data-specialty="${specialty}">
                ${specialty}
                <button type="button" class="remove-specialty" onclick="viewsHandler.removeSpecialty('${specialty}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }

    setupSpecialtiesManagement() {
        const addSpecialtySelect = document.getElementById('add-specialty-select');
        if (addSpecialtySelect) {
            addSpecialtySelect.addEventListener('change', (e) => {
                const specialty = e.target.value;
                if (specialty) {
                    this.addSpecialty(specialty);
                    e.target.value = '';
                }
            });
        }
    }

    addSpecialty(specialty) {
        const container = document.getElementById('specialties-container');
        if (!container) return;
        
        // Check if already exists
        const existing = container.querySelector(`[data-specialty="${specialty}"]`);
        if (existing) {
            showNotification('This specialty is already added', 'info');
            return;
        }
        
        // Add new specialty tag
        const tag = document.createElement('span');
        tag.className = 'specialty-tag';
        tag.setAttribute('data-specialty', specialty);
        tag.innerHTML = `
            ${specialty}
            <button type="button" class="remove-specialty" onclick="viewsHandler.removeSpecialty('${specialty}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    }

    removeSpecialty(specialty) {
        const tag = document.querySelector(`.specialty-tag[data-specialty="${specialty}"]`);
        if (tag) {
            tag.remove();
        }
    }

    setupSettingsTabs() {
        // Get all settings tabs and add direct click handlers to each
        const tabs = document.querySelectorAll('.settings-tab');
        
        tabs.forEach(tab => {
            // Remove any existing onclick to avoid duplicates
            tab.onclick = null;
            
            // Add direct onclick handler
            tab.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if tab is hidden
                const computedStyle = window.getComputedStyle(tab);
                if (computedStyle.display === 'none' || tab.classList.contains('hidden')) {
                    return false;
                }
                
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchSettingsTab(tabName);
                }
                return false;
            };
            
            // Also add event listener as backup
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const computedStyle = window.getComputedStyle(tab);
                if (computedStyle.display === 'none' || tab.classList.contains('hidden')) {
                    return;
                }
                
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchSettingsTab(tabName);
                }
            }, true);
        });
        
        // Also use event delegation on container as additional backup
        const settingsTabsContainer = document.querySelector('.settings-tabs');
        if (settingsTabsContainer) {
            // Remove old listener if it exists
            if (this._settingsTabClickHandler) {
                settingsTabsContainer.removeEventListener('click', this._settingsTabClickHandler);
            }
            
            const handleTabClick = (e) => {
                const tab = e.target.closest('.settings-tab');
                if (!tab) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const computedStyle = window.getComputedStyle(tab);
                if (computedStyle.display === 'none' || tab.classList.contains('hidden')) {
                    return;
                }
                
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchSettingsTab(tabName);
                }
            };
            
            this._settingsTabClickHandler = handleTabClick;
            settingsTabsContainer.addEventListener('click', handleTabClick, true);
        }
    }

    switchSettingsTab(tabName) {
        try {
        if (!tabName) return;
        
        // Check if tab is hidden - don't switch to hidden tabs
        const targetTab = document.querySelector(`.settings-tab[data-tab="${tabName}"]`);
        if (targetTab) {
            const computedStyle = window.getComputedStyle(targetTab);
            if (computedStyle.display === 'none' || targetTab.classList.contains('hidden')) {
                return;
            }
        }
        
        // If switching to profile tab, reset and setup system rating stars
        if (tabName === 'profile') {
            this.systemRatingSetupDone = false;
            setTimeout(() => {
                this.setupSystemRatingStars();
            }, 100);
        }
        
        // If switching to clinic tab, initialize map
        if (tabName === 'clinic') {
            setTimeout(() => {
                this.initClinicLocationMap();
            }, 200);
        }
        
        // Update tab active states
        document.querySelectorAll('.settings-tab').forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            if (isActive) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update panel active states - handle different panel ID patterns
        document.querySelectorAll('.settings-panel').forEach(panel => {
            let isActive = false;
            
            // Standard pattern: tabName-settings (e.g., profile-settings)
            if (panel.id === `${tabName}-settings`) {
                isActive = true;
            }
            // Special case: notifications tab -> notification-settings panel (singular)
            else if (tabName === 'notifications' && panel.id === 'notification-settings') {
                isActive = true;
            }
            // Alternative pattern for clinic (clinic-settings)
            else if (tabName === 'clinic' && panel.id === 'clinic-settings') {
                isActive = true;
            }
            // Alternative pattern for data (data-settings)
            else if (tabName === 'data' && panel.id === 'data-settings') {
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
        
        // If switching to data tab, ensure backup manager is available
        if (tabName === 'data' && typeof dataBackup !== 'undefined') {
            // Backup manager is already loaded
        }
        
            // Reload settings when switching to profile or clinic tab to ensure data is current
            if (tabName === 'profile' || tabName === 'clinic') {
                try {
            this.loadSettings();
                } catch (error) {
                    console.error('Error loading settings:', error);
                    // Don't show error to user, just log it
                }
            }
        } catch (error) {
            console.error('Error switching settings tab:', error);
            if (typeof showNotification === 'function') {
                showNotification('An error occurred while switching tabs. Please try again.', 'error');
            }
        }
    }

    // Booking Flow
    initBooking() {
        this.setupBookingSteps();
        this.setupServiceSelection();
        // setupDentistSelection will be called dynamically when service is selected
        this.setupDateTimeSelection();
        this.setupPatientInfo();
    }

    setupBookingSteps() {
        const nextButtons = document.querySelectorAll('.next-step-btn');
        const backButtons = document.querySelectorAll('.back-step-btn');

        nextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.validateCurrentStep()) {
                    this.goToNextStep();
                }
            });
        });

        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.goToPreviousStep();
            });
        });
    }

    // Service to specialty mapping
    getServiceSpecialtyMapping() {
        return {
            'Dental Cleaning': ['General Dentistry', 'Periodontics'],
            'Consultation': ['General Dentistry'],
            'Tooth Filling': ['General Dentistry', 'Restorative Dentistry'],
            'Tooth Extraction': ['Oral Surgery', 'General Dentistry'],
            'Root Canal': ['Endodontics', 'General Dentistry'],
            'Braces Consultation': ['Orthodontics']
        };
    }

    updateDentistDropdownForService(service, dentistSelect) {
        if (!dentistSelect) return;
        
        const dentistSelectText = document.getElementById('dentist-select-text');
        const dentistSelectOptions = document.getElementById('dentist-select-options');
        const dentistSelectDisplay = document.getElementById('dentist-select-display');
        
        // Clear existing options
        if (dentistSelectOptions) {
            dentistSelectOptions.innerHTML = '';
        }
        
        if (!service) {
            if (dentistSelectText) {
                dentistSelectText.textContent = 'Select Dentist (choose service first)';
                dentistSelectText.style.color = '#6B7280';
            }
            if (dentistSelectOptions) {
                dentistSelectOptions.innerHTML = '<div style="padding: 12px; text-align: center; color: #6B7280;">Select a service first</div>';
            }
            if (dentistSelect) {
                dentistSelect.value = '';
            }
            return;
        }
        
        // Get all dentists
        const allDentists = dataManager.getUsers({ role: 'dentist' });
        
        // Get required specialties for this service
        const serviceMapping = this.getServiceSpecialtyMapping();
        const requiredSpecialties = serviceMapping[service] || ['General Dentistry'];
        
        // Filter dentists who have at least one of the required specialties
        const availableDentists = allDentists.filter(dentist => {
            const dentistSpecialties = dentist.specialties || [];
            return requiredSpecialties.some(specialty => 
                dentistSpecialties.includes(specialty)
            );
        });
        
        // If no dentists match, show all dentists
        const dentistsToShow = availableDentists.length > 0 ? availableDentists : allDentists;
        
        if (dentistsToShow.length === 0) {
            if (dentistSelectText) {
                dentistSelectText.textContent = 'No dentists available';
                dentistSelectText.style.color = '#6B7280';
            }
            if (dentistSelectOptions) {
                dentistSelectOptions.innerHTML = '<div style="padding: 12px; text-align: center; color: #6B7280;">No dentists available for this service</div>';
            }
            return;
        }
        
        // Update display text
        if (dentistSelectText) {
            dentistSelectText.textContent = 'Select Dentist';
            dentistSelectText.style.color = '#1F2937';
        }
        
        // Add dentist options with profile pictures
        if (dentistSelectOptions) {
            dentistSelectOptions.innerHTML = dentistsToShow.map(dentist => {
                const specialties = (dentist.specialties || []).join(', ') || 'General Dentistry';
                const profilePicture = dentist.profilePicture 
                    ? `<img src="${dentist.profilePicture}" alt="${dentist.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #2563EB;">`
                    : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #2563EB; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">
                        ${dentist.name.charAt(0)}
                       </div>`;
                
                return `
                    <div class="dentist-option" data-dentist="${dentist.name}" style="padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-radius: 6px; transition: background 0.2s;" 
                         onmouseover="this.style.background='#F3F4F6'" 
                         onmouseout="this.style.background='transparent'"
                         onclick="viewsHandler.selectDentist('${dentist.name}')">
                        ${profilePicture}
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1F2937;">${dentist.name}</div>
                            <div style="font-size: 12px; color: #6B7280;">${specialties}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    toggleDentistDropdown() {
        const dropdown = document.getElementById('dentist-select-dropdown');
        const arrow = document.getElementById('dentist-select-arrow');
        if (dropdown) {
            const isOpen = dropdown.style.display !== 'none';
            dropdown.style.display = isOpen ? 'none' : 'block';
            if (arrow) {
                arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    }

    selectDentist(dentistName) {
        const dentistSelect = document.getElementById('appointment-dentist-select');
        const dentistSelectText = document.getElementById('dentist-select-text');
        const dropdown = document.getElementById('dentist-select-dropdown');
        const arrow = document.getElementById('dentist-select-arrow');
        
        if (dentistSelect) {
            dentistSelect.value = dentistName;
        }
        if (dentistSelectText) {
            dentistSelectText.textContent = dentistName;
            dentistSelectText.style.color = '#1F2937';
        }
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        if (arrow) {
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    setupServiceSelection() {
        const serviceItems = document.querySelectorAll('.service-item[data-service]');
        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                serviceItems.forEach(s => s.classList.remove('selected'));
                item.classList.add('selected');
                
                this.bookingData.service = item.getAttribute('data-service');
                this.bookingData.price = item.getAttribute('data-price');
                this.bookingData.duration = item.getAttribute('data-duration');
                
                // Load dentists filtered by service when service is selected
                this.loadDentistsForService(this.bookingData.service);
            });
        });
    }

    loadDentistsForService(service) {
        const dentistsGrid = document.getElementById('dentists-grid');
        if (!dentistsGrid) return;
        
        // Get all dentists
        const allDentists = dataManager.getUsers({ role: 'dentist' });
        
        // Get required specialties for this service
        const serviceMapping = this.getServiceSpecialtyMapping();
        const requiredSpecialties = serviceMapping[service] || ['General Dentistry'];
        
        // Filter dentists who have at least one of the required specialties
        const availableDentists = allDentists.filter(dentist => {
            const dentistSpecialties = dentist.specialties || [];
            return requiredSpecialties.some(specialty => 
                dentistSpecialties.includes(specialty)
            );
        });
        
        // If no dentists match, show all dentists
        const dentistsToShow = availableDentists.length > 0 ? availableDentists : allDentists;
        
        // Render dentists
        if (dentistsToShow.length === 0) {
            dentistsGrid.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 20px;">No dentists available</p>';
            return;
        }
        
        dentistsGrid.innerHTML = dentistsToShow.map(dentist => {
            const specialties = (dentist.specialties || []).join(', ') || 'General Dentistry';
            return `
                <div class="dentist-item" data-dentist="${dentist.name}" data-dentist-id="${dentist.id}">
                    <div class="dentist-icon">
                        ${dentist.profilePicture ? 
                            `<img src="${dentist.profilePicture}" alt="${dentist.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">` :
                            `<i class="fas fa-user-md"></i>`
                        }
                    </div>
                    <h4>${dentist.name}</h4>
                    <p>${specialties}</p>
                    <div class="dentist-rating">
                        <i class="fas fa-star"></i>
                        <span>Available</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Re-setup dentist selection handlers
        this.setupDentistSelection();
    }

    setupDentistSelection() {
        const dentistItems = document.querySelectorAll('.dentist-item');
        dentistItems.forEach(item => {
            item.addEventListener('click', () => {
                dentistItems.forEach(d => d.classList.remove('selected'));
                item.classList.add('selected');
                
                this.bookingData.dentist = item.getAttribute('data-dentist');
                this.bookingData.dentistId = item.getAttribute('data-dentist-id');
            });
        });
    }

    setupDateTimeSelection() {
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            dateInput.min = getTodayDate();
            dateInput.addEventListener('change', () => {
                this.bookingData.date = dateInput.value;
                this.loadTimeSlots(dateInput.value);
            });
        }

        // Time slots will be populated when date is selected
    }

    loadTimeSlots(date) {
        const container = document.getElementById('time-slots');
        if (!container) return;
        
        // Validate that the selected date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        
        if (selected < today) {
            container.innerHTML = '<p style="color: #EF4444; text-align: center; padding: 20px;">Cannot book appointments in the past. Please select today or a future date.</p>';
            // Clear the date input
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) {
                dateInput.value = '';
            }
            return;
        }
        
        const isToday = selected.getTime() === today.getTime();
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Get selected dentist's working hours
        let workingHours = null;
        if (this.bookingData && this.bookingData.dentist) {
            // Find the dentist user
            const dentists = dataManager.getUsers().filter(u => u.role === 'dentist');
            const dentist = dentists.find(d => d.name === this.bookingData.dentist || d.id === this.bookingData.dentistId);
            if (dentist) {
                const settings = dataManager.getSettings(dentist);
                if (settings && settings.workingHours) {
                    // Determine which working hours to use based on day of week
                    const dayOfWeek = new Date(date).getDay();
                    if (dayOfWeek === 6) { // Saturday
                        workingHours = settings.workingHours.saturday || settings.workingHours.weekdays;
                    } else if (dayOfWeek === 0) { // Sunday
                        workingHours = settings.workingHours.sunday || 'Closed';
                    } else { // Weekdays (Monday-Friday)
                        workingHours = settings.workingHours.weekdays;
                    }
                }
            }
        }
        
        // Generate time slots based on working hours
        let slots = [];
        if (workingHours && workingHours.toLowerCase() !== 'closed') {
            if (typeof getScheduleTimeSlots === 'function') {
                slots = getScheduleTimeSlots(workingHours);
            } else {
                // Fallback: parse working hours manually
                const match = workingHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (match) {
                    let startHour = parseInt(match[1]);
                    const startPeriod = match[3].toUpperCase();
                    let endHour = parseInt(match[4]);
                    const endMinute = parseInt(match[5]);
                    const endPeriod = match[6].toUpperCase();
                    
                    // Convert to 24-hour format
                    if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
                    else if (startPeriod === 'AM' && startHour === 12) startHour = 0;
                    
                    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
                    else if (endPeriod === 'AM' && endHour === 12) endHour = 0;
                    
                    // Generate hourly slots
                    for (let hour = startHour; hour < endHour; hour++) {
                        slots.push(`${hour.toString().padStart(2, '0')}:00`);
                    }
                } else {
                    // Default to 30-minute slots if parsing fails
                    slots = getTimeSlots();
                }
            }
        } else {
            // Default to 30-minute slots if no working hours or closed
            slots = getTimeSlots();
        }
        
        // Get existing appointments for this specific dentist and date
        const dentistName = this.bookingData?.dentist || '';
        const existingAppointments = dataManager.getAppointments({ 
            date: date,
            dentist: dentistName 
        });
        
        // Block time slots based on service duration
        const bookedTimes = new Set();
        existingAppointments
            .filter(apt => apt.status !== 'cancelled' && apt.service)
            .forEach(apt => {
                // Normalize appointment time to hour for hourly slots
                if (apt.time) {
                    const [hour] = apt.time.split(':').map(Number);
                    const startTime = `${hour.toString().padStart(2, '0')}:00`;
                    
                    // Get how many hours this appointment should occupy
                    const hours = typeof getAppointmentHours === 'function' ? getAppointmentHours(apt.service) : 1;
                    
                    // Block all hours this appointment occupies
                    for (let i = 0; i < hours; i++) {
                        const slotIndex = slots.findIndex(s => s === startTime);
                        if (slotIndex !== -1 && (slotIndex + i) < slots.length) {
                            bookedTimes.add(slots[slotIndex + i]);
                        }
                    }
                }
            });

        container.innerHTML = slots.map(time => {
            const isBooked = bookedTimes.has(time);
            // Check if slot is in the past (for today's date)
            let isPast = false;
            if (isToday) {
                const [slotHour, slotMinute = 0] = time.split(':').map(Number);
                if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                    isPast = true;
                }
            }
            const isDisabled = isBooked || isPast;
            const disabledTitle = isBooked ? 'Already booked' : (isPast ? 'Past time slot' : '');
            return `
                <button type="button" class="time-slot-btn ${isDisabled ? 'booked' : ''}" 
                        ${isDisabled ? 'disabled' : ''} 
                        data-time="${time}"
                        style="${isDisabled ? 'opacity: 0.6; background: #F3F4F6; color: #9CA3AF; cursor: not-allowed;' : ''}"
                        title="${isDisabled ? disabledTitle : ''}">
                    ${time}
                    ${isDisabled ? '<i class="fas fa-lock"></i>' : ''}
                </button>
            `;
        }).join('');

        container.querySelectorAll('.time-slot-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.bookingData.time = btn.getAttribute('data-time');
            });
        });
    }

    setupPatientInfo() {
        const form = document.getElementById('patient-info-form');
        const confirmBtn = document.getElementById('confirm-booking-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (!form) return;
                
                const validation = validateForm(form);
                if (!validation.isValid) {
                    showNotification(validation.errors[0], 'error');
                    return;
                }

                const formData = new FormData(form);
                const patientInfo = Object.fromEntries(formData);
                
                this.bookingData = { ...this.bookingData, ...patientInfo };
                this.confirmBooking();
            });
        }
    }

    validateCurrentStep() {
        const currentStep = document.querySelector(`.booking-step[data-step="${this.currentBookingStep}"]`);
        if (!currentStep) return false;

        if (this.currentBookingStep === 1) {
            if (!this.bookingData.service) {
                showNotification('Please select a service', 'warning');
                return false;
            }
        } else if (this.currentBookingStep === 2) {
            if (!this.bookingData.dentist) {
                showNotification('Please select a dentist', 'warning');
                return false;
            }
        } else if (this.currentBookingStep === 3) {
            if (!this.bookingData.date || !this.bookingData.time) {
                showNotification('Please select a date and time', 'warning');
                return false;
            }
        }

        return true;
    }

    goToNextStep() {
        if (this.currentBookingStep < 5) {
            this.currentBookingStep++;
            this.updateBookingSteps();
            this.updateBookingSummary();
        }
    }

    goToPreviousStep() {
        if (this.currentBookingStep > 1) {
            this.currentBookingStep--;
            this.updateBookingSteps();
        }
    }

    updateBookingSteps() {
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.toggle('active', step.getAttribute('data-step') == this.currentBookingStep);
        });

        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentBookingStep);
        });

        // Show/hide back button
        document.querySelectorAll('.back-step-btn').forEach(btn => {
            btn.style.display = this.currentBookingStep > 1 ? 'inline-block' : 'none';
        });
    }

    updateBookingSummary() {
        if (this.currentBookingStep === 4) {
            document.getElementById('summary-service').textContent = this.bookingData.service || '-';
            document.getElementById('summary-dentist').textContent = this.bookingData.dentist || '-';
            document.getElementById('summary-datetime').textContent = 
                this.bookingData.date && this.bookingData.time 
                    ? `${formatDate(this.bookingData.date)} at ${this.bookingData.time}`
                    : '-';
            document.getElementById('summary-price').textContent = 
                this.bookingData.price ? `₱ ${parseInt(this.bookingData.price).toLocaleString()}` : '-';
        }
    }

    confirmBooking() {
        const appointment = {
            patientName: this.bookingData.name,
            service: this.bookingData.service,
            dentist: this.bookingData.dentist,
            date: this.bookingData.date,
            time: this.bookingData.time,
            phone: this.bookingData.phone,
            email: this.bookingData.email,
            notes: this.bookingData.notes,
            status: 'pending'
        };

        // Validate appointment
        const validation = validationManager.validateAppointment(appointment);
        if (!validation.isValid) {
            showNotification(validation.errors[0], 'error');
            return;
        }

        // Create patient if doesn't exist
        let patient = null;
        if (appointment.email) {
            const patients = dataManager.getPatients();
            patient = patients.find(p => p && p.email === appointment.email);
        }
        
        if (!patient && appointment.email) {
            const patientData = {
                name: appointment.patientName,
                email: appointment.email,
                phone: appointment.phone,
                dob: this.bookingData.dob,
                address: this.bookingData.address,
                medicalHistory: this.bookingData.notes
            };
            
            const patientValidation = validationManager.validatePatient(patientData);
            if (!patientValidation.isValid) {
                showNotification(patientValidation.errors[0], 'error');
                return;
            }
            
            patient = dataManager.createPatient(patientData);
            if (!patient) {
                showNotification('Failed to create patient record', 'error');
                return;
            }
        }

        if (patient) {
            appointment.patientId = patient.id;
        }
        
        const newAppointment = dataManager.createAppointment(appointment);
        if (!newAppointment) {
            showNotification('Failed to create appointment', 'error');
            return;
        }

        // Notify dentist when appointment is created from booking flow
        if (appointment.dentist) {
            const dentists = dataManager.getUsers({ role: 'dentist' });
            const dentist = dentists.find(d => d.name === appointment.dentist);
            if (dentist) {
                dataManager.createNotification({
                    userId: dentist.id,
                    userRole: 'dentist',
                    type: 'appointment',
                    title: 'New Appointment',
                    message: `${appointment.patientName} has booked an appointment for ${appointment.service} on ${appointment.date} at ${appointment.time}.`,
                    relatedId: newAppointment.id,
                    relatedType: 'appointment'
                });
                
                // Update notification badge
                if (typeof updateNotificationBadge === 'function') {
                    updateNotificationBadge();
                }
            }
        }

        // Show confirmation
        this.currentBookingStep = 5;
        this.updateBookingSteps();
        this.showConfirmation(newAppointment);

        // Reset booking data
        setTimeout(() => {
            this.bookingData = {};
            this.currentBookingStep = 1;
        }, 5000);
    }

    showConfirmation(appointment) {
        const container = document.getElementById('confirmation-details');
        if (container) {
            container.innerHTML = `
                <div class="confirmation-item">
                    <strong>Appointment ID:</strong> ${appointment.id}
                </div>
                <div class="confirmation-item">
                    <strong>Patient:</strong> ${appointment.patientName}
                </div>
                <div class="confirmation-item">
                    <strong>Service:</strong> ${appointment.service}
                </div>
                <div class="confirmation-item">
                    <strong>Date & Time:</strong> ${formatDate(appointment.date)} at ${appointment.time}
                </div>
                <div class="confirmation-item">
                    <strong>Dentist:</strong> ${appointment.dentist}
                </div>
            `;
        }

        // Setup confirmation buttons
        const newBookingBtn = document.getElementById('new-booking-btn');
        const dashboardBtn = document.getElementById('view-dashboard-btn');

        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', () => {
                this.currentBookingStep = 1;
                this.bookingData = {};
                this.updateBookingSteps();
                document.querySelectorAll('.service-item').forEach(s => s.classList.remove('selected'));
            });
        }

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                document.querySelector('[data-view="dashboard"]').click();
            });
        }

        showNotification('Appointment booked successfully!', 'success');
    }
    
    updateSidebarClinicInfo(user) {
        if (!user || user.role !== 'dentist') return;
        
        const clinicInfoSection = document.querySelector('.clinic-info');
        if (!clinicInfoSection) return;
        
        // Get clinic information from user object or settings
        const settings = dataManager.getSettings(user);
        const clinicName = user.clinicName || settings?.clinicName || 'Dental Clinic';
        const branch = user.branch || settings?.branch || '';
        const address = user.clinicAddress || settings?.address || user.address || '';
        const phone = user.clinicPhone || settings?.phone || user.phone || '';
        
        // Update clinic name
        const clinicNameEl = clinicInfoSection.querySelector('h3');
        if (clinicNameEl) {
            clinicNameEl.textContent = clinicName;
        }
        
        // Update branch
        const branchEl = clinicInfoSection.querySelector('p');
        if (branchEl) {
            branchEl.textContent = branch || '';
            branchEl.style.display = branch ? 'block' : 'none';
        }
        
        // Update address
        const addressSpan = clinicInfoSection.querySelector('.detail-item:first-of-type span');
        if (addressSpan) {
            addressSpan.textContent = address || 'No address provided';
        }
        
        // Update phone
        const phoneSpan = clinicInfoSection.querySelector('.detail-item:last-of-type span');
        if (phoneSpan) {
            phoneSpan.textContent = phone || 'No phone provided';
        }
    }
    
    setupSystemRatingStars() {
        // Prevent multiple setups
        if (this.systemRatingSetupDone) {
            return;
        }
        
        const systemRatingGroup = document.getElementById('system-rating-group');
        const ratingContainer = document.getElementById('system-rating-stars');
        const ratingValue = document.getElementById('system-rating-value');
        
        // Check if elements exist
        if (!systemRatingGroup || !ratingContainer || !ratingValue) {
            // Retry once after a short delay if elements might not be loaded yet
            if (!this.systemRatingRetryAttempted) {
                this.systemRatingRetryAttempted = true;
                setTimeout(() => {
                    this.systemRatingRetryAttempted = false;
                    this.setupSystemRatingStars();
                }, 200);
            }
            return;
        }
        
        // Check if the rating group is visible
        if (systemRatingGroup.style.display === 'none') {
            return;
        }
        
        // Use event delegation on the container to handle all star interactions
        // This is more reliable than individual listeners
        ratingContainer.addEventListener('click', (e) => {
            const star = e.target.closest('.system-rating-star');
            if (star) {
                const rating = parseInt(star.getAttribute('data-rating'));
                if (rating && rating >= 1 && rating <= 5) {
                    ratingValue.value = rating;
                    this.updateSystemRatingDisplay(rating);
                    // Show feedback
                    showNotification('Rating saved. Click "Save Changes" to update your profile.', 'info');
                }
            }
        });
        
        ratingContainer.addEventListener('mouseenter', (e) => {
            const star = e.target.closest('.system-rating-star');
            if (star) {
                const hoverRating = parseInt(star.getAttribute('data-rating'));
                if (hoverRating && hoverRating >= 1 && hoverRating <= 5) {
                    this.highlightStars(hoverRating);
                }
            }
        }, true);
        
        ratingContainer.addEventListener('mouseleave', () => {
            const currentRating = parseInt(ratingValue.value || '0');
            this.updateSystemRatingDisplay(currentRating);
        });
        
        // Mark as setup
        this.systemRatingSetupDone = true;
    }
    
    updateSystemRatingDisplay(rating) {
        const stars = document.querySelectorAll('.system-rating-star');
        const ratingText = document.getElementById('system-rating-text');
        
        stars.forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.style.color = '#FBBF24'; // Gold/yellow for filled stars
            } else {
                star.style.color = '#D1D5DB'; // Gray for empty stars
            }
        });
        
        if (ratingText) {
            if (rating === 0) {
                ratingText.textContent = 'Not rated';
            } else {
                ratingText.textContent = `${rating} out of 5 stars`;
            }
        }
    }
    
    highlightStars(rating) {
        const stars = document.querySelectorAll('.system-rating-star');
        stars.forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.style.color = '#FBBF24'; // Gold/yellow
            } else {
                star.style.color = '#D1D5DB'; // Gray
            }
        });
    }
}

// Initialize views handler - only if user is logged in
let viewsHandler = null;

// Initialize views handler when DOM is ready and user is logged in
function initializeViewsHandler() {
    // Check if dataManager is available
    if (typeof dataManager === 'undefined' || !dataManager.getCurrentUser) {
        // Wait a bit and try again
        setTimeout(initializeViewsHandler, 100);
        return;
    }
    
    // Check if user is logged in
    const user = dataManager.getCurrentUser();
    if (!user) {
        // User not logged in - don't initialize views handler
        return;
    }
    
    // User is logged in - initialize views handler
    if (!viewsHandler) {
        try {
            viewsHandler = new ViewsHandler();
        } catch (error) {
            console.error('Error initializing views handler:', error);
            // Don't show error notification if it's just because user is not logged in
        }
    }
}

// Try to initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeViewsHandler);
} else {
    // DOM is already ready
    initializeViewsHandler();
}

// Also try to initialize when user logs in (listen for storage changes)
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser' || e.key === null) {
        if (!viewsHandler && dataManager && dataManager.getCurrentUser()) {
            initializeViewsHandler();
        }
    }
});

