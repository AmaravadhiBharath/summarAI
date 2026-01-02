import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', style, ...props }, ref) => {
        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
            icon: 'p-2',
        };

        // Theme-aware styles
        const getVariantStyle = () => {
            switch (variant) {
                case 'primary':
                    return {
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        border: '1px solid transparent',
                        boxShadow: 'var(--shadow-sm)'
                    };
                case 'secondary':
                    return {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)',
                        boxShadow: 'var(--shadow-sm)'
                    };
                case 'ghost':
                    return {
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)'
                    };
                case 'outline':
                    return {
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                    };
            }
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:pointer-events-none',
                    sizes[size],
                    className
                )}
                style={{ ...getVariantStyle(), ...style }}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
