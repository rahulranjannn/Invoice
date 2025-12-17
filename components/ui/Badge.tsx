import React from 'react';
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    label: string;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', label, dot = false, ...props }) => {

    const variants = {
        default: "bg-slate-700/50 text-slate-300 border-slate-600",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border-red-500/20",
        info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        outline: "bg-transparent border-slate-600 text-slate-400"
    };

    const dotColors = {
        default: "bg-slate-400",
        success: "bg-emerald-400",
        warning: "bg-amber-400",
        danger: "bg-red-400",
        info: "bg-cyan-400",
        outline: "bg-slate-400"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                variants[variant],
                className
            )}
            {...props}
        >
            {dot && (
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />
            )}
            {label}
        </span>
    );
};
