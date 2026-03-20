import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CountrySelectScreen from '@/screens/onboarding/CountrySelectScreen';
import FreelanceTypeScreen from '@/screens/onboarding/FreelanceTypeScreen';

import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator initialRouteName="CountrySelect" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={CountrySelectScreen}
        name="CountrySelect"
        options={{ title: 'Country' }}
      />
      <Stack.Screen
        component={FreelanceTypeScreen}
        name="FreelanceType"
        options={{ title: 'Freelance type' }}
      />
    </Stack.Navigator>
  );
}
