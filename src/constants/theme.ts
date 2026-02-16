export const colors = {
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  border: '#222222',
  borderLight: '#333333',

  primary: '#9945FF',
  primaryDark: '#7B2FE0',
  accent: '#14F195',
  error: '#FF4444',
  warning: '#FFB800',

  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  textDim: '#444444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
} as const;
