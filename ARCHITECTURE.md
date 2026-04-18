# ChildTracker — Architecture

## Concept
Transparent iOS parental monitoring app. Child installs it openly and approves a VPN/DNS profile
once. Every domain the device visits is logged and sent to the parent via WhatsApp.
No secrets — child knows the app is running.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHILD'S iPHONE                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React Native App (bare workflow)                       │    │
│  │  - Setup/onboarding UI                                  │    │
│  │  - Extension status + toggle                            │    │
│  │  - Link code entry (connects to parent)                 │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │ starts/stops                      │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │  Network Extension (Swift — NEDNSProxyProvider)         │    │
│  │  - Intercepts ALL DNS queries system-wide               │    │
│  │  - Logs: domain, timestamp, app bundle ID               │    │
│  │  - Batches to shared UserDefaults → App reads + uploads │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │ batched upload every 60s          │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE BACKEND                            │
│                                                                 │
│  ┌────────────────┐   ┌──────────────────────────────────────┐  │
│  │  Firestore     │   │  Cloud Functions                     │  │
│  │  - families    │   │  - onDnsLogBatch (HTTP)              │  │
│  │  - dns_logs    │   │    receives batches from child app   │  │
│  │  - settings    │   │  - hourlyDigest (cron)               │  │
│  │  - blocklist   │   │    summarises last hour → WhatsApp   │  │
│  └────────────────┘   │  - instantAlert                      │  │
│                       │    for blocked/flagged domains        │  │
│                       └──────────────────┬───────────────────┘  │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  TWILIO WhatsApp API                                            │
│  → Parent's WhatsApp number                                     │
└─────────────────────────────────────────────────────────────────┘
```

## iOS Project Structure (Bare Workflow)

```
childtracker/
├── ios/
│   ├── ChildTracker/              # Main app target
│   │   ├── AppDelegate.swift
│   │   └── Info.plist
│   ├── ChildTrackerDNS/           # Network Extension target
│   │   ├── DNSProxyProvider.swift # Core: intercepts DNS queries
│   │   ├── DomainLogger.swift     # Writes to shared App Group
│   │   └── Info.plist
│   └── ChildTracker.xcworkspace
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── ChildSetupScreen.tsx   # Enter link code + approve VPN
│   │   ├── ParentSetupScreen.tsx  # Phone number + get link code
│   │   ├── MonitorScreen.tsx      # Child: extension on/off status
│   │   └── DashboardScreen.tsx    # Parent: recent domains, alerts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── dnsLogService.ts       # Uploads batched logs to backend
│   │   ├── familyService.ts       # Family linking (same as before)
│   │   └── extensionBridge.ts     # Native module bridge to DNS ext
│   ├── store/
│   ├── types/
│   └── navigation/
├── functions/                     # Firebase Cloud Functions
└── ...
```

## Data Models (Firestore)

### `families/{familyId}`
```ts
{
  id: string
  linkCode: string
  parentPhone: string       // E.164 — WhatsApp destination
  parentName: string
  createdAt: Timestamp
  settings: {
    alertMode: 'instant_flagged' | 'hourly' | 'daily'
    flaggedDomains: string[]  // always instant alert if visited
    blockedDomains: string[]  // blocked at DNS level
    blockedCategories: string[] // e.g. 'adult', 'gambling'
  }
}
```

### `families/{familyId}/dns_logs/{logId}`
```ts
{
  domain: string            // e.g. "instagram.com"
  timestamp: Timestamp
  blocked: boolean
  appBundleId?: string      // which app triggered the query
  notified: boolean
}
```

## Network Extension Flow

1. Child app calls `NETunnelProviderManager` to install VPN config (one-time, requires user tap "Allow")
2. `NEDNSProxyProvider` starts — iOS routes all DNS queries through it
3. Extension intercepts query → logs `{ domain, timestamp }` to shared `UserDefaults` (App Group)
4. Main app has a background task that reads shared UserDefaults every 60s and POSTs batch to Firebase Function
5. Cloud Function writes to Firestore + triggers WhatsApp if domain is flagged/blocked

## WhatsApp Message Templates

### `hourly_digest`
> "📱 Last hour on Sofia's phone:\n• youtube.com (12x)\n• instagram.com (8x)\n• google.com (3x)"

### `flagged_alert`
> "⚠️ Sofia just visited: onlyfans.com at 3:42 PM"

### `blocked_notice`
> "🚫 Blocked: Sofia tried to visit gambling.com at 4:15 PM"

## What Requires Apple Developer Account
- Network Extension entitlement (`com.apple.developer.networking.networkextension`)
- App Group entitlement (shared storage between app + extension)
- Provisioning profiles for both targets
- Cannot be tested on a real device without these
- Simulator: extension won't intercept real DNS but logic can be unit tested

## Tech Stack
- **App**: React Native bare workflow (Expo bare)
- **Language**: TypeScript (app) + Swift (Network Extension)
- **Backend**: Firebase Firestore + Cloud Functions
- **Messaging**: Twilio WhatsApp API
- **State**: Zustand + AsyncStorage
- **Navigation**: React Navigation v6
- **Styling**: NativeWind
