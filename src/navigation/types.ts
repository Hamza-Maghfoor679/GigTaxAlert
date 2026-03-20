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

export type AuthFlowStatus = 'auth' | 'onboarding' | 'main';
