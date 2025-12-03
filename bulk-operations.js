// Bulk Operations Manager

class BulkOperationsManager {
    constructor() {
        this.selectedItems = new Set();
    }

    initCheckboxes(container, items, onSelectionChange) {
        if (!container) return;

        // Add select all checkbox in header if table
        const table = container.closest('table');
        if (table) {
            const thead = table.querySelector('thead tr');
            if (thead && !thead.querySelector('.select-all-checkbox')) {
                const firstCell = thead.querySelector('th');
                if (firstCell) {
                    const checkbox = document.createElement('th');
                    checkbox.className = 'select-all-checkbox';
                    checkbox.innerHTML = `
                        <input type="checkbox" id="select-all" title="Select All">
                    `;
                    checkbox.style.width = '40px';
                    thead.insertBefore(checkbox, firstCell);

                    checkbox.querySelector('input').addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        container.querySelectorAll('.item-checkbox').forEach(cb => {
                            cb.checked = isChecked;
                            const itemId = cb.getAttribute('data-id');
                            if (isChecked) {
                                this.selectedItems.add(itemId);
                            } else {
                                this.selectedItems.delete(itemId);
                            }
                        });
                        this.updateBulkActions(container, onSelectionChange);
                    });
                }
            }
        }

        // Add checkboxes to items
        container.querySelectorAll('tr, .patient-card, .record-card').forEach((item, index) => {
            if (!item.querySelector('.item-checkbox')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'item-checkbox';
                checkbox.setAttribute('data-id', item.getAttribute('data-id') || `item-${index}`);
                
                checkbox.addEventListener('change', (e) => {
                    const itemId = checkbox.getAttribute('data-id');
                    if (e.target.checked) {
                        this.selectedItems.add(itemId);
                    } else {
                        this.selectedItems.delete(itemId);
                    }
                    this.updateBulkActions(container, onSelectionChange);
                });

                if (item.tagName === 'TR') {
                    const firstCell = item.querySelector('td');
                    if (firstCell) {
                        const checkboxCell = document.createElement('td');
                        checkboxCell.appendChild(checkbox);
                        checkboxCell.style.width = '40px';
                        item.insertBefore(checkboxCell, firstCell);
                    }
                } else {
                    item.insertBefore(checkbox, item.firstChild);
                    checkbox.style.marginRight = '10px';
                }
            }
        });
    }

    updateBulkActions(container, onSelectionChange) {
        const count = this.selectedItems.size;
        
        // Remove existing bulk actions bar
        const existingBar = document.querySelector('.bulk-actions-bar');
        if (existingBar) {
            existingBar.remove();
        }

        if (count > 0) {
            const bar = document.createElement('div');
            bar.className = 'bulk-actions-bar';
            bar.innerHTML = `
                <div class="bulk-actions-info">
                    <strong>${count}</strong> item${count > 1 ? 's' : ''} selected
                </div>
                <div class="bulk-actions-buttons">
                    <button class="btn btn-sm btn-outline" onclick="bulkOps.clearSelection()">
                        <i class="fas fa-times"></i> Clear
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="bulkOps.showBulkActions()">
                        <i class="fas fa-tasks"></i> Actions
                    </button>
                </div>
            `;

            const viewContainer = container.closest('.content-view');
            if (viewContainer) {
                viewContainer.insertBefore(bar, viewContainer.firstChild);
            }

            if (onSelectionChange) {
                onSelectionChange(Array.from(this.selectedItems));
            }
        }
    }

    clearSelection() {
        this.selectedItems.clear();
        document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('#select-all').forEach(cb => cb.checked = false);
        const bar = document.querySelector('.bulk-actions-bar');
        if (bar) bar.remove();
    }

    getSelectedItems() {
        return Array.from(this.selectedItems);
    }

    showBulkActions() {
        const selected = this.getSelectedItems();
        if (selected.length === 0) {
            showNotification('No items selected', 'warning');
            return;
        }

        const currentView = document.querySelector('.content-view.active');
        const viewId = currentView ? currentView.id : '';

        const actions = [];

        if (viewId.includes('appointment')) {
            actions.push(
                { label: 'Mark as Confirmed', action: 'confirm', icon: 'fa-check' },
                { label: 'Mark as Completed', action: 'complete', icon: 'fa-check-circle' },
                { label: 'Mark as Cancelled', action: 'cancel', icon: 'fa-times' },
                { label: 'Delete Selected', action: 'delete', icon: 'fa-trash', danger: true }
            );
        } else if (viewId.includes('patient')) {
            actions.push(
                { label: 'Delete Selected', action: 'delete', icon: 'fa-trash', danger: true },
                { label: 'Export Selected', action: 'export', icon: 'fa-download' }
            );
        } else if (viewId.includes('record')) {
            actions.push(
                { label: 'Delete Selected', action: 'delete', icon: 'fa-trash', danger: true },
                { label: 'Export Selected', action: 'export', icon: 'fa-download' }
            );
        }

        const content = `
            <div class="bulk-actions-list">
                ${actions.map(action => `
                    <button class="bulk-action-item ${action.danger ? 'danger' : ''}" 
                            data-action="${action.action}">
                        <i class="fas ${action.icon}"></i>
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;

        const modal = showModal('Bulk Actions', content, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                action: 'cancel',
                handler: () => {}
            }
        ]);

        // Add action handlers
        setTimeout(() => {
            modal.querySelectorAll('.bulk-action-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    this.executeBulkAction(action, selected);
                    closeModal(modal);
                });
            });
        }, 100);
    }

    executeBulkAction(action, selectedIds) {
        const user = dataManager.getCurrentUser();
        
        // Check permissions
        if (action === 'delete' && !rolePermissions.canPerformAction(user, 'bulkDelete')) {
            showNotification('You do not have permission to delete items', 'error');
            return;
        }
        if ((action === 'confirm' || action === 'complete' || action === 'cancel') && 
            !rolePermissions.canPerformAction(user, 'bulkUpdate')) {
            showNotification('You do not have permission to update items', 'error');
            return;
        }
        
        switch(action) {
            case 'delete':
                showConfirmation(`Delete ${selectedIds.length} item(s)? This action cannot be undone.`, () => {
                    const currentView = document.querySelector('.content-view.active');
                    let deleted = 0;
                    
                    selectedIds.forEach(id => {
                        try {
                            // Determine type and delete
                            if (currentView?.id === 'appointments-view') {
                                if (dataManager.deleteAppointment(id)) deleted++;
                            } else if (currentView?.id === 'patients-view') {
                                if (dataManager.deletePatient(id)) deleted++;
                            } else if (currentView?.id === 'records-view') {
                                if (dataManager.deleteRecord(id)) deleted++;
                            }
                        } catch (error) {
                            console.error('Error deleting item:', error);
                        }
                    });
                    
                    this.clearSelection();
                    showNotification(`${deleted} item(s) deleted successfully`, 'success');
                    
                    // Refresh current view
                    const viewName = currentView?.id.replace('-view', '');
                    if (viewName && typeof viewsHandler !== 'undefined') {
                        if (viewName === 'appointments') viewsHandler.loadAppointments(1);
                        else if (viewName === 'patients') viewsHandler.loadPatients(1);
                        else if (viewName === 'records') viewsHandler.loadRecords(1);
                    }
                });
                break;
            case 'confirm':
                let confirmCount = 0;
                selectedIds.forEach(id => {
                    const appointment = dataManager.getAppointment(id);
                    // Don't change completed or cancelled appointments
                    if (appointment && appointment.status !== 'completed' && appointment.status !== 'cancelled') {
                        dataManager.updateAppointment(id, { status: 'confirmed' });
                        // Notify patient of confirmation
                        if (typeof viewsHandler !== 'undefined' && viewsHandler.notifyPatientOfStatusChange) {
                            viewsHandler.notifyPatientOfStatusChange(id, 'confirmed', appointment);
                        }
                        confirmCount++;
                    }
                });
                this.clearSelection();
                if (confirmCount > 0) {
                    showNotification(`${confirmCount} appointment(s) confirmed`, 'success');
                    if (confirmCount < selectedIds.length) {
                        showNotification(`${selectedIds.length - confirmCount} appointment(s) skipped (completed/cancelled cannot be changed)`, 'warning');
                    }
                } else {
                    showNotification('No appointments could be confirmed. Completed/cancelled appointments cannot be changed.', 'warning');
                }
                // Refresh appointments view
                if (typeof viewsHandler !== 'undefined') {
                    viewsHandler.loadAppointments(1);
                    // Refresh schedule if visible
                    if (document.getElementById('schedule-view')?.classList.contains('active')) {
                        viewsHandler.loadSchedule();
                    }
                }
                break;
            case 'complete':
                // For bulk complete, show completion modal for single appointment
                // For multiple, inform user they need to complete individually
                if (selectedIds.length === 1) {
                    const appointment = dataManager.getAppointment(selectedIds[0]);
                    if (appointment && appointment.status !== 'completed' && appointment.status !== 'cancelled') {
                        this.clearSelection();
                        if (typeof viewsHandler !== 'undefined' && viewsHandler.showCompleteAppointmentModal) {
                            viewsHandler.showCompleteAppointmentModal(selectedIds[0], appointment);
                        } else {
                            // Fallback: direct update (but should create record)
                            dataManager.updateAppointment(selectedIds[0], { status: 'completed' });
                            showNotification('Appointment marked as completed. Please add treatment notes by editing the appointment.', 'warning');
                            if (typeof viewsHandler !== 'undefined') {
                                viewsHandler.loadAppointments(1);
                            }
                        }
                    } else {
                        showNotification('This appointment is already completed or cancelled.', 'warning');
                        this.clearSelection();
                    }
                } else {
                    // Multiple appointments - inform user they need to complete individually
                    showNotification('To mark appointments as completed, please complete them individually to add treatment notes for each patient.', 'info');
                    this.clearSelection();
                }
                break;
            case 'cancel':
                let cancelCount = 0;
                selectedIds.forEach(id => {
                    const appointment = dataManager.getAppointment(id);
                    // Don't change completed appointments (they're final)
                    if (appointment && appointment.status !== 'completed') {
                        dataManager.updateAppointment(id, { status: 'cancelled' });
                        cancelCount++;
                        
                        // Notify patient of cancellation
                        if (typeof viewsHandler !== 'undefined' && viewsHandler.notifyPatientOfStatusChange) {
                            viewsHandler.notifyPatientOfStatusChange(id, 'cancelled', appointment);
                        }
                        
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
                                    message: `${appointment.patientName}'s appointment for ${appointment.service} on ${appointment.date} at ${appointment.time} has been cancelled.`,
                                    relatedId: id,
                                    relatedType: 'appointment'
                                });
                            }
                        }
                    }
                });
                this.clearSelection();
                if (cancelCount > 0) {
                    showNotification(`${cancelCount} appointment(s) cancelled`, 'success');
                    if (cancelCount < selectedIds.length) {
                        showNotification(`${selectedIds.length - cancelCount} appointment(s) skipped (completed appointments cannot be cancelled)`, 'warning');
                    }
                    
                    // Update notification badge
                    if (typeof updateNotificationBadge === 'function') {
                        updateNotificationBadge();
                    }
                } else {
                    showNotification('No appointments could be cancelled. Completed appointments cannot be changed.', 'warning');
                }
                // Refresh appointments view
                if (typeof viewsHandler !== 'undefined') {
                    viewsHandler.loadAppointments(1);
                    // Refresh schedule if visible
                    if (document.getElementById('schedule-view')?.classList.contains('active')) {
                        viewsHandler.loadSchedule();
                    }
                }
                break;
            case 'export':
                // Export selected items
                const currentView = document.querySelector('.content-view.active');
                let data = [];
                if (currentView.id.includes('appointment')) {
                    data = selectedIds.map(id => dataManager.getAppointment(id)).filter(Boolean);
                } else if (currentView.id.includes('patient')) {
                    data = selectedIds.map(id => dataManager.getPatient(id)).filter(Boolean);
                } else if (currentView.id.includes('record')) {
                    data = selectedIds.map(id => dataManager.getRecords().find(r => r.id === id)).filter(Boolean);
                }
                exportToCSV(data, `export-${Date.now()}.csv`);
                this.clearSelection();
                break;
        }
    }
}

// Global bulk operations manager
const bulkOps = new BulkOperationsManager();

