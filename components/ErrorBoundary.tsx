import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-xl border border-slate-800">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-slate-400 max-w-md mb-6">
                        We encountered an unexpected error. The application captured this to prevent a crash.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-lg text-left w-full max-w-md mb-6 overflow-auto border border-slate-800">
                        <code className="text-xs text-red-400 font-mono">
                            {this.state.error?.toString()}
                        </code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
