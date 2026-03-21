import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { CATEGORY_META } from '@/constants/deadlineCategories';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { FilterCategory } from '../../types';

type Props = {
  selected: FilterCategory;
  onChange: (filter: FilterCategory) => void;
};

const FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income_tax', label: 'Income Tax' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'self_employment', label: 'Self-Employed' },
  { key: 'vat', label: 'VAT' },
  { key: 'other', label: '1099 / Other' },
];

export function CategoryFilterPills({ selected, onChange }: Props) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    scroll: { paddingHorizontal: spacing.md, paddingBottom: vs(12) },
    pill: {
      paddingHorizontal: s(14),
      paddingVertical: vs(7),
      borderRadius: radius.full,
      borderWidth: 1,
      marginRight: s(8),
    },
    pillText: { ...typography.labelSmall, fontWeight: '600' },
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {FILTERS.map(({ key, label }) => {
        const isActive = selected === key;
        const meta = key !== 'all' ? CATEGORY_META[key] : null;
        const bg = isActive ? (meta ? meta.bg(colors) : `${colors.primary}18`) : colors.surface;
        const border = isActive ? (meta ? meta.color(colors) : colors.primary) : colors.border;
        const txtColor = isActive ? (meta ? meta.color(colors) : colors.primary) : colors.textSecondary;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.pill, { backgroundColor: bg, borderColor: border }]}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(key);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, { color: txtColor }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
