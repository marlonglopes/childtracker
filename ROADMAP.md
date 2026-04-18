# ChildTracker — Roadmap

## Vision
Transparent iOS parental monitoring. Child installs openly, approves a DNS profile once.
Parent gets WhatsApp alerts about every domain visited — no secrets, no spyware.

---

## Phase 1 — Foundation + Backend (Weeks 1–2)
**Goal**: Backend fully working. Can receive DNS logs and send WhatsApp messages.
No Apple Developer account needed for this phase.

- [ ] Reset to React Native bare workflow
- [ ] Family linking flow (parent gets link code, child enters it)
- [ ] Firebase: Firestore schema, security rules, Cloud Functions
- [ ] `onDnsLogBatch` Cloud Function — receives batched logs, writes to Firestore
- [ ] `hourlyDigest` Cloud Function — cron, sends WhatsApp summary
- [ ] `instantAlert` Cloud Function — flagged/blocked domain → immediate WhatsApp
- [ ] Twilio WhatsApp sandbox integration
- [ ] Parent dashboard UI: recent domains list, settings
- [ ] Child setup UI: link code entry, VPN install prompt screen

**Exit criteria**: POST a fake DNS batch to the function manually → parent WhatsApp message arrives.

---

## Phase 2 — Network Extension (Weeks 3–4)
**Requires Apple Developer account ($99)**

- [ ] Add `ChildTrackerDNS` Network Extension target in Xcode
- [ ] `NEDNSProxyProvider` Swift implementation — intercepts DNS queries
- [ ] App Group setup — shared storage between app and extension
- [ ] `DomainLogger.swift` — writes batched domains to shared UserDefaults
- [ ] `extensionBridge.ts` — React Native native module to start/stop extension
- [ ] Background task in main app — reads shared storage, uploads to Firebase
- [ ] VPN profile install flow in child onboarding (user taps Allow once)
- [ ] Test on real device end-to-end

**Exit criteria**: Child visits youtube.com → parent gets WhatsApp within 5 minutes.

---

## Phase 3 — Parental Controls + Blocking (Weeks 5–6)

- [ ] Domain blocklist (parent sets blocked domains/categories)
- [ ] DNS extension returns NXDOMAIN for blocked domains
- [ ] Instant WhatsApp alert when blocked domain attempted
- [ ] Flagged domains list (alert immediately, don't block)
- [ ] Domain categories (adult, gambling, social media, gaming)
- [ ] Per-category toggle (block all adult sites, etc.)
- [ ] Alert mode settings: instant flagged / hourly digest / daily digest
- [ ] Quiet hours (no alerts 10pm–7am)

**Exit criteria**: Parent blocks "tiktok.com" → child can't access it + parent gets WhatsApp confirmation.

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
- Android version (can read SMS on Android — bigger feature set)
- Screen time reports (Apple DeviceActivity framework)
- App usage monitoring (which apps used, how long)
- Location check-ins (original idea — optional add-on)
- Web dashboard for parent (React web app)
- Multi-child support
