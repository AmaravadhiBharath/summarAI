import React, { useState, useEffect } from 'react';
import { Tooltip, cn } from './ui/Tooltip';
import type { ChromeUser } from '../services/chrome-auth';

interface QuotaCounterProps {
    user: ChromeUser | null;
    isPro?: boolean;
}

export const QuotaCounter: React.FC<QuotaCounterProps> = ({ user, isPro }) => {
    const [quotaUsed, setQuotaUsed] = useState<number>(0);
    const [quotaLimit, setQuotaLimit] = useState<number>(user ? 10 : 5);
    useEffect(() => {
        // Load quota from storage
        chrome.storage.local.get(['quotaUsed', 'quotaLimit'], (result) => {
            if (result.quotaUsed !== undefined) setQuotaUsed(result.quotaUsed as number);
            if (result.quotaLimit !== undefined) setQuotaLimit(result.quotaLimit as number);
        });

        // Listen for quota updates
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.quotaUsed) setQuotaUsed(changes.quotaUsed.newValue as number);
            if (changes.quotaLimit) setQuotaLimit(changes.quotaLimit.newValue as number);
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    // Update limit when user changes
    useEffect(() => {
        setQuotaLimit(user ? 10 : 5);
    }, [user]);

    // Don't show counter for Pro users
    if (isPro) {
        return null;
    }

    const remaining = Math.max(0, quotaLimit - quotaUsed);

    return (
        <Tooltip content="Summaries remaining today" side="bottom">
            <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-sm transition-colors",
                remaining === 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-600 border-gray-200"
            )}>
                {remaining} left
            </span>
        </Tooltip>
    );
};
