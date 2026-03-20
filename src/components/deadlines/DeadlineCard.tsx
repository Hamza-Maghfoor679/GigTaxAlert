import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DeadlineItem } from '@/stores/deadlineStore';
import { radius, spacing, typography, useThemeColors } from '@/theme';
import { daysUntil } from '@/utils/dateHelpers';
import { formatShortDate } from '@/utils/formatters';

import { Badge } from '../ui/Badge';

type DeadlineCardProps = {
  item: DeadlineItem;
  categoryColor?: string;
  onPress?: () => void;
};

export function DeadlineCard({
  item,
  categoryColor,
  onPress,
}: DeadlineCardProps) {
  const colors = useThemeColors();
  const effectiveCategoryColor = categoryColor ?? colors.primary;
  const due = new Date(item.dueDate);
  const remaining = daysUntil(due);

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    pressed: {
      opacity: 0.92,
    },
    accent: {
      width: spacing.xs,
    },
    accentColor: {
      backgroundColor: effectiveCategoryColor,
    },
    content: {
      flex: 1,
      padding: spacing.md,
      gap: spacing.xs,
    },
    meta: {
      color: colors.textSecondary,
    },
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.accent, styles.accentColor]} />
      <View style={styles.content}>
        <Text style={typography.h3}>{item.title}</Text>
        <Text style={[typography.bodySmall, styles.meta]}>
          Due {formatShortDate(item.dueDate)} · {remaining} days
        </Text>
        <Badge label={item.category} />
      </View>
    </Pressable>
  );
}
