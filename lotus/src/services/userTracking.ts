
import type { ChromeUser } from './chrome-auth';

const USER_DB_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyeohAlB3zqDoIK1Qtr2K9zClnsIaRxTrDv7k2bx_scTvCJ_F-_KYAZLESl8t8YA8gTEg/exec';

export const trackUserSignup = async (user: ChromeUser) => {
    try {
        const result = await chrome.storage.local.get(['userTrackedEmail']);
        if (result.userTrackedEmail === user.email) {
            return; // Already tracked
        }

        await fetch(USER_DB_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'user_signup',
                name: user.name || 'Unknown',
                email: user.email
            })
        });

        await chrome.storage.local.set({ userTrackedEmail: user.email });
        console.log('User tracked in DB');

    } catch (error) {
        console.error('Failed to track user', error);
    }
};

export const trackHeavyUser = async (email: string, count: number) => {
    try {
        // We use the "Name" column to indicate Heavy User status, and send count
        await fetch(USER_DB_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'heavy_user',
                name: `Heavy User`,
                email: email,
                count: count
            })
        });
    } catch (error) {
        console.error('Failed to track heavy user', error);
    }
};
