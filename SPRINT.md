# ChildTracker — Sprint Tracker

## Current Sprint: Sprint 2 — Activity Logging + First WhatsApp
**Dates**: 2026-05-02 → 2026-05-15
**Phase**: Phase 1 — MVP
**Goal**: Child taps a button → parent receives a WhatsApp message. End-to-end working on real device.

---

### Sprint 1 Tasks

#### Setup
- [x] Expo project scaffolded (TypeScript, strict mode)
- [x] Install core deps: NativeWind, React Navigation, Zustand, Firebase SDK
- [x] Configure `tsconfig.json` (strict mode, path aliases `@/*`)
- [x] Configure `app.config.ts` with Firebase env vars
- [x] `.env.example` with required vars documented
- [x] Prettier + ESLint setup (`no-console` enforced)

#### Firebase
- [x] Firestore security rules written (`firestore.rules`)
- [x] Cloud Functions scaffold: `onActivityLogged` + `dailyDigest` + Twilio WhatsApp
- [ ] **MANUAL**: Create Firebase project at console.firebase.google.com
- [ ] **MANUAL**: Enable Firestore, Anonymous Auth, Cloud Functions
- [ ] **MANUAL**: `firebase deploy --only firestore:rules`
- [ ] **MANUAL**: `firebase functions:config:set twilio.sid=... twilio.token=... twilio.from=...`

#### Navigation
- [x] Root navigator (Auth stack vs. Child stack vs. Parent stack)
- [x] Auth stack: WelcomeScreen → ParentSetupScreen / LinkCodeScreen
- [x] Child stack: HomeScreen (8 activity buttons + SOS)
- [x] Parent stack: DashboardScreen + SettingsScreen

#### Family Linking
- [x] `ParentSetupScreen`: enters name + phone → creates Firestore family + link code
- [x] `LinkCodeScreen`: child enters 6-digit code + name + avatar → anonymous auth
- [x] Firestore family document creation via `familyService.ts`
- [x] Link code validation + error alerts

#### State
- [x] `authStore` (Zustand + AsyncStorage): uid, familyId, role, childId, childName
- [x] `familyStore` (Zustand + AsyncStorage): family settings, children list
- [x] Persistence with `zustand/middleware` (AsyncStorage)

---

### Sprint 2 Tasks (Planned — starts 2026-05-02)
- Child HomeScreen: 8 activity buttons (big, colorful)
- Activity logging service (write to Firestore)
- Cloud Function: `onActivityLogged` trigger
- Twilio sandbox setup
- First WhatsApp message sent end-to-end

---

### Sprint 3 Tasks (Planned — starts 2026-05-16)
- GPS location on activity log
- Reverse geocoding
- SOS button
- Daily digest Cloud Function (cron)
- Parent settings: notify mode toggle

---

## Completed Sprints

### Sprint 1 — Foundation ✅ (completed 2026-04-18)
All code tasks complete. Manual Firebase/Twilio setup required before first run (see blockers).
Delivered: full app scaffold, navigation, all screens, Firestore rules, Cloud Functions, Zustand stores, service layer.

---

## Blockers / Decisions Needed
- [ ] **Twilio**: Create account at twilio.com, enable WhatsApp Sandbox, get SID + Auth Token
- [ ] **Firebase**: Create project, enable Firestore + Anonymous Auth + Cloud Functions (Blaze plan required for Functions)
- [ ] **Decision**: Twilio sandbox first (free, instant) vs Meta Cloud API (free but needs business verification — weeks)
  → Recommendation: Twilio sandbox for Sprint 2, migrate to Meta for production (Phase 4)
- [ ] **Firebase region**: Choose closest to target users (e.g. `us-central1` or `southamerica-east1`)

---

## Definition of Done
- Feature works on both iOS (simulator) and Android (emulator)
- TypeScript compiles with no errors
- No `console.log` left in committed code
- PR reviewed before merge to `main`
