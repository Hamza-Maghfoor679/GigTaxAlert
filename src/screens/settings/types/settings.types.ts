// ─── Profile ──────────────────────────────────────────────────────────────────

export type FreelanceType =
  | 'designer'
  | 'developer'
  | 'writer'
  | 'consultant'
  | 'photographer'
  | 'marketer'
  | 'other';

export type SubscriptionTier = 'free' | 'pro' | 'pro_annual';

export type UserProfile = {
  id:               string;
  displayName:      string;
  email:            string;
  country:          string;       // ISO-3166 alpha-2, e.g. "US"
  countryLabel:     string;       // e.g. "United States"
  freelanceType:    FreelanceType;
  subscriptionTier: SubscriptionTier;
  avatarInitials:   string;
};

// ─── Notification preferences ─────────────────────────────────────────────────

export type NotificationCategory =
  | 'estimated_tax'
  | 'vat'
  | 'self_assessment'
  | 'quarterly'
  | 'reminders';

export type NotificationPreferences = Record<NotificationCategory, boolean> & {
  globalEnabled: boolean;
};

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionInfo = {
  tier:          SubscriptionTier;
  label:         string;       // "Free" | "Pro" | "Pro Annual"
  renewsAt?:     string;       // ISO date string
  isTrial:       boolean;
  trialEndsAt?:  string;
};

// ─── Country / freelance option shapes ───────────────────────────────────────

export type SelectOption = {
  value: string;
  label: string;
  flag?: string;
};