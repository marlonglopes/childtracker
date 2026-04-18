# ChildTracker — Claude Code Context

## What This App Does
Transparent iOS parental monitoring. Child installs it knowingly and approves a DNS VPN profile once.
Every domain the child's phone visits is logged and sent to the parent via WhatsApp.

## Tech Stack
- **App**: React Native bare workflow (NOT Expo managed — needs Network Extension entitlement)
- **Language**: TypeScript (app) + Swift (Network Extension target)
- **State**: Zustand + AsyncStorage
- **Navigation**: React Navigation v6
- **Styling**: NativeWind (Tailwind for RN)
- **Backend**: Firebase Firestore + Cloud Functions (Node.js)
- **Messaging**: Twilio WhatsApp API
- **iOS Extension**: NEDNSProxyProvider (intercepts all DNS queries system-wide)

## Key Constraints
- Network Extension CANNOT be tested on real device without Apple Developer account ($99)
- Expo managed workflow CANNOT be used — Network Extensions need native entitlements
- App Group entitlement required for shared storage between app and extension
- Child must explicitly tap "Allow" to install the VPN profile — iOS requirement, not optional

## Folder Structure
```
childtracker/
├── ios/
│   ├── ChildTracker/           # Main RN app target
│   └── ChildTrackerDNS/        # Network Extension (Swift)
│       ├── DNSProxyProvider.swift
│       └── DomainLogger.swift
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── dnsLogService.ts    # Uploads DNS batches to backend
│   │   ├── familyService.ts    # Family linking
│   │   └── extensionBridge.ts  # Native module: start/stop extension
│   ├── store/
│   ├── types/
│   └── utils/
├── functions/                  # Firebase Cloud Functions
└── docs/
```

## Data Flow
1. `NEDNSProxyProvider` (Swift) intercepts DNS query → writes to shared UserDefaults (App Group)
2. Main app background task reads shared storage every 60s → calls `dnsLogService.uploadBatch()`
3. `onDnsLogBatch` Cloud Function writes logs to Firestore
4. `hourlyDigest` cron OR `instantAlert` trigger → Twilio → parent's WhatsApp

## Running Locally
```bash
npm install
npm run emulators          # Firebase local emulators (Firestore + Auth + Functions)
npx react-native start     # Metro bundler
npx react-native run-ios   # iOS simulator (extension won't intercept DNS in sim)
```

## What Needs Apple Developer Account
- Network Extension entitlement
- App Group entitlement
- Provisioning profiles for both targets (ChildTracker + ChildTrackerDNS)
- Real device testing of DNS interception

## Sprint Tracking
See SPRINT.md for current sprint.
See ROADMAP.md for full phase plan.
See ARCHITECTURE.md for system design and data models.
