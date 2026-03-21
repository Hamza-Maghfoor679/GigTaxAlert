import type {
    FreelanceType,
    NotificationCategory,
    SelectOption,
    SubscriptionTier,
  } from '../types/settings.types';
  
  // ─── Country options ──────────────────────────────────────────────────────────
  
  export const COUNTRY_OPTIONS: SelectOption[] = [
    { value: 'US', label: 'United States',  flag: '🇺🇸' },
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'CA', label: 'Canada',         flag: '🇨🇦' },
    { value: 'AU', label: 'Australia',      flag: '🇦🇺' },
    { value: 'DE', label: 'Germany',        flag: '🇩🇪' },
    { value: 'FR', label: 'France',         flag: '🇫🇷' },
    { value: 'IN', label: 'India',          flag: '🇮🇳' },
    { value: 'PK', label: 'Pakistan',       flag: '🇵🇰' },
    { value: 'NG', label: 'Nigeria',        flag: '🇳🇬' },
    { value: 'SG', label: 'Singapore',      flag: '🇸🇬' },
  ];
  
  // ─── Freelance type options ───────────────────────────────────────────────────
  
  export const FREELANCE_OPTIONS: SelectOption[] = [
    { value: 'designer',    label: 'Designer',          flag: '🎨' },
    { value: 'developer',   label: 'Developer',         flag: '💻' },
    { value: 'writer',      label: 'Writer / Copywriter', flag: '✍️' },
    { value: 'consultant',  label: 'Consultant',        flag: '💼' },
    { value: 'photographer',label: 'Photographer',      flag: '📷' },
    { value: 'marketer',    label: 'Marketer',          flag: '📣' },
    { value: 'other',       label: 'Other',             flag: '⚡' },
  ];
  
  // ─── Subscription helpers ─────────────────────────────────────────────────────
  
  export const SUBSCRIPTION_LABELS: Record<SubscriptionTier, string> = {
    free:       'Free',
    pro:        'Pro Monthly',
    pro_annual: 'Pro Annual',
  };
  
  export const SUBSCRIPTION_BADGE_COLOR = (tier: SubscriptionTier, primary: string): string => {
    if (tier === 'free') return '#6B7280';
    return primary;
  };
  
  // ─── Notification category meta ───────────────────────────────────────────────
  
  export const NOTIFICATION_META: Record<
    NotificationCategory,
    { label: string; description: string; emoji: string }
  > = {
    estimated_tax: {
      label:       'Estimated Tax',
      description: 'Quarterly federal tax payment reminders',
      emoji:       '🏛️',
    },
    vat: {
      label:       'VAT Returns',
      description: 'VAT submission and payment due dates',
      emoji:       '💶',
    },
    self_assessment: {
      label:       'Self Assessment',
      description: 'Annual self-assessment filing deadlines',
      emoji:       '📋',
    },
    quarterly: {
      label:       'Quarterly Deadlines',
      description: 'All quarterly tax events',
      emoji:       '📅',
    },
    reminders: {
      label:       'Early Reminders',
      description: '7 and 30-day advance warnings',
      emoji:       '⏰',
    },
  };
  
  // ─── Initials helper ──────────────────────────────────────────────────────────
  
  export const getInitials = (name: string): string =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  
  // ─── Country label from value ─────────────────────────────────────────────────
  
  export const getCountryLabel = (value: string): string =>
    COUNTRY_OPTIONS.find((c) => c.value === value)?.label ?? value;
  
  export const getCountryFlag = (value: string): string =>
    COUNTRY_OPTIONS.find((c) => c.value === value)?.flag ?? '🌍';