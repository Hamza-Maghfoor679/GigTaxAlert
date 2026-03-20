import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';

import type { DeadlineItem } from '@/stores/deadlineStore';
import { spacing, typography, useThemeColors } from '@/theme';

import { DeadlineCard } from './DeadlineCard';

type DeadlineListProps = {
  deadlines: DeadlineItem[];
  onItemPress?: (item: DeadlineItem) => void;
};

export function DeadlineList({ deadlines, onItemPress }: DeadlineListProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    list: {
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    sep: {
      height: spacing.sm,
    },
    empty: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });

  const renderItem: ListRenderItem<DeadlineItem> = ({ item }) => (
    <DeadlineCard
      item={item}
      onPress={onItemPress ? () => onItemPress(item) : undefined}
    />
  );

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={deadlines}
      keyExtractor={(d) => d.id}
      ListEmptyComponent={
        <Text style={[typography.bodyMedium, styles.empty]}>
          No deadlines yet. Pull to refresh after connecting Supabase.
        </Text>
      }
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}
