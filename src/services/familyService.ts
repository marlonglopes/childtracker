import {
  doc,
  setDoc,
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
import type { Family, Child } from '@/types';

function generateLinkCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createFamily(parentName: string, parentPhone: string): Promise<Family> {
  const userCred = await signInAnonymously(auth);
  const familyId = userCred.user.uid;
  const linkCode = generateLinkCode();

  const family: Omit<Family, 'id' | 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    linkCode,
    parentPhone,
    parentName,
    createdAt: serverTimestamp(),
    settings: {
      notifyMode: 'instant',
      digestTime: '18:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  await setDoc(doc(db, 'families', familyId), family);

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
    settings: familyData['settings'],
  };

  return {
    family,
    child: { id: childId, ...child, linkedAt: new Date() },
  };
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
    settings: data['settings'],
  };
}
