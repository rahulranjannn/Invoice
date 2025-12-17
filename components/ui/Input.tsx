import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    startIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, helperText, error, startIcon, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                        {label} {props.required && <span className="text-red-400">*</span>}
                    </label>
                )}
                <div className="relative">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            {startIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100",
                            "placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                            "transition-all duration-200 shadow-sm",
                            startIcon && "pl-10",
                            error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-400 animate-in slide-in-from-top-1">{error}</p>
                )}
                {!error && helperText && (
                    <p className="text-xs text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
