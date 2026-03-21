import { useCallback, useState } from 'react';

import { useDeadlineStore } from '@/stores/deadlineStore';

/**
 * Fetches `user_deadlines` from Supabase — stub until wired.
 */
export function useDeadlines() {
  const deadlines = useDeadlineStore((s) => s.deadlines);
  const setDeadlines = useDeadlineStore((s) => s.setDeadlines);
  const [loading, setLoading] = useState(false);
  const toggleComplete = useDeadlineStore((s) => s.toggleComplete);
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: const { data } = await supabase.from('user_deadlines').select('*')
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, [setDeadlines]);

  return { deadlines, loading, refetch, toggleComplete };
}
