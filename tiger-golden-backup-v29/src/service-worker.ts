// Background service worker
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
