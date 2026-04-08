import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

import type { GeneratedDeadline } from '@/domain/deadlines/engine';

export type UserDeadlineDoc = GeneratedDeadline & {
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

export async function upsertUserDeadlines(uid: string, deadlines: GeneratedDeadline[]): Promise<void> {
  const batch = writeBatch(getFirestore());
  const now = serverTimestamp();

  deadlines.forEach((deadline) => {
    const ref = doc(deadlinesCol(uid), deadline.id);
    batch.set(
      ref,
      {
        ...deadline,
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
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
