import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, s, ms, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Quarter, QuarterSummary } from '../../types/estimator.types';

type Props = {
  summaries:       QuarterSummary[];
  selectedQuarter: Quarter;
  onSelect:        (q: Quarter) => void;
  delay?:          number;
};

export function YearToDateSummary({ summaries, selectedQuarter, onSelect, delay = 0 }: Props) {
  const colors      = useThemeColors();
  const styles      = createStyles(colors);
  const totalIncome = summaries.reduce((sum, q) => sum + q.grossIncome, 0);
  const totalTax    = summaries.reduce((sum, q) => sum + q.estimatedTax, 0);

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)} style={styles.wrapper}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Year to Date</Text>
        <Text style={styles.ytdTotal}>
          {summaries.filter((q) => q.hasData).length} / 4 quarters logged
        </Text>
      </View>

      {/* ── 2×2 grid ── */}
      <View style={styles.grid}>
        {summaries.map((q, i) => {
          const isActive  = q.quarter === selectedQuarter;
          const dotColor  = q.hasData ? colors.secondary : colors.textDisabled;
          const labelColor = isActive ? colors.primary : colors.textPrimary;

          return (
            <Animated.View
              key={q.quarter}
              entering={FadeIn.delay(delay + i * 24).duration(200)}
              style={styles.tileWrap}
            >
              <TouchableOpacity
                style={[
                  styles.tile,
                  { borderColor: isActive ? colors.primary : colors.border },
                  isActive && styles.tileActive,
                ]}
                onPress={() => { void Haptics.selectionAsync(); onSelect(q.quarter); }}
                activeOpacity={0.8}
              >
                {/* Quarter label + dot */}
                <View style={styles.tileHeader}>
                  <Text style={[styles.tileQ, { color: labelColor }]}>{q.quarter}</Text>
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                </View>

                {q.hasData ? (
                  <>
                    {/*
                      ✅ adjustsFontSizeToFit shrinks the income value before
                      it ever clips. width:'100%' gives RN a container to
                      measure against; without it the shrink never triggers.
                    */}
                    <Text
                      style={styles.incomeVal}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.65}
                    >
                      {formatCurrency(q.grossIncome)}
                    </Text>

                    <View style={styles.taxRow}>
                      <Text style={styles.taxLbl} numberOfLines={1}>Tax owed</Text>
                      {/*
                        ✅ flex:1 on taxVal so it can shrink when the number
                        is large — without it the value pushes the label off.
                      */}
                      <Text
                        style={[styles.taxVal, { color: colors.danger }]}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        minimumFontScale={0.7}
                      >
                        {formatCurrency(q.estimatedTax)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyTxt}>No data yet</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ── YTD totals strip ── */}
      {totalIncome > 0 && (
        <View style={styles.strip}>
          {[
            { val: formatCurrency(totalIncome),            lbl: 'Total income', color: colors.textPrimary  },
            { val: formatCurrency(totalTax),               lbl: 'Total tax',    color: colors.danger       },
            { val: formatCurrency(totalIncome - totalTax), lbl: 'Net kept',     color: colors.secondary    },
          ].map(({ val, lbl, color }, i) => (
            <View
              key={lbl}
              style={[
                styles.stripItem,
                i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: s(12) },
              ]}
            >
              {/*
                ✅ flex:1 on each strip column means each gets equal width,
                so a large number in one column can't push the others out.
                adjustsFontSizeToFit handles the rest.
              */}
              <Text
                style={[styles.stripVal, { color }]}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.65}
              >
                {val}
              </Text>
              <Text style={styles.stripLbl} numberOfLines={1}>{lbl}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    wrapper: { gap: vs(12) },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    title:    { ...typography.h3,        color: colors.textPrimary   },
    ytdTotal: { ...typography.labelSmall, color: colors.textSecondary },

    // ── Grid ────────────────────────────────────────────────────────────────
    grid:     { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -s(5) },
    tileWrap: { width: '50%', paddingHorizontal: s(5), marginBottom: vs(10) },
    tile: {
      minHeight:       vs(112),
      backgroundColor: colors.surface,
      borderRadius:    radius.lg,
      borderWidth:     1,
      padding:         s(12),
      gap:             vs(8),
    },
    tileActive: { borderWidth: 2 },

    tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tileQ: { ...typography.labelLarge, fontWeight: '700' },
    dot:   { width: s(8), height: s(8), borderRadius: radius.full },

    // ✅ ms() scales gently — income value won't blow up on tablets
    incomeVal: {
      fontSize:   ms(18, 0.35),
      fontFamily: 'Inter_700Bold',
      color:      colors.textPrimary,
      width:      '100%', // required for adjustsFontSizeToFit
    },

    taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: s(4) },
    taxLbl: { ...typography.caption, color: colors.textSecondary, flexShrink: 0 },
    taxVal: {
      fontSize:   ms(12, 0.3),
      fontFamily: 'Inter_600SemiBold',
      flexShrink: 1,   // ✅ shrinks before clipping the label
      textAlign:  'right',
    },

    emptyTxt: { ...typography.caption, color: colors.textDisabled, marginTop: vs(2) },

    // ── Strip ────────────────────────────────────────────────────────────────
    strip: {
      flexDirection:     'row',
      backgroundColor:   colors.surface,
      borderRadius:      radius.lg,
      borderWidth:       1,
      borderColor:       colors.border,
      paddingVertical:   vs(12),
      paddingHorizontal: spacing.md,
    },
    stripItem: {
      flex:       1,         // ✅ equal thirds — large numbers can't steal space
      alignItems: 'center',
      gap:        vs(3),
    },
    stripVal: {
      fontSize:   ms(16, 0.35),
      fontFamily: 'Inter_700Bold',
      width:      '100%',    // required for adjustsFontSizeToFit
      textAlign:  'center',
    },
    stripLbl: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  });