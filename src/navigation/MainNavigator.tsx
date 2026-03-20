import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DeadlineCalendarScreen from '@/screens/calendar/DeadlineCalendarScreen';
import DeadlineDetailScreen from '@/screens/dashboard/DeadlineDetailScreen';
import HomeScreen from '@/screens/dashboard/HomeScreen';
import IncomeEstimatorScreen from '@/screens/estimator/IncomeEstimatorScreen';
import TaxSummaryScreen from '@/screens/estimator/TaxSummaryScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import SubscriptionScreen from '@/screens/settings/SubscriptionScreen';
import { useThemeColors } from '@/theme';

import type {
  DashboardStackParamList,
  EstimatorStackParamList,
  MainTabParamList,
  SettingsStackParamList,
} from './types';

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const EstimatorStack = createNativeStackNavigator<EstimatorStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: true }}>
      <DashboardStack.Screen
        component={HomeScreen}
        name="Home"
        options={{ title: 'Home', headerShown: false }}
      />
      <DashboardStack.Screen
        component={DeadlineDetailScreen}
        name="DeadlineDetail"
        options={{ title: 'Deadline', headerShown: false }}
      />
    </DashboardStack.Navigator>
  );
}

function EstimatorStackNavigator() {
  return (
    <EstimatorStack.Navigator screenOptions={{ headerShown: true }}>
      <EstimatorStack.Screen
        component={IncomeEstimatorScreen}
        name="IncomeEstimator"
        options={{ title: 'Estimator', headerShown: false }}
      />
      <EstimatorStack.Screen
        component={TaxSummaryScreen}
        name="TaxSummary"
        options={{ title: 'Summary', headerShown: false }}
      />
    </EstimatorStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: true }}>
      <SettingsStack.Screen
        component={SettingsScreen}
        name="Settings"
        options={{ title: 'Settings', headerShown: false }}
      />
      <SettingsStack.Screen
        component={SubscriptionScreen}
        name="Subscription"
        options={{ title: 'Subscription', headerShown: false }}
      />
      <SettingsStack.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ title: 'Profile', headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
}

export function MainNavigator() {
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        component={DashboardStackNavigator}
        name="Dashboard"
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        component={DeadlineCalendarScreen}
        name="Calendar"
        options={{ title: 'Calendar', headerShown: false }}
      />
      <Tab.Screen
        component={EstimatorStackNavigator}
        name="Estimator"
        options={{ title: 'Estimator', headerShown: false }}
      />
      <Tab.Screen
        component={SettingsStackNavigator}
        name="Settings"
        options={{ title: 'Settings', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
