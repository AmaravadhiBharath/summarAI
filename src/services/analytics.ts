import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_CnQoAhO7LuIZtFrzKlzsMKL3bVmWtGv4sEUgMFnnM4I';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export const initAnalytics = () => {
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false, // Disable autocapture for extensions to be safe/clean
        capture_pageview: false, // We'll manually track views
        persistence: 'localStorage',
        disable_session_recording: true, // Heavy for extensions
    });
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    try {
        posthog.capture(eventName, properties);
    } catch (e) {
        console.error("Analytics Error:", e);
    }
};

export const identifyUser = (userId: string, email?: string) => {
    posthog.identify(userId, { email });
};

export const resetAnalytics = () => {
    posthog.reset();
};
