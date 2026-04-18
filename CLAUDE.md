# ChildTracker — Claude Code Context

## Project Overview
React Native (Expo) app for child activity tracking with real-time WhatsApp notifications to parents. Children tap big-button UI to log activities; parents receive WhatsApp messages via Twilio.

## Tech Stack
- **App**: React Native + Expo SDK (managed workflow)
- **Language**: TypeScript (strict)
- **State**: Zustand
- **Navigation**: React Navigation v6
- **Backend**: Firebase (Firestore + Cloud Functions + Auth)
- **Messaging**: Twilio WhatsApp API
- **Location**: Expo Location + Geofencing
- **Notifications**: Expo Notifications (push)
- **Forms**: React Hook Form
- **Styling**: NativeWind (Tailwind for RN)

## Folder Structure
```
childtracker/
├── src/
│   ├── screens/          # One file per screen
│   ├── components/       # Shared UI components
│   ├── navigation/       # React Navigation stacks/tabs
│   ├── services/         # Firebase, Twilio, Location API calls
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── utils/            # Pure helpers (formatters, validators)
│   ├── types/            # Shared TypeScript interfaces
│   └── assets/           # Images, fonts
├── functions/            # Firebase Cloud Functions (Node.js)
├── docs/                 # Architecture, roadmap, sprint docs
└── .github/workflows/    # CI/CD
```

## Key Conventions
- Screens live in `src/screens/`, named `<Name>Screen.tsx`
- Services are pure async functions, no side effects in service layer
- All Firebase calls go through `src/services/firebase.ts`
- All Twilio calls go through `functions/` (never expose Twilio creds to client)
- Family linking uses a 6-digit code stored in Firestore
- Activity types are defined in `src/types/activity.ts` — add new ones there first

## Environment Variables
Never commit `.env`. Use `app.config.ts` extra fields for Expo + Firebase config.
Twilio credentials live only in Firebase Functions environment config.

## Running Locally
```bash
npx expo start          # Start Expo dev server
npx expo start --ios    # iOS simulator
npx expo start --android
cd functions && npm run serve  # Local Firebase emulator
```

## Testing
- Unit tests: Jest + React Native Testing Library
- E2E: Detox (Phase 3+)
- Run: `npm test`

## Sprint Tracking
See [SPRINT.md](./SPRINT.md) for current sprint status.
See [ROADMAP.md](./ROADMAP.md) for full phase plan.
See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design.
