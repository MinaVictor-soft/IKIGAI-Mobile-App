// API base URL - using production Replit API
// Both web and production use the same backend
const API_URL = 'https://ikigai-backend.replit.app/api/v1';

export const API_BASE_URL = API_URL;

export const COLORS = {
  // Youth-friendly unisex theme
  primary: '#6366F1',        // Vibrant indigo
  primaryDark: '#4F46E5',    // Deep indigo
  secondary: '#06B6D4',     // Cyan/teal energy
  accent: '#F59E0B',         // Amber gold
  background: '#0F172A',     // Deep navy
  surface: '#1E293B',        // Slate card surface
  surfaceLight: '#334155',   // Lighter slate
  card: '#1E293B',           // Card background
  text: '#F8FAFC',           // Clean white text
  textSecondary: '#94A3B8',  // Muted slate
  textMuted: '#64748B',      // Very muted
  success: '#10B981',        // Emerald green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  border: '#334155',         // Slate border
  gold: '#F59E0B',           // 1st place
  silver: '#CBD5E1',         // 2nd place
  bronze: '#D97706',         // 3rd place
  sakura: '#F472B6',         // Accent pink (subtle)
  indigo: '#6366F1',         // Match primary
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
