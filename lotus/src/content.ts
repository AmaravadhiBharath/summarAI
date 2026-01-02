import { scrapePage } from './core/scraper';

// console.log("Tiger: Content Script Loaded! (vRefactored)");

// SummarAI Content Script - Production Build

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ pong: true });
        return true;
    }

    if (request.action === 'getPageContent') {
        // We use a try-catch to ensure we always send a response
        try {
            console.log("Tiger: Starting scrape...");
            scrapePage({ includeImages: request.includeImages }).then(content => {
                console.log("Tiger: Scrape complete", content);
                sendResponse(content);
            }).catch(error => {
                console.error("Tiger: Scraping failed", error);
                sendResponse(null);
            });
        } catch (error) {
            console.error("Tiger: Scraping failed", error);
            sendResponse(null);
        }
        return true; // Keep channel open for async response
    }
});


