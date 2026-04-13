import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useUserProfile } from '@/context/UserProfileContext';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import type { TaxBreakdown } from '../types/estimator.types';

type Props = {
  breakdown: TaxBreakdown;
  delay?: number;
};

type RowProps = {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
};

function BreakdownRow({ label, value, valueColor, bold = false }: RowProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>{label}</Text>
      <Text
        style={[
          typography.bodyMedium,
          { color: valueColor ?? colors.textPrimary },
          bold && { fontFamily: 'Inter_700Bold' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function selfEmploymentLabel(country: string | null): string {
  if (country === 'UK' || country === 'GB') return 'National Insurance';
  if (country === 'DE' || country === 'FR' || country === 'NL') return 'Trade tax (est.)';
  return 'Self-employment tax';
}

export function TaxBreakdownCard({ breakdown, delay = 0 }: Props) {
  const colors = useThemeColors();
  const { country } = useUserProfile();
  const seLabel = selfEmploymentLabel(country);

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)} style={styles.card(colors)}>
      <View style={styles.header}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>Tax Breakdown</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{breakdown.period}</Text>
      </View>

      <BreakdownRow
        label="Gross income"
        value={formatCurrency(breakdown.grossIncome, breakdown.currency)}
      />
      <BreakdownRow
        label="Deductions"
        value={`- ${formatCurrency(breakdown.deductions, breakdown.currency)}`}
      />
      <BreakdownRow label="Net income" value={formatCurrency(breakdown.netIncome, breakdown.currency)} />

      <View style={styles.divider(colors)} />

      <BreakdownRow
        label="Income tax"
        value={formatCurrency(breakdown.incomeTax, breakdown.currency)}
        valueColor={colors.danger}
      />
      <BreakdownRow
        label={seLabel}
        value={formatCurrency(breakdown.selfEmploymentTax, breakdown.currency)}
        valueColor={colors.danger}
      />

      <View style={styles.divider(colors)} />

      <BreakdownRow
        label="Total owed"
        value={formatCurrency(breakdown.totalOwed, breakdown.currency)}
        valueColor={colors.danger}
        bold
      />
      <BreakdownRow
        label="Effective rate"
        value={`${breakdown.effectiveRate.toFixed(1)}%`}
        valueColor={colors.textSecondary}
      />

      <View style={styles.safeRow(colors)}>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>Safe to spend</Text>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
          {formatCurrency(breakdown.safeAmount, breakdown.currency)}
        </Text>
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary }]}>
        This is an estimate only. Consult a qualified tax professional for advice specific to your
        situation.
      </Text>
    </Animated.View>
  );
}

const styles = {
  card: (colors: ReturnType<typeof useThemeColors>) =>
  ({
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: vs(10),
  }),
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: s(8),
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: s(8),
  },
  divider: (colors: ReturnType<typeof useThemeColors>) =>
  ({
    height: 1,
    backgroundColor: colors.border,
  }),
  safeRow: (colors: ReturnType<typeof useThemeColors>) =>
  ({
    marginTop: vs(4),
    backgroundColor: `${colors.primary}1A`,
    borderRadius: radius.md,
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
};
