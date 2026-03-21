import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CATEGORY_META } from '@/constants/deadlineCategories';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { addToDeviceCalendar } from '../../utils';

type Props = {
  deadlines: Deadline[];
  monthLabel: string;
  onCardPress: (deadline: Deadline) => void;
  onToggleComplete: (id: string, current: boolean) => void;
};

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
    emptyText: { ...typography.bodyMedium, color: colors.textSecondary },
    card: {
      marginHorizontal: spacing.md,
      marginBottom: vs(8),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    colorBar: { width: s(4) },
    cardBody: { flex: 1, padding: s(12), gap: vs(6) },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: s(8), flexWrap: 'wrap' },
    title: { ...typography.labelLarge, color: colors.textPrimary, flex: 1 },
    pill: { paddingHorizontal: s(7), paddingVertical: vs(2), borderRadius: radius.full },
    pillText: { ...typography.caption, fontWeight: '600' },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dueDate: { ...typography.bodySmall, color: colors.textSecondary },
    calBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
      backgroundColor: colors.primaryLight,
    },
    calBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    actions: {
      paddingVertical: vs(12),
      paddingHorizontal: s(12),
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    checkBtn: {
      width: s(28),
      height: s(28),
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBtnDone: { borderColor: colors.secondary, backgroundColor: colors.secondary },
    checkMark: { ...typography.bodySmall, color: '#FFF', fontWeight: '700' },
    chevron: { ...typography.h3, color: colors.textDisabled },
  });

  return (
    <>
      <Text style={styles.header}>{monthLabel}</Text>
      {deadlines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗓️</Text>
          <Text style={styles.emptyText}>No deadlines this month</Text>
        </View>
      ) : (
        deadlines.map((d, i) => {
          const meta = CATEGORY_META[d.category];
          return (
            <Animated.View key={d.id} entering={FadeIn.delay(Math.min(i * 24, 120)).duration(200)}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onCardPress(d);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.colorBar, { backgroundColor: meta.color(colors) }]} />
                <View style={styles.cardBody}>
                  <View style={styles.topRow}>
                    <Text
                      style={[
                        styles.title,
                        d.isCompleted && { color: colors.textDisabled, textDecorationLine: 'line-through' },
                      ]}
                      numberOfLines={1}
                    >
                      {d.title}
                    </Text>
                    <View style={[styles.pill, { backgroundColor: meta.bg(colors) }]}>
                      <Text style={[styles.pillText, { color: meta.color(colors) }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text style={styles.dueDate}>{d.isCompleted ? 'Completed' : `Due ${d.dueDate}`}</Text>
                    {!d.isCompleted && (
                      <TouchableOpacity
                        style={styles.calBtn}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          void addToDeviceCalendar(d);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.calBtnText}>+ Calendar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.checkBtn, d.isCompleted && styles.checkBtnDone]}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onToggleComplete(d.id, d.isCompleted);
                    }}
                    activeOpacity={0.8}
                  >
                    {d.isCompleted && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                  {!d.isCompleted && <Text style={styles.chevron}>›</Text>}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })
      )}
    </>
  );
}
