# ChildTracker — Sprint Tracker

## Current Sprint: Sprint 2 — Network Extension
**Dates**: 2026-05-02 → 2026-05-15
**Phase**: Phase 2 — Network Extension
**Goal**: Child visits a domain on a real device → parent's WhatsApp within 5 minutes.
Final real-device test requires an Apple Developer account ($99/yr); everything up to that step is runnable without one.

---

### Sprint 2 Tasks

#### Native Project Generation
- [ ] `npx expo prebuild` — generates `ios/` (and `android/`); pins Expo deps
- [ ] Commit the generated native project as-is before adding the extension

#### Config Plugin (`withDnsExtension`)
- [ ] Expo config plugin that injects the `ChildTrackerDNS` Network Extension target
- [ ] App Group entitlement on both targets
- [ ] `com.apple.developer.networking.networkextension` entitlement
- [ ] `Info.plist` for the extension (`NEProviderClasses`)

#### Network Extension (Swift)
- [ ] `DNSProxyProvider.swift` — `NEDNSProxyProvider` subclass, forwards queries
- [ ] `DomainLogger.swift` — appends `{ domain, timestamp, appBundleId }` to
      shared App Group `UserDefaults`
- [ ] Local extraction of the queried domain from the DNS packet

#### React Native Native Module
- [ ] `ChildTrackerExtension.swift` — `install / start / stop / status`
- [ ] Obj-C bridge header
- [ ] Swap `extensionBridge.ts` placeholder for `NativeModules.ChildTrackerExtension`

#### Background Upload
- [ ] Background task (60s cadence) that drains the shared buffer and calls
      `dnsLogService.uploadBatch`
- [ ] Exponential-backoff retry on network failure

#### Child Onboarding VPN-Install Flow
- [ ] `ExtensionInstallScreen` — explains what's being installed, triggers
      `NETunnelProviderManager.saveToPreferences`, confirms success
- [ ] Re-check on app resume

#### Verification
- [ ] `npm run typecheck` passes (0 errors)
- [ ] Build succeeds on iOS simulator with the extension target
- [ ] 🔒 Real-device E2E (blocked on Apple Developer account) — child visits
      a flagged domain, parent receives WhatsApp within 5 min

---

### Sprint 3 Tasks (Planned — starts 2026-05-16)
**Phase 3 — Parental Controls + Blocking**

- DNS extension returns `NXDOMAIN` for `blockedDomains` (real block, not just log)
- Client-side block event → instant WhatsApp
- Domain category lists (adult / gambling / social / gaming)
- Per-category toggles in Settings
- Daily digest at `settings.digestTime` in family timezone
- Quiet hours (suppress instant alerts 22:00–07:00)

---

## Completed Sprints

### Sprint 1 — Backend + Family Linking ✅
**Dates**: 2026-04-18 → 2026-05-01
**Exit**: POST fake DNS batch → emulator logs WhatsApp mock → domain appears
in Parent Dashboard. Verified 2026-04-18.

- Expo + TypeScript scaffold, NativeWind, React Navigation v6, Zustand
- Firebase SDK + emulator config (Firestore, Auth, Functions, UI)
- Firestore schema + security rules (`dnsLogs` functions-only write)
- `onDnsLogBatch` HTTP function + `hourlyDigest` pub/sub cron
- Twilio WhatsApp integration (sandbox + `FUNCTIONS_EMULATOR` mock)
- Parent flow: `ParentSetupScreen`, `DashboardScreen`, `SettingsScreen`
- Child flow: `LinkCodeScreen`, `MonitorScreen` (placeholder bridge)
- Anonymous Firebase Auth; parent UID = familyId, child UID = childId
- End-to-end smoke test — green

### Previous Sprint — Pivoted ⚠️
Original concept (child taps activity buttons + location check-ins) was replaced
with DNS parental monitoring. All activity/location code removed; family linking
and Firebase scaffolding were kept and adapted.

---

## Blockers / Decisions Needed
- [ ] **Apple Developer account ($99)** — blocks final Sprint 2 real-device E2E
      test only; steps 1–7 of Sprint 2 run without it
- [ ] Twilio account — needed for real WhatsApp tests (sandbox is free; emulator
      uses a mock and needs nothing)
- [ ] Firebase project — needed for deploy (emulator covers local dev)

---

## Definition of Done
- Feature tested on iOS simulator (or real device for extension work)
- TypeScript compiles with no errors (`npm run typecheck`)
- No `console.log` in committed code
