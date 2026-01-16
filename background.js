// Proxy type options: PROXY (HTTP), HTTPS, SOCKS4, SOCKS5.
function createPACScript(proxyType, proxyUrl) {
    if (!proxyUrl) {
        return 'function FindProxyForURL(url, host) { return "DIRECT"; }';
    }
    return `function FindProxyForURL(url, host) { return "${proxyType} ${proxyUrl}"; }`;
}

// Enable the proxy with the given type, URL, and credentials.
function enableProxy(proxyType, proxyUrl, proxyUsername) {
    const pacScript = createPACScript(proxyType, proxyUrl);
    console.log('=== Proxy Enabled ===');
    console.log('Type:', proxyType);
    console.log('URL:', proxyUrl);
    console.log('Username:', proxyUsername || '(none)');
    console.log('PAC Script:', pacScript);
    console.log('=====================');

    return chrome.proxy.settings.set({
        value: {
            mode: 'pac_script',
            pacScript: { data: pacScript },
        },
        scope: 'regular',
    });
}

function disableProxy() {
    console.log('=== Proxy Disabled ===');
    return chrome.proxy.settings.set({
        value: { mode: 'direct' },
        scope: 'regular',
    });
}

function getProxyStatus() {
    return new Promise((resolve) => {
        chrome.proxy.settings.get({ incognito: false }, (details) => {
            const isEnabled = details.value.mode === 'pac_script';
            resolve({ enabled: isEnabled, details: details.value });
        });
    });
}

// Handle proxy authentication.
chrome.webRequest.onAuthRequired.addListener(
    (details, callback) => {
        chrome.storage.local.get(['proxyUsername', 'proxyPassword'], (result) => {
            if (result.proxyUsername && result.proxyPassword) {
                console.log('=== Proxy Auth ===');
                console.log('Providing credentials for:', details.challenger?.host);
                callback({
                    authCredentials: {
                        username: result.proxyUsername,
                        password: result.proxyPassword
                    }
                });
            } else {
                console.log('No credentials saved, letting browser prompt');
                callback({});
            }
        });
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
);

// Message handler.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'enable') {
        chrome.storage.local.get(['proxyUsername'], (result) => {
            enableProxy(message.proxyType, message.proxyUrl, result.proxyUsername).then(() => {
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (message.action === 'disable') {
        disableProxy().then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (message.action === 'status') {
        getProxyStatus().then((status) => {
            sendResponse(status);
        });
        return true;
    }
});
