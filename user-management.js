// User Management System (Admin Only)

class UserManagement {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize if user is admin
        const user = dataManager.getCurrentUser();
        if (user && user.role === 'admin') {
            this.setupUserManagement();
        }
    }

    setupUserManagement() {
        // Load users when view is shown
        document.addEventListener('viewChanged', (e) => {
            if (e.detail.view === 'users') {
                this.loadUsers();
            }
        });

        // Search
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.loadUsers();
            }, 300));
        }

        // Role filter
        const roleFilter = document.getElementById('user-role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.loadUsers());
        }
    }

    loadUsers(page = 1) {
        const search = document.getElementById('user-search')?.value || '';
        const roleFilter = document.getElementById('user-role-filter')?.value || '';

        let users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(user => 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        // Filter by role
        if (roleFilter) {
            users = users.filter(user => user.role === roleFilter);
        }

        // Paginate
        const paginationData = paginationManager.paginate(users, page);
        this.renderUsers(paginationData.items);

        // Render pagination
        const paginationContainer = document.getElementById('users-pagination');
        if (paginationContainer) {
            paginationManager.renderPagination(paginationContainer, paginationData, (newPage) => {
                this.loadUsers(newPage);
            });
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr data-id="${user.id}">
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="user-avatar-small">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                        <strong>${user.name}</strong>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${rolePermissions.getRoleName(user.role)}</span>
                </td>
                <td>
                    <span class="status-badge confirmed">Active</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="userManagement.editUser('${user.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="userManagement.resetPassword('${user.id}')" title="Reset Password">
                            <i class="fas fa-key"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                        <button class="btn-icon danger" onclick="userManagement.deleteUser('${user.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showAddUserModal() {
        const content = `
            <form id="add-user-form">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Role *</label>
                    <select name="role" required>
                        <option value="">Select Role</option>
                        <option value="admin">Administrator</option>
                        <option value="dentist">Dentist</option>
                        <option value="patient">Patient</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" required>
                    <small class="password-hint">Must be at least 8 characters</small>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone">
                </div>
                <div class="form-group">
                    <label>Role Title</label>
                    <input type="text" name="roleTitle" placeholder="e.g., Clinic Dentist, Receptionist">
                </div>
            </form>
        `;

        showModal('Add New User', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Create User',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    const form = document.getElementById('add-user-form');
                    const validation = validateForm(form);
                    if (!validation.isValid) {
                        showNotification(validation.errors[0], 'error');
                        return;
                    }

                    const formData = new FormData(form);
                    const userData = Object.fromEntries(formData);

                    // Validate password
                    const passwordValidation = validationManager.validatePassword(userData.password);
                    if (!passwordValidation.isValid) {
                        showNotification(passwordValidation.errors[0], 'error');
                        return;
                    }

                    // Check if email exists
                    const users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');
                    if (users.find(u => u.email === userData.email)) {
                        showNotification('Email already registered', 'error');
                        return;
                    }

                    // Create user
                    const newUser = {
                        id: Date.now().toString(),
                        ...userData,
                        createdAt: new Date().toISOString()
                    };

                    users.push(newUser);
                    localStorage.setItem('toothtrack_users', JSON.stringify(users));

                    // If patient, also create patient record
                    if (userData.role === 'patient') {
                        dataManager.createPatient({
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone
                        });
                    }

                    showNotification('User created successfully', 'success');
                    this.loadUsers();
                }
            }
        ]);
    }

    editUser(id) {
        const users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');
        const user = users.find(u => u.id === id);
        if (!user) return;

        const content = `
            <form id="edit-user-form">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Role *</label>
                    <select name="role" required>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        <option value="dentist" ${user.role === 'dentist' ? 'selected' : ''}>Dentist</option>
                        <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Patient</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value="${user.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Role Title</label>
                    <input type="text" name="roleTitle" value="${user.roleTitle || ''}">
                </div>
            </form>
        `;

        showModal('Edit User', content, [
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
                    const form = document.getElementById('edit-user-form');
                    const formData = new FormData(form);
                    const updates = Object.fromEntries(formData);

                    const users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');
                    const index = users.findIndex(u => u.id === id);
                    if (index !== -1) {
                        users[index] = { ...users[index], ...updates };
                        localStorage.setItem('toothtrack_users', JSON.stringify(users));
                        showNotification('User updated successfully', 'success');
                        this.loadUsers();
                    }
                }
            }
        ]);
    }

    resetPassword(id) {
        const content = `
            <form id="reset-password-form">
                <div class="form-group">
                    <label>New Password *</label>
                    <input type="password" name="password" required>
                    <small class="password-hint">Must be at least 8 characters with uppercase, lowercase, and number</small>
                </div>
                <div class="form-group">
                    <label>Confirm Password *</label>
                    <input type="password" name="confirmPassword" required>
                </div>
            </form>
        `;

        showModal('Reset Password', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            },
            {
                label: 'Reset Password',
                class: 'btn-primary',
                action: 'submit',
                handler: () => {
                    const form = document.getElementById('reset-password-form');
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);

                    if (data.password !== data.confirmPassword) {
                        showNotification('Passwords do not match', 'error');
                        return;
                    }

                    const passwordValidation = validationManager.validatePassword(data.password);
                    if (!passwordValidation.isValid) {
                        showNotification(passwordValidation.errors[0], 'error');
                        return;
                    }

                    const users = JSON.parse(localStorage.getItem('toothtrack_users') || '[]');
                    const index = users.findIndex(u => u.id === id);
                    if (index !== -1) {
                        users[index].password = data.password; // In production, hash this
                        localStorage.setItem('toothtrack_users', JSON.stringify(users));
                        showNotification('Password reset successfully', 'success');
                    }
                }
            }
        ]);
    }

    deleteUser(id) {
        if (typeof dataManager === 'undefined') {
            showNotification('Data manager not available', 'error');
            return;
        }
        
        const user = dataManager.getUser(id);
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        
        if (user.role === 'admin') {
            showNotification('Cannot delete administrator account', 'error');
            return;
        }

        showConfirmation('Are you sure you want to delete this user? This will permanently delete all their appointments, records, and related data.', () => {
            try {
                const deleted = dataManager.deleteUser(id);
                if (deleted) {
                    showNotification('User and all associated data deleted successfully', 'success');
                    this.loadUsers();
                    
                    // Refresh views if they're currently displayed
                    if (typeof viewsHandler !== 'undefined') {
                        viewsHandler.loadAppointments(1);
                        viewsHandler.loadRecords(1);
                        viewsHandler.loadDashboardData();
                        viewsHandler.loadSchedule();
                    }
                } else {
                    showNotification('Failed to delete user', 'error');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                showNotification('Error deleting user: ' + (error.message || 'Unknown error'), 'error');
            }
        });
    }
}

// Initialize user management
const userManagement = new UserManagement();

