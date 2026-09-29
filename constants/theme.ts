// Rytok Design Tokens — mirrors your web brand exactly

export const colors = {
    bg:            '#0b0e1a',
    bgCard:        '#141826',
    bgInput:       'rgba(255,255,255,0.07)',
    bgMuted:       'rgba(255,255,255,0.04)',
    border:        'rgba(255,255,255,0.08)',
    borderStrong:  'rgba(255,255,255,0.15)',
    textPrimary:   '#ffffff',
    textSecondary: 'rgba(255,255,255,0.55)',
    textMuted:     'rgba(255,255,255,0.35)',
    personal: {
        gradient:   ['#4f6af5', '#7c3aed'] as [string, string],
        accent:     '#4f6af5',
        headerBg:   '#1a3a6e',
        headerText: '#ffffff',
    },
    business: {
        gradient:   ['#0e8c82', '#0ea5e9'] as [string, string],
        accent:     '#0e8c82',
        headerBg:   '#0d3d3a',
        headerText: '#f0c060',
    },
    success:  '#22c55e',
    danger:   '#ff4757',
    warning:  '#f59e0b',
    info:     '#0ea5e9',
    tabActive:   '#4f6af5',
    tabInactive: 'rgba(255,255,255,0.4)',
    tabBarBg:    '#141826',
};

export const spacing  = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius   = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 };
