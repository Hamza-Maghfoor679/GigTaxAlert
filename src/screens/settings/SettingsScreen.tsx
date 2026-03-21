import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/Skeleton';
import { radius, s, spacing, vs, useThemeColors, useThemeMode, typography } from '@/theme';

import { NotificationToggles } from './components/Notificationtoggles';
import { ProfileSection } from './components/ProfileSection';
import { SettingRow } from './components/Settingrow';
import { SubscriptionCard } from './components/SubscriptionCard';
import { useNotificationPreferences } from './hooks/useNotificationPreferences';
import { useSettingsProfile } from './hooks/useSettingsProfile';
import { useSubscription } from './hooks/useSubscription';
import { makeSettingsStyles } from './styles/SettingsStyles';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { setThemeMode, themeMode } = useThemeMode();

  // ✅ Styles memoized — only recomputes when theme changes, not on every render
  const st = useMemo(() => makeSettingsStyles(colors), [colors]);

  const { profile, loading: profileLoading, isSaving: profileSaving, updateCountry, updateFreelanceType } = useSettingsProfile();
  const { subscription, loading: subLoading, openUpgrade, openManage, restorePurchases } = useSubscription();
  const { prefs, isSaving: notifSaving, toggleGlobal, toggleCategory } = useNotificationPreferences();
  const setStatus = useAuthStore((s) => s.setStatus);


  // ✅ isLoading stays true until BOTH deferred fetches resolve —
  //    skeleton shows during that window so there's no layout jump
  const isLoading = profileLoading || subLoading;

  const onSignOut = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive',  
        onPress: () => { setStatus("auth") } 
      },
    ]);
  };

  const cycleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light');
  };

  const themeLabel = themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System';

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>

        {/*
          ✅ Only the header animates on mount — everything else waits behind
          isLoading. This means a single FadeIn fires instead of 10+,
          leaving the JS thread free for hook initialisation.
        */}
        <Animated.View entering={FadeIn.duration(200)} style={st.header}>
          <Text style={st.headerTitle}>Settings</Text>
          <Text style={st.headerSub}>Manage your account and preferences</Text>
        </Animated.View>

        {isLoading ? (
          // ✅ Skeletons have no entrance animations — plain Views render instantly
          <>
            <Skeleton width="auto" height={vs(88)} borderRadius={radius.xl}
              style={{ marginHorizontal: spacing.md, marginBottom: vs(24) }} />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="auto" height={vs(120)} borderRadius={radius.xl}
                style={{ marginHorizontal: spacing.md, marginBottom: vs(20) }} />
            ))}
          </>
        ) : (
          /*
            ✅ Content animations are now staggered but only fire AFTER
            InteractionManager resolves (i.e. after the skeleton swap).
            The JS thread is idle by this point so animations are smooth.
          */
          <>
            {/* ── Avatar card ── */}
            {profile && (
              <Animated.View entering={FadeIn.delay(0).duration(800)} style={st.avatarCard}>
                <View style={st.avatar}>
                  <Text style={st.avatarText}>{profile.avatarInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.avatarName}>{profile.displayName}</Text>
                  <Text style={st.avatarEmail}>{profile.email}</Text>
                </View>
              </Animated.View>
            )}

            {/* ── Plan ── */}
            <Animated.View entering={FadeIn.delay(60).duration(800)}>
              <Text style={st.sectionLabel}>Plan</Text>
              <SubscriptionCard
                subscription={subscription}
                onUpgrade={openUpgrade}
                onManage={openManage}
                onRestore={restorePurchases}
              />
            </Animated.View>

            {/* ── Profile ── */}
            {profile && (
              <Animated.View entering={FadeIn.delay(120).duration(800)}>
                <Text style={st.sectionLabel}>Profile</Text>
                <ProfileSection
                  country={profile.country}
                  countryLabel={profile.countryLabel}
                  freelanceType={profile.freelanceType}
                  isSaving={profileSaving}
                  sectionCardStyle={st.sectionCard}
                  onCountryChange={updateCountry}
                  onFreelanceChange={updateFreelanceType}
                />
              </Animated.View>
            )}

            {/* ── Notifications ── */}
            <Animated.View entering={FadeIn.delay(180).duration(800)}>
              <Text style={st.sectionLabel}>Notifications</Text>
              <NotificationToggles
                prefs={prefs}
                isSaving={notifSaving}
                sectionCardStyle={st.sectionCard}
                onToggleGlobal={toggleGlobal}
                onToggleCategory={toggleCategory}
              />
            </Animated.View>

            {/* ── Appearance ── */}
            <Animated.View entering={FadeIn.delay(240).duration(800)}>
              <Text style={st.sectionLabel}>Appearance</Text>
              <View style={st.sectionCard}>
                <SettingRow
                  type="pressable"
                  emoji={themeMode === 'dark' ? '🌙' : themeMode === 'light' ? '☀️' : '🖥️'}
                  iconBg={colors.warning + '20'}
                  label="Theme"
                  subtitle="Tap to cycle between modes"
                  value={themeLabel}
                  onPress={cycleTheme}
                />
              </View>
            </Animated.View>

            {/* ── Account ── */}
            <Animated.View entering={FadeIn.delay(300).duration(800)}>
              <Text style={st.sectionLabel}>Account</Text>
              <View style={st.sectionCard}>
                <SettingRow type="pressable" emoji="🔒" iconBg={colors.border}
                  label="Privacy Policy" onPress={() => {}} showDivider />
                <SettingRow type="pressable" emoji="📄" iconBg={colors.border}
                  label="Terms of Service" onPress={() =>{}} showDivider />
                <SettingRow type="pressable" emoji="🚪" iconBg="#FEE2E2"
                  label="Sign Out" onPress={onSignOut} />
              </View>
            </Animated.View>

            {/* ── Version ── */}
            <Animated.View entering={FadeIn.delay(340).duration(800)}>
              <Text style={{ ...typography.caption, color: colors.textDisabled, textAlign: 'center', marginTop: vs(8) }}>
                GigTax Alert · v1.0.0
              </Text>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}