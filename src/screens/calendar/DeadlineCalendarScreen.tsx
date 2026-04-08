import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRefresh } from '@/hooks/useRefresh';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { DeadlineDetailSheet } from '@/components/ui/homeComponents/DeadlineDetailSheet';
import { CategoryFilterPills, DeadlineCard, MonthCalendar } from './components/index';
import { useCalendarDeadlines } from './hooks/useCalendarDeadlines';
import { FilterCategory } from './types/calendar.types';
import { buildMarkedDates, deadlinesForMonth } from './utils/calendarHelpers';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayKey = new Date().toISOString().slice(0, 10);       // YYYY-MM-DD
const currentMonth = new Date().toISOString().slice(0, 7);       // YYYY-MM

const toMonthLabel = (key: string): string =>
  new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DeadlineCalendarScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);

  const { deadlines, loading, refetch, toggleComplete } = useCalendarDeadlines();
  const { refreshing, onRefresh } = useRefresh(refetch);

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [visibleMonth, setVisibleMonth] = useState<string>(currentMonth);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [sheetDeadline, setSheetDeadline] = useState<Deadline | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────

  const markedDates = useMemo(
    () => buildMarkedDates(deadlines, colors, filter, selectedDate),
    [deadlines, colors, filter, selectedDate],
  );

  const monthDeadlines = useMemo(
    () => deadlinesForMonth(deadlines, visibleMonth, filter),
    [deadlines, visibleMonth, filter],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onDayPress = (dateString: string) => {
    void Haptics.selectionAsync();
    setSelectedDate(dateString);
    // snap visible month to match tapped day
    setVisibleMonth(dateString.slice(0, 7));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        {/* ── Header ── */}
        <Animated.View entering={FadeIn.delay(0).duration(200)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Calendar</Text>
            <Text style={styles.headerSubtitle}>Keep tax deadlines organized by month</Text>
          </View>
          <Animated.View>
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelectedDate(todayKey);
                setVisibleMonth(currentMonth);
              }}
              activeOpacity={0.82}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── Category filter pills ── */}
        <Animated.View entering={FadeIn.delay(60).duration(200)}>
          <CategoryFilterPills selected={filter} onChange={setFilter} />
        </Animated.View>

        {/* ── Calendar ── */}
        <Animated.View
          entering={FadeIn.delay(120).duration(200)}
          style={styles.calendarWrapper}
        >
          {loading ? (
            <Skeleton width="100%" height={vs(320)} borderRadius={radius.xl} />
          ) : (
            <MonthCalendar
              markedDates={markedDates}
              selectedDate={selectedDate}
              onDayPress={onDayPress}
              onMonthChange={(monthKey) => {
                setVisibleMonth(monthKey);
                // clear selected date when swiping to a different month
                setSelectedDate('');
              }}
            />
          )}
        </Animated.View>
        <Text style={styles.monthHeader}>
          {toMonthLabel(visibleMonth)} — {monthDeadlines.length} deadline{monthDeadlines.length === 1 ? '' : 's'}
        </Text>

        {/* ── Month deadline list (only scrollable area) ── */}
        {loading ? (
          <View style={styles.loadingList}>
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                width="auto"
                height={vs(72)}
                borderRadius={radius.lg}
                style={{ marginHorizontal: spacing.md }}
              />
            ))}
          </View>
        ) : (
          <FlatList
            data={monthDeadlines}
            keyExtractor={(item) => item.id}
            style={styles.deadlinesList}
            contentContainerStyle={styles.deadlinesListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void onRefresh()}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🧾</Text>
                <Text style={styles.emptyTitle}>No deadlines this month</Text>
                <Text style={styles.emptyText}>
                  You are clear for now. New dates appear as your tax cycle updates.
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeIn.delay(index * 40).duration(220)}>
                <DeadlineCard
                  deadline={item}
                  onCardPress={(d) => setSheetDeadline(d)}
                  onToggleComplete={toggleComplete}
                />
              </Animated.View>
            )}
          />
        )}
      </View>

      {/* ── Detail bottom sheet ── */}
      <DeadlineDetailSheet
        deadline={sheetDeadline}
        onClose={() => setSheetDeadline(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>, bottomInset: number) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingTop: vs(6), gap: vs(6) },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: vs(8),
      paddingBottom: vs(14),
    },
    headerLeft: { gap: vs(3), flex: 1, paddingRight: spacing.sm },
    headerTitle: { ...typography.h1, color: colors.textPrimary },
    headerSubtitle: { ...typography.bodySmall, color: colors.textSecondary },
    todayBtn: {
      paddingHorizontal: s(14),
      paddingVertical: vs(7),
      borderRadius: radius.full,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: `${colors.primary}40`,
    },
    todayBtnText: { ...typography.labelSmall, color: colors.primary, fontWeight: '700' },
    calendarWrapper: {
      marginHorizontal: spacing.md,
    },
    monthHeader: {
      ...typography.h3,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      marginBottom: vs(10),
      marginTop: vs(12),
    },
    loadingList: {
      gap: vs(8),
      marginTop: vs(8),
      paddingBottom: vs(24),
    },
    deadlinesList: {
      flex: 1,
    },
    deadlinesListContent: {
      paddingBottom: vs(24) + bottomInset + vs(40),
    },
    empty: { alignItems: 'center', paddingVertical: vs(28), gap: vs(6) },
    emptyEmoji: { fontSize: s(34) },
    emptyTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
    emptyText: { ...typography.bodySmall, color: colors.textSecondary },
  });
