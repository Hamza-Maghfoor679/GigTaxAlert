import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import type { AuthStackParamList } from '@/navigation/types';
import { radius, s, ms, spacing, typography, vs, useThemeColors, useThemeMode } from '@/theme';

export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

// ─── Animated background ring ─────────────────────────────────────────────────

function PulseRing({ size, delay, colors }: { size: number; delay: number; colors: ReturnType<typeof useThemeColors> }) {
  const scale   = useSharedValue(0.85);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2200 }),
        withTiming(0.85, { duration: 2200 }),
      ), -1, true,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.12, { duration: 2200 }),
        withTiming(0.35, { duration: 2200 }),
      ), -1, true,
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  return (
    <Animated.View style={[{
      position:        'absolute',
      width:           s(size),
      height:          s(size),
      borderRadius:    s(size) / 2,
      borderWidth:     1.5,
      borderColor:     colors.primary,
    }, animStyle]} />
  );
}

// ─── Floating stat chip ───────────────────────────────────────────────────────

function StatChip({
  emoji, value, label, delay, colors,
}: {
  emoji: string; value: string; label: string; delay: number;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(16)}
      style={{
        backgroundColor:   colors.surface,
        borderRadius:      radius.lg,
        borderWidth:       1,
        borderColor:       colors.border,
        paddingHorizontal: s(14),
        paddingVertical:   vs(10),
        alignItems:        'center',
        gap:               vs(2),
        flex:              1,
      }}
    >
      <Text style={{ fontSize: s(20) }}>{emoji}</Text>
      <Text style={{ ...typography.labelLarge, color: colors.textPrimary, fontSize: ms(13, 0.3) }}>{value}</Text>
      <Text style={{ ...typography.caption, color: colors.textSecondary, textAlign: 'center' }}>{label}</Text>
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const colors  = useThemeColors();
  const { isDark } = useThemeMode();

  // CTA button press animation
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const styles = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: colors.background },
    screen:      { flex: 1, paddingHorizontal: spacing.lg },

    // ── Background rings container
    ringsLayer:  { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

    // ── Top spacer + logo cluster
    logoSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // ── Logo icon
    logoBox: {
      width:           s(88),
      height:          s(88),
      borderRadius:    radius.xxl,
      backgroundColor: colors.primary,
      alignItems:      'center',
      justifyContent:  'center',
      marginBottom:    vs(20),
      // Layered shadow simulation
      shadowColor:     colors.primary,
      shadowOffset:    { width: 0, height: vs(8) },
      shadowOpacity:   0.35,
      shadowRadius:    s(20),
      elevation:       12,
    },
    logoEmoji:   { fontSize: s(44) },

    // ── Hero text
    heroTitle: {
      fontSize:      ms(38, 0.4),
      fontFamily:    'Inter_700Bold',
      color:         colors.textPrimary,
      textAlign:     'center',
      letterSpacing: -1,
      lineHeight:    ms(46, 0.4),
    },
    heroAccent: {
      color: colors.primary,
    },
    heroSub: {
      ...typography.bodyMedium,
      color:      colors.textSecondary,
      textAlign:  'center',
      lineHeight: vs(22),
      marginTop:  vs(10),
      paddingHorizontal: s(8),
    },

    // ── Stats row
    statsRow: {
      flexDirection: 'row',
      gap:           s(10),
      marginBottom:  vs(28),
    },

    // ── CTA button
    ctaBtn: {
      backgroundColor: colors.primary,
      borderRadius:    radius.lg,
      paddingVertical: vs(17),
      alignItems:      'center',
      justifyContent:  'center',
      shadowColor:     colors.primary,
      shadowOffset:    { width: 0, height: vs(4) },
      shadowOpacity:   0.3,
      shadowRadius:    s(12),
      elevation:       8,
    },
    ctaBtnTxt: {
      fontSize:   ms(16, 0.3),
      fontFamily: 'Inter_700Bold',
      color:      '#FFF',
      letterSpacing: 0.2,
    },

    // ── Secondary action
    secondaryBtn:    { alignItems: 'center', paddingVertical: vs(14) },
    secondaryBtnTxt: { ...typography.labelLarge, color: colors.textSecondary },

    // ── Bottom padding
    bottomBlock: { paddingBottom: vs(24), gap: vs(10) },

    // ── Legal
    legalTxt: { ...typography.caption, color: colors.textDisabled, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* ── Pulsing background rings ── */}
      <View style={styles.ringsLayer} pointerEvents="none">
        <PulseRing size={280} delay={0}    colors={colors} />
        <PulseRing size={380} delay={400}  colors={colors} />
        <PulseRing size={480} delay={800}  colors={colors} />
      </View>

      <View style={styles.screen}>

        {/* ── Logo + hero ── */}
        <View style={styles.logoSection}>
          {/* Logo icon */}
          <Animated.View entering={FadeIn.delay(0).duration(500)} style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧾</Text>
          </Animated.View>

          {/* Hero title */}
          <Animated.Text
            entering={FadeInDown.delay(80).springify().damping(18)}
            style={styles.heroTitle}
          >
            Tax deadlines,{'\n'}
            <Text style={styles.heroAccent}>handled.</Text>
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInDown.delay(140).springify().damping(18)}
            style={styles.heroSub}
          >
            Countdown timers, tax estimates, and smart reminders — built for freelancers who have better things to worry about.
          </Animated.Text>
        </View>

        {/* ── Stats chips ── */}
        <View style={styles.statsRow}>
          <StatChip emoji="⏰" value="14 days"  label="Avg. notice"  delay={220} colors={colors} />
          <StatChip emoji="💸" value="$1,240"   label="Avg. saved"   delay={280} colors={colors} />
          <StatChip emoji="✅" value="10k+"     label="Freelancers"  delay={340} colors={colors} />
        </View>

        {/* ── Bottom CTA ── */}
        <Animated.View
          entering={FadeInUp.delay(200).springify().damping(18)}
          style={styles.bottomBlock}
        >
          {/* Primary CTA */}
          <Animated.View style={btnStyle}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
              onPressIn={() => {
                btnScale.value = withSpring(0.97, { damping: 15 });
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }); }}
              onPress={() => navigation.navigate('CountrySelect')}
            >
              <Text style={styles.ctaBtnTxt}>Get started — it's free</Text>
            </Pressable>
          </Animated.View>

          {/* Legal */}
          <Text style={styles.legalTxt}>
            No credit card required · Cancel anytime
          </Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}