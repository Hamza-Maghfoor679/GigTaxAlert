import { StyleSheet } from 'react-native';

import { radius, spacing, typography, s, vs, wp } from '@/theme';
import type { Colors } from '@/theme';

export const homeStyles = (colors: Colors) =>
  StyleSheet.create({
    // ── Layout ──────────────────────────────────────────────
    safe:          { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: vs(40) },
    listWrapper:   { paddingHorizontal: spacing.md },

    // ── Header ──────────────────────────────────────────────
    header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingBottom: vs(12) },
    headerRight:   { flexDirection: 'row', gap: s(10), alignItems: 'center' },
    greeting:      { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },
    headerTitle:   { ...typography.h2, color: colors.textPrimary },
    iconBtn:       { width: s(40), height: s(40), borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    iconBtnText:   { fontSize: s(18) },
    avatar:        { width: s(40), height: s(40), borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText:    { ...typography.labelLarge, color: '#FFF', fontSize: s(14) },

    // ── Date pill ───────────────────────────────────────────
    datePill:      { alignSelf: 'flex-start', marginHorizontal: spacing.md, marginBottom: vs(16), backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: vs(4), borderRadius: radius.full },
    datePillText:  { ...typography.labelSmall, color: colors.primary },

    // ── Summary cards ───────────────────────────────────────
    summaryRow:    { flexDirection: 'row', paddingHorizontal: spacing.md, gap: s(10), marginBottom: vs(20) },
    summaryCard:   { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: vs(14), paddingHorizontal: s(12), borderWidth: 1, borderColor: colors.border, gap: vs(6) },
    summaryEmoji:  { fontSize: s(20) },
    summaryVal:    { ...typography.h1, lineHeight: undefined },
    summaryLbl:    { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
    accentBar:     { position: 'absolute', bottom: 0, left: s(12), right: s(12), height: vs(3), borderRadius: radius.full },

    // ── Hero card ───────────────────────────────────────────
    hero:          { margin: spacing.md, marginTop: 0, borderRadius: radius.xxl, backgroundColor: colors.primary, padding: spacing.md, overflow: 'hidden' },
    heroBlob1:     { position: 'absolute', width: s(120), height: s(120), borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.06)', top: vs(-30), right: s(-20) },
    heroBlob2:     { position: 'absolute', width: s(80),  height: s(80),  borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.04)', bottom: vs(-20), left: s(20) },
    heroTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(12) },
    heroCount:     { ...typography.displayLarge, color: '#FFF', lineHeight: undefined },
    heroUnit:      { ...typography.bodySmall, color: 'rgba(255,255,255,0.65)', marginTop: vs(2) },
    heroBadge:     { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: s(10), paddingVertical: vs(3) },
    heroBadgeTxt:  { ...typography.labelSmall, color: '#FFF' },
    heroDivider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: vs(12) },
    heroBottom:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroName:      { ...typography.labelLarge, color: '#FFF' },
    heroDate:      { ...typography.bodySmall, color: 'rgba(255,255,255,0.65)', marginTop: vs(2) },
    heroArrow:     { width: s(36), height: s(36), borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    heroArrowText: { color: '#FFF', fontSize: s(16), fontWeight: '600' },

    // ── Section header ──────────────────────────────────────
    sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: vs(10) },
    sectionLbl:    { ...typography.h3, color: colors.textPrimary },
    seeAll:        { ...typography.labelSmall, color: colors.primary },

    // ── Empty state ─────────────────────────────────────────
    empty:         { marginTop: vs(24), alignItems: 'center', gap: vs(8) },
    emptyEmoji:    { fontSize: s(48) },
    emptyTitle:    { ...typography.h3, color: colors.textPrimary },
    emptySub:      { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center', maxWidth: wp(65) },
  });