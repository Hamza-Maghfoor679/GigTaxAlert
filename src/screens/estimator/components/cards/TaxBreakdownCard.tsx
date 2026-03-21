import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { TaxBreakdown } from '../../types/estimator.types';

type Props = {
  breakdown: TaxBreakdown;
  delay?: number;
};

type RowProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  isTotal?: boolean;
};

function Row({ label, value, hint, accent, isTotal }: RowProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: vs(isTotal ? 14 : 10),
    },
    divider: { height: 1, backgroundColor: colors.border },
    left: { gap: vs(2) },
    label: { ...typography[isTotal ? 'labelLarge' : 'bodyMedium'], color: colors.textPrimary },
    hint: { ...typography.caption, color: colors.textSecondary },
    value: { ...typography[isTotal ? 'h2' : 'labelLarge'], color: accent ?? colors.textPrimary },
  });

  return (
    <>
      {isTotal && <View style={styles.divider} />}
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>{label}</Text>
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    </>
  );
}

export function TaxBreakdownCard({ breakdown, delay = 0 }: Props) {
  const colors = useThemeColors();
  const hasData = breakdown.grossIncome > 0;
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(4),
    },
    title: { ...typography.h3, color: colors.textPrimary },
    rateBadge: { paddingHorizontal: s(10), paddingVertical: vs(3), borderRadius: radius.full, backgroundColor: colors.primaryLight },
    rateBadgeTxt: { ...typography.labelSmall, color: colors.primary, fontWeight: '700' },
    emptyTxt: { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center', paddingVertical: vs(16) },
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Tax Breakdown</Text>
        {hasData && (
          <View style={styles.rateBadge}>
            <Text style={styles.rateBadgeTxt}>{breakdown.effectiveRate.toFixed(1)}% effective</Text>
          </View>
        )}
      </View>

      {!hasData ? (
        <Text style={styles.emptyTxt}>Enter income above to see your estimate</Text>
      ) : (
        <>
          <Row label="Gross Income" value={formatCurrency(breakdown.grossIncome)} />
          <Row
            label="Deductions"
            value={`- ${formatCurrency(breakdown.deductions)}`}
            hint="Business expenses"
            accent={colors.secondary}
          />
          <Row label="Taxable Income" value={formatCurrency(breakdown.taxableIncome)} />
          <Row
            label="Self-Employment Tax"
            value={formatCurrency(breakdown.seTax)}
            hint="15.3% - Social Security + Medicare"
            accent={colors.warning}
          />
          <Row
            label="Federal Income Tax"
            value={formatCurrency(breakdown.incomeTax)}
            hint="Based on 2024 brackets"
            accent={colors.warning}
          />
          <Row label="Total Owed" value={formatCurrency(breakdown.totalOwed)} accent={colors.danger} isTotal />
        </>
      )}
    </Animated.View>
  );
}
