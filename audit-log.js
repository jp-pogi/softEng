// Audit Logging System - Track all changes

class AuditLog {
    constructor() {
        this.logs = [];
        this.init();
    }

    init() {
        // Load existing logs
        this.loadLogs();
        
        // Track data changes
        this.setupTracking();
    }

    loadLogs() {
        const stored = localStorage.getItem('toothtrack_audit_logs');
        if (stored) {
            this.logs = JSON.parse(stored);
        }
    }

    saveLogs() {
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        localStorage.setItem('toothtrack_audit_logs', JSON.stringify(this.logs));
    }

    log(action, entity, entityId, details = {}) {
        const user = dataManager.getCurrentUser();
        const logEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user: user ? {
                id: user.id,
                name: user.name,
                role: user.role
            } : null,
            action, // create, update, delete, view, export
            entity, // appointment, patient, record, user, settings
            entityId,
            details,
            ip: 'local', // In production, get from server
            userAgent: navigator.userAgent
        };
        
        this.logs.push(logEntry);
        this.saveLogs();
        
        // Dispatch event for real-time updates
        document.dispatchEvent(new CustomEvent('auditLog', { detail: logEntry }));
    }

    setupTracking() {
        // Wait for dataManager to be initialized
        if (typeof dataManager === 'undefined') {
            setTimeout(() => this.setupTracking(), 100);
            return;
        }

        // Only setup if not already done
        if (dataManager._auditTracked) {
            return;
        }

        // Track appointment changes
        if (dataManager.createAppointment) {
            const originalCreate = dataManager.createAppointment.bind(dataManager);
            dataManager.createAppointment = function(appointment) {
                const result = originalCreate(appointment);
                if (result && typeof auditLog !== 'undefined') {
                    auditLog.log('create', 'appointment', result.id, {
                        patientName: appointment.patientName,
                        service: appointment.service,
                        date: appointment.date,
                        time: appointment.time
                    });
                }
                return result;
            };
        }

        if (dataManager.updateAppointment) {
            const originalUpdate = dataManager.updateAppointment.bind(dataManager);
            dataManager.updateAppointment = function(id, updates) {
                const result = originalUpdate(id, updates);
                if (result && typeof auditLog !== 'undefined') {
                    auditLog.log('update', 'appointment', id, updates);
                }
                return result;
            };
        }

        if (dataManager.deleteAppointment) {
            const originalDelete = dataManager.deleteAppointment.bind(dataManager);
            dataManager.deleteAppointment = function(id) {
                const appointment = this.getAppointment(id);
                const result = originalDelete(id);
                if (result && appointment && typeof auditLog !== 'undefined') {
                    auditLog.log('delete', 'appointment', id, {
                        patientName: appointment.patientName,
                        service: appointment.service
                    });
                }
                return result;
            };
        }

        // Track patient changes
        if (dataManager.createPatient) {
            const originalCreatePatient = dataManager.createPatient.bind(dataManager);
            dataManager.createPatient = function(patient) {
                const result = originalCreatePatient(patient);
                if (result && typeof auditLog !== 'undefined') {
                    auditLog.log('create', 'patient', result.id, {
                        name: patient.name,
                        email: patient.email
                    });
                }
                return result;
            };
        }

        // Track user changes
        if (dataManager.logout) {
            const originalLogout = dataManager.logout.bind(dataManager);
            dataManager.logout = function() {
                const user = this.getCurrentUser();
                if (user && typeof auditLog !== 'undefined') {
                    auditLog.log('logout', 'user', user.id, {
                        name: user.name
                    });
                }
                return originalLogout();
            };
        }

        dataManager._auditTracked = true;
    }

    getLogs(filters = {}) {
        let logs = [...this.logs];
        
        if (filters.userId) {
            logs = logs.filter(log => log.user?.id === filters.userId);
        }
        
        if (filters.entity) {
            logs = logs.filter(log => log.entity === filters.entity);
        }
        
        if (filters.action) {
            logs = logs.filter(log => log.action === filters.action);
        }
        
        if (filters.startDate) {
            logs = logs.filter(log => log.timestamp >= filters.startDate);
        }
        
        if (filters.endDate) {
            logs = logs.filter(log => log.timestamp <= filters.endDate);
        }
        
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    exportLogs() {
        const logs = this.getLogs();
        const csv = this.logsToCSV(logs);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    logsToCSV(logs) {
        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Entity ID', 'Details'];
        const rows = logs.map(log => [
            new Date(log.timestamp).toLocaleString(),
            log.user?.name || 'System',
            log.user?.role || 'N/A',
            log.action,
            log.entity,
            log.entityId || 'N/A',
            JSON.stringify(log.details)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize audit log
const auditLog = new AuditLog();

