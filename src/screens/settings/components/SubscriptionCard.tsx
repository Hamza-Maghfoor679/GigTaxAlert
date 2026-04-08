import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { SubscriptionState } from '../types/settings.types';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';

type Props = {
  subscription: SubscriptionState | null;
  onUpgrade: () => void;
  onManage: () => void;
  onRestore: () => void;
};

/**
 * SubscriptionCard
 *
 * Shows current plan badge with contextual CTA:
 * - Free  → upgrade card with feature list
 * - Pro   → manage / renewal info
 */
export function SubscriptionCard({
  subscription, onUpgrade, onManage, onRestore,
}: Props) {
  const colors = useThemeColors();
  const isPro = subscription?.tier === 'pro';

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: spacing.md,
      marginBottom: vs(20),
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    proCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary + '33',
      padding: spacing.md,
      gap: vs(12),
    },
    proTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    proBadge: { paddingHorizontal: s(12), paddingVertical: vs(4), borderRadius: radius.full, backgroundColor: colors.success + '22' },
    proBadgeTxt: { ...typography.labelSmall, color: colors.success, fontWeight: '700' },
    proTitle: { ...typography.h3, color: colors.textPrimary },
    proRenews: { ...typography.bodySmall, color: colors.textSecondary },
    manageBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: vs(12),
      alignItems: 'center',
    },
    manageBtnTxt: { ...typography.labelLarge, color: colors.textPrimary },
    restoreBtn: { alignItems: 'center', paddingVertical: vs(4) },
    restoreTxt: { ...typography.bodySmall, color: colors.textSecondary },
    upgradeCard: {
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.primary + '33',
      padding: spacing.md,
      gap: vs(12),
    },
    upgradeTitle: { ...typography.h3, color: colors.textPrimary },
    upgradeSub: { ...typography.bodySmall, color: colors.textSecondary },
    upgradeBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      paddingVertical: vs(14),
      alignItems: 'center',
    },
    upgradeBtnTxt: { ...typography.labelLarge, color: '#FFF', fontSize: s(15) },
  });

  const renewsAtText = subscription?.isLifetime
    ? 'Lifetime access'
    : subscription?.expiresAt
      ? `Renews ${subscription.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

  return (
    <View style={styles.card}>
      {isPro ? (
        <View style={styles.proCard}>
          <View style={styles.proTopRow}>
            <Text style={styles.proTitle}>✅ Pro Plan</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeTxt}>ACTIVE</Text>
            </View>
          </View>

          {renewsAtText ? <Text style={styles.proRenews}>{renewsAtText}</Text> : null}

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => { void Haptics.selectionAsync(); onManage(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.manageBtnTxt}>Manage Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreBtn} onPress={() => { void Haptics.selectionAsync(); onRestore(); }} activeOpacity={0.7}>
            <Text style={styles.restoreTxt}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>⚡ Free Plan</Text>
          <Text style={styles.upgradeSub}>Upgrade for income estimator + PDF export</Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onUpgrade(); }}
            activeOpacity={0.9}
          >
            <Text style={styles.upgradeBtnTxt}>Upgrade to Pro · $5.99/mo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn} onPress={() => { void Haptics.selectionAsync(); onRestore(); }} activeOpacity={0.7}>
            <Text style={styles.restoreTxt}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}