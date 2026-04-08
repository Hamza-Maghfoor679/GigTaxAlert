import { StyleSheet } from 'react-native';

import { radius, s, spacing, typography, useThemeColors, vs } from '@/theme';

export const makeSettingsStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: vs(48) },
    header: { paddingHorizontal: spacing.md, paddingTop: vs(8), paddingBottom: vs(20) },
    headerTitle: { ...typography.h1, color: colors.textPrimary },
    headerSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: vs(2) },
    avatarCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: spacing.md,
      marginBottom: vs(24),
    },
    avatar: {
      width: s(48),
      height: vs(48),
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
    },
    avatarText: { fontFamily: 'Inter_700Bold', fontSize: s(18), color: colors.primary },
    avatarName: { ...typography.labelLarge, color: colors.textPrimary },
    avatarEmail: { ...typography.bodySmall,  color: colors.textSecondary, marginTop: vs(2) },
    sectionLabel: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: s(12),
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginHorizontal: spacing.md,
      marginBottom: vs(8),
      marginTop: vs(4),
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: spacing.md,
      marginBottom: vs(20),
      overflow: 'hidden',
    },
  });