import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './Tooltip'; // Reusing cn utility

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    children,
    ...props
}) => {
    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 border border-transparent",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        icon: "p-2 bg-transparent hover:bg-gray-100 rounded-full text-gray-600"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-0 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children as React.ReactNode}
        </motion.button>
    );
};
