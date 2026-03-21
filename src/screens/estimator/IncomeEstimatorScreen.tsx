import * as Haptics from 'expo-haptics';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Skeleton } from '@/components/ui/Skeleton';
import { useRefresh } from '@/hooks/useRefresh';
import type { EstimatorStackParamList } from '@/navigation/types';
import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { useIncomeEstimator } from './hooks/useIncomeEstimator';
import {
  IncomeForm,
  QuarterSelector,
  SafeToSpendCard,
  TaxBreakdownCard,
  YearToDateSummary,
} from './components';

export type IncomeEstimatorScreenProps = NativeStackScreenProps<
  EstimatorStackParamList,
  'IncomeEstimator'
>;

export default function IncomeEstimatorScreen({ navigation }: IncomeEstimatorScreenProps) {
  const colors = useThemeColors();

  const {
    selectedQuarter, selectedYear, setQuarter, setYear,
    form, setForm, saveEntry, isSaving,
    breakdown, safeAmount,
    quarterSummaries,
    loading,
  } = useIncomeEstimator();

  const { refreshing, onRefresh } = useRefresh(async () => {
    // re-trigger fetch by cycling year — replace with direct refetch when wired up
  });

  const onExportPDF = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: wire to PDF generation (react-native-html-to-pdf or expo-print)
    Alert.alert('Coming soon', 'PDF export will be available in the next update.');
  };

  const styles = StyleSheet.create({
    safe:          { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingTop: vs(6), paddingBottom: vs(40), gap: vs(18), paddingHorizontal: spacing.md },

    // Header
    header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: vs(8) },
    headerLeft:  { gap: vs(2) },
    proBadge:    { paddingHorizontal: s(10), paddingVertical: vs(3), borderRadius: radius.full, backgroundColor: colors.primary },
    proBadgeTxt: { ...typography.caption, color: '#FFF', fontWeight: '700', letterSpacing: 0.8 },
    title:       { ...typography.h1, color: colors.textPrimary },
    subtitle:    { ...typography.bodySmall, color: colors.textSecondary },

    // Export button
    exportBtn: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             s(6),
      paddingHorizontal: s(14),
      paddingVertical: vs(8),
      borderRadius:    radius.full,
      borderWidth:     1,
      borderColor:     colors.border,
      backgroundColor: colors.background,
    },
    exportBtnTxt: { ...typography.labelSmall, color: colors.textPrimary },

    // View summary button
    summaryBtn: {
      backgroundColor: colors.surface,
      borderRadius:    radius.lg,
      borderWidth:     1,
      borderColor:     colors.border,
      paddingVertical: vs(14),
      alignItems:      'center',
    },
    summaryBtnTxt: { ...typography.labelLarge, color: colors.primary },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeTxt}>PRO</Text>
            </View>
            <Text style={styles.title}>Estimator</Text>
            <Text style={styles.subtitle}>Track income, taxes, and spendable cash by quarter</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={onExportPDF} activeOpacity={0.8}>
            <Text style={styles.exportBtnTxt}>📄 Export PDF</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Quarter selector ── */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
          <QuarterSelector
            selected={selectedQuarter}
            year={selectedYear}
            onChange={setQuarter}
            onYearChange={setYear}
          />
        </Animated.View>

        {loading ? (
          <>
            <Skeleton width="100%" height={vs(180)} borderRadius={radius.xl} />
            <Skeleton width="100%" height={vs(220)} borderRadius={radius.xl} />
            <Skeleton width="100%" height={vs(280)} borderRadius={radius.xl} />
          </>
        ) : (
          <>
            {/* ── Safe to spend hero ── */}
            <SafeToSpendCard
              safeAmount={safeAmount}
              grossIncome={breakdown.grossIncome}
              totalOwed={breakdown.totalOwed}
              quarter={selectedQuarter}
              delay={120}
            />

            {/* ── Income form ── */}
            <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
              <IncomeForm
                form={form}
                onChange={setForm}
                onSave={saveEntry}
                isSaving={isSaving}
              />
            </Animated.View>

            {/* ── Tax breakdown ── */}
            <TaxBreakdownCard breakdown={breakdown} delay={240} />

            {/* ── Year to date summary ── */}
            <YearToDateSummary
              summaries={quarterSummaries}
              selectedQuarter={selectedQuarter}
              onSelect={setQuarter}
              delay={300}
            />

            {/* ── View full summary ── */}
            <Animated.View entering={FadeInDown.delay(360).springify().damping(18)}>
              <TouchableOpacity
                style={styles.summaryBtn}
                onPress={() => {
                  void Haptics.selectionAsync();
                  navigation.navigate('TaxSummary');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.summaryBtnTxt}>View Full Tax Summary →</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
