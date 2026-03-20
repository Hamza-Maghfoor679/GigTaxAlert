import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PaywallModal } from '@/components/ui/PaywallModal';
import { Button } from '@/components/ui/Button';
import type { SettingsStackParamList } from '@/navigation/types';
import { useSubscription } from '@/hooks/useSubscription';
import { spacing, typography, useThemeColors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export type SubscriptionScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'Subscription'
>;

export default function SubscriptionScreen(_props: SubscriptionScreenProps) {
  const { isPro, purchasePro } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: spacing.sm,
    },
    sub: {
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.h1, { color: colors.textPrimary }]}>Subscription</Text>
      <Text style={[typography.bodyMedium, styles.sub]}>
        Pro: {isPro ? 'active' : 'inactive'}
      </Text>
      <Button label="Show paywall" onPress={() => setShowPaywall(true)} />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => void purchasePro()}
      />
    </SafeAreaView>
  );
}
