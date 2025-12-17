import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {

        const variants = {
            primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25 border border-transparent",
            secondary: "bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 border border-slate-600",
            ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent",
            danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
            outline: "bg-transparent border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 gap-2",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : icon ? (
                    <span className="flex-shrink-0">{icon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
