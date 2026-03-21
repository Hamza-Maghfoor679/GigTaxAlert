import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';

type Props = {
  safeAmount: number;
  grossIncome: number;
  totalOwed: number;
  quarter: string;
  delay?: number;
};

export function SafeToSpendCard({ safeAmount, grossIncome, totalOwed, quarter, delay = 0 }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const spendPct = grossIncome > 0 ? (safeAmount / grossIncome) * 100 : 0;
  const taxPct = grossIncome > 0 ? (totalOwed / grossIncome) * 100 : 0;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={styles.card}>
      <View style={styles.blob} />
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Safe to spend</Text>
          <Text style={styles.amount}>{grossIncome > 0 ? formatCurrency(safeAmount) : '--'}</Text>
          <Text style={styles.subLabel}>this {quarter}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>Spendable</Text>
        </View>
      </View>

      {grossIncome > 0 && (
        <>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${spendPct}%` }]} />
          </View>
          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <Text style={styles.splitVal}>{formatCurrency(grossIncome)}</Text>
              <Text style={styles.splitLbl}>Gross income</Text>
            </View>
            <View style={[styles.splitItem, { alignItems: 'center' }]}>
              <Text style={styles.splitVal}>{taxPct.toFixed(0)}%</Text>
              <Text style={styles.splitLbl}>Tax rate</Text>
            </View>
            <View style={[styles.splitItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.splitVal}>{formatCurrency(totalOwed)}</Text>
              <Text style={styles.splitLbl}>Set aside</Text>
            </View>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      backgroundColor: colors.secondary,
      padding: spacing.md,
      overflow: 'hidden',
      gap: vs(12),
    },
    blob: {
      position: 'absolute',
      width: s(160),
      height: s(160),
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: vs(-50),
      right: s(-30),
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: s(10), paddingVertical: vs(4) },
    badgeTxt: { ...typography.labelSmall, color: '#FFF' },
    label: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginBottom: vs(2) },
    amount: { ...typography.displayLarge, color: '#FFF', lineHeight: undefined },
    subLabel: { ...typography.caption, color: 'rgba(255,255,255,0.65)' },
    barBg: { height: vs(6), borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.75)' },
    splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
    splitItem: { gap: vs(2) },
    splitVal: { ...typography.labelLarge, color: '#FFF' },
    splitLbl: { ...typography.caption, color: 'rgba(255,255,255,0.65)' },
  });
