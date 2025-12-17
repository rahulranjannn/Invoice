import React from 'react';
import { cn } from './Button';

export const EmptyState = ({ icon, title, description, action }: any) => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-xl">
            {icon ? React.cloneElement(icon, { className: "w-10 h-10 text-slate-600" }) : null}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">{description}</p>
        {action}
    </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse bg-slate-800 rounded-lg", className)} />
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="w-full space-y-4">
        <Skeleton className="w-full h-12 rounded-xl" />
        <div className="space-y-2">
            {[...Array(rows)].map((_, i) => (
                <Skeleton key={i} className="w-full h-16 rounded-lg opacity-60" />
            ))}
        </div>
    </div>
);
