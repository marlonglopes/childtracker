import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebase';
import type { Family, Child, FamilySettings } from '@/types';

function generateLinkCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createFamily(parentName: string, parentPhone: string): Promise<Family> {
  console.log('[createFamily] start', { parentName, parentPhone });
  const userCred = await signInAnonymously(auth);
  console.log('[createFamily] signed in', userCred.user.uid);
  const familyId = userCred.user.uid;
  const linkCode = generateLinkCode();

  const family: Omit<Family, 'id' | 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    linkCode,
    parentPhone,
    parentName,
    createdAt: serverTimestamp(),
    settings: {
      alertMode: 'instant',
      digestTime: '18:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      flaggedDomains: [],
      blockedDomains: [],
    },
  };

  await setDoc(doc(db, 'families', familyId), family);
  console.log('[createFamily] wrote Firestore doc families/' + familyId);

  return {
    id: familyId,
    ...family,
    createdAt: new Date(),
  };
}

export async function linkChildToFamily(
  linkCode: string,
  childName: string,
  avatar: string,
): Promise<{ family: Family; child: Child }> {
  const q = query(collection(db, 'families'), where('linkCode', '==', linkCode));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('Invalid link code. Please check and try again.');
  }

  const familyDoc = snap.docs[0]!;
  const familyData = familyDoc.data();

  const userCred = await signInAnonymously(auth);
  const childId = userCred.user.uid;

  const child: Omit<Child, 'id' | 'linkedAt'> & { linkedAt: ReturnType<typeof serverTimestamp> } = {
    name: childName,
    avatar,
    linkedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'families', familyDoc.id, 'children', childId), child);

  const family: Family = {
    id: familyDoc.id,
    linkCode: familyData['linkCode'],
    parentPhone: familyData['parentPhone'],
    parentName: familyData['parentName'],
    createdAt: (familyData['createdAt'] as Timestamp).toDate(),
    settings: {
      alertMode: familyData['settings']?.alertMode ?? 'instant',
      digestTime: familyData['settings']?.digestTime ?? '18:00',
      timezone: familyData['settings']?.timezone ?? 'UTC',
      flaggedDomains: familyData['settings']?.flaggedDomains ?? [],
      blockedDomains: familyData['settings']?.blockedDomains ?? [],
    },
  };

  return {
    family,
    child: { id: childId, ...child, linkedAt: new Date() },
  };
}

export async function updateFamilySettings(
  familyId: string,
  patch: Partial<FamilySettings>,
): Promise<void> {
  const ref = doc(db, 'families', familyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Family not found');
  const current = snap.data()['settings'] ?? {};
  await updateDoc(ref, { settings: { ...current, ...patch } });
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(db, 'families', familyId));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    linkCode: data['linkCode'],
    parentPhone: data['parentPhone'],
    parentName: data['parentName'],
    createdAt: (data['createdAt'] as Timestamp).toDate(),
    settings: {
      alertMode: data['settings']?.alertMode ?? 'instant',
      digestTime: data['settings']?.digestTime ?? '18:00',
      timezone: data['settings']?.timezone ?? 'UTC',
      flaggedDomains: data['settings']?.flaggedDomains ?? [],
      blockedDomains: data['settings']?.blockedDomains ?? [],
    },
  };
}
