import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DnsBufferEntry {
  domain: string;
  timestamp: number;
  appBundleId?: string;
}

// Mirrors the on-device App Group UserDefaults buffer that the real
// NEDNSProxyProvider writes to. Same shape, same drain semantics — swapping
// the backing store is the only change when the native bridge lands.

const STORAGE_KEY = 'pendingDnsLogs';
const MAX_ENTRIES = 1000;

async function readAll(): Promise<DnsBufferEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DnsBufferEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(entries: DnsBufferEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function push(entry: DnsBufferEntry): Promise<void> {
  const entries = await readAll();
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  await writeAll(entries);
}

// Atomic drain — returns the current entries and clears the buffer in one go.
// Anything pushed after readAll() but before the clear is lost; acceptable
// for this fidelity (the real App Group buffer has the same race).
export async function drainAll(): Promise<DnsBufferEntry[]> {
  const entries = await readAll();
  if (entries.length === 0) return [];
  await AsyncStorage.removeItem(STORAGE_KEY);
  return entries;
}

export async function count(): Promise<number> {
  const entries = await readAll();
  return entries.length;
}
