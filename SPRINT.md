# ChildTracker — Sprint Tracker

## Current Sprint: Sprint 1 — Backend + Family Linking
**Dates**: 2026-04-18 → 2026-05-01
**Phase**: Phase 1 — Foundation
**Goal**: Backend fully working end-to-end. POST fake DNS batch → WhatsApp arrives on parent's phone.
No Apple Developer account required.

---

### Sprint 1 Tasks

#### Project Setup
- [x] Expo + TypeScript scaffold (strict mode + `exactOptionalPropertyTypes`)
- [x] NativeWind + React Navigation v6
- [x] Firebase SDK (client) + Zustand + AsyncStorage
- [x] ESLint + Prettier
- [x] Firebase emulator config (`firebase.json` — Firestore, Auth, Functions, UI)
- [x] Purge of pre-pivot activity/location code

#### Types & Data
- [x] `DnsLog` type (domain, timestamp, blocked, flagged, appBundleId)
- [x] `Family` type (settings with flaggedDomains, blockedDomains, alertMode)
- [x] Firestore security rules (`dnsLogs` functions-only write, family-member read)

#### Firebase Cloud Functions
- [x] `onDnsLogBatch` — HTTP function, receives `{ familyId, childId, logs[] }`,
      writes to Firestore, and (for `alertMode !== 'digest'`) emits an instant
      WhatsApp message for any flagged/blocked match
- [x] `hourlyDigest` — pub/sub cron (`0 * * * *` UTC), aggregates last hour →
      WhatsApp summary for families in `digest` or `both` mode
- [x] Twilio WhatsApp integration (sandbox + emulator-mock via
      `FUNCTIONS_EMULATOR=true`)

#### Family Linking
- [x] `ParentSetupScreen` — enter name + WhatsApp number → 6-digit link code
- [x] `LinkCodeScreen` (child side) — enter link code → paired, avatar picker
- [x] Anonymous Firebase Auth; parent UID = familyId, child UID = childId

#### Parent Dashboard
- [x] `DashboardScreen` — recent DNS activity, flagged/blocked tags, pull-to-refresh
- [x] `SettingsScreen` — alert mode radio, flagged/blocked domain editors,
      persists via new `updateFamilySettings` service

#### Child Monitor Screen
- [x] `MonitorScreen` — extension status, toggle, unlink device
- [x] `extensionBridge` placeholder (returns `unavailable` until Sprint 2
      supplies the real native module)

#### Verification
- [x] `npm run typecheck` passes (0 errors)
- [ ] End-to-end smoke test via emulator: POST a fake batch → WhatsApp-mock log
      shows the alert → domain appears in Dashboard

---

### Sprint 2 Tasks (Planned — starts 2026-05-02)
**Requires Apple Developer account**

- Run `npx expo prebuild` to generate native `ios/` project
- Add `ChildTrackerDNS` Network Extension target (via Expo config plugin)
- `NEDNSProxyProvider` Swift implementation
- App Group + shared `UserDefaults` buffer
- React Native native module for `extensionBridge` (replace placeholder)
- Real device end-to-end test

---

## Completed Sprints

### Previous Sprint — Pivoted ⚠️
Original concept (child taps activity buttons + location check-ins) was replaced
with DNS parental monitoring. All activity/location code removed; family linking
and Firebase scaffolding were kept and adapted.

---

## Blockers / Decisions Needed
- [ ] Apple Developer account ($99) — required for Sprint 2 Network Extension
- [ ] Twilio account — needed for real WhatsApp tests (sandbox is free; emulator
      uses a mock and needs nothing)
- [ ] Firebase project — needed for deploy (emulator covers local dev)

---

## Definition of Done
- Feature tested on iOS simulator (or real device for extension work)
- TypeScript compiles with no errors (`npm run typecheck`)
- No `console.log` in committed code
