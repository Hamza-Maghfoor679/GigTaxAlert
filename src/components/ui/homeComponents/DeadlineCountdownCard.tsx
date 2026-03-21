import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';


import { radius, s, typography, vs, useThemeColors } from '@/theme';
import { Deadline } from './deadline.types';
import { CATEGORY_META } from './deadlineCategories';

type Props = {
  deadline: Deadline;
  index?: number;
  onPress: (deadline: Deadline) => void;
  onToggleComplete: (id: string, current: boolean) => void;
};

/**
 * DeadlineCountdownCard
 *
 * Displays a single deadline with:
 * - Colour-coded category pill
 * - "in X days" countdown (or "Today!" / "Overdue")
 * - Brief checkmark scale feedback on toggle
 * - Full-row tap → detail bottom sheet
 */
export function DeadlineCountdownCard({
  deadline,
  index = 0,
  onPress,
  onToggleComplete,
}: Props) {
  const colors = useThemeColors();
  const meta   = CATEGORY_META[deadline.category];
  const scale  = useSharedValue(1);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(1.12, { duration: 120, easing: Easing.out(Easing.quad) }, () => {
      scale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) });
    });
    onToggleComplete(deadline.id, deadline.isCompleted);
  };

  const getDaysLabel = () => {
    if (deadline.isCompleted) return '✓ Done';
    if (deadline.daysLeft === 0) return 'Due today!';
    if (deadline.daysLeft < 0)  return 'Overdue';
    return `in ${deadline.daysLeft} day${deadline.daysLeft === 1 ? '' : 's'}`;
  };

  const getDaysColor = () => {
    if (deadline.isCompleted)   return colors.secondary;
    if (deadline.daysLeft <= 3) return colors.danger;
    if (deadline.daysLeft <= 7) return colors.warning;
    return colors.textSecondary;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: deadline.isCompleted ? colors.border : deadline.daysLeft <= 7 && !deadline.isCompleted
        ? colors.danger + '30'
        : colors.border,
      paddingHorizontal: s(14),
      paddingVertical: vs(12),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    left: {
      flex: 1,
      gap: vs(5),
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      flexWrap: 'wrap',
    },
    title: {
      ...typography.labelLarge,
      color: deadline.isCompleted ? colors.textDisabled : colors.textPrimary,
      textDecorationLine: deadline.isCompleted ? 'line-through' : 'none',
      flexShrink: 1,
    },
    pill: {
      paddingHorizontal: s(8),
      paddingVertical: vs(2),
      borderRadius: radius.full,
    },
    pillText: {
      ...typography.caption,
      fontWeight: '600',
    },
    dueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },
    dueDate: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    daysLeft: {
      ...typography.labelSmall,
      fontWeight: '700',
    },
    checkBtn: {
      width: s(32),
      height: s(32),
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: deadline.isCompleted ? colors.secondary : colors.border,
      backgroundColor: deadline.isCompleted ? colors.secondary : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkMark: {
      ...typography.bodySmall,
      color: '#FFF',
      fontWeight: '700',
    },
    arrow: {
      ...typography.bodyMedium,
      color: colors.textDisabled,
    },
  });

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index * 24, 96)).duration(200)}
      exiting={FadeOut.duration(160)}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(deadline)}
        activeOpacity={0.75}
      >
        {/* ── Checkmark toggle ── */}
        <Animated.View style={checkAnimStyle}>
          <TouchableOpacity style={styles.checkBtn} onPress={handleToggle} activeOpacity={0.8}>
            {deadline.isCompleted && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Content ── */}
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{deadline.title}</Text>
            <View style={[styles.pill, { backgroundColor: meta.bg(colors) }]}>
              <Text style={[styles.pillText, { color: meta.color(colors) }]}>
                {meta.label}
              </Text>
            </View>
          </View>
          <View style={styles.dueRow}>
            <Text style={styles.dueDate}>{deadline.dueDate}</Text>
            <Text style={[styles.daysLeft, { color: getDaysColor() }]}>
              · {getDaysLabel()}
            </Text>
          </View>
        </View>

        {/* ── Chevron ── */}
        {!deadline.isCompleted && <Text style={styles.arrow}>›</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}
