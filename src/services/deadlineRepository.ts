import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  setDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import type {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type { GeneratedDeadline } from '@/domain/deadlines/engine';

export type UserDeadlineDoc = GeneratedDeadline & {
  year?: number;
  type?: string;
  schemaVersion?: number;
  completedAt?: unknown | null;
  reminderDaysBefore?: number[];
  reminderNotificationIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ReminderMetadataDoc = {
  deadlineId: string;
  reminderDaysBefore: number[];
  notificationIds: string[];
  updatedAt?: unknown;
};

const usersCol = () => collection(getFirestore(), 'users');
const deadlinesCol = (uid: string) => collection(doc(usersCol(), uid), 'deadlines');
const remindersCol = (uid: string) => collection(doc(usersCol(), uid), 'deadlineReminders');

export async function listUserDeadlines(uid: string): Promise<UserDeadlineDoc[]> {
  const snap = await getDocs(deadlinesCol(uid));
  return snap.docs.map((doc) => ({ ...(doc.data() as UserDeadlineDoc), id: doc.id }));
}

export type DeadlineQueryOptions = {
  year: number;
  limitCount?: number;
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
};

function buildDeadlinesQuery(uid: string, options: DeadlineQueryOptions) {
  const constraints = [
    where('year', '==', options.year),
    orderBy('dueDate', 'asc'),
  ];

  if (typeof options.limitCount === 'number' && options.limitCount > 0) {
    constraints.push(limit(options.limitCount));
  }

  if (options.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  return query(deadlinesCol(uid), ...constraints);
}

export function subscribeUserDeadlines(
  uid: string,
  options: DeadlineQueryOptions,
  onData: (
    deadlines: UserDeadlineDoc[],
    lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
  ) => void,
  onError: (error: unknown) => void,
): () => void {
  return onSnapshot(
    buildDeadlinesQuery(uid, options),
    (snap) => {
      const rows = snap.docs.map((item) => ({ ...(item.data() as UserDeadlineDoc), id: item.id }));
      const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
      onData(rows, lastDoc);
    },
    onError,
  );
}

export async function upsertUserDeadlines(uid: string, deadlines: GeneratedDeadline[]): Promise<void> {
  const batch = writeBatch(getFirestore());
  const now = serverTimestamp();

  deadlines.forEach((deadline) => {
    const ref = doc(deadlinesCol(uid), deadline.id);
    const parsedYear = Number(deadline.dueDate.slice(0, 4));
    batch.set(
      ref,
      {
        ...deadline,
        year: Number.isNaN(parsedYear) ? new Date().getFullYear() : parsedYear,
        type: deadline.category ?? 'other',
        schemaVersion: 1,
        updatedAt: now,
        createdAt: now,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

export async function setDeadlineCompletion(
  uid: string,
  deadlineId: string,
  isComplete: boolean,
): Promise<void> {
  await setDoc(
    doc(deadlinesCol(uid), deadlineId),
    {
      isComplete,
      completedAt: isComplete ? serverTimestamp() : null,
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function batchSetDeadlineCompletion(
  uid: string,
  updates: Array<{ deadlineId: string; isComplete: boolean }>,
): Promise<void> {
  if (updates.length === 0) return;

  const batch = writeBatch(getFirestore());
  const now = serverTimestamp();
  updates.forEach(({ deadlineId, isComplete }) => {
    batch.set(
      doc(deadlinesCol(uid), deadlineId),
      {
        isComplete,
        completedAt: isComplete ? now : null,
        schemaVersion: 1,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

export async function upsertReminderMetadata(uid: string, metadata: ReminderMetadataDoc): Promise<void> {
  await setDoc(
    doc(remindersCol(uid), metadata.deadlineId),
    {
      ...metadata,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getReminderMetadata(uid: string, deadlineId: string): Promise<ReminderMetadataDoc | null> {
  const snap = await getDoc(doc(remindersCol(uid), deadlineId));
  if (!snap.exists) return null;
  return snap.data() as ReminderMetadataDoc;
}
