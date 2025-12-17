import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-slate-800 border border-slate-700 rounded-xl shadow-lg relative overflow-hidden",
                    hoverEffect && "group hover:border-blue-500/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={cn("p-6 border-b border-slate-700/50", className)} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
    <h3 className={cn("text-lg font-bold text-white tracking-wide", className)} {...props}>
        {children}
    </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);
