const POSTHOG_KEY = 'phc_CnQoAhO7LuIZtFrzKlzsMKL3bVmWtGv4sEUgMFnnM4I';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let isInitialized = false;
const ANALYTICS_ENABLED = true;
let currentUserId: string | null = null;

export const initAnalytics = () => {
    if (!ANALYTICS_ENABLED) return;
    isInitialized = true;
    // No initialization needed for fetch-based approach
};

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
    if (!ANALYTICS_ENABLED || !isInitialized) return;

    try {
        const payload = {
            api_key: POSTHOG_KEY,
            event: eventName,
            properties: {
                distinct_id: currentUserId || 'anonymous_user',
                $lib: 'summarai-extension',
                ...properties
            },
            timestamp: new Date().toISOString()
        };

        await fetch(`${POSTHOG_HOST}/capture/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        // Silently fail for analytics
        console.warn("Analytics Error:", e);
    }
};

export const identifyUser = (userId: string, email?: string) => {
    if (!ANALYTICS_ENABLED) return;
    currentUserId = userId;

    if (email) {
        trackEvent('$identify', {
            $set: { email }
        });
    }
};

export const resetAnalytics = () => {
    currentUserId = null;
};
