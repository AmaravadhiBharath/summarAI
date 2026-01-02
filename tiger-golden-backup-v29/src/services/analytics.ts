import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_CnQoAhO7LuIZtFrzKlzsMKL3bVmWtGv4sEUgMFnnM4I';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let isInitialized = false;
const ANALYTICS_ENABLED = true; // Enabled for PostHog

export const initAnalytics = () => {
    if (!ANALYTICS_ENABLED) return;
    if (isInitialized) return;

    try {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: false,
            capture_pageview: false,
            persistence: 'localStorage',
            disable_session_recording: true,
            advanced_disable_decide: true, // PREVENTS LOADING EXTERNAL SCRIPTS (Surveys, Toolbar, etc.)
            disable_compression: true, // Optional: helps with some CSP issues
        });
        isInitialized = true;
    } catch (e) {
        console.error("Analytics Init Error:", e);
    }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!ANALYTICS_ENABLED) return;

    try {
        if (!isInitialized) {
            console.warn("Analytics not initialized, skipping event:", eventName);
            return;
        }
        posthog.capture(eventName, properties);
    } catch (e) {
        console.error("Analytics Error:", e);
    }
};

export const identifyUser = (userId: string, email?: string) => {
    if (!ANALYTICS_ENABLED) return;

    try {
        if (!isInitialized) return;
        posthog.identify(userId, { email });
    } catch (e) {
        console.error("Analytics Identify Error:", e);
    }
};

export const resetAnalytics = () => {
    if (!ANALYTICS_ENABLED) return;

    try {
        if (!isInitialized) return;
        posthog.reset();
    } catch (e) {
        console.error("Analytics Reset Error:", e);
    }
};
