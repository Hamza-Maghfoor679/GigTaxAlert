import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useThemeColors } from '@/theme';

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
  });

  return <View style={styles.card}>{children}</View>;
}
