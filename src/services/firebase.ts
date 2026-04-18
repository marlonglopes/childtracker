import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import Constants from 'expo-constants';

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig?.extra ?? {};

// In local dev, these can be anything — emulator ignores them
const firebaseConfig = {
  apiKey: (firebaseApiKey as string) ?? 'local-dev',
  authDomain: (firebaseAuthDomain as string) ?? 'localhost',
  projectId: (firebaseProjectId as string) ?? 'childtracker-dev',
  storageBucket: (firebaseStorageBucket as string) ?? '',
  messagingSenderId: (firebaseMessagingSenderId as string) ?? '',
  appId: (firebaseAppId as string) ?? 'local-dev',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to local emulators when running in development.
// EXPO_PUBLIC_USE_EMULATOR=true enables this — set it in .env.local for local dev.
// On a physical device, use your machine's LAN IP instead of localhost.
if (process.env.EXPO_PUBLIC_USE_EMULATOR === 'true') {
  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? 'localhost';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  console.log('[firebase] connected to emulators at', host);
} else {
  console.log('[firebase] using REAL firebase project', firebaseConfig.projectId);
}
