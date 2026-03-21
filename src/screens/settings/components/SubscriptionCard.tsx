import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { SubscriptionInfo } from '../types/settings.types';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';

type Props = {
  subscription: SubscriptionInfo | null;
  delay?:       number;
  onUpgrade:    () => void;
  onManage:     () => void;
  onRestore:    () => Promise<void>;
};

/**
 * SubscriptionCard
 *
 * Shows current plan badge with contextual CTA:
 * - Free  → upgrade card with feature list
 * - Pro   → manage / renewal info
 */
export function SubscriptionCard({
  subscription, delay = 0, onUpgrade, onManage, onRestore,
}: Props) {
  const colors = useThemeColors();
  const isPro  = subscription?.tier !== 'free';

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: spacing.md,
      marginBottom:     vs(20),
      borderRadius:     radius.xl,
      overflow:         'hidden',
    },

    // ── Pro card (active) ─────────────────────────────────────────────────
    proCard: {
      backgroundColor: colors.surface,
      borderWidth:     1,
      borderColor:     colors.primary + '40',
      padding:         spacing.md,
      gap:             vs(12),
    },
    proTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    proBadge:   { paddingHorizontal: s(12), paddingVertical: vs(4), borderRadius: radius.full, backgroundColor: colors.primary },
    proBadgeTxt:{ ...typography.labelSmall, color: '#FFF', fontWeight: '700' },
    proTitle:   { ...typography.h3, color: colors.textPrimary },
    proRenews:  { ...typography.bodySmall, color: colors.textSecondary },
    manageBtn: {
      borderWidth:     1,
      borderColor:     colors.border,
      borderRadius:    radius.lg,
      paddingVertical: vs(12),
      alignItems:      'center',
    },
    manageBtnTxt: { ...typography.labelLarge, color: colors.textPrimary },
    restoreBtn:   { alignItems: 'center', paddingVertical: vs(4) },
    restoreTxt:   { ...typography.bodySmall, color: colors.textSecondary },

    // ── Upgrade card (free) ───────────────────────────────────────────────
    upgradeCard: {
      backgroundColor: colors.primary,
      padding:         spacing.md,
      gap:             vs(14),
      overflow:        'hidden',
    },
    upgradeBlob: {
      position:        'absolute',
      width:           s(140),
      height:          s(140),
      borderRadius:    radius.full,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top:             vs(-40),
      right:           s(-20),
    },
    upgradeTitle: { ...typography.h2, color: '#FFF' },
    upgradeSub:   { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
    featureList:  { gap: vs(6) },
    featureRow:   { flexDirection: 'row', alignItems: 'center', gap: s(8) },
    featureTxt:   { ...typography.bodySmall, color: 'rgba(255,255,255,0.9)' },
    upgradeBtn: {
      backgroundColor: '#FFF',
      borderRadius:    radius.lg,
      paddingVertical: vs(14),
      alignItems:      'center',
    },
    upgradeBtnTxt: { ...typography.labelLarge, color: colors.primary, fontSize: s(15) },
  });

  const PRO_FEATURES = [
    'Tax estimate calculator',
    'Safe-to-spend number',
    'Year-to-date summary',
    'PDF tax summary export',
  ];

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)} style={styles.card}>
      {isPro ? (
        <View style={styles.proCard}>
          <View style={styles.proTopRow}>
            <Text style={styles.proTitle}>{subscription?.label ?? 'Pro'}</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeTxt}>ACTIVE</Text>
            </View>
          </View>

          {subscription?.renewsAt && (
            <Text style={styles.proRenews}>
              Renews {new Date(subscription.renewsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          )}

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => { void Haptics.selectionAsync(); onManage(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.manageBtnTxt}>Manage Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreBtn} onPress={() => void onRestore()} activeOpacity={0.7}>
            <Text style={styles.restoreTxt}>Restore purchases</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.upgradeCard}>
          <View style={styles.upgradeBlob} />
          <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
          <Text style={styles.upgradeSub}>Unlock the full tax toolkit</Text>

          <View style={styles.featureList}>
            {PRO_FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={{ fontSize: s(14) }}>✓</Text>
                <Text style={styles.featureTxt}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onUpgrade(); }}
            activeOpacity={0.9}
          >
            <Text style={styles.upgradeBtnTxt}>Upgrade Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}