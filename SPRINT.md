# ChildTracker — Sprint Tracker

## Current Sprint: Sprint 1 — Foundation
**Dates**: 2026-04-18 → 2026-05-01  
**Phase**: Phase 1 — MVP  
**Goal**: Project scaffolded, Firebase connected, family linking flow working.

---

### Sprint 1 Tasks

#### Setup
- [ ] `npx create-expo-app childtracker --template expo-template-blank-typescript`
- [ ] Install core deps: NativeWind, React Navigation, Zustand, Firebase SDK
- [ ] Configure `tsconfig.json` (strict mode)
- [ ] Configure `app.config.ts` with Firebase env vars
- [ ] `.env.example` with required vars documented
- [ ] Prettier + ESLint setup

#### Firebase
- [ ] Create Firebase project (dev environment)
- [ ] Enable Firestore, Auth (Anonymous + Phone), Cloud Functions
- [ ] Write Firestore security rules (families, children, activities)
- [ ] Deploy initial security rules

#### Navigation
- [ ] Root navigator (Auth stack vs. App stack)
- [ ] Auth stack: WelcomeScreen, LinkCodeScreen, ParentSetupScreen
- [ ] App stack (child): HomeScreen (activity buttons)
- [ ] App stack (parent): SettingsScreen

#### Family Linking
- [ ] `ParentSetupScreen`: phone OTP auth, generates link code
- [ ] `LinkCodeScreen`: child enters 6-digit code, anonymous auth
- [ ] Firestore family document creation
- [ ] Link code validation + error states

#### State
- [ ] `authStore` (Zustand): user, familyId, role (child/parent)
- [ ] `familyStore`: family settings, children list
- [ ] Persistence with `zustand/middleware` (AsyncStorage)

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

_None yet — project starts Sprint 1._

---

## Blockers / Decisions Needed
- [ ] Twilio account setup (needs phone number purchase)
- [ ] Decide: Twilio sandbox first or Meta Cloud API from start?
- [ ] Firebase project name / GCP region

---

## Definition of Done
- Feature works on both iOS (simulator) and Android (emulator)
- TypeScript compiles with no errors
- No `console.log` left in committed code
- PR reviewed before merge to `main`
