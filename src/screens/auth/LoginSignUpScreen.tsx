import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

import type { AuthStackParamList, RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { radius, s, ms, spacing, typography, vs, useThemeColors, useThemeMode } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

// Required for expo-auth-session on Android
WebBrowser.maybeCompleteAuthSession();

export type LoginSignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'LoginSignUp'>;

// ─── Floating orb (decorative background element) ────────────────────────────

function FloatingOrb({
  size, top, left, right, color, delay,
}: {
  size: number; top?: number; left?: number; right?: number; color: string; delay: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-s(12), { duration: 2800 + delay }),
        withTiming(0,       { duration: 2800 + delay }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position:        'absolute',
          width:           s(size),
          height:          s(size),
          borderRadius:    s(size) / 2,
          backgroundColor: color,
          top,
          left,
          right,
        },
        animStyle,
      ]}
    />
  );
}

// ─── Google button ────────────────────────────────────────────────────────────

function GoogleButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  const colors  = useThemeColors();
  const scale   = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = StyleSheet.create({
    btn: {
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             s(10),
      backgroundColor: colors.surface,
      borderRadius:    radius.lg,
      borderWidth:     1,
      borderColor:     colors.border,
      paddingVertical: vs(16),
      paddingHorizontal: spacing.lg,
    },
    googleLogo: {
      width:  s(20),
      height: s(20),
    },
    label: {
      ...typography.labelLarge,
      color:    colors.textPrimary,
      fontSize: ms(15, 0.3),
    },
  });

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 100 });
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 100 }); }}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            {/* Inline Google "G" SVG as text — no asset needed */}
            <FontAwesome name='google' size={20} color={colors.textPrimary} />
            <Text style={styles.label}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────

function FeaturePill({ emoji, label }: { emoji: string; label: string }) {
  const colors = useThemeColors();

  return (
    <View style={{
      flexDirection:     'row',
      alignItems:        'center',
      gap:               s(6),
      backgroundColor:   colors.surface,
      borderRadius:      radius.full,
      borderWidth:       1,
      borderColor:       colors.border,
      paddingHorizontal: s(12),
      paddingVertical:   vs(6),
    }}>
      <Text style={{ fontSize: s(13) }}>{emoji}</Text>
      <Text style={{ ...typography.labelSmall, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LoginSignUpScreen(_props: LoginSignUpScreenProps) {
  const colors    = useThemeColors();
  const { isDark} = useThemeMode();
  const setStatus = useAuthStore((s) => s.setStatus);
  const [loading, setLoading] = useState(false);

  // ── Expo Google Auth ─────────────────────────────────────────────────────
  // const [_request, response, promptAsync] = Google.useAuthRequest({
  //   // TODO: replace with your actual client IDs from Google Cloud Console
  //   // iosClientId:     'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  //   // androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  //   // webClientId:     'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  // });

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     handleGoogleSignIn(authentication?.accessToken);
  //   }
  // }, [response]);

  const handleGoogleSignIn = async (accessToken?: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      // TODO: exchange token with Supabase
      // const { data, error } = await supabase.auth.signInWithIdToken({
      //   provider: 'google',
      //   token: accessToken,
      // });
      // if (error) throw error;

      await new Promise((r) => setTimeout(r, 800)); // simulate
      setStatus('onboarding');
    } catch (e) {
      console.error('Google sign-in failed:', e);
    } finally {
      setLoading(false);
    }
  };
type RootNav = NativeStackNavigationProp<RootStackParamList>;
const rootNav = useNavigation<RootNav>();


  const onGooglePress = async () => {
    // await promptAsync();
    setStatus('onboarding')
  };

  const styles = StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colors.background },
    screen:  { flex: 1, paddingHorizontal: spacing.lg },

    // ── Background orbs ──
    orbsLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },

    // ── Logo block ──
    logoWrap: {
      marginTop:  vs(64),
      alignItems: 'center',
      gap:        vs(12),
    },
    logoBox: {
      width:           s(64),
      height:          s(64),
      borderRadius:    radius.xl,
      backgroundColor: colors.primary,
      alignItems:      'center',
      justifyContent:  'center',
      // Subtle inner shadow simulation via border
      borderWidth:     1,
      borderColor:     colors.primary,
    },
    logoEmoji: { fontSize: s(32) },
    appName: {
      ...typography.h2,
      color:       colors.textPrimary,
      textAlign:   'center',
      letterSpacing: -0.5,
    },
    tagline: {
      ...typography.bodySmall,
      color:     colors.textSecondary,
      textAlign: 'center',
    },

    // ── Hero text ──
    heroBlock: {
      flex:       1,
      justifyContent: 'center',
      gap:        vs(8),
    },
    heroTitle: {
      fontSize:      ms(34, 0.4),
      fontFamily:    'Inter_700Bold',
      color:         colors.textPrimary,
      letterSpacing: -0.8,
      lineHeight:    ms(42, 0.4),
    },
    heroAccent: { color: colors.primary },
    heroSub: {
      ...typography.bodyMedium,
      color:      colors.textSecondary,
      lineHeight: vs(22),
    },

    // ── Feature pills ──
    pillsRow: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           s(8),
      marginTop:     vs(4),
    },

    // ── Bottom CTA block ──
    bottomBlock: {
      paddingBottom: vs(32),
      gap:           vs(16),
    },
    dividerRow: {
      flexDirection:  'row',
      alignItems:     'center',
      gap:            s(10),
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerTxt:  { ...typography.caption, color: colors.textDisabled },
    terms: {
      ...typography.caption,
      color:     colors.textSecondary,
      textAlign: 'center',
      lineHeight: vs(18),
    },
    termsLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  });

  const orbColor = isDark
    ? 'rgba(37,99,235,0.12)'
    : 'rgba(37,99,235,0.07)';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ── Decorative floating orbs ── */}
      <View style={styles.orbsLayer} pointerEvents="none">
        <FloatingOrb size={220} top={-60}  right={-60}  color={orbColor} delay={0}    />
        <FloatingOrb size={160} top={180}  left={-80}   color={orbColor} delay={600}  />
        <FloatingOrb size={120} top={420}  right={-30}  color={orbColor} delay={1200} />
      </View>

      <View style={styles.screen}>
        {/* ── Logo ── */}
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)} style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧾</Text>
          </View>
          <Text style={styles.appName}>GigTax Alert</Text>
          <Text style={styles.tagline}>Tax deadlines for freelancers</Text>
        </Animated.View>

        {/* ── Hero copy ── */}
        <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={styles.heroBlock}>
          <Text style={styles.heroTitle}>
            Never miss a{'\n'}
            <Text style={styles.heroAccent}>tax deadline</Text>
            {'\n'}again.
          </Text>
          <Text style={styles.heroSub}>
            Built for freelancers and self-employed workers who want to stay on top of their tax obligations — without the stress.
          </Text>

          <View style={styles.pillsRow}>
            <FeaturePill emoji="⏰" label="Deadline alerts"   />
            <FeaturePill emoji="💰" label="Tax estimates"     />
            <FeaturePill emoji="📅" label="Calendar sync"     />
            <FeaturePill emoji="📄" label="PDF summaries"     />
          </View>
        </Animated.View>

        {/* ── Bottom CTA ── */}
        <Animated.View entering={FadeInUp.delay(160).springify().damping(18)} style={styles.bottomBlock}>
          <GoogleButton onPress={() => void onGooglePress()} loading={loading} />

          <Text style={styles.terms}>
            By continuing you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}