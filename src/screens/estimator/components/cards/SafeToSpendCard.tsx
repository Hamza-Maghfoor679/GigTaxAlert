import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, s, ms, spacing, typography, vs, wp, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';

type Props = {
  safeAmount:  number;
  grossIncome: number;
  totalOwed:   number;
  quarter:     string;
  delay?:      number;
};

export function SafeToSpendCard({ safeAmount, grossIncome, totalOwed, quarter, delay = 0 }: Props) {
  const colors   = useThemeColors();
  const styles   = createStyles(colors);
  const spendPct = grossIncome > 0 ? (safeAmount  / grossIncome) * 100 : 0;
  const taxPct   = grossIncome > 0 ? (totalOwed   / grossIncome) * 100 : 0;

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)} style={styles.card}>
      <View style={styles.blob} />

      {/* ── Top row — stacks vertically if badge would overflow ── */}
      <View style={styles.topRow}>
        <View style={styles.amountBlock}>
          <Text style={styles.label}>Safe to spend</Text>

          {/*
            adjustsFontSizeToFit + numberOfLines shrinks the font before it
            ever clips. minimumFontScale = 0.6 means it won't go below 60%
            of the base size (so displayLarge ~32pt won't drop below ~19pt).
          */}
          <Text
            style={styles.amount}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
          >
            {grossIncome > 0 ? formatCurrency(safeAmount) : '--'}
          </Text>

          <Text style={styles.subLabel}>this {quarter}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeTxt} numberOfLines={1}>💸 Spendable</Text>
        </View>
      </View>

      {grossIncome > 0 && (
        <>
          {/* ── Progress bar ── */}
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${spendPct}%` }]} />
          </View>

          {/* ── Split row — each value also adjusts font size ── */}
          <View style={styles.splitRow}>
            {[
              { val: formatCurrency(grossIncome), lbl: 'Gross income', align: 'flex-start'  as const },
              { val: `${taxPct.toFixed(0)}%`,     lbl: 'Tax rate',     align: 'center'       as const },
              { val: formatCurrency(totalOwed),   lbl: 'Set aside',    align: 'flex-end'    as const },
            ].map(({ val, lbl, align }) => (
              <View key={lbl} style={[styles.splitItem, { alignItems: align }]}>
                <Text
                  style={styles.splitVal}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.7}
                >
                  {val}
                </Text>
                <Text style={styles.splitLbl} numberOfLines={1}>{lbl}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: {
      borderRadius:    radius.xl,
      backgroundColor: colors.secondary,
      padding:         spacing.md,
      overflow:        'hidden',
      gap:             vs(10),
      minHeight:       vs(150)
    },
    blob: {
      position:        'absolute',
      width:           s(160),
      height:          s(160),
      borderRadius:    radius.full,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top:             vs(-50),
      right:           s(-30),
    },

    // ── Top row ─────────────────────────────────────────────────────────────
    topRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      gap:            s(8),
    },
    // flex: 1 so it fills available space and lets the badge stay fixed-width
    amountBlock: {
      flex: 1,
      gap:  vs(2),
    },
    badge: {
      backgroundColor:  'rgba(255,255,255,0.2)',
      borderRadius:     radius.full,
      paddingHorizontal: s(10),
      paddingVertical:  vs(4),
      // Fixed width prevents badge from being pushed off screen
      alignSelf:        'flex-start',
      flexShrink:       0,
    },
    badgeTxt: { ...typography.labelSmall, color: '#FFF' },

    // ── Amount ──────────────────────────────────────────────────────────────
    label:    { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginBottom: vs(2) },
    amount: {
      // ms() (moderateScale) grows/shrinks more gently than s() on large screens
      fontSize:   ms(32, 0.4),
      fontFamily: 'Inter_700Bold',
      color:      '#FFF',
      lineHeight: undefined,
      // Ensures adjustsFontSizeToFit has room to work within the flex:1 container
      width:      '100%',
    },
    subLabel: { ...typography.caption, color: 'rgba(255,255,255,0.65)' },

    // ── Bar ─────────────────────────────────────────────────────────────────
    barBg: {
      height:          vs(6),
      borderRadius:    radius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      overflow:        'hidden',
    },
    barFill: {
      height:          '100%',
      borderRadius:    radius.full,
      backgroundColor: 'rgba(255,255,255,0.75)',
    },

    // ── Split row ────────────────────────────────────────────────────────────
    splitRow: {
      flexDirection: 'row',
      // Equal thirds — each item gets exactly 1/3 of card width
      gap:           0,
    },
    splitItem: {
      flex: 1,
      gap:  vs(2),
    },
    splitVal: {
      // ms with 0.3 factor = gentle scaling; won't blow up on tablets
      fontSize:   ms(14, 0.3),
      fontFamily: 'Inter_600SemiBold',
      color:      '#FFF',
    },
    splitLbl: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.65)',
    },
  });