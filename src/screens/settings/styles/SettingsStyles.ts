import { StyleSheet } from 'react-native';

import { radius, s, spacing, typography, vs } from '@/theme';
import type { Colors } from '@/theme';

export const makeSettingsStyles = (colors: Colors) =>
  StyleSheet.create({
    // ── Layout ────────────────────────────────────────────────────────────
    safe:          { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: vs(48) },

    // ── Header ────────────────────────────────────────────────────────────
    header:      { paddingHorizontal: spacing.md, paddingTop: vs(8), paddingBottom: vs(20) },
    headerTitle: { ...typography.h1, color: colors.textPrimary },
    headerSub:   { ...typography.bodySmall, color: colors.textSecondary, marginTop: vs(2) },

    // ── Avatar card ───────────────────────────────────────────────────────
    avatarCard: {
      marginHorizontal: spacing.md,
      marginBottom:     vs(24),
      backgroundColor:  colors.surface,
      borderRadius:     radius.xl,
      borderWidth:      1,
      borderColor:      colors.border,
      padding:          spacing.md,
      flexDirection:    'row',
      alignItems:       'center',
      gap:              s(14),
    },
    avatar: {
      width:           s(56),
      height:          s(56),
      borderRadius:    radius.full,
      backgroundColor: colors.primary,
      alignItems:      'center',
      justifyContent:  'center',
    },
    avatarText:  { ...typography.h2, color: '#FFF' },
    avatarName:  { ...typography.labelLarge, color: colors.textPrimary },
    avatarEmail: { ...typography.bodySmall,  color: colors.textSecondary, marginTop: vs(2) },

    // ── Section ───────────────────────────────────────────────────────────
    sectionLabel: {
      ...typography.labelSmall,
      color:           colors.textSecondary,
      textTransform:   'uppercase',
      letterSpacing:   1,
      paddingHorizontal: spacing.md,
      marginBottom:    vs(8),
      marginTop:       vs(4),
    },
    sectionCard: {
      marginHorizontal: spacing.md,
      marginBottom:     vs(10),
      backgroundColor:  colors.surface,
      borderRadius:     radius.xl,
      borderWidth:      1,
      borderColor:      colors.border,
      overflow:         'hidden',
    },

    // ── Setting row ───────────────────────────────────────────────────────
    row: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: s(16),
      paddingVertical:   vs(14),
      gap:               s(8),
    },
    rowDivider: { height: 1, backgroundColor: colors.border, marginLeft: s(52) },
    rowIconBox: {
      width:           s(36),
      height:          s(36),
      borderRadius:    radius.md,
      alignItems:      'center',
      justifyContent:  'center',
    },
    rowIcon:    { fontSize: s(18) },
    rowContent: { flex: 1, gap: vs(2) },
    rowLabel:   { ...typography.labelSmall, color: colors.textPrimary },
    rowSub:     { ...typography.bodySmall,  color: colors.textSecondary },
    rowValue:   { ...typography.bodySmall,  color: colors.textSecondary },
    rowChevron: { ...typography.h3, color: colors.textDisabled },

    // ── Skeleton ──────────────────────────────────────────────────────────
    skeletonCard: {
      marginHorizontal: spacing.md,
      marginBottom:     vs(20),
      borderRadius:     radius.xl,
      overflow:         'hidden',
    },
  });