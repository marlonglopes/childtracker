import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import Constants from 'expo-constants';
import { db } from './firebase';
import type { DnsLog } from '@/types';

function resolveBatchEndpoint(): string {
  const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';
  const projectId =
    (Constants.expoConfig?.extra?.firebaseProjectId as string | undefined) ?? 'childtracker-dev';

  if (useEmulator) {
    const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? 'localhost';
    return `http://${host}:5001/${projectId}/us-central1/onDnsLogBatch`;
  }
  return `https://us-central1-${projectId}.cloudfunctions.net/onDnsLogBatch`;
}

export async function uploadBatch(
  familyId: string,
  childId: string,
  logs: Array<{ domain: string; timestamp: number; appBundleId?: string }>,
): Promise<void> {
  const res = await fetch(resolveBatchEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyId, childId, logs }),
  });
  if (!res.ok) {
    throw new Error(`uploadBatch failed: ${res.status}`);
  }
}

export async function getRecentLogs(familyId: string, count = 50): Promise<DnsLog[]> {
  const snap = await getDocs(
    query(
      collection(db, 'families', familyId, 'dnsLogs'),
      orderBy('timestamp', 'desc'),
      limit(count),
    ),
  );

  return snap.docs.map((d) => {
    const data = d.data();
    const appBundleId = data['appBundleId'] as string | undefined;
    const log: DnsLog = {
      id: d.id,
      familyId,
      childId: data['childId'] as string,
      domain: data['domain'] as string,
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      blocked: data['blocked'] as boolean,
      flagged: data['flagged'] as boolean,
    };
    if (appBundleId !== undefined) log.appBundleId = appBundleId;
    return log;
  });
}
