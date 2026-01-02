import React from 'react';
import { cn } from '../../utils/cn';

interface MarqueeProps {
    items: string[];
    speed?: number;
    className?: string;
    reverse?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({ items, speed = 30, className, reverse = false }) => {
    const animationName = reverse ? 'marquee-reverse' : 'marquee';

    return (
        <div
            className={cn("relative flex overflow-hidden w-full select-none pointer-events-none", className)}
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
            }}
        >
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-25%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-25%); }
                    100% { transform: translateX(0); }
                }
                .animate-marquee-${reverse ? 'reverse' : 'normal'} {
                    animation: ${animationName} ${speed}s linear infinite;
                }
                `}
            </style>
            <div
                className={`flex animate-marquee-${reverse ? 'reverse' : 'normal'} whitespace-nowrap w-max`}
                style={{ willChange: 'transform' }}
            >
                {[...Array(4)].map((_, setIndex) => (
                    <div key={setIndex} className="flex items-center shrink-0">
                        {items.map((item, i) => (
                            <span key={`${setIndex}-${i}`} className="mx-3 text-xs font-medium flex items-center" style={{ color: 'var(--text-secondary)' }}>
                                {item}
                                <span className="ml-3" style={{ color: 'var(--text-tertiary)' }}>•</span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
