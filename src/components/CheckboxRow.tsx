import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../components/ui/Tooltip';

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
    <div className="flex items-center gap-4 p-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={onChange}>
        <div className={cn(
            "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0",
            checked ? "bg-black dark:bg-white border-black dark:border-white" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
        )}>
            {checked && <Check className="w-3.5 h-3.5 text-white dark:text-black" strokeWidth={3} />}
        </div>
        <div className="flex flex-col select-none">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{subtext}</span>
        </div>
    </div>
);
