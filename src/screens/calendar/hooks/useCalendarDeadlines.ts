import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';

import type { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { getUserDeadlines, setDeadlineComplete } from '@/services/deadlines';
import { toUiDeadline } from '@/services/deadlineMapper';

type UseCalendarDeadlinesReturn = {
  deadlines: Deadline[];
  loading: boolean;
  refetch: () => Promise<void>;
  toggleComplete: (id: string) => void;
};

export function useCalendarDeadlines(): UseCalendarDeadlinesReturn {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        setDeadlines([]);
        return;
      }

      const stored = await getUserDeadlines(uid);

      const normalized = stored
        .map(toUiDeadline)
        .filter((deadline): deadline is Deadline => Boolean(deadline?.dueDate));

      setDeadlines(normalized);
    } catch {
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const current = deadlines.find((deadline) => deadline.id === id)?.isComplete ?? false;
    const next = !current;
    const previous = deadlines;
    setDeadlines((prev) =>
      prev.map((deadline) =>
        deadline.id === id ? { ...deadline, isComplete: next, completed: next } : deadline,
      ),
    );

    const persist = async () => {
      try {
        await setDeadlineComplete(id, next);
      } catch {
        setDeadlines(previous);
        Alert.alert('Sync Failed', 'Could not save changes. Check your connection and try again.');
      }
    };

    void persist();
  }, [deadlines]);

  const refetch = useCallback(async () => {
    await fetchDeadlines();
  }, [fetchDeadlines]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { deadlines, loading, refetch, toggleComplete };
}
