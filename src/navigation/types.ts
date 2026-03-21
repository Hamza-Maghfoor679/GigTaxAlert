export type AuthStackParamList = {
  Welcome: undefined;
  LoginSignUp: undefined;
};

export type OnboardingStackParamList = {
  CountrySelect: undefined;
  FreelanceType: undefined;
};

export type DashboardStackParamList = {
  Home: undefined;
  DeadlineDetail: { deadlineId: string };
};

export type EstimatorStackParamList = {
  IncomeEstimator: undefined;
  TaxSummary: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Subscription: undefined;
  Profile: undefined;
};

/** Bottom tabs; each tab hosts its own stack navigator. */
export type MainTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Estimator: undefined;
  Settings: undefined;
};

/**
 * Root navigator — switches between auth, onboarding, and main flows.
 * Also exposes cross-stack screens (AllDeadlines) that can be pushed
 * from any nested navigator via useNavigation<RootNav>().
 */
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  AllDeadlines: undefined;
  Settings: undefined;
  DeadlineDetail: { deadlineId: string };
  IncomeEstimator: undefined;
  TaxSummary: undefined;
  CountrySelect: undefined;
  FreelanceType: undefined;
  Welcome: undefined;
  LoginSignUp: undefined;
  Subscription: undefined;
  Profile: undefined;
};

export type AuthFlowStatus = 'auth' | 'onboarding' | 'main';