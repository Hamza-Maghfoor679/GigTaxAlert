import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DeadlineCalendarScreen from '@/screens/calendar/DeadlineCalendarScreen';
import DeadlineDetailScreen from '@/screens/dashboard/DeadlineDetailScreen';
import HomeScreen from '@/screens/dashboard/HomeScreen';
import IncomeEstimatorScreen from '@/screens/estimator/IncomeEstimatorScreen';
import TaxSummaryScreen from '@/screens/estimator/TaxSummaryScreen';
import ProfileScreen from '@/screens/settings/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import SubscriptionScreen from '@/screens/settings/SubscriptionScreen';
import { ms, s, typography, useThemeColors } from '@/theme';

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
  const insets = useSafeAreaInsets();

  const tabBarHeight = ms(56) + Math.max(insets.bottom, s(8));
  const styles = StyleSheet.create({
    tabBar: {
      position: 'absolute',
      left: s(12),
      right: s(12),
      bottom: Math.max(insets.bottom, s(10)),
      height: tabBarHeight,
      borderTopWidth: 0,
      borderRadius: s(18),
      backgroundColor: colors.surface,
      paddingTop: s(6),
      paddingBottom: Math.max(insets.bottom, s(8)),
      paddingHorizontal: s(8),
      elevation: 10,
      shadowColor: '#000000',
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: s(4) },
      shadowRadius: s(10),
    },
    tabBarLabel: {
      ...typography.labelSmall,
      marginTop: s(2),
    },
  });

  const getTabIcon = (
    routeName: keyof MainTabParamList,
    focused: boolean,
    color: string,
  ) => {
    const iconSize = focused ? ms(22) : ms(20);
    const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> =
      {
        Dashboard: focused ? 'home' : 'home-outline',
        Calendar: focused ? 'calendar' : 'calendar-outline',
        Estimator: focused ? 'calculator' : 'calculator-outline',
        Settings: focused ? 'settings' : 'settings-outline',
      };

    return <Ionicons name={iconMap[routeName]} size={iconSize} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color }) =>
          getTabIcon(route.name as keyof MainTabParamList, focused, color),
      })}
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
