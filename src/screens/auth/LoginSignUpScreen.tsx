import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import type { AuthStackParamList, RootStackParamList } from '@/navigation/types';
import { getUser } from '@/services/user';
import { useAuthStore } from '@/stores/authStore';
import { radius, s, ms, spacing, typography, vs, useThemeColors, useThemeMode } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export type LoginSignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'LoginSignUp'>;

// ─── Floating orb ─────────────────────────────────────────────────────────────

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
        withTiming(0, { duration: 2800 + delay }),
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
          position: 'absolute',
          width: s(size),
          height: s(size),
          borderRadius: s(size) / 2,
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
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(10),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: vs(16),
      paddingHorizontal: spacing.lg,
    },
    label: {
      ...typography.labelLarge,
      color: colors.textPrimary,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: s(12),
      paddingVertical: vs(6),
    }}>
      <Text style={{ fontSize: s(13) }}>{emoji}</Text>
      <Text style={{ ...typography.labelSmall, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LoginSignUpScreen(_props: LoginSignUpScreenProps) {
  const colors = useThemeColors();
  const { isDark } = useThemeMode();
  const setStatus = useAuthStore((s) => s.setStatus);
  const [loading, setLoading] = useState(false);

  // ← ADDED: read onboarding selections collected before sign-in
  const { country, freelanceType, clear: clearOnboarding } = useOnboardingStore();

  type RootNav = NativeStackNavigationProp<RootStackParamList>;
  const rootNav = useNavigation<RootNav>();

  // Firestore profile: use doc existence, not Auth isNewUser — that flag is false for
  // anyone who already has a Google account in Firebase, so onboarding data was skipped.
  const saveUserToFirestore = async (
    uid: string,
    email: string,
    displayName: string,
    photoURL: string | null,
  ) => {
    try {
      const userRef = firestore().collection('users').doc(uid);
      const existing = await getUser(uid);

      const touch = {
        uid,
        email,
        displayName,
        photoURL,
        provider: 'google' as const,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (!existing) {
        await userRef.set(
          {
            ...touch,
            country: country ?? null,
            freelanceType: freelanceType ?? null,
            vatRegistered: false,
            subscriptionTier: 'free',
            revenueCatId: null,
            fcmToken: null,
            onboardingComplete: true,
            deadlinesGeneratedYear: null,
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await userRef.set(touch, { merge: true });
      }

      clearOnboarding();
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error('Firestore user write failed:', err);
      if (__DEV__) {
        console.error('[Firestore]', e?.code, e?.message);
      }
    }
  };

  // ── Google Sign-In Handler ────────────────────────────────────────────────
  const onGooglePress = async () => {
    setLoading(true);
    try {
      // 1. Check Google Play Services (Android requirement)
      await GoogleSignin.hasPlayServices();

      // 2. Trigger native Google Sign-In sheet
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID token received from Google');

      // 3. Create Firebase credential from Google token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // 4. Sign in to Firebase with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      setStatus('main');

      void saveUserToFirestore(
        userCredential.user.uid,
        userCredential.user.email ?? '',
        userCredential.user.displayName ?? '',
        userCredential.user.photoURL ?? null,
      );

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User closed the sheet — do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Already signing in — do nothing
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available on this device.');
      } else {
        console.error('Google sign-in error:', error);
        Alert.alert('Sign-in Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // const onSignOut = () => {
  //   void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  //   Alert.alert('Sign out', 'Are you sure you want to sign out?', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Sign out',
  //       style: 'destructive',
  //       onPress: async () => {  // ✅ async goes here, before the arrow
  //         try {
  //           await GoogleSignin.revokeAccess();
  //           await GoogleSignin.signOut();
  //           await auth().signOut();
  //           setStatus('auth');
  //         } catch (error) {
  //           console.error('Sign-out error:', error);
  //         }
  //       },
  //     },
  //   ]);
  // };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1, paddingHorizontal: spacing.lg },
    orbsLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    logoWrap: {
      marginTop: vs(64),
      alignItems: 'center',
      gap: vs(12),
    },
    logoBox: {
      width: s(64),
      height: s(64),
      borderRadius: radius.xl,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    logoEmoji: { fontSize: s(32) },
    appName: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    tagline: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    heroBlock: {
      flex: 1,
      justifyContent: 'center',
      gap: vs(8),
    },
    heroTitle: {
      fontSize: ms(34, 0.4),
      fontFamily: 'Inter_700Bold',
      color: colors.textPrimary,
      letterSpacing: -0.8,
      lineHeight: ms(42, 0.4),
    },
    heroAccent: { color: colors.primary },
    heroSub: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
      lineHeight: vs(22),
    },
    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: vs(4),
    },
    bottomBlock: {
      paddingBottom: vs(32),
      gap: vs(16),
    },
    terms: {
      ...typography.caption,
      color: colors.textSecondary,
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
      {/* <Button  title='signout' onPress={() => onSignOut}/> */}
      <View style={styles.orbsLayer} pointerEvents="none">
        <FloatingOrb size={220} top={-60} right={-60} color={orbColor} delay={0} />
        <FloatingOrb size={160} top={180} left={-80} color={orbColor} delay={600} />
        <FloatingOrb size={120} top={420} right={-30} color={orbColor} delay={1200} />
      </View>

      <View style={styles.screen}>
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🧾</Text>
            </View>
            <Text style={styles.appName}>GigTax Alert</Text>
            <Text style={styles.tagline}>Tax deadlines for freelancers</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(18)}
          style={{ flex: 1 }}
        >
          <View style={styles.heroBlock}>
            <Text style={styles.heroTitle}>
              Never miss a{'\n'}
              <Text style={styles.heroAccent}>tax deadline</Text>
              {'\n'}again.
            </Text>
            <Text style={styles.heroSub}>
              Built for freelancers and self-employed workers who want to stay on top of their tax obligations — without the stress.
            </Text>

            <View style={styles.pillsRow}>
              <FeaturePill emoji="⏰" label="Deadline alerts" />
              <FeaturePill emoji="💰" label="Tax estimates" />
              <FeaturePill emoji="📅" label="Calendar sync" />
              <FeaturePill emoji="📄" label="PDF summaries" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160).springify().damping(18)}>
          <View style={styles.bottomBlock}>
            <GoogleButton onPress={() => void onGooglePress()} loading={loading} />
            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}