import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className, side = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-black border-b-transparent border-l-transparent border-r-transparent",
        bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-black border-t-transparent border-l-transparent border-r-transparent",
        left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-black border-r-transparent border-t-transparent border-b-transparent",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-black border-l-transparent border-t-transparent border-b-transparent"
    };

    return (
        <div
            className={cn("relative inline-block", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={cn(
                        "absolute z-50 px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap pointer-events-none animate-fade-in",
                        positionClasses[side]
                    )}
                >
                    {content}
                    {/* Little arrow */}
                    <div className={cn("absolute border-4", arrowClasses[side])} />
                </div>
            )}
        </div>
    );
};
