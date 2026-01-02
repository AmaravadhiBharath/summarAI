import React, { useState, useEffect } from 'react';
import { Tooltip } from './ui/Tooltip';
import { cn } from '../utils/cn';
import type { ChromeUser } from '../services/chrome-auth';

interface QuotaCounterProps {
    user: ChromeUser | null;
    isPro?: boolean;
}

export const QuotaCounter: React.FC<QuotaCounterProps> = ({ user, isPro }) => {
    const [quotaUsed, setQuotaUsed] = useState<number>(0);
    const [quotaLimit, setQuotaLimit] = useState<number>(user ? 10 : 5);

    useEffect(() => {
        chrome.storage.local.get(['quotaUsed', 'quotaLimit'], (result) => {
            if (result.quotaUsed !== undefined) setQuotaUsed(result.quotaUsed as number);
            if (result.quotaLimit !== undefined) setQuotaLimit(result.quotaLimit as number);
        });

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.quotaUsed) setQuotaUsed(changes.quotaUsed.newValue as number);
            if (changes.quotaLimit) setQuotaLimit(changes.quotaLimit.newValue as number);
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    useEffect(() => {
        setQuotaLimit(user ? 10 : 5);
    }, [user]);

    if (isPro) return null;

    const remaining = Math.max(0, quotaLimit - quotaUsed);

    return (
        <Tooltip content="Daily Quota" side="bottom">
            <span
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm transition-colors"
                style={{
                    backgroundColor: remaining === 0 ? '#fee2e2' : 'var(--bg-secondary)',
                    color: remaining === 0 ? '#dc2626' : 'var(--text-secondary)',
                    border: `1px solid ${remaining === 0 ? '#fecaca' : 'var(--border-primary)'}`
                }}
            >
                {remaining} left
            </span>
        </Tooltip>
    );
};
