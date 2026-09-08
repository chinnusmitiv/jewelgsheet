export const PALETTE = {
  // Brand & Neutrals
  primary: '#2563eb',       // Royal Blue
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  primaryBorder: '#bfdbfe',

  background: '#f8fafc',    // Slate 50
  surface: '#ffffff',
  surfaceCard: '#ffffff',
  surfaceSubtle: '#f1f5f9',

  text: '#0f172a',          // Slate 900
  textSecondary: '#64748b', // Slate 500
  textMuted: '#94a3b8',     // Slate 400
  textInverse: '#ffffff',

  border: '#e2e8f0',        // Slate 200
  borderDark: '#cbd5e1',

  // Financial Semantics
  cashIn: '#059669',        // Emerald 600
  cashInLight: '#ecfdf5',
  cashInBorder: '#a7f3d0',

  cashOut: '#dc2626',       // Rose / Red 600
  cashOutLight: '#fef2f2',
  cashOutBorder: '#fecaca',

  jewelGold: '#d97706',     // Amber 600
  jewelGoldLight: '#fffbeb',
  jewelGoldBorder: '#fde68a',

  // Difference Status
  balanced: '#059669',      // Green
  balancedLight: '#ecfdf5',
  short: '#dc2626',         // Red
  shortLight: '#fef2f2',
  excess: '#0284c7',        // Sky Blue
  excessLight: '#f0f9ff',

  // Warning & Info
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  info: '#3b82f6',
  infoLight: '#eff6ff',

  // Overlay & Shadows
  overlay: 'rgba(15, 23, 42, 0.65)',
  shadow: '#0f172a',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
