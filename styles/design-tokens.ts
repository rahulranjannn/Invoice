export const colors = {
    // Semantic colors
    primary: {
        DEFAULT: '#3b82f6', // blue-500
        hover: '#2563eb',   // blue-600
        active: '#1d4ed8',  // blue-700
        light: '#60a5fa',   // blue-400
        subtle: '#eff6ff',  // blue-50
        ring: '#bfdbfe',    // blue-200
    },
    success: {
        DEFAULT: '#10b981', // emerald-500
        text: '#34d399',    // emerald-400
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
        DEFAULT: '#f59e0b', // amber-500
        text: '#fbbf24',    // amber-400
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
        DEFAULT: '#ef4444', // red-500
        text: '#f87171',    // red-400
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.2)',
    },
    info: {
        DEFAULT: '#06b6d4', // cyan-500
        text: '#22d3ee',    // cyan-400
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.2)',
    },

    // Surface colors (Dark Theme)
    surface: {
        page: '#0f172a',    // slate-900
        card: '#1e293b',    // slate-800
        cardHover: '#334155', // slate-700
        input: '#0f172a',   // slate-900
        border: '#334155',  // slate-700
        borderLight: '#475569', // slate-600
    },

    // Text colors
    text: {
        primary: '#f1f5f9', // slate-100
        secondary: '#cbd5e1', // slate-300
        muted: '#94a3b8',   // slate-400
        inverse: '#0f172a', // slate-900
    },

    // Charts
    charts: {
        liability: ['#f97316', '#fb923c', '#ef4444', '#f87171', '#fdba74'], // Orange-Red Palette (Orange First)
        credit: ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8', '#93c5fd'],     // Blue Palette (Blue First)
    }
};

export const spacing = {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    xxl: '3rem',    // 48px
};

export const typography = {
    fontFamily: {
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
};

export const borderRadius = {
    none: '0px',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
};

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
};
