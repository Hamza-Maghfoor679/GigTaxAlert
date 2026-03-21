import { useCallback, useEffect, useState } from 'react';
import { InteractionManager, Linking } from 'react-native';

import type { SubscriptionInfo } from '../types/settings.types';

type UseSubscriptionReturn = {
  subscription:     SubscriptionInfo | null;
  loading:          boolean;
  openUpgrade:      () => void;
  openManage:       () => void;
  restorePurchases: () => Promise<void>;
};

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading,      setLoading]      = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      // const info = await Purchases.getCustomerInfo();
      await new Promise((r) => setTimeout(r, 300));
      setSubscription({ tier: 'pro', label: 'Pro Monthly', renewsAt: '2025-05-01', isTrial: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ Defer until animations are done — RevenueCat call is heavy
    const task = InteractionManager.runAfterInteractions(() => {
      void fetchSubscription();
    });
    return () => task.cancel();
  }, [fetchSubscription]);

  const openUpgrade      = useCallback(() => void Linking.openURL('https://gigtax.app/upgrade'), []);
  const openManage       = useCallback(() => void Linking.openURL('https://apps.apple.com/account/subscriptions'), []);
  const restorePurchases = useCallback(async () => { await fetchSubscription(); }, [fetchSubscription]);

  return { subscription, loading, openUpgrade, openManage, restorePurchases };
}