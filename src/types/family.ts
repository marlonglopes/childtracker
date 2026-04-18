export type NotifyMode = 'instant' | 'digest' | 'both';

export interface FamilySettings {
  notifyMode: NotifyMode;
  digestTime: string;   // "18:00" in local time
  timezone: string;
}

export interface Family {
  id: string;
  linkCode: string;
  parentPhone: string;
  parentName: string;
  createdAt: Date;
  settings: FamilySettings;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  deviceToken?: string;
  linkedAt: Date;
}
