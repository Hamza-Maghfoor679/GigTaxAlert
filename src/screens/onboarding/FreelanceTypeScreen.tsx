import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { radius, s, ms, spacing, typography, vs, useThemeColors } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export type FreelanceTypeScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'FreelanceType'
>;

// ─── Freelance types ──────────────────────────────────────────────────────────

const FREELANCE_TYPES = [
  {
    value:   'developer',
    emoji:   '💻',
    label:   'Developer',
    sub:     'Software, web, mobile, DevOps',
    tags:    ['1099-NEC', 'Quarterly tax', 'Home office'],
  },
  {
    value:   'designer',
    emoji:   '🎨',
    label:   'Designer',
    sub:     'UI/UX, graphic, brand, motion',
    tags:    ['1099-NEC', 'Equipment deductions'],
  },
  {
    value:   'writer',
    emoji:   '✍️',
    label:   'Writer / Copywriter',
    sub:     'Content, journalism, ghostwriting',
    tags:    ['1099-NEC', 'Home office', 'Subscriptions'],
  },
  {
    value:   'consultant',
    emoji:   '💼',
    label:   'Consultant',
    sub:     'Strategy, management, finance',
    tags:    ['1099-NEC', 'Business travel', 'Quarterly tax'],
  },
  {
    value:   'photographer',
    emoji:   '📷',
    label:   'Photographer / Videographer',
    sub:     'Commercial, events, editorial',
    tags:    ['1099-NEC', 'Equipment', 'Vehicle mileage'],
  },
  {
    value:   'marketer',
    emoji:   '📣',
    label:   'Marketer',
    sub:     'Social media, SEO, ads, email',
    tags:    ['1099-NEC', 'Ad spend deductions'],
  },
  {
    value:   'tutor',
    emoji:   '🎓',
    label:   'Tutor / Coach',
    sub:     'Online teaching, coaching, mentoring',
    tags:    ['1099-NEC', 'Software subscriptions'],
  },
  {
    value:   'other',
    emoji:   '⚡',
    label:   'Something else',
    sub:     'We\'ll cover the essentials for any freelancer',
    tags:    ['1099-NEC', 'Quarterly tax'],
  },
] as const;

type FreelanceValue = typeof FREELANCE_TYPES[number]['value'];

// ─── Type card ────────────────────────────────────────────────────────────────

