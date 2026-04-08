import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRefresh } from '@/hooks/useRefresh';
import type { EstimatorStackParamList } from '@/navigation/types';
import { radius, vs, useThemeColors } from '@/theme';
import { useIncomeEstimator } from './hooks/useIncomeEstimator';
import {
  IncomeForm,
  QuarterSelector,
  SafeToSpendCard,
  TaxBreakdownCard,
  YearToDateSummary,
} from './components';
import { createEstimatorScreenStyles } from './styles/styles';

export type IncomeEstimatorScreenProps = NativeStackScreenProps<
  EstimatorStackParamList,
  'IncomeEstimator'
>;

export default function IncomeEstimatorScreen({ navigation }: IncomeEstimatorScreenProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createEstimatorScreenStyles(colors), [colors]);
  const tabBarHeight = useBottomTabBarHeight();


  const {
    selectedQuarter, selectedYear, setQuarter, setYear,
    form, setForm, saveEntry, isSaving,
    breakdown, safeAmount,
    quarterSummaries,
    loading,
  } = useIncomeEstimator();

  const { refreshing, onRefresh } = useRefresh(async () => {
    // re-trigger fetch logic here
  });

  const onExportPDF = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming soon', 'PDF export will be available in the next update.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── FIXED TOP SECTION (Header + Quarter Selector) ── */}
      <View style={styles.fixedHeaderContainer}>
        <Animated.View entering={FadeIn.delay(0).duration(200)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeTxt}>PRO</Text>
            </View>
            <Text style={styles.title}>Estimator</Text>
            <Text style={styles.subtitle}>Track income, taxes, and spendable cash</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={onExportPDF} activeOpacity={0.8}>
            <Text style={styles.exportBtnTxt}>📄 Export PDF</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(60).duration(200)}>
          <QuarterSelector
            selected={selectedQuarter}
            year={selectedYear}
            onChange={setQuarter}
            onYearChange={setYear}
          />
        </Animated.View>
      </View>

      {/* ── SCROLLABLE SECTION (Everything else) ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + vs(20) }]}
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
        {loading ? (
          <>
            <Skeleton width="100%" height={vs(180)} borderRadius={radius.xl} />
            <Skeleton width="100%" height={vs(220)} borderRadius={radius.xl} />
            <Skeleton width="100%" height={vs(280)} borderRadius={radius.xl} />
          </>
        ) : (
          <>
            {/* Safe to Spend starts the scrollable area */}
            <SafeToSpendCard
              safeAmount={safeAmount}
              grossIncome={breakdown.grossIncome}
              totalOwed={breakdown.totalOwed}
              quarter={selectedQuarter}
              delay={120}
            />

            <Animated.View entering={FadeIn.delay(180).duration(200)}>
              <IncomeForm
                form={form}
                onChange={setForm}
                onSave={saveEntry}
                isSaving={isSaving}
              />
            </Animated.View>

            <TaxBreakdownCard breakdown={breakdown} delay={240} />

            <YearToDateSummary
              summaries={quarterSummaries}
              selectedQuarter={selectedQuarter}
              onSelect={setQuarter}
              delay={300}
            />

            <Animated.View entering={FadeIn.delay(360).duration(200)}>
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