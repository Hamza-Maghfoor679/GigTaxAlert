import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs } from '@/theme';
import { useThemeColors } from '@/theme';
import { Deadline } from './deadline.types';

type Props = {
  deadlines: Deadline[];
  onPress: (deadline: Deadline) => void;
};

/**
 * UrgencyBanner
 *
 * Shows a stacked list of upcoming deadlines that are < 7 days away.
 * - Red   → ≤ 3 days
 * - Amber → 4–6 days
 *
 * Tapping a row opens the deadline detail sheet.
 */
export function UrgencyBanner({ deadlines, onPress }: Props) {
  const colors = useThemeColors();

  const urgent = useMemo(
    () =>
      deadlines
        .filter((d) => d.daysLeft <= 7 && !d.isComplete)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [deadlines],
  );

  if (urgent.length === 0) return null;

  const getAccent = (daysLeft: number) =>
    daysLeft <= 3 ? colors.danger : colors.warning;

  const styles = StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.md,
      marginBottom: vs(16),
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(14),
      paddingVertical: vs(10),
      gap: s(10),
    },
    dot: {
      width: s(8),
      height: s(8),
      borderRadius: radius.full,
    },
    name: {
      ...typography.labelLarge,
      color: '#FFF',
      flex: 1,
    },
    days: {
      ...typography.labelSmall,
      color: 'rgba(255,255,255,0.85)',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      marginHorizontal: s(14),
    },
  });

  return (
    <Animated.View entering={FadeIn.delay(40).duration(200)} style={styles.wrapper}>
      {urgent.map((d, i) => {
        const accent = getAccent(d.daysLeft);
        const label  = d.daysLeft === 0 ? 'Due today!' : `${d.daysLeft}d left`;

        return (
          <View key={d.id}>
            {i > 0 && <View style={styles.divider} />}
            <TouchableOpacity
              style={[styles.row, { backgroundColor: accent }]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress(d);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
              <Text style={styles.name} numberOfLines={1}>{d.title}</Text>
              <Text style={styles.days}>⚠️ {label}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </Animated.View>
  );
}
