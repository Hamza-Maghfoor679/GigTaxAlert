import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation/types';
import { useDeadlines } from '@/hooks/useDeadlines';
import { spacing, typography, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { useIncomeEstimator } from './hooks/useIncomeEstimator';
import type { Quarter } from './types/estimator.types';

export type TaxSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TaxSummary'
>;

const DATE_RANGES: Record<Quarter, string> = {
  Q1: 'Jan-Mar',
  Q2: 'Apr-Jun',
  Q3: 'Jul-Sep',
  Q4: 'Oct-Dec',
};

export default function TaxSummaryScreen({ navigation }: TaxSummaryScreenProps) {
  const colors = useThemeColors();
  const { selectedYear, quarterSummaries, setQuarter } = useIncomeEstimator();
  const { deadlines } = useDeadlines();

  const totalIncome = useMemo(
    () => quarterSummaries.reduce((sum, q) => sum + q.grossIncome, 0),
    [quarterSummaries],
  );
  const totalTax = useMemo(
    () => quarterSummaries.reduce((sum, q) => sum + q.estimatedTax, 0),
    [quarterSummaries],
  );
  const quartersFiled = useMemo(
    () => quarterSummaries.filter((q) => q.hasData).length,
    [quarterSummaries],
  );

  const nextDeadline = useMemo(() => {
    return [...deadlines]
      .filter((d) => !d.isComplete && d.dueDate.getTime() >= Date.now())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  }, [deadlines]);

  const onExportPDF = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming soon', 'PDF export will be available in the next update.');
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tax Summary</Text>
        <Text style={styles.subtitle}>{selectedYear} Overview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Annual totals</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total income this year</Text>
            <Text style={styles.value}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total tax owed this year</Text>
            <Text style={[styles.value, { color: colors.danger }]}>{formatCurrency(totalTax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net kept this year</Text>
            <Text style={styles.value}>{formatCurrency(totalIncome - totalTax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quarters filed</Text>
            <Text style={styles.value}>{quartersFiled} / 4</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Per-quarter breakdown</Text>
          {quarterSummaries.map((summary) => (
            <TouchableOpacity
              key={summary.quarter}
              style={styles.quarterRow}
              onPress={() => {
                setQuarter(summary.quarter);
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.quarterLeft}>
                <Text style={styles.quarterTitle}>{summary.quarter}</Text>
                <Text style={styles.quarterRange}>{DATE_RANGES[summary.quarter]}</Text>
              </View>
              {summary.hasData ? (
                <View style={styles.quarterRight}>
                  <Text style={styles.quarterIncome}>{formatCurrency(summary.grossIncome)}</Text>
                  <Text style={[styles.quarterTax, { color: colors.danger }]}>
                    Tax: {formatCurrency(summary.estimatedTax)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>No entry yet</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {nextDeadline ? (
          <TouchableOpacity
            style={styles.deadlineBanner}
            onPress={() => {
              navigation.navigate('Home' as never);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.deadlineText}>
              {nextDeadline.title} - due {nextDeadline.dueDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.exportButton} onPress={onExportPDF} activeOpacity={0.85}>
          <Text style={styles.exportText}>📄 Export PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    header: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    backButtonText: { ...typography.labelSmall, color: colors.textPrimary },
    title: { ...typography.h2, color: colors.textPrimary },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary },
    scrollContent: {
      gap: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: { ...typography.bodyMedium, color: colors.textPrimary },
    value: { ...typography.bodyMedium, color: colors.textPrimary, fontFamily: 'Inter_700Bold' },
    quarterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    quarterLeft: { gap: 2 },
    quarterTitle: { ...typography.labelLarge, color: colors.textPrimary },
    quarterRange: { ...typography.caption, color: colors.textSecondary },
    quarterRight: { alignItems: 'flex-end', gap: 2 },
    quarterIncome: { ...typography.bodyMedium, color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
    quarterTax: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
    emptyText: { ...typography.bodySmall, color: colors.textSecondary },
    deadlineBanner: {
      borderRadius: 14,
      padding: spacing.md,
      backgroundColor: `${colors.warning}20`,
      borderWidth: 1,
      borderColor: `${colors.warning}66`,
    },
    deadlineText: { ...typography.bodySmall, color: colors.textPrimary },
    exportButton: {
      borderRadius: 14,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    exportText: { ...typography.labelLarge, color: '#fff' },
  });
