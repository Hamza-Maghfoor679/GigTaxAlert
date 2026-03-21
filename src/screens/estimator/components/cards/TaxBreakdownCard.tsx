import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, s, ms, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import type { TaxBreakdown } from '../../types/estimator.types';

type Props = {
  breakdown: TaxBreakdown;
  delay?:    number;
};

type RowProps = {
  label:    string;
  value:    string;
  hint?:    string;
  accent?:  string;
  isTotal?: boolean;
};

function Row({ label, value, hint, accent, isTotal }: RowProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    row: {
      flexDirection:  'row',
      alignItems:     'center',
      paddingVertical: vs(isTotal ? 14 : 10),
      gap:             s(8),
    },
    divider: { height: 1, backgroundColor: colors.border },

    // ✅ flex:1 so label block never competes with the value for width
    left: {
      flex: 1,
      gap:  vs(2),
    },
    label: {
      ...typography[isTotal ? 'labelLarge' : 'bodyMedium'],
      color: colors.textPrimary,
    },
    hint: { ...typography.caption, color: colors.textSecondary },

    // ✅ Fixed max width so value never pushes the label off screen.
    //    adjustsFontSizeToFit shrinks within that budget before clipping.
    valueWrap: {
      maxWidth:  '45%',
      alignItems: 'flex-end',
    },
    value: {
      fontSize:   isTotal ? ms(20, 0.35) : ms(14, 0.3),
      fontFamily: isTotal ? 'Inter_700Bold' : 'Inter_600SemiBold',
      color:      accent ?? colors.textPrimary,
      textAlign:  'right',
      width:      '100%', // required for adjustsFontSizeToFit
    },
  });

  return (
    <>
      {isTotal && <View style={styles.divider} />}
      <View style={styles.row}>
        {/* Left — label + optional hint, fills remaining space */}
        <View style={styles.left}>
          <Text style={styles.label} numberOfLines={2}>{label}</Text>
          {hint && <Text style={styles.hint} numberOfLines={1}>{hint}</Text>}
        </View>

        {/* Right — value shrinks font before wrapping or clipping */}
        <View style={styles.valueWrap}>
          <Text
            style={styles.value}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.65}
          >
            {value}
          </Text>
        </View>
      </View>
    </>
  );
}

export function TaxBreakdownCard({ breakdown, delay = 0 }: Props) {
  const colors  = useThemeColors();
  const hasData = breakdown.grossIncome > 0;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius:    radius.xl,
      borderWidth:     1,
      borderColor:     colors.border,
      padding:         spacing.md,
    },
    header: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   vs(4),
      gap:            s(8),
    },
    title:        { ...typography.h3, color: colors.textPrimary, flex: 1 },
    rateBadge:    { paddingHorizontal: s(10), paddingVertical: vs(3), borderRadius: radius.full, backgroundColor: colors.primaryLight, flexShrink: 0 },
    rateBadgeTxt: { ...typography.labelSmall, color: colors.primary, fontWeight: '700' },
    emptyTxt:     { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center', paddingVertical: vs(16) },
  });

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)} style={styles.card}>
      <View style={styles.header}>
        {/* ✅ flex:1 on title + flexShrink:0 on badge — same pattern as SafeToSpendCard */}
        <Text style={styles.title} numberOfLines={1}>Tax Breakdown</Text>
        {hasData && (
          <View style={styles.rateBadge}>
            <Text style={styles.rateBadgeTxt} numberOfLines={1}>
              {breakdown.effectiveRate.toFixed(1)}% effective
            </Text>
          </View>
        )}
      </View>

      {!hasData ? (
        <Text style={styles.emptyTxt}>Enter income above to see your estimate</Text>
      ) : (
        <>
          <Row label="Gross Income"          value={formatCurrency(breakdown.grossIncome)}  />
          <Row label="Deductions"            value={`- ${formatCurrency(breakdown.deductions)}`}
               hint="Business expenses"      accent={colors.secondary} />
          <Row label="Taxable Income"        value={formatCurrency(breakdown.taxableIncome)} />
          <Row label="Self-Employment Tax"   value={formatCurrency(breakdown.seTax)}
               hint="15.3% · SS + Medicare"  accent={colors.warning} />
          <Row label="Federal Income Tax"    value={formatCurrency(breakdown.incomeTax)}
               hint="Based on 2024 brackets" accent={colors.warning} />
          <Row label="Total Owed"            value={formatCurrency(breakdown.totalOwed)}
               accent={colors.danger}        isTotal />
        </>
      )}
    </Animated.View>
  );
}