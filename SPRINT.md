# ChildTracker — Sprint Tracker

## Current Sprint: Sprint 1 — Backend + Family Linking
**Dates**: 2026-04-18 → 2026-05-01
**Phase**: Phase 1 — Foundation
**Goal**: Backend fully working end-to-end. POST fake DNS batch → WhatsApp arrives on parent's phone.
No Apple Developer account required.

---

### Sprint 1 Tasks

#### Project Reset
- [ ] React Native bare workflow setup (`npx react-native init`)
- [ ] TypeScript config (strict)
- [ ] NativeWind + React Navigation
- [ ] Firebase SDK
- [ ] Zustand + AsyncStorage
- [ ] ESLint + Prettier
- [ ] Local emulator config

#### Types & Data
- [ ] `DnsLog` type (domain, timestamp, blocked, appBundleId)
- [ ] `Family` type (settings with flaggedDomains, blockedDomains, alertMode)
- [ ] Firestore security rules

#### Firebase Cloud Functions
- [ ] `onDnsLogBatch` — HTTP function, receives `{ familyId, logs[] }`, writes to Firestore
- [ ] `hourlyDigest` — cron, aggregates last hour, sends WhatsApp summary
- [ ] `instantAlert` — triggered when flagged/blocked domain logged
- [ ] Twilio WhatsApp integration (sandbox)

#### Family Linking
- [ ] `ParentSetupScreen` — enter name + WhatsApp number → get 6-digit link code
- [ ] `ChildSetupScreen` — enter link code → paired

#### Parent Dashboard
- [ ] `DashboardScreen` — list of recent domains with timestamps
- [ ] `SettingsScreen` — alert mode, flagged domains, blocked domains

#### Child Monitor Screen
- [ ] `MonitorScreen` — shows extension status (active/inactive), link status
- [ ] VPN install prompt UI (functional in Phase 2 — placeholder for now)

---

### Sprint 2 Tasks (Planned — starts 2026-05-02)
**Requires Apple Developer account**

- Add `ChildTrackerDNS` Network Extension target in Xcode
- `NEDNSProxyProvider` Swift implementation
- App Group + shared UserDefaults
- React Native native module bridge
- Real device end-to-end test

---

## Completed Sprints

### Previous Sprint — Pivoted ⚠️
Original concept (child taps activity buttons) was replaced with DNS parental monitoring.
All prior code scrapped and being rebuilt.

---

## Blockers / Decisions Needed
- [ ] Apple Developer account ($99) — required for Sprint 2 Network Extension
- [ ] Twilio account — needed for Sprint 1 WhatsApp testing (sandbox is free)
- [ ] Firebase project — needed for Sprint 1 (or use emulator locally)

---

## Definition of Done
- Feature tested on iOS simulator (or real device for extension work)
- TypeScript compiles with no errors (`npm run typecheck`)
- No `console.log` in committed code
