import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface CheckboxRowProps {
    label: string;
    subtext: string;
    checked: boolean;
    onChange: () => void;
}

export const CheckboxRow: React.FC<CheckboxRowProps> = ({
    label,
    subtext,
    checked,
    onChange
}) => (
    <div
        className="flex items-center gap-4 p-2 cursor-pointer group rounded-xl transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onChange}
    >
        <div
            className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0"
            style={{
                backgroundColor: checked ? 'var(--text-primary)' : 'var(--bg-secondary)',
                border: `2px solid ${checked ? 'var(--text-primary)' : 'var(--border-primary)'}`
            }}
        >
            {checked && <Check className="w-3.5 h-3.5" style={{ color: 'var(--bg-primary)' }} strokeWidth={3} />}
        </div>
        <div className="flex flex-col select-none">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subtext}</span>
        </div>
    </div>
);
