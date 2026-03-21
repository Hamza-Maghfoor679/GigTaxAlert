import type { Colors } from '@/theme';
import { radius, s, spacing, typography, vs } from '@/theme';
import { StyleSheet } from 'react-native';

/** Pass `useThemeColors()` so light/dark matches ThemeProvider (static `colors` import is always light). */
export function createEstimatorScreenStyles(colors: Colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    fixedHeaderContainer: {
      paddingHorizontal: spacing.md,
      backgroundColor: colors.background,
      zIndex: 10,
      paddingBottom: vs(8),
    },
    scrollContent: {
      paddingTop: vs(12),
      gap: vs(18),
      paddingHorizontal: spacing.md,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: vs(8),
      marginBottom: vs(12),
    },
    headerLeft: { gap: vs(2) },
    proBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: s(10),
      paddingVertical: vs(3),
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },
    proBadgeTxt: { ...typography.caption, color: '#FFF', fontWeight: '700', letterSpacing: 0.8 },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary },

    exportBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      paddingHorizontal: s(14),
      paddingVertical: vs(8),
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    exportBtnTxt: { ...typography.labelSmall, color: colors.textPrimary },

    summaryBtn: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: vs(14),
      alignItems: 'center',
    },
    summaryBtnTxt: { ...typography.labelLarge, color: colors.primary },
  });
}