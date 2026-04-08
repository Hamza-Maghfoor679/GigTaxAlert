import type { CountryCode, FreelanceType } from '../types/settings.types';

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
};

export const COUNTRY_OPTIONS: { code: CountryCode; label: string; flag: string }[] = [
  { code: 'US', label: COUNTRY_LABELS.US, flag: '🇺🇸' },
  { code: 'UK', label: COUNTRY_LABELS.UK, flag: '🇬🇧' },
  { code: 'DE', label: COUNTRY_LABELS.DE, flag: '🇩🇪' },
  { code: 'FR', label: COUNTRY_LABELS.FR, flag: '🇫🇷' },
  { code: 'NL', label: COUNTRY_LABELS.NL, flag: '🇳🇱' },
];

export const FREELANCE_OPTIONS: { value: FreelanceType; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'writer', label: 'Writer' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'creator', label: 'Creator' },
  { value: 'other', label: 'Other' },
];

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return `${parts[0]![0]!.toUpperCase()}${parts[1]![0]!.toUpperCase()}`;
};