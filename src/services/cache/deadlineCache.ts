import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  deserializeDeadlines,
  serializeDeadlines,
} from '@/hooks/utils/deadlineUtils';
import type { HookDeadline } from '@/hooks/types/deadline.types';

type MMKVInstance = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

let mmkv: MMKVInstance | null = null;

function getMMKV(): MMKVInstance | null {
  if (mmkv) return mmkv;

  try {
    const moduleRef = require('react-native-mmkv') as {
      MMKV?: new () => MMKVInstance;
    };
    if (moduleRef?.MMKV) {
      mmkv = new moduleRef.MMKV();
      return mmkv;
    }
  } catch {
    return null;
  }

  return null;
}

export function getDeadlinesCacheKey(uid: string, year: number): string {
  return `deadlines_${uid}_${year}`;
}

export async function readDeadlinesCache(uid: string, year: number): Promise<HookDeadline[]> {
  const key = getDeadlinesCacheKey(uid, year);
  const mmkvStore = getMMKV();

  try {
    const raw = mmkvStore ? mmkvStore.getString(key) : await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReturnType<typeof serializeDeadlines>;
    return deserializeDeadlines(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export async function writeDeadlinesCache(
  uid: string,
  year: number,
  deadlines: HookDeadline[],
): Promise<void> {
  const key = getDeadlinesCacheKey(uid, year);
  const payload = JSON.stringify(serializeDeadlines(deadlines));
  const mmkvStore = getMMKV();

  if (mmkvStore) {
    mmkvStore.set(key, payload);
    return;
  }

  await AsyncStorage.setItem(key, payload);
}

export async function clearDeadlinesCache(uid: string, year: number): Promise<void> {
  const key = getDeadlinesCacheKey(uid, year);
  const mmkvStore = getMMKV();

  if (mmkvStore) {
    mmkvStore.delete(key);
    return;
  }

  await AsyncStorage.removeItem(key);
}
