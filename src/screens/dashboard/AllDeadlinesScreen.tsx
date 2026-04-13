import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeadlineCountdownCard } from '@/components/ui/homeComponents/DeadlineCountdownCard';
import { DeadlineDetailSheet } from '@/components/ui/homeComponents/DeadlineDetailSheet';
import type { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useRefresh } from '@/hooks/useRefresh';
import type { DashboardStackParamList } from '@/navigation/types';
import { homeStyles } from '@/styles/MainStackStyles/HomeStyles';
import { spacing, typography, useThemeColors, vs } from '@/theme';

type AllDeadlinesScreenProps = NativeStackScreenProps<DashboardStackParamList, 'AllDeadlines'>;

export default function AllDeadlinesScreen({}: AllDeadlinesScreenProps) {
  const colors = useThemeColors();
  const st = useMemo(() => homeStyles(colors), [colors]);
  const { deadlines, refetch, loading, toggleComplete } = useDeadlines();
  const { refreshing, onRefresh } = useRefresh(refetch);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

  const sortedDeadlines = useMemo(() => {
    if (!deadlines) return [];
    return [...deadlines].sort((a, b) => Number(a.isComplete) - Number(b.isComplete) || a.daysLeft - b.daysLeft);
  }, [deadlines]);

  const openDetail = useCallback((deadline: Deadline) => setSelectedDeadline(deadline), []);
  const closeDetail = useCallback(() => setSelectedDeadline(null), []);
  const handleToggleComplete = useCallback((id: string) => toggleComplete(id), [toggleComplete]);

  const renderItem = useCallback(
    ({ item, index }: { item: Deadline; index: number }) => (
      <DeadlineCountdownCard
        deadline={item}
        index={index}
        onPress={openDetail}
        onToggleComplete={handleToggleComplete}
      />
    ),
    [handleToggleComplete, openDetail],
  );

  const keyExtractor = useCallback((item: Deadline) => item.id, []);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All caught up!</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>No deadlines available</Text>
      </View>
    ),
    [colors.textPrimary, colors.textSecondary],
  );

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <FlatList
        data={sortedDeadlines as Deadline[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>All Deadlines</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {sortedDeadlines.length} item{sortedDeadlines.length === 1 ? '' : 's'}
            </Text>
          </View>
        }
        ListEmptyComponent={!loading ? ListEmptyComponent : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <DeadlineDetailSheet deadline={selectedDeadline} onClose={closeDetail} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: vs(32),
    gap: vs(8),
  },
  header: {
    marginBottom: vs(12),
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.bodyMedium,
    marginTop: vs(4),
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: vs(32),
    gap: vs(8),
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    ...typography.h3,
  },
  emptySubtitle: {
    ...typography.bodyMedium,
  },
});
