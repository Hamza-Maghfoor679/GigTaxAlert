// types/user.ts
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type CountryCode =
  | 'US' | 'GB' | 'DE' | 'FR'
  | 'NL' | 'AU' | 'CA' | 'SG';

export type FreelanceType =
  | 'developer' | 'designer' | 'writer'
  | 'consultant' | 'photographer'
  | 'marketer' | 'tutor' | 'other';

export type SubscriptionTier = 'free' | 'pro';

export interface UserDoc {
  // Auth info
  uid:              string;
  email:            string;
  displayName:      string;
  photoURL:         string | null;
  provider:         'google';

  // Onboarding
  country:          CountryCode | null;
  freelanceType:    FreelanceType | null;
  vatRegistered:    boolean;

  // Subscription
  subscriptionTier: SubscriptionTier;
  revenueCatId:     string | null;

  // Notifications
  fcmToken:         string | null;

  // State
  onboardingComplete:      boolean;
  deadlinesGeneratedYear:  number | null;

  // Timestamps
  createdAt:        FirebaseFirestoreTypes.Timestamp;
  updatedAt:        FirebaseFirestoreTypes.Timestamp;
}