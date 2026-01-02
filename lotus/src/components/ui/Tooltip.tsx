import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    disabled?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, disabled, side = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (disabled) return <>{children}</>;

    let positionClasses = '';
    switch (side) {
        case 'bottom':
            positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
            break;
        case 'left':
            positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
            break;
        case 'right':
            positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
            break;
        case 'top':
        default:
            positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
            break;
    }

    const handleMouseEnter = () => {
        // Only show tooltip on devices that support hover (mouse)
        // This prevents "double tap to click" on touch devices
        if (window.matchMedia('(hover: hover)').matches) {
            setIsVisible(true);
        }
    };

    return (
        <div
            className="relative inline-block z-[500]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute ${positionClasses} px-2 py-1 text-xs rounded whitespace-nowrap z-[600] pointer-events-none`}
                    style={{
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg-primary)'
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};
