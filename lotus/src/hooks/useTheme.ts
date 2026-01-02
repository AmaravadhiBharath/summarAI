import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('auto');
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

    useEffect(() => {
        // Load saved theme preference
        chrome.storage.local.get(['theme'], (result) => {
            const savedTheme = result.theme as Theme || 'auto';
            setTheme(savedTheme);
        });

        // Listen for storage changes (sync across components)
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.theme) {
                setTheme(changes.theme.newValue as Theme);
            }
        };
        chrome.storage.onChanged.addListener(handleStorageChange);

        // Listen for system color scheme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            updateResolvedTheme(theme, e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        handleChange(mediaQuery); // Initial check

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        updateResolvedTheme(theme, mediaQuery.matches);
    }, [theme]);

    const updateResolvedTheme = (currentTheme: Theme, systemPrefersDark: boolean) => {
        let resolved: ResolvedTheme;
        if (currentTheme === 'auto') {
            resolved = systemPrefersDark ? 'dark' : 'light';
        } else {
            resolved = currentTheme as ResolvedTheme;
        }
        setResolvedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
    };

    const changeTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        chrome.storage.local.set({ theme: newTheme });
    };

    return { theme, resolvedTheme, setTheme: changeTheme };
}
