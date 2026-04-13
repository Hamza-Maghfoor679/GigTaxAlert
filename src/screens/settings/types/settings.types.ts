export type CountryCode = 'US' | 'UK' | 'DE' | 'FR' | 'NL';

export type FreelanceType =
  'developer' | 'designer' | 'writer' | 'consultant' | 'creator' | 'other';

export interface SettingsProfile {
  displayName: string;
  email: string;
  avatarInitials: string;
  country: CountryCode;
  countryLabel: string;
  freelanceType: FreelanceType;
  photoURL: string | null;
}

export interface NotificationPreferences {
  globalEnabled: boolean;
  deadlines: boolean;
  dayOf: boolean;
  postDeadline: boolean;
}

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
};