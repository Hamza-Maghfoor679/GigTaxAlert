import { s, vs } from './responsive';

export const spacing = {
  xs: s(4),
  sm: s(8),
  md: s(16),
  lg: s(24),
  xl: s(32),
  xxl: s(48),
} as const;

export const verticalSpacing = {
  xs: vs(4),
  sm: vs(8),
  md: vs(16),
  lg: vs(24),
  xl: vs(32),
  xxl: vs(48),
} as const;

export const radius = {
  sm: s(4),
  md: s(8),
  lg: s(12),
  xl: s(16),
  xxl: s(24),
  full: s(999),
} as const;

export const iconSize = {
  sm: s(16),
  md: s(24),
  lg: s(32),
  xl: s(48),
} as const;

