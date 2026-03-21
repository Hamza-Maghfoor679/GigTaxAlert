import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { Deadline } from './deadline.types';
import { CATEGORY_META } from './deadlineCategories';

type Props = {
  deadline: Deadline | null;
  onClose: () => void;
};

/**
 * DeadlineDetailSheet
 *
 * @gorhom/bottom-sheet panel that appears when a deadline card is tapped.
 * Shows:
 * - Plain-English description
 * - Penalty / consequence info
 * - "Pay now" CTA that deep-links to paymentUrl
 */
export function DeadlineDetailSheet({ deadline, onClose }: Props) {
  const colors    = useThemeColors();
  const sheetRef  = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%', '85%'], []);

  useEffect(() => {
    if (deadline) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [deadline]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handlePayNow = () => {
    if (!deadline?.paymentUrl) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void Linking.openURL(deadline.paymentUrl);
  };

  const meta = deadline ? CATEGORY_META[deadline.category] : null;

  const styles = StyleSheet.create({
    handle: {
      backgroundColor: colors.border,
      width: s(40),
      height: vs(4),
      borderRadius: radius.full,
      alignSelf: 'center',
      marginTop: vs(8),
      marginBottom: vs(4),
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: vs(40),
      gap: vs(20),
    },
    // Header
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: s(12),
      marginTop: vs(12),
    },
    title:   { ...typography.h2, color: colors.textPrimary, flex: 1 },
    pill:    { paddingHorizontal: s(10), paddingVertical: vs(4), borderRadius: radius.full, marginTop: vs(4) },
    pillTxt: { ...typography.labelSmall, fontWeight: '700' },
    dueRow:  { flexDirection: 'row', alignItems: 'center', gap: s(8) },
    dueDate: { ...typography.bodyMedium, color: colors.textSecondary },
    daysChip:{ paddingHorizontal: s(10), paddingVertical: vs(3), borderRadius: radius.full, backgroundColor: colors.primaryLight },
    daysChipTxt: { ...typography.labelSmall, color: colors.primary, fontWeight: '700' },

    // Sections
    section: {
      gap: vs(6),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    sectionIcon: { fontSize: s(20) },
    sectionTitle:{ ...typography.labelLarge, color: colors.textPrimary },
    sectionBody: { ...typography.bodyMedium, color: colors.textSecondary, lineHeight: vs(22) },

    // Penalty section
    penaltySection: {
      gap: vs(6),
      backgroundColor: colors.danger + '0D',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.danger + '30',
      padding: spacing.md,
    },
    penaltyTitle: { ...typography.labelLarge, color: colors.danger },
    penaltyBody:  { ...typography.bodyMedium, color: colors.textSecondary, lineHeight: vs(22) },

    // CTA
    payBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      paddingVertical: vs(16),
      alignItems: 'center',
    },
    payBtnText: { ...typography.labelLarge, color: '#FFF', fontSize: s(16) },
  });

  if (!deadline || !meta) return null;

  const daysLabel = deadline.daysLeft === 0
    ? 'Due today!'
    : deadline.daysLeft < 0
    ? 'Overdue'
    : `${deadline.daysLeft} days left`;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleComponent={() => <View style={styles.handle} />}
      backgroundStyle={{ backgroundColor: colors.background }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{deadline.title}</Text>
          <View style={[styles.pill, { backgroundColor: meta.bg(colors) }]}>
            <Text style={[styles.pillTxt, { color: meta.color(colors) }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.dueRow}>
          <Text style={styles.dueDate}>Due {deadline.dueDate}</Text>
          <View style={styles.daysChip}>
            <Text style={styles.daysChipTxt}>{daysLabel}</Text>
          </View>
        </View>

        {/* ── What is it? ── */}
        <View style={styles.section}>
          <Text style={styles.sectionIcon}>📋</Text>
          <Text style={styles.sectionTitle}>What is this?</Text>
          <Text style={styles.sectionBody}>{deadline.description}</Text>
        </View>

        {/* ── Penalty info ── */}
        <View style={styles.penaltySection}>
          <Text style={styles.sectionIcon}>⚠️</Text>
          <Text style={styles.penaltyTitle}>If you miss this</Text>
          <Text style={styles.penaltyBody}>{deadline.penaltyInfo}</Text>
        </View>

        {/* ── Pay now CTA ── */}
        {!!deadline.paymentUrl && (
          <TouchableOpacity style={styles.payBtn} onPress={handlePayNow} activeOpacity={0.85}>
            <Text style={styles.payBtnText}>Pay now →</Text>
          </TouchableOpacity>
        )}

      </BottomSheetScrollView>
    </BottomSheet>
  );
}