function TypeCard({
  emoji, label, sub, tags, selected, onPress, delay,
}: {
  emoji: string; label: string; sub: string; tags: readonly string[];
  selected: boolean; onPress: () => void; delay: number;
}) {
  const colors = useThemeColors();
  const scale  = useSharedValue(1);
  const anim   = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = StyleSheet.create({
    card: {
      backgroundColor:   selected ? colors.primaryLight : colors.surface,
      borderRadius:      radius.lg,
      borderWidth:       selected ? 2 : 1,
      borderColor:       selected ? colors.primary : colors.border,
      padding:           s(14),
      gap:               vs(8),
    },
    topRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           s(12),
    },
    emojiBox: {
      width:           s(44),
      height:          s(44),
      borderRadius:    radius.md,
      backgroundColor: selected ? colors.primary : colors.background,
      borderWidth:     1,
      borderColor:     selected ? colors.primary : colors.border,
      alignItems:      'center',
      justifyContent:  'center',
    },
    emoji:   { fontSize: s(22) },
    textCol: { flex: 1, gap: vs(2) },
    label:   { ...typography.labelLarge, color: selected ? colors.primary : colors.textPrimary },
    sub:     { ...typography.bodySmall,  color: colors.textSecondary },
    check: {
      width:           s(22),
      height:          s(22),
      borderRadius:    radius.full,
      backgroundColor: selected ? colors.primary : 'transparent',
      borderWidth:     selected ? 0 : 1.5,
      borderColor:     colors.border,
      alignItems:      'center',
      justifyContent:  'center',
    },
    checkMark: { ...typography.caption, color: '#FFF', fontWeight: '700' },

    // Deduction tags
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
    tag: {
      paddingHorizontal: s(8),
      paddingVertical:   vs(3),
      borderRadius:      radius.full,
      backgroundColor:   selected ? colors.primary + '18' : colors.border + '60',
    },
    tagTxt: {
      ...typography.caption,
      color:      selected ? colors.primary : colors.textSecondary,
      fontWeight: '600',
    },
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)}>
      <Animated.View style={anim}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
          onPressOut={() => { scale.value = withSpring(1,    { damping: 15 }); }}
          onPress={onPress}
        >
          {/* Top row — emoji + text + check */}
          <View style={styles.topRow}>
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.sub}  numberOfLines={1}>{sub}</Text>
            </View>
            <View style={styles.check}>
              {selected && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </View>

          {/* Relevant tax tags — shown only when selected */}
          {selected && (
            <Animated.View
              entering={FadeInDown.delay(0).duration(180)}
              style={styles.tagsRow}
            >
              {tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagTxt}>{t}</Text>
                </View>
              ))}
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function FreelanceTypeScreen({ navigation }: FreelanceTypeScreenProps) {
  // ↑ Fixed: was `_props` — navigation was never in scope, causing a runtime crash

  const setFreelanceType = useOnboardingStore((s) => s.setFreelanceType); // ← memory only
  const colors           = useThemeColors();
  const [selected, setSelected] = useState<FreelanceValue | null>(null);

  const btnScale = useSharedValue(1);
  const btnAnim  = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const onSelect = (value: FreelanceValue) => {
    void Haptics.selectionAsync();
    setSelected(value);
  };

  const onFinish = () => {
    if (!selected) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFreelanceType(selected);           // ← store in onboardingStore, no Firestore yet
    navigation.navigate('LoginSignUp');   // ← Fixed: was 'loginSignup' (wrong casing)
    // setStatus is NOT called here — LoginSignUpScreen handles navigation after sign-in
  };

  const styles = StyleSheet.create({
    safe:   { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1 },

    // ── Header ──
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop:        vs(8),
      paddingBottom:     vs(20),
      gap:               vs(6),
    },
    step:  { ...typography.labelSmall, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 },
    title: { fontSize: ms(28, 0.4), fontFamily: 'Inter_700Bold', color: colors.textPrimary, letterSpacing: -0.5 },
    sub:   { ...typography.bodyMedium, color: colors.textSecondary, lineHeight: vs(22) },

    // ── Progress bar — 100% filled (step 2 of 2) ──
    progressBg:   { height: vs(3), backgroundColor: colors.border, marginHorizontal: spacing.lg, borderRadius: radius.full, marginBottom: vs(20) },
    progressFill: { height: '100%', width: '100%', backgroundColor: colors.primary, borderRadius: radius.full },

    // ── List ──
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: vs(120), gap: vs(10) },

    // ── Fixed CTA ──
    bottomWrap: {
      position:          'absolute',
      bottom:            0,
      left:              0,
      right:             0,
      paddingHorizontal: spacing.lg,
      paddingBottom:     vs(32),
      paddingTop:        vs(16),
      backgroundColor:   colors.background,
      borderTopWidth:    1,
      borderTopColor:    colors.border,
      gap:               vs(8),
    },
    ctaBtn: {
      backgroundColor: selected ? colors.primary : colors.border,
      borderRadius:    radius.lg,
      paddingVertical: vs(16),
      alignItems:      'center',
    },
    ctaTxt: {
      fontSize:   ms(15, 0.3),
      fontFamily: 'Inter_700Bold',
      color:      selected ? '#FFF' : colors.textDisabled,
    },
    hint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)} style={styles.header}>
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>What do you do?</Text>
          <Text style={styles.sub}>
            We'll tailor your deadline reminders and deduction tips to your work.
          </Text>
        </Animated.View>

        {/* ── Progress bar (full) ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(18)} style={styles.progressBg}>
          <View style={styles.progressFill} />
        </Animated.View>

        {/* ── Type list ── */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {FREELANCE_TYPES.map((t, i) => (
            <TypeCard
              key={t.value}
              emoji={t.emoji}
              label={t.label}
              sub={t.sub}
              tags={t.tags}
              selected={selected === t.value}
              onPress={() => onSelect(t.value)}
              delay={80 + i * 40}
            />
          ))}
        </ScrollView>

        {/* ── Fixed CTA ── */}
        <Animated.View entering={FadeInDown.delay(420).springify().damping(18)} style={styles.bottomWrap}>
          <Animated.View style={btnAnim}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && selected && { opacity: 0.88 }]}
              onPressIn={() => {
                if (!selected) return;
                btnScale.value = withSpring(0.97, { damping: 15 });
              }}
              onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
              onPress={onFinish}
              disabled={!selected}
            >
              <Text style={styles.ctaTxt}>
                {selected ? "Let's go →" : 'Select your work type'}
              </Text>
            </Pressable>
          </Animated.View>
          <Text style={styles.hint}>You can change this later in Settings</Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}