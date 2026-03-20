import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

type BadgeProps = {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.border,
    },
    success: {
      backgroundColor: colors.secondary,
    },
    warning: {
      backgroundColor: colors.warning,
    },
    danger: {
      backgroundColor: colors.danger,
    },
    label: {
      color: colors.surface,
      fontWeight: '600',
    },
  });

  return (
    <View
      style={[
        styles.badge,
        tone === 'success' && styles.success,
        tone === 'warning' && styles.warning,
        tone === 'danger' && styles.danger,
      ]}
    >
      <Text style={[typography.caption, styles.label]}>{label}</Text>
    </View>
  );
}
