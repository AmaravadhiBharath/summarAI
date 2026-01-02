import { useState, useEffect } from 'react';

// Mock types for now, will be replaced by actual types
export interface User {
    id: string;
    email: string | null;
    name: string | null;
    picture: string | null;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement actual Chrome Identity auth
        // For now, just simulate loading
        const checkAuth = async () => {
            try {
                // Placeholder for chrome.identity.getProfileUserInfo or similar
                setLoading(false);
            } catch (error) {
                console.error("Auth check failed", error);
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const signIn = async () => {
        // TODO: Implement Google Sign In
    };

    const signOut = async () => {
        // TODO: Implement Sign Out
        setUser(null);
    };

    return { user, loading, signIn, signOut };
};
