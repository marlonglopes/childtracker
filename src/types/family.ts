import type { AlertMode } from './dns';

export interface FamilySettings {
  alertMode: AlertMode;
  digestTime: string;
  timezone: string;
  flaggedDomains: string[];
  blockedDomains: string[];
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
