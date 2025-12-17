// Background service worker
console.log('Summarai Service Worker Loaded');

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'welcome.html' });
    }
});

// Setup side panel behavior
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error));
