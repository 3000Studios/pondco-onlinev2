export interface AuditLog {
  id: string;
  timestamp: string;
  agency: string;
  category: 'SECURITY' | 'RECORDS' | 'COMPLIANCE' | 'SYSTEM' | 'PUBLIC_REQUEST';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  operator: string;
  ipAddress: string;
}

export interface ServiceStatusItem {
  id: string;
  name: string;
  code: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  uptime: string;
  latency: string;
  lastChecked: string;
}

export interface AccessibilitySettings {
  fontSize: 'standard' | 'large' | 'extra';
  highContrast: boolean;
  screenReaderActive: boolean;
  soundEnabled: boolean;
}

export interface UserSession {
  username: string;
  email: string;
  clearanceLevel: 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN';
  token: string;
  authenticatedTime: string;
  avatarIcon: string;
}

