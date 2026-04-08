import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeSkeleton } from '@/components/ui/HomeSkeleton';

import { useDeadlines } from '@/hooks/useDeadlines';
import { useRefresh } from '@/hooks/useRefresh';
import type { DashboardStackParamList, RootStackParamList } from '@/navigation/types';
import { homeStyles } from '@/styles/MainStackStyles/HomeStyles';
import { s, spacing, typography, vs, useThemeColors } from '@/theme';
import { getGreeting, getFormattedDate } from '@/utils/dateHelpers';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { TaxEstimateWidget } from '@/components/ui/homeComponents/TaxEstimateWidget';
import { UrgencyBanner } from '@/components/ui/homeComponents/UrgencyBanner';
import { DeadlineCountdownCard } from '@/components/ui/homeComponents/DeadlineCountdownCard';
import { DeadlineDetailSheet } from '@/components/ui/homeComponents/DeadlineDetailSheet';
import { useTaxEstimate } from '@/hooks/Usetaxestimate ';
import { useUserProfile } from '@/context/UserProfileContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type HomeScreenProps = NativeStackScreenProps<DashboardStackParamList, 'Home'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const rootNav = useNavigation<RootNav>();
  const colors = useThemeColors();
  const st = useMemo(() => homeStyles(colors), [colors]);

  const { deadlines, refetch, loading, toggleComplete } = useDeadlines();
  const { estimate } = useTaxEstimate();
  const { displayName } = useUserProfile();
  const { refreshing, onRefresh } = useRefresh(refetch);

  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────

  const active = deadlines?.filter((d) => !d.isComplete) ?? [];
  const completed = deadlines?.filter((d) => d.isComplete) ?? [];
  const upcoming = active.slice().sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);
  const avatarInitials = useMemo(() => {
    const normalized = (displayName ?? '').trim();
    if (!normalized) return 'JD';
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [displayName]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openDetail = useCallback((deadline: Deadline) => setSelectedDeadline(deadline), []);
  const closeDetail = useCallback(() => setSelectedDeadline(null), []);
  const handleToggleComplete = useCallback((id: string) => toggleComplete(id), [toggleComplete]);
  const handleSeeAll = useCallback(() => {
    void Haptics.selectionAsync();
    Alert.alert('Wait for a little while understanding the flow');
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: vs(10) },
        sectionLbl: { ...typography.h3, color: colors.textPrimary },
        seeAll: { ...typography.labelSmall, color: colors.primary },
        cardGap: { paddingHorizontal: spacing.md, gap: vs(8) },
        completedHdr: { ...typography.labelSmall, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: spacing.md, marginTop: vs(24), marginBottom: vs(8) },
        emptyBox: { alignItems: 'center', paddingVertical: vs(32), gap: vs(8) },
        emptyEmoji: { fontSize: s(40) },
        emptyTitle: { ...typography.h3, color: colors.textPrimary },
        emptySubtitle: { ...typography.bodyMedium, color: colors.textSecondary },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={st.scrollContent}
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
        {loading && !deadlines ? (
          <HomeSkeleton st={st} />
        ) : (
          <>
            {/* ── Header ── */}
            <Animated.View entering={FadeIn.delay(0).duration(200)} style={st.header}>
              <View>
                <Text style={st.greeting}>{getGreeting()}</Text>
                <Text style={st.headerTitle}>GigTax Alert</Text>
              </View>
              <View style={st.headerRight}>

                <TouchableOpacity
                  style={st.avatar}
                  activeOpacity={0.85}
                  onPress={() => { rootNav.navigate('Settings'); }}
                >
                  <Text style={st.avatarText}>{avatarInitials}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ── Date pill ── */}
            <Animated.View entering={FadeIn.delay(40).duration(200)} style={st.datePill}>
              <Text style={st.datePillText}>📅  {getFormattedDate()}</Text>
            </Animated.View>

            {/* ── Urgency banner (< 7 days) ── */}
            {deadlines && <UrgencyBanner deadlines={deadlines} onPress={openDetail} />}

            {/* ── Tax estimate widget (Pro) ── */}
            <TaxEstimateWidget
              estimate={estimate ?? null}
              delay={120}
              // onPress={() => rootNav.navigate('Estimator')}
              onPress={() => { }}
            />

            {/* ── Upcoming deadlines (next 3) ── */}
            <Animated.View entering={FadeIn.delay(180).duration(200)} style={styles.sectionRow}>
              <Text style={styles.sectionLbl}>Upcoming Deadlines</Text>
              <TouchableOpacity
                onPress={handleSeeAll}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.cardGap}>
              {upcoming.length === 0 ? (
                <Animated.View entering={FadeIn.delay(240).duration(200)} style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🎉</Text>
                  <Text style={styles.emptyTitle}>All caught up!</Text>
                  <Text style={styles.emptySubtitle}>No upcoming deadlines</Text>
                </Animated.View>
              ) : (
                upcoming.map((d, i) => (
                  <DeadlineCountdownCard
                    key={d.id}
                    deadline={d as unknown as Deadline}
                    index={i}
                    onPress={openDetail}
                    onToggleComplete={handleToggleComplete}
                  />
                ))
              )}
            </View>

            {/* ── Completed section ── */}
            {completed.length > 0 && (
              <>
                <Text style={styles.completedHdr}>
                  Completed · {completed.length}
                </Text>
                <View style={styles.cardGap}>
                  {completed.map((d, i) => (
                    <DeadlineCountdownCard
                      key={d.id}
                      deadline={d as unknown as Deadline}
                      index={i}
                      onPress={openDetail}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Detail bottom sheet ── */}
      <DeadlineDetailSheet
        deadline={selectedDeadline}
        onClose={closeDetail}
      />
    </SafeAreaView>
  );
}