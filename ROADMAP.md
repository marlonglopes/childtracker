# ChildTracker — Roadmap

## Vision
A zero-friction safety app where kids tap one button and parents instantly know what's happening — no calls, no texts, no worry.

---

## Phase 1 — MVP (Weeks 1–3)
**Goal**: Working app on real device. Child taps, parent gets WhatsApp.

- [x] Expo project scaffolding + TypeScript + NativeWind
- [x] Family linking (6-digit code flow) — screens + service layer
- [x] Child UI: big button grid (8 core activities + SOS)
- [x] Activity logging to Firestore — `activityService.ts`
- [x] Cloud Function: instant WhatsApp on activity tap (`onActivityLogged`)
- [x] Basic parent settings screen (phone number, notify mode)
- [ ] Firebase project setup (Auth, Firestore, Functions) — **manual step**
- [ ] Twilio WhatsApp sandbox integration — **manual step**
- [ ] TestFlight internal build

**Exit criteria**: Child taps "Arrived at school" → parent WhatsApp message arrives in < 5 seconds.

---

## Phase 2 — Polish + Location (Weeks 4–5)
**Goal**: Real-world reliable. Location context added.

- [ ] GPS location attached to activity logs
- [ ] Reverse geocoding (address in WhatsApp message)
- [ ] Daily digest mode (scheduled summary)
- [ ] SOS button (prominent, always visible, instant alert)
- [ ] Custom activity creation (parent side)
- [ ] Avatar/emoji selection for child profile
- [ ] Onboarding flow (first-run walkthrough)
- [ ] Error states + offline handling
- [ ] Push notifications to parent app (optional, in addition to WhatsApp)

**Exit criteria**: Location in messages, SOS works, digest arrives on schedule.

---

## Phase 3 — Geofencing + Multi-child (Weeks 6–8)
**Goal**: Automatic detection + family scale.

- [ ] iOS/Android geofencing (auto-log arrival/departure at saved locations)
- [ ] Saved locations management (school, home, practice fields)
- [ ] Multiple children per family
- [ ] Per-child notification preferences
- [ ] Activity history timeline (parent view)
- [ ] Message template customization
- [ ] Twilio → Meta Cloud API migration (for production)
- [ ] Rate limiting + abuse protection

**Exit criteria**: App detects school arrival without child tapping. 3 children in one family work correctly.

---

## Phase 4 — Production Launch (Weeks 9–12)
**Goal**: App Store ready.

- [ ] App Store / Google Play submission prep
- [ ] Meta WhatsApp Business API verification
- [ ] Production Firebase project (separate from dev)
- [ ] Analytics (Firebase Analytics events)
- [ ] Crash reporting (Sentry)
- [ ] Performance monitoring
- [ ] Privacy policy + Terms of Service
- [ ] COPPA compliance review (child data)
- [ ] E2E test suite (Detox)
- [ ] App Store screenshots + metadata

**Exit criteria**: Approved on App Store and Google Play.

---

## Backlog (Future)
- Apple Watch complication for kids
- Parent dashboard web app
- Activity streaks / gamification for kids
- Scheduled check-in reminders ("You should be home by 5pm")
- Group family chats
- Multi-language support
