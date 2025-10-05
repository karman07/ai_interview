// Bluish Theme Color Constants with Dark Mode Support
export const COLORS = {
  // Primary Blue Palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Green Palette
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },

  // Purple Palette
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },

  // Orange Palette
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },

  // Red Palette
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },

  // Blue Palette (same as primary for consistency)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Yellow Palette
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },

  // Light Mode Theme (Bluish with White Background)
  light: {
    bg: '#ffffff',
    bgSecondary: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#64748b'
    },
    sidebar: '#f8fafc',
    sidebarActive: '#eff6ff',
    success: '#f0fdf4',
    error: '#fef2f2',
    warning: '#fff7ed',
    info: '#eff6ff'
  },

  // Dark Mode Theme
  dark: {
    bg: '#0f172a',
    bgSecondary: '#1e293b',
    card: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      muted: '#94a3b8'
    },
    sidebar: '#1e293b',
    sidebarActive: '#1e40af',
    success: '#065f46',
    error: '#7f1d1d',
    warning: '#92400e',
    info: '#1e3a8a'
  },

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Helper functions
export const getTheme = (isDark: boolean) => isDark ? COLORS.dark : COLORS.light;
export const getPrimaryColor = (shade: keyof typeof COLORS.primary = 500) => COLORS.primary[shade];