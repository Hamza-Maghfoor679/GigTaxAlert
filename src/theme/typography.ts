import { StyleSheet, TextStyle } from 'react-native';
import { rf } from './responsive';

type Typography = {
  displayLarge: TextStyle;
  displayMedium: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  labelLarge: TextStyle;
  labelSmall: TextStyle;
  caption: TextStyle;
};

export const typography = StyleSheet.create<Typography>({
  displayLarge: {
    fontSize: rf(32),
    lineHeight: rf(40),
    fontWeight: '700',
  },
  displayMedium: {
    fontSize: rf(28),
    lineHeight: rf(36),
    fontWeight: '700',
  },
  h1: {
    fontSize: rf(24),
    lineHeight: rf(32),
    fontWeight: '700',
  },
  h2: {
    fontSize: rf(20),
    lineHeight: rf(28),
    fontWeight: '600',
  },
  h3: {
    fontSize: rf(18),
    lineHeight: rf(24),
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: rf(16),
    lineHeight: rf(24),
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: rf(14),
    lineHeight: rf(20),
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: rf(12),
    lineHeight: rf(16),
    fontWeight: '400',
  },
  labelLarge: {
    fontSize: rf(14),
    lineHeight: rf(20),
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
  },
  caption: {
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '400',
  },
});

