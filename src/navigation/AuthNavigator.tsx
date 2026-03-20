import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginSignUpScreen from '@/screens/auth/LoginSignUpScreen';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';

import type { AuthStackParamList } from './types';

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
        component={LoginSignUpScreen}
        name="LoginSignUp"
        options={{ title: 'Account' }}
      />
    </Stack.Navigator>
  );
}
