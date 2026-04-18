import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DnsLog } from '@/types';

const BATCH_ENDPOINT = '/onDnsLogBatch';

export async function uploadBatch(
  familyId: string,
  childId: string,
  logs: Array<{ domain: string; timestamp: number; appBundleId?: string }>,
): Promise<void> {
  const res = await fetch(BATCH_ENDPOINT, {
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
