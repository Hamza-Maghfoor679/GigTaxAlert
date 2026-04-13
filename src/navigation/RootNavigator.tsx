import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '@/stores/authStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { NotificationOrchestrator } from './NotificationOrchestrator';
import { OnboardingNavigator } from './OnboardingNavigator';

import type { MainTabParamList } from './types';

const navigationRef = createNavigationContainerRef<MainTabParamList>();

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        {status === 'auth' ? (
          <AuthNavigator />
        ) : status === 'onboarding' ? (
          <OnboardingNavigator />
        ) : (
          <MainNavigator />
        )}
      </NavigationContainer>
      <NotificationOrchestrator navigationRef={navigationRef} />
    </>
  );
}
