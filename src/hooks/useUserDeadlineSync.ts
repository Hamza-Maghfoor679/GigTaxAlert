import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';

import type { UseDeadlinesResult, DeadlineError, HookDeadline } from '@/hooks/types/deadline.types';
import { normalizeDeadline } from '@/hooks/utils/deadlineUtils';
import { ensureDeadlinesGeneratedForYear } from '@/services/deadlines';
import { trackDeadlineCompleted } from '@/services/analytics/deadlineAnalytics';
import { readDeadlinesCache, writeDeadlinesCache } from '@/services/cache/deadlineCache';
import { setDeadlineCompletion, subscribeUserDeadlines } from '@/services/deadlineRepository';
import { useAuthStore } from '@/stores/authStore';

function mapFirestoreError(error: unknown): DeadlineError {
  const e = error as { code?: string; message?: string };
  switch (e?.code) {
    case 'firestore/permission-denied':
    case 'permission-denied':
      return {
        type: 'PERMISSION_DENIED',
        message: 'You do not have permission to access deadlines.',
      };
    case 'firestore/unavailable':
    case 'firestore/deadline-exceeded':
    case 'unavailable':
    case 'deadline-exceeded':
      return {
        type: 'NETWORK_ERROR',
        message: 'Network is unavailable. Showing last known data.',
      };
    case 'firestore/failed-precondition':
    case 'failed-precondition':
      return {
        type: 'UNKNOWN',
        message:
          'Firestore query needs an index (year + dueDate). Create the suggested index in Firebase console.',
      };
    default:
      return {
        type: 'UNKNOWN',
        message: e?.message || 'Unable to load deadlines right now.',
      };
  }
}

/**
 * Single Firestore subscription for user deadlines — mount only from UserProfileProvider.
 */
export function useUserDeadlineSync(): UseDeadlinesResult {
  const authFlowStatus = useAuthStore((s) => s.status);
  const [deadlines, setDeadlines] = useState<HookDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DeadlineError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  const cleanupSubscription = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      mounted.current = false;
      cleanupSubscription();
    };
  }, [cleanupSubscription]);

  const bootstrap = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    const year = new Date().getFullYear();

    if (!uid) {
      if (!mounted.current) return;
      cleanupSubscription();
      setDeadlines([]);
      setError(null);
      if (!mounted.current) return;
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cached = await readDeadlinesCache(uid, year);
      if (mounted.current && cached.length > 0) {
        setDeadlines(cached);
      }
    } catch {
      // cache read is best-effort; ignore failures
    }

    try {
      await ensureDeadlinesGeneratedForYear(uid, year);
    } catch (generationError) {
      if (mounted.current) {
        setError(mapFirestoreError(generationError));
      }
    }

    cleanupSubscription();
    let didReceiveSnapshot = false;
    const loadingWatchdog = setTimeout(() => {
      if (!mounted.current || didReceiveSnapshot) return;
      setLoading(false);
    }, 6000);

    try {
      unsubscribeRef.current = subscribeUserDeadlines(
        uid,
        { year, limitCount: 50, cursor: undefined },
        async (rows, _lastDoc) => {
          didReceiveSnapshot = true;
          clearTimeout(loadingWatchdog);
          const normalized = rows
            .map((row) => normalizeDeadline(row, row.id))
            .filter((row): row is HookDeadline => row !== null);

          if (!mounted.current) return;
          setDeadlines(normalized);
          setError(null);
          setLoading(false);
          try {
            await writeDeadlinesCache(uid, year, normalized);
          } catch {
            // cache write is best-effort; ignore failures
          }
        },
        (snapshotError) => {
          didReceiveSnapshot = true;
          clearTimeout(loadingWatchdog);
          if (!mounted.current) return;
          console.error('[useUserDeadlineSync] snapshot error:', snapshotError);
          setError(mapFirestoreError(snapshotError));
          setLoading(false);
        },
      );
    } catch (subscribeError) {
      clearTimeout(loadingWatchdog);
      if (!mounted.current) return;
      console.error('[useUserDeadlineSync] subscribe error:', subscribeError);
      setError(mapFirestoreError(subscribeError));
      setLoading(false);
    }
  }, [cleanupSubscription]);

  const refetch = useCallback(async () => {
    setReloadToken((v) => v + 1);
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    let rollback: HookDeadline[] = [];
    let nextValue: boolean | null = null;

    setDeadlines((prev) => {
      rollback = prev;
      return prev.map((item) => {
        if (item.id !== id) return item;
        nextValue = !item.isComplete;
        return {
          ...item,
          isComplete: !item.isComplete,
        };
      });
    });

    if (nextValue === null) return;

    try {
      await setDeadlineCompletion(uid, id, nextValue);
      await trackDeadlineCompleted({ deadlineId: id, source: 'home' });
      setError(null);
    } catch (toggleError) {
      setDeadlines(rollback);
      setError(mapFirestoreError(toggleError));
    }
  }, []);

  useEffect(() => {
    void bootstrap();
    return () => {
      cleanupSubscription();
    };
  }, [bootstrap, cleanupSubscription, reloadToken, authFlowStatus]);

  const activeDeadlines = useMemo(
    () => deadlines.filter((deadline) => !deadline.isComplete),
    [deadlines],
  );
  const completedDeadlines = useMemo(
    () => deadlines.filter((deadline) => deadline.isComplete),
    [deadlines],
  );
  const upcomingDeadlines = useMemo(
    () =>
      activeDeadlines
        .slice()
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 3),
    [activeDeadlines],
  );

  return useMemo(
    () => ({
      deadlines,
      activeDeadlines,
      completedDeadlines,
      upcomingDeadlines,
      loading,
      error,
      refetch,
      toggleComplete,
    }),
    [
      deadlines,
      activeDeadlines,
      completedDeadlines,
      upcomingDeadlines,
      loading,
      error,
      refetch,
      toggleComplete,
    ],
  );
}
