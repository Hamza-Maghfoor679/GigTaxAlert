import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRefresh } from '@/hooks/useRefresh';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { DeadlineDetailSheet } from '@/components/ui/homeComponents/DeadlineDetailSheet';
import { CalendarDeadlineList, CategoryFilterPills, MonthCalendar } from './components/index';
import { useCalendarDeadlines } from './hooks/useCalendarDeadlines';
import { FilterCategory } from './types/calendar.types';
import { buildMarkedDates, deadlinesForMonth } from './utils/calendarHelpers';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayKey    = new Date().toISOString().slice(0, 10);       // YYYY-MM-DD
const currentMonth = new Date().toISOString().slice(0, 7);       // YYYY-MM

const toMonthLabel = (key: string): string =>
  new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DeadlineCalendarScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const { deadlines, loading, refetch, toggleComplete } = useCalendarDeadlines();
  const { refreshing, onRefresh } = useRefresh(refetch);

  const [selectedDate,  setSelectedDate]  = useState<string>(todayKey);
  const [visibleMonth,  setVisibleMonth]  = useState<string>(currentMonth);
  const [filter,        setFilter]        = useState<FilterCategory>('all');
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
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

        {/* ── Month deadline list ── */}
        {loading ? (
          <View style={{ gap: vs(8), marginTop: vs(8) }}>
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
          <CalendarDeadlineList
            deadlines={monthDeadlines}
            monthLabel={toMonthLabel(visibleMonth)}
            onCardPress={(d) => setSheetDeadline(d)}
            onToggleComplete={toggleComplete}
          />
        )}
      </ScrollView>

      {/* ── Detail bottom sheet ── */}
      <DeadlineDetailSheet
        deadline={sheetDeadline}
        onClose={() => setSheetDeadline(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingTop: vs(6), paddingBottom: vs(40), gap: vs(6) },
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
  });
