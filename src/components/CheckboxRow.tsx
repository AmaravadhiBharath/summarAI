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
    <div className="flex items-center gap-4 p-2 cursor-pointer group hover:bg-gray-50 rounded-xl transition-colors" onClick={onChange}>
        <div className={cn(
            "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0",
            checked ? "bg-black border-black" : "bg-white border-gray-300 group-hover:border-gray-400"
        )}>
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <div className="flex flex-col select-none">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            <span className="text-xs text-gray-500">{subtext}</span>
        </div>
    </div>
);
