# ChildTracker — Roadmap

## Vision
Transparent iOS parental monitoring. Child installs openly, approves a DNS profile once.
Parent gets WhatsApp alerts about every domain visited — no secrets, no spyware.

---

## Phase 1 — Foundation + Backend (Weeks 1–2) ✅ done
**Goal**: Backend fully working. Can receive DNS logs and send WhatsApp messages.
No Apple Developer account needed for this phase.

- [x] React Native + Expo + TypeScript scaffold
- [x] NativeWind, React Navigation v6, Zustand stores, Firebase SDK wired
- [x] Family linking flow (parent gets link code, child enters it)
- [x] Firestore schema + security rules (parent-writable family, functions-only `dnsLogs`)
- [x] `onDnsLogBatch` Cloud Function — receives batched logs, writes to Firestore,
      emits instant WhatsApp for flagged/blocked
- [x] `hourlyDigest` Cloud Function — cron, sends WhatsApp summary
- [x] Twilio WhatsApp integration (sandbox + emulator-mock mode)
- [x] Parent dashboard UI: recent domains list
- [x] Parent settings UI: alert mode, flagged/blocked domain editors
- [x] Child monitor UI: extension on/off placeholder (real start/stop in Sprint 2)
- [x] End-to-end smoke test: POST a fake DNS batch → emulator logs WhatsApp message
      → domain appears in Dashboard — verified 2026-04-18

**Exit criteria**: POST a fake DNS batch to the local function → WhatsApp-mock
log shows the alert, and the domain appears in the Parent Dashboard. ✅

---

## Phase 2 — Network Extension (Weeks 3–4)
**Requires Apple Developer account ($99)**

- [ ] `npx expo prebuild` to generate native `ios/` project
- [ ] Add `ChildTrackerDNS` Network Extension target in Xcode (via config plugin)
- [ ] `NEDNSProxyProvider` Swift implementation — intercepts DNS queries
- [ ] App Group setup — shared storage between app and extension
- [ ] `DomainLogger.swift` — writes batched domains to shared UserDefaults
- [ ] `extensionBridge.ts` — swap placeholder for real `NativeModules.ChildTrackerExtension`
- [ ] Background task in main app — reads shared storage, uploads to Firebase
- [ ] VPN profile install flow in child onboarding (user taps "Allow" once)
- [ ] Test on real device end-to-end

**Exit criteria**: Child visits youtube.com → parent gets WhatsApp within 5 minutes.

---

## Phase 3 — Parental Controls + Blocking (Weeks 5–6)

- [ ] DNS extension returns NXDOMAIN for domains in `blockedDomains`
- [ ] Instant WhatsApp alert when blocked domain attempted (already emitted server-side,
      but client-side block path needs to fire too)
- [ ] Domain categories (adult, gambling, social media, gaming) — server-side lists
- [ ] Per-category toggle (block all adult sites, etc.)
- [ ] Daily digest mode (scheduled at `settings.digestTime` in family timezone)
- [ ] Quiet hours (suppress instant alerts 10pm–7am)

**Exit criteria**: Parent blocks "tiktok.com" → child can't access it + parent gets
WhatsApp confirmation.

---

## Phase 4 — Polish + Launch (Weeks 7–10)

- [ ] App Store submission (requires paid dev account)
- [ ] Privacy policy (required by Apple — parental monitoring category)
- [ ] Apple review: must clearly state app purpose at install, child must consent
- [ ] Production Firebase + Twilio (off sandbox)
- [ ] Meta WhatsApp Business API (replaces Twilio sandbox)
- [ ] Crash reporting (Sentry)
- [ ] Analytics
- [ ] App Store screenshots + metadata

---

## Backlog
- Android version (requires a different mechanism — private DNS / VpnService)
- Screen time reports (Apple DeviceActivity framework)
- App usage monitoring (which apps used, how long)
- Web dashboard for parent (React web app)
- Multi-child support per family
