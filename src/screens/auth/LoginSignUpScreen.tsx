import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

import type { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { radius, s, ms, spacing, typography, vs, useThemeColors, useThemeMode } from '@/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

// ─── Configure Google Sign-In (once at module level) ──────────────────────────
GoogleSignin.configure({
  webClientId: '97946692169-jv5kb4v2scgjakh94hh4m5rv65j5ii66.apps.googleusercontent.com',
  scopes: ['email', 'profile'],
});

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
  const colors    = useThemeColors();
  const scale     = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = StyleSheet.create({
    btn: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      gap:               s(10),
      backgroundColor:   colors.surface,
      borderRadius:      radius.lg,
      borderWidth:       1,
      borderColor:       colors.border,
      paddingVertical:   vs(16),
      paddingHorizontal: spacing.lg,
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
            <FontAwesome name="google" size={20} color={colors.textPrimary} />
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
  const { isDark } = useThemeMode();
  const setStatus = useAuthStore((s) => s.setStatus);

  // Read the country + freelanceType collected during onboarding screens
  const { country, freelanceType, clear: clearOnboarding } = useOnboardingStore();

  const [loading, setLoading] = useState(false);

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const onGooglePress = async () => {
    setLoading(true);
    try {
      // ── 1. Google sign-in ──────────────────────────────────────────────
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken  = userInfo.data?.idToken;
      if (!idToken) throw new Error('No ID token received from Google');

      // ── 2. Firebase Auth ───────────────────────────────────────────────
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential   = await auth().signInWithCredential(googleCredential);
      const firebaseUser     = userCredential.user;
      const isNewUser        = userCredential.additionalUserInfo?.isNewUser;

      // ── 3. Write to Firestore ──────────────────────────────────────────
      const userRef = firestore().collection('users').doc(firebaseUser.uid);

      if (isNewUser) {
        // New user: write the full document with onboarding data.
        // { merge: true } is safe even if onUserCreated Cloud Function
        // already wrote a base doc — it fills in missing fields only.
        await userRef.set(
          {
            uid:          firebaseUser.uid,
            email:        firebaseUser.email         ?? '',
            displayName:  firebaseUser.displayName   ?? '',
            photoURL:     firebaseUser.photoURL      ?? null,
            provider:     'google',

            // Onboarding selections collected before sign-in
            country:      country,        // from onboardingStore
            freelanceType: freelanceType, // from onboardingStore
            vatRegistered: false,

            subscriptionTier: 'free',
            revenueCatId:     null,
            fcmToken:         null,

            onboardingComplete:     true,
            deadlinesGeneratedYear: null, // Cloud Function sets this after generating deadlines

            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        // Returning user: just refresh the updatedAt timestamp.
        // All other fields stay as they are in Firestore.
        await userRef.update({
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      // ── 4. Clean up + navigate ─────────────────────────────────────────
      clearOnboarding();           // wipe temporary onboardingStore
      setStatus('main'); // navigate to main app (Home tab)

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User closed the Google sheet — do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Sign-in already in progress — do nothing
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

  const styles = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: colors.background },
    screen:    { flex: 1, paddingHorizontal: spacing.lg },
    orbsLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
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
      borderWidth:     1,
      borderColor:     colors.primary,
    },
    logoEmoji: { fontSize: s(32) },
    appName: {
      ...typography.h2,
      color:         colors.textPrimary,
      textAlign:     'center',
      letterSpacing: -0.5,
    },
    tagline: {
      ...typography.bodySmall,
      color:     colors.textSecondary,
      textAlign: 'center',
    },
    heroBlock: {
      flex:           1,
      justifyContent: 'center',
      gap:            vs(8),
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
    pillsRow: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           s(8),
      marginTop:     vs(4),
    },
    bottomBlock: {
      paddingBottom: vs(32),
      gap:           vs(16),
    },
    terms: {
      ...typography.caption,
      color:      colors.textSecondary,
      textAlign:  'center',
      lineHeight: vs(18),
    },
    termsLink: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  });

  const orbColor = isDark
    ? 'rgba(37,99,235,0.12)'
    : 'rgba(37,99,235,0.07)';

     const onSignOut = () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: async () => {  // ✅ async goes here, before the arrow
              try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                // await auth().signOut();
                setStatus('auth');
              } catch (error) {
                console.error('Sign-out error:', error);
              }
            },
          },
        ]);
      };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <Button title='Sign Out' onPress={() => onSignOut} />
      <View style={styles.orbsLayer} pointerEvents="none">
        <FloatingOrb size={220} top={-60}  right={-60}  color={orbColor} delay={0}    />
        <FloatingOrb size={160} top={180}  left={-80}   color={orbColor} delay={600}  />
        <FloatingOrb size={120} top={420}  right={-30}  color={orbColor} delay={1200} />
      </View>

      <View style={styles.screen}>
        <Animated.View entering={FadeInDown.delay(0).springify().damping(18)} style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧾</Text>
          </View>
          <Text style={styles.appName}>GigTax Alert</Text>
          <Text style={styles.tagline}>Tax deadlines for freelancers</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={styles.heroBlock}>
          <Text style={styles.heroTitle}>
            Never miss a{'\n'}
            <Text style={styles.heroAccent}>tax deadline</Text>
            {'\n'}again.
          </Text>
          <Text style={styles.heroSub}>
            Built for freelancers and self-employed workers who want to stay on top
            of their tax obligations — without the stress.
          </Text>
          <View style={styles.pillsRow}>
            <FeaturePill emoji="⏰" label="Deadline alerts" />
            <FeaturePill emoji="💰" label="Tax estimates"   />
            <FeaturePill emoji="📅" label="Calendar sync"   />
            <FeaturePill emoji="📄" label="PDF summaries"   />
          </View>
        </Animated.View>

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