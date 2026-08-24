import { Easing } from 'react-native-reanimated';

export const colors = {
  pageBackground: '#f9fafb',
  listBackground: '#f9fafb',
  surface: '#ffffff',
  headerBorder: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  delete: '#ef4444',
  hairline: '#f3f4f6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const ROW_HEIGHT = 72;
export const SWIPE_THRESHOLD = 120;
export const SLIDE_OUT_DURATION = 200;
export const COLLAPSE_DURATION = 150;
export const SNAP_BACK_DURATION = 300;

export const SNAP_BACK_EASING = Easing.bezier(0.25, 1, 0.5, 1);
