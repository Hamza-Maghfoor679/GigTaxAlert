import { useState } from 'react';

/**
 * RevenueCat / purchases — replace with `react-native-purchases` when integrated.
 */
export function useSubscription() {
  const [isPro] = useState(false);
  const [isLoading] = useState(false);

  return {
    isPro,
    isLoading,
    offerings: [] as const,
    purchasePro: async () => {
      // TODO: Purchases.purchasePackage(...)
    },
    restore: async () => {
      // TODO: Purchases.restorePurchases()
    },
  };
}
