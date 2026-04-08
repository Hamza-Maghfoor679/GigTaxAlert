import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { collection, doc, getDoc, getFirestore } from '@react-native-firebase/firestore';

import type { SubscriptionState } from '../types/settings.types';

type UseSubscriptionReturn = {
  subscription: SubscriptionState | null;
  loading: boolean;
  openUpgrade: () => void;
  openManage: () => void;
  restorePurchases: () => void;
};

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        setSubscription({ tier: 'free' });
        return;
      }
      const firestore = getFirestore();
      const userRef = doc(collection(firestore, 'users'), uid);
      const snap = await getDoc(userRef);
      const tier = snap.exists ? ((snap.data() as { subscriptionTier?: 'free' | 'pro' }).subscriptionTier ?? 'free') : 'free';
      setSubscription({ tier });
    } catch (error) {
      console.error('fetchSubscription error:', error);
      setSubscription({ tier: 'free' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  const openUpgrade = useCallback(() => {
    Alert.alert('Upgrade', 'RevenueCat paywall coming soon');
  }, []);

  const openManage = useCallback(() => {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    void Linking.openURL(url).catch((error) => {
      console.error('openManage error:', error);
    });
  }, []);

  const restorePurchases = useCallback(() => {
    Alert.alert('Restore Purchases', 'Restore flow will be connected shortly.');
  }, []);

  return { subscription, loading, openUpgrade, openManage, restorePurchases };
}