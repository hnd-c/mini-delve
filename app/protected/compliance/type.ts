export type ComplianceCheckType = 'mfa' | 'rls' | 'pitr';

export interface ComplianceCheck {
  id: string;
  project_id: string;
  check_type: ComplianceCheckType;
  status: boolean;
  details: any;
  created_at: string;
  created_by: string;
}

export interface RLSDetails {
  totalTables: number;
  rlsEnabledTables: number;
  percentage: number;
  tables: Array<{
    name: string;
    hasRLS: boolean;
  }>;
}

export interface MFADetails {
  totalUsers: number;
  mfaEnabledUsers: number;
  percentage: number;
  nonCompliantUsers: string[];
}

export interface PITRDetails {
  enabled: boolean;
  wal_level: string;
  archive_command: string;
}

export interface PITRStatus {
  enabled: boolean;
  wal_level?: string;
  archive_command?: string;
}