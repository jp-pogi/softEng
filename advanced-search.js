// Advanced Search and Filtering System

class AdvancedSearch {
    constructor() {
        this.filters = {
            appointments: {},
            patients: {},
            records: {}
        };
        this.init();
    }

    init() {
        this.setupSearchUI();
        this.setupFilters();
    }

    setupSearchUI() {
        // Add advanced search toggle to existing search boxes
        const addFilterButtons = () => {
            const searchInputs = document.querySelectorAll('#appointment-search, #patient-search, #record-search');
            searchInputs.forEach(input => {
                // Skip if button already exists
                if (input.parentElement.querySelector('.advanced-filter-btn')) {
                    return;
                }
                
                const container = input.parentElement;
                if (!container) return;
                
                const advancedBtn = document.createElement('button');
                advancedBtn.className = 'btn-icon advanced-filter-btn';
                advancedBtn.type = 'button';
                advancedBtn.innerHTML = '<i class="fas fa-filter"></i>';
                advancedBtn.setAttribute('aria-label', 'Advanced filters');
                advancedBtn.setAttribute('data-tooltip', 'Advanced Filters');
                advancedBtn.style.marginLeft = '8px';
                advancedBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showAdvancedFilters(input.id.replace('-search', ''));
                });
                container.appendChild(advancedBtn);
            });
        };

        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addFilterButtons);
        } else {
            addFilterButtons();
        }

        // Also try after a delay in case elements are created dynamically
        setTimeout(addFilterButtons, 500);
    }

    showAdvancedFilters(type) {
        const filters = this.getFiltersForType(type);
        
        const content = `
            <div class="advanced-filters">
                ${type === 'appointment' ? `
                <div class="filter-group">
                    <label>Date Range</label>
                    <div class="date-range">
                        <input type="date" id="filter-start-date" value="${filters.startDate || ''}">
                        <span>to</span>
                        <input type="date" id="filter-end-date" value="${filters.endDate || ''}">
                    </div>
                </div>
                <div class="filter-group">
                    <label>Status</label>
                    <select id="filter-status" multiple>
                        <option value="pending" ${filters.status?.includes('pending') ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${filters.status?.includes('confirmed') ? 'selected' : ''}>Confirmed</option>
                        <option value="in-progress" ${filters.status?.includes('in-progress') ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${filters.status?.includes('completed') ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${filters.status?.includes('cancelled') ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Service</label>
                    <select id="filter-service">
                        <option value="">All Services</option>
                        <option value="Dental Cleaning">Dental Cleaning</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Tooth Filling">Tooth Filling</option>
                        <option value="Tooth Extraction">Tooth Extraction</option>
                        <option value="Root Canal">Root Canal</option>
                        <option value="Braces Consultation">Braces Consultation</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Dentist</label>
                    <input type="text" id="filter-dentist" value="${filters.dentist || ''}" placeholder="Filter by dentist">
                </div>
                ` : ''}
                
                ${type === 'patient' ? `
                <div class="filter-group">
                    <label>Date Joined</label>
                    <div class="date-range">
                        <input type="date" id="filter-start-date" value="${filters.startDate || ''}">
                        <span>to</span>
                        <input type="date" id="filter-end-date" value="${filters.endDate || ''}">
                    </div>
                </div>
                <div class="filter-group">
                    <label>Has Email</label>
                    <select id="filter-has-email">
                        <option value="">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Has Phone</label>
                    <select id="filter-has-phone">
                        <option value="">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                ` : ''}
                
                ${type === 'record' ? `
                <div class="filter-group">
                    <label>Date Range</label>
                    <div class="date-range">
                        <input type="date" id="filter-start-date" value="${filters.startDate || ''}">
                        <span>to</span>
                        <input type="date" id="filter-end-date" value="${filters.endDate || ''}">
                    </div>
                </div>
                <div class="filter-group">
                    <label>Treatment Type</label>
                    <input type="text" id="filter-treatment" value="${filters.treatment || ''}" placeholder="Filter by treatment">
                </div>
                <div class="filter-group">
                    <label>Dentist</label>
                    <input type="text" id="filter-dentist" value="${filters.dentist || ''}" placeholder="Filter by dentist">
                </div>
                ` : ''}
            </div>
        `;

        const modal = showModal('Advanced Filters', content, [
            {
                label: 'Clear',
                class: 'btn-outline',
                action: 'clear',
                handler: () => {
                    this.clearFilters(type);
                }
            },
            {
                label: 'Apply Filters',
                class: 'btn-primary',
                action: 'apply',
                handler: () => {
                    this.applyFilters(type, modal);
                }
            }
        ]);
    }

    getFiltersForType(type) {
        const key = type === 'appointment' ? 'appointments' : 
                   type === 'patient' ? 'patients' : 
                   type === 'record' ? 'records' : type + 's';
        return this.filters[key] || {};
    }

    applyFilters(type, modal) {
        const filters = {};
        
        if (type === 'appointment') {
            const startDate = document.getElementById('filter-start-date')?.value;
            const endDate = document.getElementById('filter-end-date')?.value;
            const statusSelect = document.getElementById('filter-status');
            const status = statusSelect ? Array.from(statusSelect.selectedOptions).map(opt => opt.value) : [];
            const service = document.getElementById('filter-service')?.value;
            const dentist = document.getElementById('filter-dentist')?.value;
            
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (status.length > 0) filters.status = status;
            if (service) filters.service = service;
            if (dentist) filters.dentist = dentist;
        } else if (type === 'patient') {
            const startDate = document.getElementById('filter-start-date')?.value;
            const endDate = document.getElementById('filter-end-date')?.value;
            const hasEmail = document.getElementById('filter-has-email')?.value;
            const hasPhone = document.getElementById('filter-has-phone')?.value;
            
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (hasEmail) filters.hasEmail = hasEmail;
            if (hasPhone) filters.hasPhone = hasPhone;
        } else if (type === 'record') {
            const startDate = document.getElementById('filter-start-date')?.value;
            const endDate = document.getElementById('filter-end-date')?.value;
            const treatment = document.getElementById('filter-treatment')?.value;
            const dentist = document.getElementById('filter-dentist')?.value;
            
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (treatment) filters.treatment = treatment;
            if (dentist) filters.dentist = dentist;
        }
        
        const key = type === 'appointment' ? 'appointments' : 
                   type === 'patient' ? 'patients' : 
                   type === 'record' ? 'records' : type + 's';
        this.filters[key] = filters;
        
        if (typeof closeModal !== 'undefined' && modal) {
            closeModal(modal);
        }
        
        // Trigger view refresh
        document.dispatchEvent(new CustomEvent('filtersChanged', { 
            detail: { type, filters } 
        }));
        
        if (typeof showNotification !== 'undefined') {
            showNotification('Filters applied', 'success');
        }
    }

    clearFilters(type) {
        const key = type === 'appointment' ? 'appointments' : 
                   type === 'patient' ? 'patients' : 
                   type === 'record' ? 'records' : type + 's';
        this.filters[key] = {};
        
        if (typeof showNotification !== 'undefined') {
            showNotification('Filters cleared', 'info');
        }
        // Trigger view refresh
        document.dispatchEvent(new CustomEvent('filtersChanged', { 
            detail: { type, filters: {} } 
        }));
    }

    filterData(data, type) {
        if (!data || !Array.isArray(data)) return data;
        
        const key = type === 'appointment' ? 'appointments' : 
                   type === 'patient' ? 'patients' : 
                   type === 'record' ? 'records' : type + 's';
        const filters = this.filters[key] || {};
        if (Object.keys(filters).length === 0) return data;
        
        return data.filter(item => {
            if (type === 'appointment') {
                if (filters.startDate && item.date < filters.startDate) return false;
                if (filters.endDate && item.date > filters.endDate) return false;
                if (filters.status && !filters.status.includes(item.status)) return false;
                if (filters.service && item.service !== filters.service) return false;
                if (filters.dentist && item.dentist && !item.dentist.toLowerCase().includes(filters.dentist.toLowerCase())) return false;
            } else if (type === 'patient') {
                if (filters.startDate && item.createdAt && item.createdAt < filters.startDate) return false;
                if (filters.endDate && item.createdAt && item.createdAt > filters.endDate) return false;
                if (filters.hasEmail === 'yes' && !item.email) return false;
                if (filters.hasEmail === 'no' && item.email) return false;
                if (filters.hasPhone === 'yes' && !item.phone) return false;
                if (filters.hasPhone === 'no' && item.phone) return false;
            } else if (type === 'record') {
                if (filters.startDate && item.date < filters.startDate) return false;
                if (filters.endDate && item.date > filters.endDate) return false;
                if (filters.treatment && item.treatment && !item.treatment.toLowerCase().includes(filters.treatment.toLowerCase())) return false;
                if (filters.dentist && item.dentist && !item.dentist.toLowerCase().includes(filters.dentist.toLowerCase())) return false;
            }
            return true;
        });
    }

    setupFilters() {
        document.addEventListener('filtersChanged', (e) => {
            const { type } = e.detail;
            if (type === 'appointment' && typeof viewsHandler !== 'undefined') {
                viewsHandler.loadAppointments(1);
            } else if (type === 'patient' && typeof viewsHandler !== 'undefined') {
                viewsHandler.loadPatients(1);
            } else if (type === 'record' && typeof viewsHandler !== 'undefined') {
                viewsHandler.loadRecords(1);
            }
        });
    }
}

// Initialize advanced search
const advancedSearch = new AdvancedSearch();

