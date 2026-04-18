# ChildTracker — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CHILD DEVICE                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Native App (Expo)                             │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ Activity   │  │  Location    │  │  Auth       │  │   │
│  │  │ Buttons UI │  │  (GPS/Geo)   │  │  (Firebase) │  │   │
│  │  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘  │   │
│  └────────┼────────────────┼─────────────────┼──────────┘   │
└───────────┼────────────────┼─────────────────┼──────────────┘
            │                │                 │
            ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     FIREBASE BACKEND                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Firestore   │  │   Auth       │  │  Cloud Functions  │  │
│  │  - families  │  │  (Anonymous  │  │  - onActivityLog  │  │
│  │  - children  │  │   + Phone)   │  │  - dailyDigest    │  │
│  │  - activities│  └──────────────┘  │  - sendWhatsApp   │  │
│  │  - settings  │                    └────────┬──────────┘  │
│  └──────────────┘                             │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     TWILIO                                  │
│              WhatsApp Business API                          │
│         (Pre-approved message templates)                    │
└─────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     PARENT DEVICE                           │
│              WhatsApp notification received                 │
│         (No app install required for parent)                │
└─────────────────────────────────────────────────────────────┘
```

## Data Models (Firestore)

### `families/{familyId}`
```ts
{
  id: string
  linkCode: string          // 6-digit pairing code
  parentPhone: string       // E.164 format (+1234567890)
  parentName: string
  createdAt: Timestamp
  settings: {
    notifyMode: 'instant' | 'digest' | 'both'
    digestTime: string      // "18:00" local time
    timezone: string
  }
}
```

### `families/{familyId}/children/{childId}`
```ts
{
  id: string
  name: string
  avatar: string            // emoji or asset key
  deviceToken: string       // Expo push token
  linkedAt: Timestamp
}
```

### `families/{familyId}/activities/{activityId}`
```ts
{
  id: string
  childId: string
  childName: string
  type: ActivityType        // see types below
  label: string             // display label
  timestamp: Timestamp
  location?: {
    lat: number
    lng: number
    address?: string        // reverse geocoded
  }
  notified: boolean
  notifiedAt?: Timestamp
}
```

## Activity Types
```ts
type ActivityType =
  | 'arrived_school'
  | 'left_school'
  | 'arrived_home'
  | 'left_home'
  | 'arrived_practice'
  | 'left_practice'
  | 'homework_done'
  | 'eating'
  | 'sos'                   // always instant, priority
  | 'custom'
```

## Cloud Functions

### `onActivityLogged` (Firestore trigger)
- Triggers on new doc in `activities/`
- For `sos` or if `notifyMode === 'instant'`: calls `sendWhatsApp` immediately
- Otherwise: marks for digest

### `dailyDigest` (Cron — Cloud Scheduler)
- Runs at configurable time per family
- Aggregates unnotified activities for the day
- Sends summary WhatsApp message

### `sendWhatsApp` (callable)
- Accepts `{ to, templateName, params }`
- Calls Twilio REST API
- Logs delivery status back to Firestore

## Security Rules (Firestore)
- Children can only write to their own family's `activities` subcollection
- Parents can read all family data; children cannot read sibling data
- Link code lookup is the only unauthenticated read allowed (rate-limited via function)

## WhatsApp Message Templates

### `activity_instant`
> "{{childName}} just {{action}} at {{time}} 📍 {{location}}"

### `daily_digest`
> "Today's summary for {{childName}}:\n{{activityList}}\n\nAll good! 👍"

### `sos_alert`
> "🚨 SOS from {{childName}} at {{time}}. Last location: {{location}}. Tap to call."

Templates must be pre-approved by Meta/Twilio before use in production.

## Family Linking Flow
1. Parent opens app → enters their phone number → Firebase Auth (OTP)
2. Parent gets a 6-digit link code (stored in Firestore)
3. Child opens app → enters the 6-digit code
4. Child device is linked to family, anonymous auth created for child
5. Both devices share the same `familyId`
