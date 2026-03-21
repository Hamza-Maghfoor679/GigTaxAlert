import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { Quarter, QuarterSummary } from '../../types/estimator.types';

type Props = {
  summaries: QuarterSummary[];
  selectedQuarter: Quarter;
  onSelect: (q: Quarter) => void;
  delay?: number;
};

export function YearToDateSummary({ summaries, selectedQuarter, onSelect, delay = 0 }: Props) {
  const colors = useThemeColors();
  const totalIncome = summaries.reduce((sum, q) => sum + q.grossIncome, 0);
  const totalTax = summaries.reduce((sum, q) => sum + q.estimatedTax, 0);
  const styles = createStyles(colors);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Year to Date</Text>
        <Text style={styles.ytdTotal}>{summaries.filter((item) => item.hasData).length} / 4 quarters logged</Text>
      </View>

      <View style={styles.grid}>
        {summaries.map((q, i) => {
          const isActive = q.quarter === selectedQuarter;
          const dotColor = q.hasData ? colors.secondary : colors.textDisabled;
          const textColor = isActive ? colors.primary : colors.textPrimary;

          return (
            <Animated.View key={q.quarter} entering={FadeInDown.delay(delay + i * 50).springify().damping(18)} style={styles.tileWrap}>
              <TouchableOpacity
                style={[
                  styles.tile,
                  { borderColor: isActive ? colors.primary : colors.border },
                  isActive && styles.tileActive,
                ]}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onSelect(q.quarter);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.tileHeader}>
                  <Text style={[styles.tileQ, { color: textColor }]}>{q.quarter}</Text>
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                </View>
                {q.hasData ? (
                  <>
                    <Text style={[styles.incomeVal, { color: colors.textPrimary }]}>{formatCurrency(q.grossIncome)}</Text>
                    <View style={styles.taxRow}>
                      <Text style={styles.taxLbl}>Tax owed</Text>
                      <Text style={[styles.taxVal, { color: colors.danger }]}>{formatCurrency(q.estimatedTax)}</Text>
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

      {totalIncome > 0 && (
        <View style={styles.strip}>
          <View style={styles.stripItem}>
            <Text style={styles.stripVal}>{formatCurrency(totalIncome)}</Text>
            <Text style={styles.stripLbl}>Total income</Text>
          </View>
          <View style={[styles.stripItem, styles.stripSplit, { borderLeftColor: colors.border }]}>
            <Text style={[styles.stripVal, { color: colors.danger }]}>{formatCurrency(totalTax)}</Text>
            <Text style={styles.stripLbl}>Total tax</Text>
          </View>
          <View style={[styles.stripItem, styles.stripSplit, { borderLeftColor: colors.border }]}>
            <Text style={[styles.stripVal, { color: colors.secondary }]}>{formatCurrency(totalIncome - totalTax)}</Text>
            <Text style={styles.stripLbl}>Net kept</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    wrapper: { gap: vs(12) },
    header: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'baseline' },
    title: { ...typography.h3, color: colors.textPrimary },
    ytdTotal: { ...typography.labelSmall, color: colors.textSecondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -s(5) },
    tileWrap: { width: '50%', paddingHorizontal: s(5), marginBottom: vs(10) },
    tile: {
      minHeight: vs(112),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: s(12),
      gap: vs(8),
    },
    tileActive: { borderWidth: 2 },
    tileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tileQ: { ...typography.labelLarge, fontWeight: '700' },
    dot: { width: s(8), height: s(8), borderRadius: radius.full },
    incomeVal: { ...typography.h3 },
    taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taxLbl: { ...typography.caption, color: colors.textSecondary },
    taxVal: { ...typography.labelSmall },
    emptyTxt: { ...typography.caption, color: colors.textDisabled, marginTop: vs(2) },
    strip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: vs(12),
      paddingHorizontal: spacing.md,
    },
    stripItem: { alignItems: 'center', gap: vs(3) },
    stripSplit: { borderLeftWidth: 1, paddingLeft: spacing.md },
    stripVal: { ...typography.h3, color: colors.textPrimary },
    stripLbl: { ...typography.caption, color: colors.textSecondary },
  });
