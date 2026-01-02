import toast from 'react-hot-toast';

// Chrome Identity API - NO Firebase Auth
// This is the ONLY auth method for the extension

export interface ChromeUser {
    email: string;
    id: string;
    name: string;
    picture: string;
}

let currentUser: ChromeUser | null = null;
const authListeners: ((user: ChromeUser | null) => void)[] = [];

// Get auth token using chrome.identity
const getAuthToken = (interactive: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result && typeof result === 'string') {
                resolve(result);
            } else if (result && typeof result === 'object' && 'token' in result) {
                resolve((result as any).token);
            } else {
                reject(new Error('No token received'));
            }
        });
    });
};

// Get user info from Google API using token
const getUserInfo = async (token: string): Promise<ChromeUser> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return {
        email: data.email,
        id: data.id,
        name: data.name,
        picture: data.picture
    };
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<ChromeUser> => {
    try {
        // Clear any cached token first
        await clearCachedToken();

        // Get fresh token
        const token = await getAuthToken(true);

        // Get user info
        const user = await getUserInfo(token);

        // Update current user
        currentUser = user;

        // Notify listeners
        authListeners.forEach(listener => listener(user));

        // Store in chrome.storage
        await chrome.storage.local.set({
            chromeUser: user,
            authToken: token
        });

        return user;
    } catch (error: any) {
        console.error("Error signing in with Google", error);
        toast.error("Sign In Error: " + (error.message || error));
        throw error;
    }
};

// Sign out
export const logout = async () => {
    try {
        await clearCachedToken();
        currentUser = null;
        authListeners.forEach(listener => listener(null));
        await chrome.storage.local.remove(['chromeUser', 'authToken']);
    } catch (error) {
        console.error("Error signing out", error);
    }
};

// Clear cached token
export const clearCachedToken = async () => {
    return new Promise<void>((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (result) => {
            const token = typeof result === 'string' ? result : (result as any)?.token;
            if (token) {
                chrome.identity.removeCachedAuthToken({ token }, () => resolve());
            } else {
                resolve();
            }
        });
    });
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (callback: (user: ChromeUser | null) => void) => {
    authListeners.push(callback);

    // Check chrome.storage for persisted user
    chrome.storage.local.get(['chromeUser'], (result) => {
        if (result.chromeUser) {
            currentUser = result.chromeUser as ChromeUser;
            callback(currentUser);
        } else {
            callback(null);
        }
    });

    // Return unsubscribe function
    return () => {
        const index = authListeners.indexOf(callback);
        if (index > -1) {
            authListeners.splice(index, 1);
        }
    };
};

// Get current user
export const getCurrentUser = (): ChromeUser | null => {
    return currentUser;
};

// Get auth token for API calls
export const getAuthTokenForAPI = async (): Promise<string> => {
    try {
        return await getAuthToken(false);
    } catch (error) {
        console.error("Error getting auth token", error);
        throw error;
    }
};
