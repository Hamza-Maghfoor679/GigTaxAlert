import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '@/stores/authStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);

  return (
    <NavigationContainer>
      {status === 'auth' ? (
        <AuthNavigator />
      ) : status === 'onboarding' ? (
        <OnboardingNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
