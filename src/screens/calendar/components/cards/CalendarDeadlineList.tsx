import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CATEGORY_META } from '@/constants/deadlineCategories';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';

type Props = {
  deadlines: Deadline[];
  monthLabel: string;
  onCardPress: (deadline: Deadline) => void;
  onToggleComplete: (id: string) => void;
};

type DeadlineCardProps = {
  deadline: Deadline;
  onCardPress: (deadline: Deadline) => void;
  onToggleComplete: (id: string) => void;
};

const formatDueDate = (dueDate: Deadline['dueDate']): string => {
  const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
  return Number.isNaN(date.getTime())
    ? String(dueDate)
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysChip = (daysLeft: number, colors: ReturnType<typeof useThemeColors>) => {
  if (daysLeft <= 0) {
    return {
      label: daysLeft === 0 ? 'Due today!' : 'Overdue',
      backgroundColor: `${colors.danger}1A`,
      textColor: colors.danger,
    };
  }

  if (daysLeft <= 7) {
    return {
      label: `${daysLeft} days`,
      backgroundColor: `${colors.warning}1A`,
      textColor: colors.warning,
    };
  }

  return {
    label: `${daysLeft} days`,
    backgroundColor: colors.primaryLight,
    textColor: colors.primary,
  };
};

export function DeadlineCard({ deadline, onCardPress, onToggleComplete }: DeadlineCardProps) {
  const colors = useThemeColors();
  const category = deadline.category ?? 'other';
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const isCompleted = Boolean(deadline.completed ?? deadline.isCompleted ?? deadline.isComplete);
  const daysChip = getDaysChip(deadline.daysLeft, colors);

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: spacing.md,
      marginBottom: vs(8),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    colorBar: { width: s(4), backgroundColor: meta.color(colors) },
    cardBody: { flex: 1, padding: s(12), gap: vs(6) },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: s(8), flexWrap: 'wrap' },
    title: { ...typography.labelLarge, color: colors.textPrimary, flex: 1 },
    titleDone: { color: colors.textDisabled, textDecorationLine: 'line-through' },
    pill: { paddingHorizontal: s(7), paddingVertical: vs(2), borderRadius: radius.full },
    pillText: { ...typography.caption, fontWeight: '600' },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dueDate: { ...typography.bodySmall, color: colors.textSecondary },
    daysChip: {
      borderRadius: radius.full,
      paddingHorizontal: s(10),
      paddingVertical: vs(3),
      backgroundColor: daysChip.backgroundColor,
    },
    daysChipText: {
      ...typography.labelSmall,
      color: daysChip.textColor,
      fontWeight: '700',
    },
    check: {
      width: s(24),
      height: s(24),
      borderRadius: radius.full,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkMark: { ...typography.bodySmall, color: '#FFF', fontWeight: '700' },
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        void Haptics.selectionAsync();
        onCardPress(deadline);
      }}
      onLongPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onToggleComplete(deadline.id);
      }}
      activeOpacity={0.82}
    >
      <View style={styles.colorBar} />
      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={1}>
            {deadline.title}
          </Text>
          {isCompleted && (
            <View style={styles.check}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          )}
          <View style={[styles.pill, { backgroundColor: meta.bg(colors) }]}>
            <Text style={[styles.pillText, { color: meta.color(colors) }]}>{meta.label}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.dueDate}>{formatDueDate(deadline.dueDate)}</Text>
          <View style={styles.daysChip}>
            <Text style={styles.daysChipText}>{daysChip.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function CalendarDeadlineList({ deadlines, monthLabel, onCardPress, onToggleComplete }: Props) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    header: {
      ...typography.h3,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      marginBottom: vs(10),
      marginTop: vs(12),
    },
    empty: { alignItems: 'center', paddingVertical: vs(28), gap: vs(6) },
    emptyEmoji: { fontSize: s(34) },
    emptyTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
    emptyText: { ...typography.bodySmall, color: colors.textSecondary },
  });

  const header = `${monthLabel} — ${deadlines.length} deadline${deadlines.length === 1 ? '' : 's'}`;

  return (
    <>
      <Text style={styles.header}>{header}</Text>
      {deadlines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyTitle}>No deadlines this month</Text>
          <Text style={styles.emptyText}>You are clear for now. New dates appear as your tax cycle updates.</Text>
        </View>
      ) : (
        deadlines.map((deadline, i) => (
          <Animated.View key={deadline.id} entering={FadeIn.delay(i * 40).duration(220)}>
            <DeadlineCard
              deadline={deadline}
              onCardPress={onCardPress}
              onToggleComplete={onToggleComplete}
            />
          </Animated.View>
        ))
      )}
    </>
  );
}
