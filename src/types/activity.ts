export const ACTIVITY_TYPES = [
  'arrived_school',
  'left_school',
  'arrived_home',
  'left_home',
  'arrived_practice',
  'left_practice',
  'homework_done',
  'eating',
  'sos',
  'custom',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityConfig {
  type: ActivityType;
  label: string;
  emoji: string;
  color: string;       // Tailwind bg class
  instant: boolean;    // always sends WhatsApp immediately
}

export const ACTIVITY_CONFIGS: Record<Exclude<ActivityType, 'custom'>, ActivityConfig> = {
  arrived_school:   { type: 'arrived_school',   label: 'Arrived at School',   emoji: '🏫', color: 'bg-blue-500',   instant: true  },
  left_school:      { type: 'left_school',       label: 'Left School',         emoji: '🎒', color: 'bg-blue-400',   instant: true  },
  arrived_home:     { type: 'arrived_home',      label: 'Arrived Home',        emoji: '🏠', color: 'bg-green-500',  instant: true  },
  left_home:        { type: 'left_home',         label: 'Left Home',           emoji: '👋', color: 'bg-green-400',  instant: false },
  arrived_practice: { type: 'arrived_practice',  label: 'At Practice',         emoji: '⚽', color: 'bg-orange-500', instant: false },
  left_practice:    { type: 'left_practice',     label: 'Left Practice',       emoji: '🏃', color: 'bg-orange-400', instant: false },
  homework_done:    { type: 'homework_done',     label: 'Homework Done',       emoji: '📚', color: 'bg-purple-500', instant: false },
  eating:           { type: 'eating',            label: 'Eating',              emoji: '🍽️', color: 'bg-yellow-500', instant: false },
  sos:              { type: 'sos',               label: 'SOS',                 emoji: '🆘', color: 'bg-red-600',    instant: true  },
};

export interface ActivityLog {
  id: string;
  childId: string;
  childName: string;
  type: ActivityType;
  label: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  notified: boolean;
  notifiedAt?: Date;
}
