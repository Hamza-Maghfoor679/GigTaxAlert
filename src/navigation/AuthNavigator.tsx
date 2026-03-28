import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginSignUpScreen from '@/screens/auth/LoginSignUpScreen';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';

import type { AuthStackParamList } from './types';
import FreelanceTypeScreen from '@/screens/onboarding/FreelanceTypeScreen';
import CountrySelectScreen from '@/screens/onboarding/CountrySelectScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        component={WelcomeScreen}
        name="Welcome"
        options={{ title: 'Welcome' }}
      />
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
      <Stack.Screen
        component={LoginSignUpScreen}
        name="LoginSignUp"
        options={{ title: 'Account' }}
      />
    </Stack.Navigator>
  );
}
