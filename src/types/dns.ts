export interface DnsLog {
  id: string;
  familyId: string;
  childId: string;
  domain: string;
  timestamp: Date;
  blocked: boolean;
  flagged: boolean;
  appBundleId?: string;
}

export type AlertMode = 'instant' | 'digest' | 'both';
