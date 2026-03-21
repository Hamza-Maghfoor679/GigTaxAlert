import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { TaxEstimate } from './deadline.types';

type Props = {
  estimate: TaxEstimate | null;
  delay?: number;
  onPress: () => void;
};

/**
 * TaxEstimateWidget
 *
 * Shows "~$1,240 due Apr 15" for Pro users.
 * For free users renders a locked teaser card with an upgrade prompt.
 */
export function TaxEstimateWidget({ estimate, delay = 0, onPress }: Props) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: spacing.md,
      marginBottom: vs(16),
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    iconBox: {
      width: s(44),
      height: s(44),
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: { fontSize: s(22) },
    content: { flex: 1, gap: vs(3) },
    label:  { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
    amount: { ...typography.h2, color: colors.textPrimary },
    sub:    { ...typography.bodySmall, color: colors.textSecondary },
    arrow:  { ...typography.h3, color: colors.primary },

    // Locked state
    lockedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.surface + 'CC',
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: s(6),
    },
    lockIcon: { fontSize: s(16) },
    lockText: { ...typography.labelLarge, color: colors.primary },

    // Pro badge
    proBadge: {
      position: 'absolute',
      top: vs(-8),
      right: s(12),
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingHorizontal: s(8),
      paddingVertical: vs(2),
    },
    proBadgeTxt: { ...typography.caption, color: '#FFF', fontWeight: '700', letterSpacing: 0.6 },
  });

  const isPro     = estimate?.isPro ?? false;
  const formatted = estimate
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: estimate.currency }).format(estimate.amountDue)
    : '—';

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          onPress();
        }}
        activeOpacity={0.8}
      >
        {/* Pro badge */}
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeTxt}>PRO</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconBox}>
          <Text style={styles.icon}>💰</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.label}>Estimated Tax Owed</Text>
          <Text style={styles.amount}>
            {isPro ? `~${formatted}` : '~$•,•••'}
          </Text>
          <Text style={styles.sub}>
            {isPro && estimate
              ? `${estimate.deadlineTitle} · due ${estimate.dueDate}`
              : 'Upgrade to see your estimate'}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>

        {/* Locked overlay for free users */}
        {!isPro && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockText}>Unlock with Pro</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
