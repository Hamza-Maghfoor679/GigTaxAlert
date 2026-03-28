// services/user.ts
import { UserDoc } from '@/types/schemas/user';
import firestore from '@react-native-firebase/firestore';

const usersCol = () => firestore().collection('users');

// ─── Real-time listener ───────────────────────────────────────────────────────
// Start this after Firebase Auth confirms a session.
// Returns the unsubscribe function — call it in useEffect cleanup.
export function listenUser(uid: string, cb: (user: UserDoc | null) => void) {
  return usersCol()
    .doc(uid)
    .onSnapshot((snap) =>
      cb(snap.exists ? (snap.data() as UserDoc) : null)
    );
}

// ─── One-time read ────────────────────────────────────────────────────────────
// Use sparingly — prefer the listener for reactive UI.
export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await usersCol().doc(uid).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

// ─── Update FCM token ─────────────────────────────────────────────────────────
// Call every app launch after notification permission is granted.
export async function updateFcmToken(uid: string, token: string) {
  await usersCol().doc(uid).update({
    fcmToken:  token,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ─── Update RevenueCat ID ─────────────────────────────────────────────────────
// Call the first time the paywall is shown.
export async function updateRevenueCatId(uid: string, id: string) {
  await usersCol().doc(uid).update({
    revenueCatId: id,
    updatedAt:    firestore.FieldValue.serverTimestamp(),
  });
}