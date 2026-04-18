import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { ActivityType, ActivityLog } from '@/types';

export interface LogActivityParams {
  familyId: string;
  childId: string;
  childName: string;
  type: ActivityType;
  label: string;
  location?: { lat: number; lng: number; address?: string };
}

export async function logActivity(params: LogActivityParams): Promise<string> {
  const { familyId, ...rest } = params;

  const docRef = await addDoc(collection(db, 'families', familyId, 'activities'), {
    ...rest,
    timestamp: serverTimestamp(),
    notified: false,
  });

  return docRef.id;
}

export async function getRecentActivities(
  familyId: string,
  count = 20,
): Promise<ActivityLog[]> {
  const q = query(
    collection(db, 'families', familyId, 'activities'),
    orderBy('timestamp', 'desc'),
    limit(count),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      childId: data['childId'],
      childName: data['childName'],
      type: data['type'],
      label: data['label'],
      timestamp: data['timestamp']?.toDate() ?? new Date(),
      location: data['location'],
      notified: data['notified'],
      notifiedAt: data['notifiedAt']?.toDate(),
    } satisfies ActivityLog;
  });
}
