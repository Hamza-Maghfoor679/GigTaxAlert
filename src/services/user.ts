// services/user.ts
import { UserDoc } from '@/types/schemas/user';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';

const usersCol = () => collection(getFirestore(), 'users');

// ─── Real-time listener ───────────────────────────────────────────────────────
// Start this after Firebase Auth confirms a session.
// Returns the unsubscribe function — call it in useEffect cleanup.
export function listenUser(uid: string, cb: (user: UserDoc | null) => void) {
  return onSnapshot(doc(usersCol(), uid), (snap) =>
    cb(snap.exists ? (snap.data() as UserDoc) : null),
  );
}

// ─── One-time read ────────────────────────────────────────────────────────────
// Use sparingly — prefer the listener for reactive UI.
export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(usersCol(), uid));
  return snap.exists ? (snap.data() as UserDoc) : null;
}

// ─── Update FCM token ─────────────────────────────────────────────────────────
// Call every app launch after notification permission is granted.
export async function updateFcmToken(uid: string, token: string) {
  await updateDoc(doc(usersCol(), uid), {
    fcmToken: token,
    updatedAt: serverTimestamp(),
  });
}

// ─── Update RevenueCat ID ─────────────────────────────────────────────────────
// Call the first time the paywall is shown.
export async function updateRevenueCatId(uid: string, id: string) {
  await updateDoc(doc(usersCol(), uid), {
    revenueCatId: id,
    updatedAt: serverTimestamp(),
  });
}