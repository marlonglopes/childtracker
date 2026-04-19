import { startMockDnsSource, type MockDnsSourceHandle } from './mockDnsSource';
import { startUploadWorker, type UploadWorkerHandle } from './uploadWorker';

// The shape the real NativeModules.ChildTrackerExtension will eventually
// expose. Until the native module lands (blocked on Apple Dev account), we
// run the mock source + upload worker inside the JS runtime.

export type ExtensionStatus = 'active' | 'inactive' | 'unavailable';

export interface MockStartOptions {
  familyId: string;
  childId: string;
}

let mockSource: MockDnsSourceHandle | null = null;
let uploadWorker: UploadWorkerHandle | null = null;

export function isMockMode(): boolean {
  return __DEV__;
}

export async function getExtensionStatus(): Promise<ExtensionStatus> {
  if (isMockMode()) {
    return mockSource && uploadWorker ? 'active' : 'inactive';
  }
  // Sprint 2.5: NativeModules.ChildTrackerExtension.getStatus()
  return 'unavailable';
}

export async function startExtension(opts: MockStartOptions): Promise<void> {
  if (!isMockMode()) {
    // Sprint 2.5: NativeModules.ChildTrackerExtension.start()
    throw new Error('Network Extension not available — requires Apple Developer account.');
  }
  if (mockSource || uploadWorker) return;
  mockSource = startMockDnsSource({
    intervalMs: 3000,
    onError: (e) => console.warn('[mockDnsSource]', e),
  });
  uploadWorker = startUploadWorker({
    familyId: opts.familyId,
    childId: opts.childId,
    intervalMs: 10000,
    onError: (e) => console.warn('[uploadWorker]', e),
    onFlush: (n) => console.log('[uploadWorker] flushed', n, 'entries'),
  });
}

export async function stopExtension(): Promise<void> {
  if (!isMockMode()) {
    // Sprint 2.5: NativeModules.ChildTrackerExtension.stop()
    throw new Error('Network Extension not available — requires Apple Developer account.');
  }
  mockSource?.stop();
  uploadWorker?.stop();
  mockSource = null;
  uploadWorker = null;
}
