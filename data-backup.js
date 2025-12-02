// Data Backup and Restore Manager

class DataBackupManager {
    constructor() {
        this.backupPrefix = 'toothtrack_backup_';
    }

    exportAllData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            appointments: JSON.parse(localStorage.getItem('toothtrack_appointments') || '[]'),
            patients: JSON.parse(localStorage.getItem('toothtrack_patients') || '[]'),
            records: JSON.parse(localStorage.getItem('toothtrack_records') || '[]'),
            users: JSON.parse(localStorage.getItem('toothtrack_users') || '[]'),
            settings: JSON.parse(localStorage.getItem('toothtrack_settings') || '{}')
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toothtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification('All data exported successfully', 'success');
        return data;
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!this.validateBackupData(data)) {
                        reject(new Error('Invalid backup file format'));
                        return;
                    }

                    // Show confirmation
                    showConfirmation(
                        `This will replace all current data. Are you sure you want to continue?`,
                        () => {
                            try {
                                // Backup current data first
                                this.createAutoBackup();

                                // Import new data
                                if (data.appointments) {
                                    localStorage.setItem('toothtrack_appointments', JSON.stringify(data.appointments));
                                }
                                if (data.patients) {
                                    localStorage.setItem('toothtrack_patients', JSON.stringify(data.patients));
                                }
                                if (data.records) {
                                    localStorage.setItem('toothtrack_records', JSON.stringify(data.records));
                                }
                                if (data.users) {
                                    localStorage.setItem('toothtrack_users', JSON.stringify(data.users));
                                }
                                if (data.settings) {
                                    localStorage.setItem('toothtrack_settings', JSON.stringify(data.settings));
                                }

                                showNotification('Data imported successfully', 'success');
                                
                                // Reload page to reflect changes
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1500);

                                resolve(data);
                            } catch (error) {
                                reject(error);
                            }
                        },
                        () => {
                            reject(new Error('Import cancelled'));
                        }
                    );
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    }

    validateBackupData(data) {
        return data && 
               typeof data === 'object' && 
               (data.appointments !== undefined || 
                data.patients !== undefined || 
                data.records !== undefined);
    }

    createAutoBackup() {
        const backup = {
            version: '1.0',
            backupDate: new Date().toISOString(),
            appointments: JSON.parse(localStorage.getItem('toothtrack_appointments') || '[]'),
            patients: JSON.parse(localStorage.getItem('toothtrack_patients') || '[]'),
            records: JSON.parse(localStorage.getItem('toothtrack_records') || '[]'),
            users: JSON.parse(localStorage.getItem('toothtrack_users') || '[]'),
            settings: JSON.parse(localStorage.getItem('toothtrack_settings') || '{}')
        };

        // Store in localStorage (keep last 5 backups)
        const backups = this.getAutoBackups();
        backups.push(backup);
        
        // Keep only last 5
        if (backups.length > 5) {
            backups.shift();
        }

        localStorage.setItem('toothtrack_auto_backups', JSON.stringify(backups));
    }

    getAutoBackups() {
        return JSON.parse(localStorage.getItem('toothtrack_auto_backups') || '[]');
    }

    restoreAutoBackup(backupIndex) {
        const backups = this.getAutoBackups();
        if (backupIndex >= 0 && backupIndex < backups.length) {
            const backup = backups[backupIndex];
            
            showConfirmation(
                `Restore backup from ${new Date(backup.backupDate).toLocaleString()}?`,
                () => {
                    if (backup.appointments) {
                        localStorage.setItem('toothtrack_appointments', JSON.stringify(backup.appointments));
                    }
                    if (backup.patients) {
                        localStorage.setItem('toothtrack_patients', JSON.stringify(backup.patients));
                    }
                    if (backup.records) {
                        localStorage.setItem('toothtrack_records', JSON.stringify(backup.records));
                    }
                    if (backup.users) {
                        localStorage.setItem('toothtrack_users', JSON.stringify(backup.users));
                    }
                    if (backup.settings) {
                        localStorage.setItem('toothtrack_settings', JSON.stringify(backup.settings));
                    }

                    showNotification('Backup restored successfully', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            );
        }
    }

    showBackupRestoreUI() {
        const backups = this.getAutoBackups();
        
        const content = `
            <div class="backup-restore-ui">
                <div class="backup-section">
                    <h4>Export Data</h4>
                    <p>Export all data to a JSON file for backup</p>
                    <button class="btn btn-primary" onclick="dataBackup.exportAllData()">
                        <i class="fas fa-download"></i> Export All Data
                    </button>
                </div>
                
                <div class="restore-section">
                    <h4>Import Data</h4>
                    <p>Import data from a backup JSON file</p>
                    <input type="file" id="import-file" accept=".json" style="display: none;">
                    <button class="btn btn-outline" onclick="document.getElementById('import-file').click()">
                        <i class="fas fa-upload"></i> Choose File
                    </button>
                    <div id="import-file-name" style="margin-top: 10px; color: #6B7280;"></div>
                </div>

                ${backups.length > 0 ? `
                <div class="auto-backups-section">
                    <h4>Auto Backups</h4>
                    <p>Recent automatic backups</p>
                    <div class="backups-list">
                        ${backups.map((backup, index) => `
                            <div class="backup-item">
                                <div class="backup-info">
                                    <strong>Backup ${backups.length - index}</strong>
                                    <small>${new Date(backup.backupDate).toLocaleString()}</small>
                                </div>
                                <button class="btn btn-sm btn-primary" onclick="dataBackup.restoreAutoBackup(${index})">
                                    <i class="fas fa-undo"></i> Restore
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        const modal = showModal('Data Backup & Restore', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'close',
                handler: () => {}
            }
        ]);

        // Handle file input
        setTimeout(() => {
            const fileInput = document.getElementById('import-file');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        document.getElementById('import-file-name').textContent = file.name;
                        dataBackup.importData(file).catch(error => {
                            showNotification(error.message || 'Import failed', 'error');
                        });
                    }
                });
            }
        }, 100);
    }
}

// Global data backup manager
const dataBackup = new DataBackupManager();

