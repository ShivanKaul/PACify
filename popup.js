const proxyTypeSelect = document.getElementById('proxy-type');
const proxyUrlInput = document.getElementById('proxy-url');
const proxyUsernameInput = document.getElementById('proxy-username');
const proxyPasswordInput = document.getElementById('proxy-password');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-btn');

let isEnabled = false;
let activeSettings = null; // Settings currently in use when proxy is enabled

// Load saved settings.
function loadSettings() {
    chrome.storage.local.get(
        ['proxyType', 'proxyUrl', 'proxyUsername', 'proxyPassword'],
        (result) => {
            proxyTypeSelect.value = result.proxyType || 'PROXY';
            proxyUrlInput.value = result.proxyUrl || '';
            proxyUsernameInput.value = result.proxyUsername || '';
            proxyPasswordInput.value = result.proxyPassword || '';
        }
    );
}

// Save settings on change.
function saveSettings() {
    chrome.storage.local.set({
        proxyType: proxyTypeSelect.value,
        proxyUrl: proxyUrlInput.value,
        proxyUsername: proxyUsernameInput.value,
        proxyPassword: proxyPasswordInput.value
    });
}

// Check if current settings differ from active settings.
function hasSettingsChanged() {
    if (!activeSettings) return false;
    return (
        proxyTypeSelect.value !== activeSettings.proxyType ||
        proxyUrlInput.value !== activeSettings.proxyUrl ||
        proxyUsernameInput.value !== activeSettings.proxyUsername ||
        proxyPasswordInput.value !== activeSettings.proxyPassword
    );
}

// Update button text based on current state.
function updateButtonState() {
    if (!isEnabled) {
        toggleBtn.textContent = 'Enable Proxy';
        toggleBtn.className = 'toggle-btn';
    } else if (hasSettingsChanged()) {
        toggleBtn.textContent = 'Apply Changes';
        toggleBtn.className = 'toggle-btn'; // Blue (default)
    } else {
        toggleBtn.textContent = 'Disable Proxy';
        toggleBtn.className = 'toggle-btn enabled'; // Red
    }
}

// Update UI based on proxy status.
function updateUI(enabled) {
    isEnabled = enabled;
    statusEl.textContent = enabled ? 'Enabled' : 'Disabled';
    statusEl.className = 'status-value ' + (enabled ? 'enabled' : 'disabled');

    if (enabled && !activeSettings) {
        // Store the settings that were just enabled
        activeSettings = {
            proxyType: proxyTypeSelect.value,
            proxyUrl: proxyUrlInput.value,
            proxyUsername: proxyUsernameInput.value,
            proxyPassword: proxyPasswordInput.value
        };
    } else if (!enabled) {
        activeSettings = null;
    }

    updateButtonState();
    toggleBtn.disabled = false;
}

// Get proxy status from background.
function getStatus() {
    chrome.runtime.sendMessage({ action: 'status' }, (response) => {
        updateUI(response.enabled);
    });
}

// Event listeners for saving on change.
proxyTypeSelect.addEventListener('change', () => {
    saveSettings();
    updateButtonState();
});
proxyUrlInput.addEventListener('change', () => {
    saveSettings();
    updateButtonState();
});
proxyUsernameInput.addEventListener('change', () => {
    saveSettings();
    updateButtonState();
});
proxyPasswordInput.addEventListener('change', () => {
    saveSettings();
    updateButtonState();
});

// Also update button on input (before change event fires).
proxyTypeSelect.addEventListener('input', updateButtonState);
proxyUrlInput.addEventListener('input', updateButtonState);
proxyUsernameInput.addEventListener('input', updateButtonState);
proxyPasswordInput.addEventListener('input', updateButtonState);

// Toggle button.
toggleBtn.addEventListener('click', () => {
    toggleBtn.disabled = true;
    toggleBtn.textContent = 'Updating...';

    if (isEnabled && !hasSettingsChanged()) {
        // Disable proxy
        chrome.runtime.sendMessage({ action: 'disable' }, () => {
            getStatus();
        });
    } else {
        // Enable or apply changes (re-enable with new settings)
        saveSettings();
        activeSettings = null; // Clear so updateUI stores new settings
        chrome.runtime.sendMessage({
            action: 'enable',
            proxyType: proxyTypeSelect.value,
            proxyUrl: proxyUrlInput.value
        }, () => {
            getStatus();
        });
    }
});

// Initialize.
loadSettings();
getStatus();
