import { drainAll } from './dnsBuffer';
import { uploadBatch } from './dnsLogService';

// Periodically drains the DNS buffer and POSTs to the onDnsLogBatch Cloud
// Function. Sprint 2 will replace the setInterval with an iOS background
// task; the draining contract stays the same.

export interface UploadWorkerHandle {
  stop(): void;
  flushNow(): Promise<void>;
}

export interface UploadWorkerOptions {
  familyId: string;
  childId: string;
  intervalMs?: number;
  onError?: (err: unknown) => void;
  onFlush?: (count: number) => void;
}

export function startUploadWorker(opts: UploadWorkerOptions): UploadWorkerHandle {
  const intervalMs = opts.intervalMs ?? 15000;
  let flushing = false;

  const flush = async () => {
    if (flushing) return;
    flushing = true;
    try {
      const entries = await drainAll();
      if (entries.length === 0) return;
      await uploadBatch(opts.familyId, opts.childId, entries);
      opts.onFlush?.(entries.length);
    } catch (e) {
      opts.onError?.(e);
    } finally {
      flushing = false;
    }
  };

  const id = setInterval(flush, intervalMs);

  return {
    stop: () => clearInterval(id),
    flushNow: flush,
  };
}
