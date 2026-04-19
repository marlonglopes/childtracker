import { push, type DnsBufferEntry } from './dnsBuffer';

// Dev-only synthetic DNS traffic generator. Mimics what NEDNSProxyProvider
// writes to the App Group buffer so the rest of the pipeline (upload worker,
// Cloud Function, dashboard) can be exercised without a real device.

const DOMAIN_POOL = [
  'google.com',
  'youtube.com',
  'instagram.com',
  'tiktok.com',
  'snapchat.com',
  'reddit.com',
  'twitter.com',
  'discord.com',
  'roblox.com',
  'wikipedia.org',
  'amazon.com',
  'netflix.com',
  'spotify.com',
  'pornhub.com',
  'onlyfans.com',
  'fortnite.com',
];

const APP_BUNDLE_IDS = [
  'com.google.chrome',
  'com.apple.mobilesafari',
  'com.burbn.instagram',
  'com.zhiliaoapp.musically',
  undefined,
];

export interface MockDnsSourceHandle {
  stop(): void;
}

function pick<T>(arr: readonly T[]): T {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i] as T;
}

export interface MockDnsSourceOptions {
  intervalMs?: number;
  onError?: (err: unknown) => void;
}

export function startMockDnsSource(opts: MockDnsSourceOptions = {}): MockDnsSourceHandle {
  const intervalMs = opts.intervalMs ?? 3000;

  const tick = async () => {
    const entry: DnsBufferEntry = {
      domain: pick(DOMAIN_POOL),
      timestamp: Date.now(),
    };
    const bundle = pick(APP_BUNDLE_IDS);
    if (bundle !== undefined) entry.appBundleId = bundle;
    try {
      await push(entry);
    } catch (e) {
      opts.onError?.(e);
    }
  };

  const id = setInterval(tick, intervalMs);
  // Prime the buffer immediately so the first upload isn't empty.
  void tick();

  return {
    stop: () => clearInterval(id),
  };
}
