import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
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
    lastSavedAt,
  } = useIncomeEstimator();
  const [showSavedModal, setShowSavedModal] = useState(false);

  useEffect(() => {
    if (!lastSavedAt) return;
    setShowSavedModal(true);
    const timer = setTimeout(() => {
      setShowSavedModal(false);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [lastSavedAt]);

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

      {showSavedModal ? (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(220)}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.28)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            paddingHorizontal: vs(16),
          }}
        >
          <Animated.View
            entering={ZoomIn.duration(260)}
            exiting={ZoomOut.duration(200)}
            style={{
              borderRadius: radius.xl,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: vs(24),
              paddingVertical: vs(20),
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
              minWidth: '82%',
              maxWidth: 360,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: vs(56),
                height: vs(56),
                borderRadius: radius.full,
                backgroundColor: `${colors.primary}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: vs(12),
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 28,
                  fontWeight: '800',
                  lineHeight: 30,
                }}
              >
                ✓
              </Text>
            </View>
            <Text
              style={{
                textAlign: 'center',
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: '700',
              }}
            >
              Your estimate has been saved
            </Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}