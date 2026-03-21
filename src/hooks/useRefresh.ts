import * as Haptics from 'expo-haptics';
import { useState, useCallback } from 'react';

/**
 * useRefresh
 *
 * Drop-in hook for pull-to-refresh flows.
 * Fires a light haptic, toggles `refreshing` state, awaits the
 * provided `refetch` function, then resets.
 *
 * @example
 * const { refreshing, onRefresh } = useRefresh(refetch);
 * <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 */
export const useRefresh = (refetch: () => Promise<unknown>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
};