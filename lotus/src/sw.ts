// Background service worker
// console.log("Service Worker: I am awake!");

// Reinforcement 2: Keep-Alive Listener
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "gemini-keep-alive") {
        // console.log("Heartbeat: Worker Stayin' Alive");
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const origin = sender.tab?.url ? new URL(sender.tab.url).origin : "extension-internal";
    console.log(`Service Worker received: ${message.type || message.action} from ${origin}`);

    handleDefaultMessage(message, sender, sendResponse);

    return true; // Keep channel open for async response
});

const handleDefaultMessage = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === "TEST_CONNECTION") {
        sendResponse({ status: "Service Worker received your message!" });
    }

    // Existing injection logic
    if (message.action === 'inject_content_script' && sender.tab?.id) {
        const manifest = chrome.runtime.getManifest();
        const contentScript = manifest.content_scripts?.find(cs => cs.matches?.includes('<all_urls>'))?.js?.[0];

        if (contentScript) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id, allFrames: true },
                files: [contentScript]
            }).then(() => {
                console.log('Content script injected programmatically');
                sendResponse({ success: true });
            }).catch((error) => {
                console.error('Failed to inject:', error);
                sendResponse({ success: false, error: error.message });
            });
        } else {
            sendResponse({ success: false, error: 'Content script not found in manifest' });
        }
    }

    if (message.action === 'scrapingComplete') {
        console.log('Scraping completed:', message.data);
    }
};

console.log('Summarai Service Worker Loaded');

// Setup side panel behavior
// Setup side panel behavior
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error: unknown) => console.error(error));
}

// Fetch latest selectors from backend
const updateSelectors = async () => {
    try {
        const response = await fetch('https://tai-backend.amaravadhibharath.workers.dev/selectors');
        if (response.ok) {
            const selectors = await response.json();
            await chrome.storage.local.set({ 'scraping_config': selectors });
            console.log('Updated scraping selectors');
        }
    } catch (e) {
        console.error('Failed to update selectors:', e);
    }
};

chrome.runtime.onInstalled.addListener(async (details) => {
    // Check if user has seen welcome page
    const { hasSeenWelcome } = await chrome.storage.local.get('hasSeenWelcome');

    // Open if strictly an install OR if they haven't seen it yet (covers dev reloads)
    if (details.reason === 'install' || !hasSeenWelcome) {
        chrome.tabs.create({ url: 'welcome.html' });
        chrome.storage.local.set({ hasSeenWelcome: true });
    }

    // Always update selectors on install/update
    updateSelectors();

    // Auto-inject content script into existing tabs
    const manifest = chrome.runtime.getManifest();
    const contentScript = manifest.content_scripts?.find(cs => cs.matches?.includes('<all_urls>'))?.js?.[0];

    if (contentScript) {
        const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
        for (const tab of tabs) {
            if (tab.id && !tab.url?.startsWith('chrome://') && !tab.url?.startsWith('edge://') && !tab.url?.startsWith('about:')) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id, allFrames: true },
                    files: [contentScript]
                }).catch(err => console.log(`Failed to inject into tab ${tab.id}:`, err));
            }
        }
    }
});

chrome.runtime.onStartup.addListener(() => {
    updateSelectors();
});

// Update every 24 hours
if (chrome.alarms) {
    chrome.alarms.create('updateSelectors', { periodInMinutes: 1440 });
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'updateSelectors') {
            updateSelectors();
        }
    });
}
