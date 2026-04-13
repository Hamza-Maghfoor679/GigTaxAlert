import { useMemo } from 'react';

import type { UseDeadlinesResult } from '@/hooks/types/deadline.types';
import { useUserProfile } from '@/context/UserProfileContext';

export function useDeadlines(): UseDeadlinesResult {
  const {
    deadlines,
    deadlinesLoading,
    deadlinesError,
    refetchDeadlines,
    toggleDeadlineComplete,
    activeDeadlines,
    completedDeadlines,
    upcomingDeadlines,
  } = useUserProfile();

  return useMemo(
    () => ({
      deadlines,
      activeDeadlines,
      completedDeadlines,
      upcomingDeadlines,
      loading: deadlinesLoading,
      error: deadlinesError,
      refetch: refetchDeadlines,
      toggleComplete: toggleDeadlineComplete,
    }),
    [
      deadlines,
      activeDeadlines,
      completedDeadlines,
      upcomingDeadlines,
      deadlinesLoading,
      deadlinesError,
      refetchDeadlines,
      toggleDeadlineComplete,
    ],
  );
}
