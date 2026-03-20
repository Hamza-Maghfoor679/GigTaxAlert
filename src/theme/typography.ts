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
    fontFamily: 'Inter_700Bold',
  },
  displayMedium: {
    fontSize: rf(28),
    lineHeight: rf(36),
    fontFamily: 'Inter_700Bold',
  },
  h1: {
    fontSize: rf(24),
    lineHeight: rf(32),
    fontFamily: 'Inter_700Bold',
  },
  h2: {
    fontSize: rf(20),
    lineHeight: rf(28),
    fontFamily: 'Inter_600SemiBold',
  },
  h3: {
    fontSize: rf(18),
    lineHeight: rf(24),
    fontFamily: 'Inter_600SemiBold',
  },
  bodyLarge: {
    fontSize: rf(16),
    lineHeight: rf(24),
    fontFamily: 'Inter_400Regular',
  },
  bodyMedium: {
    fontSize: rf(14),
    lineHeight: rf(20),
    fontFamily: 'Inter_400Regular',
  },
  bodySmall: {
    fontSize: rf(12),
    lineHeight: rf(16),
    fontFamily: 'Inter_400Regular',
  },
  labelLarge: {
    fontSize: rf(14),
    lineHeight: rf(20),
    fontFamily: 'Inter_600SemiBold',
  },
  labelSmall: {
    fontSize: rf(11),
    lineHeight: rf(16),
    fontFamily: 'Inter_500Medium',
  },
  caption: {
    fontSize: rf(10),
    lineHeight: rf(14),
    fontFamily: 'Inter_400Regular',
  },
});

