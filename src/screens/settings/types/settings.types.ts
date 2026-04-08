export type CountryCode = 'US' | 'UK' | 'DE' | 'FR' | 'NL';

export type FreelanceType = 'developer' | 'designer' | 'writer' | 'consultant' | 'creator' | 'other';

export type UserProfile = {
  displayName: string;
  email: string;
  avatarInitials: string;
  country: CountryCode;
  countryLabel: string;
  freelanceType: FreelanceType;
};

export type NotificationPrefs = {
  globalEnabled: boolean;
  categories: {
    quarterly: boolean;
    income_tax: boolean;
    self_employment: boolean;
    vat: boolean;
    other: boolean;
  };
};

export type CategoryKey = keyof NotificationPrefs['categories'];

export type SubscriptionState = {
  tier: 'free' | 'pro';
  expiresAt?: Date | null;
  isLifetime?: boolean;
};