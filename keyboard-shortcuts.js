// Keyboard Shortcuts Manager

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            this.handleShortcut(e);
        });

        // Register default shortcuts
        this.registerShortcuts();
    }

    register(keys, callback, description) {
        const key = this.normalizeKeys(keys);
        this.shortcuts.set(key, { callback, description, keys });
    }

    normalizeKeys(keys) {
        return keys.toLowerCase().replace(/\s+/g, '').split('+').sort().join('+');
    }

    handleShortcut(e) {
        // Don't trigger if typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push('ctrl');
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');
        keys.push(e.key.toLowerCase());

        const key = keys.join('+');
        const shortcut = this.shortcuts.get(key);

        if (shortcut) {
            e.preventDefault();
            shortcut.callback(e);
        }
    }

    registerShortcuts() {
        // Navigation shortcuts
        this.register('ctrl+1', () => {
            document.querySelector('[data-view="dashboard"]')?.click();
        }, 'Go to Dashboard');

        this.register('ctrl+2', () => {
            document.querySelector('[data-view="appointments"]')?.click();
        }, 'Go to Appointments');

        this.register('ctrl+3', () => {
            document.querySelector('[data-view="patients"]')?.click();
        }, 'Go to Patients');

        this.register('ctrl+4', () => {
            document.querySelector('[data-view="schedule"]')?.click();
        }, 'Go to Schedule');

        this.register('ctrl+5', () => {
            document.querySelector('[data-view="records"]')?.click();
        }, 'Go to Records');

        this.register('ctrl+6', () => {
            document.querySelector('[data-view="settings"]')?.click();
        }, 'Go to Settings');

        // Action shortcuts
        this.register('ctrl+k', () => {
            const searchInput = document.querySelector('#appointment-search, #patient-search, #record-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 'Focus Search');

        this.register('ctrl+n', () => {
            const addBtn = document.querySelector('#add-appointment-btn, #add-patient-btn, #add-record-btn');
            if (addBtn) addBtn.click();
        }, 'New Item');

        this.register('ctrl+s', (e) => {
            const form = document.querySelector('form:not([style*="display: none"])');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
                if (submitBtn) submitBtn.click();
            }
        }, 'Save');

        this.register('ctrl+e', () => {
            const exportBtn = document.querySelector('#export-appointments-btn, #export-report-btn');
            if (exportBtn) exportBtn.click();
        }, 'Export');

        // Utility shortcuts
        this.register('ctrl+/', () => {
            this.showShortcutsHelp();
        }, 'Show Shortcuts');

        this.register('escape', () => {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.querySelector('.modal-close')?.click();
            }
        }, 'Close Modal');

        // Bulk operations
        this.register('ctrl+a', (e) => {
            const checkbox = document.querySelector('#select-all');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        }, 'Select All');
    }

    showShortcutsHelp() {
        const shortcutsList = Array.from(this.shortcuts.entries())
            .map(([key, data]) => ({
                keys: data.keys,
                description: data.description
            }))
            .sort((a, b) => a.description.localeCompare(b.description));

        const content = `
            <div class="shortcuts-help">
                <h4>Keyboard Shortcuts</h4>
                <div class="shortcuts-list">
                    ${shortcutsList.map(s => `
                        <div class="shortcut-item">
                            <div class="shortcut-keys">
                                ${s.keys.split('+').map(k => `<kbd>${k}</kbd>`).join(' + ')}
                            </div>
                            <div class="shortcut-desc">${s.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        showModal('Keyboard Shortcuts', content, [
            {
                label: 'Close',
                class: 'btn-primary',
                action: 'close',
                handler: () => {}
            }
        ]);
    }

    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            keys: data.keys,
            description: data.description
        }));
    }
}

// Initialize keyboard shortcuts
const keyboardShortcuts = new KeyboardShortcutsManager();

