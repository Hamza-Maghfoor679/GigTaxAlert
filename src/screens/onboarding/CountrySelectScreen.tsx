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

export type CountrySelectScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'CountrySelect'
>;

// ─── Country data ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'United States', sub: 'IRS · Quarterly estimated tax' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', sub: 'HMRC · Self assessment' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',        sub: 'Finanzamt · VAT + income tax' },
  { code: 'FR', flag: '🇫🇷', name: 'France',         sub: 'DGFiP · Micro-entrepreneur' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands',    sub: 'Belastingdienst · BTW' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',      sub: 'ATO · BAS + PAYG' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',         sub: 'CRA · GST/HST + income tax' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',      sub: 'IRAS · GST + income tax' },
] as const;

type CountryCode = typeof COUNTRIES[number]['code'];

// ─── Country card ─────────────────────────────────────────────────────────────

function CountryCard({
  flag, name, sub, selected, onPress, delay,
}: {
  flag: string; name: string; sub: string;
  selected: boolean; onPress: () => void; delay: number;
}) {
  const colors = useThemeColors();
  const scale  = useSharedValue(1);
  const anim   = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = StyleSheet.create({
    card: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             s(14),
      backgroundColor: selected ? colors.primaryLight : colors.surface,
      borderRadius:    radius.lg,
      borderWidth:     selected ? 2 : 1,
      borderColor:     selected ? colors.primary : colors.border,
      paddingVertical: vs(14),
      paddingHorizontal: s(16),
    },
    flagBox: {
      width:           s(44),
      height:          s(44),
      borderRadius:    radius.md,
      backgroundColor: colors.background,
      alignItems:      'center',
      justifyContent:  'center',
      borderWidth:     1,
      borderColor:     colors.border,
    },
    flag:    { fontSize: s(24) },
    content: { flex: 1, gap: vs(2) },
    name:    { ...typography.labelLarge, color: selected ? colors.primary : colors.textPrimary },
    sub:     { ...typography.caption,   color: colors.textSecondary },
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
    checkMark: { ...typography.caption, color: '#FFF', fontWeight: '700', lineHeight: s(14) },
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
          <View style={styles.flagBox}>
            <Text style={styles.flag}>{flag}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.sub}>{sub}</Text>
          </View>
          <View style={styles.check}>
            {selected && <Text style={styles.checkMark}>✓</Text>}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CountrySelectScreen({ navigation }: CountrySelectScreenProps) {
  const colors      = useThemeColors();
  const setCountry  = useOnboardingStore((s: any) => s.setCountry); // ← saves to memory only
  const [selected, setSelected] = useState<CountryCode | null>(null);

  const btnScale = useSharedValue(1);
  const btnAnim  = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const onSelect = (code: CountryCode) => {
    void Haptics.selectionAsync();
    setSelected(code);
  };

  const onNext = () => {
    if (!selected) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCountry(selected);              // ← store in onboardingStore, no Firestore yet
    navigation.navigate('FreelanceType');
  };

  const styles = StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.background },
    screen:  { flex: 1 },

    // ── Header ──
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop:        vs(8),
      paddingBottom:     vs(20),
      gap:               vs(6),
    },
    step:    { ...typography.labelSmall, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.2 },
    title:   { fontSize: ms(28, 0.4), fontFamily: 'Inter_700Bold', color: colors.textPrimary, letterSpacing: -0.5 },
    sub:     { ...typography.bodyMedium, color: colors.textSecondary, lineHeight: vs(22) },

    // ── Progress bar ──
    progressBg:   { height: vs(3), backgroundColor: colors.border, marginHorizontal: spacing.lg, borderRadius: radius.full, marginBottom: vs(20) },
    progressFill: { height: '100%', width: '50%', backgroundColor: colors.primary, borderRadius: radius.full },

    // ── List ──
    list:    { flex: 1 },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: vs(120), gap: vs(10) },

    // ── Fixed bottom CTA ──
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
      gap:               vs(10),
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
    skipTxt: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)} style={styles.header}>
          <Text style={styles.step}>Step 1 of 2</Text>
          <Text style={styles.title}>Where do you file?</Text>
          <Text style={styles.sub}>
            We'll load the right tax deadlines and rules for your country.
          </Text>
        </Animated.View>

        {/* ── Progress bar ── */}
        <Animated.View entering={FadeInDown.delay(40).springify().damping(18)} style={styles.progressBg}>
          <View style={styles.progressFill} />
        </Animated.View>

        {/* ── Country list ── */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {COUNTRIES.map((c, i) => (
            <CountryCard
              key={c.code}
              flag={c.flag}
              name={c.name}
              sub={c.sub}
              selected={selected === c.code}
              onPress={() => onSelect(c.code)}
              delay={80 + i * 40}
            />
          ))}
        </ScrollView>

        {/* ── Fixed bottom CTA ── */}
        <Animated.View entering={FadeInDown.delay(420).springify().damping(18)} style={styles.bottomWrap}>
          <Animated.View style={btnAnim}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && selected && { opacity: 0.88 }]}
              onPressIn={() => {
                if (!selected) return;
                btnScale.value = withSpring(0.97, { damping: 15 });
              }}
              onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
              onPress={onNext}
              disabled={!selected}
            >
              <Text style={styles.ctaTxt}>
                {selected
                  ? `Continue with ${COUNTRIES.find((c) => c.code === selected)?.name}`
                  : 'Select a country to continue'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}