import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { radius, s, typography, vs, useThemeColors } from '@/theme';
import { Quarter } from '../../types/estimator.types';

type Props = {
  selected: Quarter;
  year: number;
  onChange: (q: Quarter) => void;
  onYearChange: (y: number) => void;
};

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const QUARTER_DATES: Record<Quarter, string> = {
  Q1: 'Jan-Mar',
  Q2: 'Apr-Jun',
  Q3: 'Jul-Sep',
  Q4: 'Oct-Dec',
};

export function QuarterSelector({ selected, year, onChange, onYearChange }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <View style={styles.yearRow}>
        <TouchableOpacity
          style={styles.yearBtn}
          onPress={() => {
            void Haptics.selectionAsync();
            onYearChange(year - 1);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.yearBtnTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.yearLabel}>{year}</Text>
        <TouchableOpacity
          style={styles.yearBtn}
          onPress={() => {
            void Haptics.selectionAsync();
            onYearChange(year + 1);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.yearBtnTxt}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pillRow}>
        {QUARTERS.map((q) => {
          const isActive = q === selected;
          return (
            <TouchableOpacity
              key={q}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(q);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillQ, { color: isActive ? '#FFF' : colors.textPrimary }]}>{q}</Text>
              <Text style={[styles.pillDates, { color: isActive ? 'rgba(255,255,255,0.78)' : colors.textSecondary }]}>
                {QUARTER_DATES[q]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    wrapper: { gap: vs(10) },
    yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(16) },
    yearBtn: {
      width: s(32),
      height: s(32),
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    yearBtnTxt: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
    yearLabel: { ...typography.h3, color: colors.textPrimary, minWidth: s(60), textAlign: 'center' },
    pillRow: { flexDirection: 'row', gap: s(8) },
    pill: { flex: 1, paddingVertical: vs(10), borderRadius: radius.md, borderWidth: 1, alignItems: 'center', gap: vs(2) },
    pillQ: { ...typography.labelLarge, fontWeight: '700' },
    pillDates: { ...typography.caption },
  });
