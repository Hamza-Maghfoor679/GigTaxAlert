import { lightColors } from './colors';

export * from './responsive';
export * from './typography';
export * from './spacing';

export * from './ThemeProvider';
export * from './colors';

// Back-compat: default to light colors for any code that still imports `colors`.
export const colors = lightColors;

