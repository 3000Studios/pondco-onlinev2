import { AuditLog, ServiceStatusItem } from '../types';

export const OFFICIAL_AGENCIES = [
  'Federal Aviation Administration (FAA)',
  'Riverside County Aviation Division (RCAD)',
  'Pond Aviation Planning Division (PAPD)',
  'KSA Geomechanical Site Design Group',
  'Pape-Dawson Civil Engineering'
];

export const INITIAL_SERVICE_STATUSES: ServiceStatusItem[] = [
  {
    id: 'status-1',
    name: 'FAA Contract Tower Integration Hub',
    code: 'FAA-CTIH-01',
    status: 'ONLINE',
    uptime: '99.98%',
    latency: '34ms',
    lastChecked: '2 mins ago'
  },
  {
    id: 'status-2',
    name: 'French Valley ATCT Site-Telemetry Feed',
    code: 'FV-STF-02',
    status: 'ONLINE',
    uptime: '99.95%',
    latency: '15ms',
    lastChecked: '1 min ago'
  },
  {
    id: 'status-3',
    name: 'Jacqueline Cochran Control Tower Design Node',
    code: 'JCCT-DN-03',
    status: 'ONLINE',
    uptime: '100.00%',
    latency: '78ms',
    lastChecked: '4 mins ago'
  },
  {
    id: 'status-4',
    name: 'FAA Airspace Interference Analysis API',
    code: 'FAA-AIA-04',
    status: 'DEGRADED',
    uptime: '99.12%',
    latency: '620ms',
    lastChecked: 'Just now'
  },
  {
    id: 'status-5',
    name: 'Pond Partner Secure Handshake Gate',
    code: 'PPSHG-AUTH',
    status: 'ONLINE',
    uptime: '99.99%',
    latency: '11ms',
    lastChecked: '30s ago'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-3159',
    timestamp: '2026-06-16T14:48:12-07:00',
    agency: 'Pond Aviation Planning Division (PAPD)',
    category: 'RECORDS',
    severity: 'SUCCESS',
    message: 'Geotechnical Borehole Log B-1 for Jacqueline Cochran runway coordinates sealed. Structural compression limits verified at 4500 PSF.',
    operator: 'SECURE_BOT_01',
    ipAddress: '10.224.12.80'
  },
  {
    id: 'LOG-3158',
    timestamp: '2026-06-16T14:44:05-07:00',
    agency: 'KSA Geomechanical Site Design Group',
    category: 'COMPLIANCE',
    severity: 'INFO',
    message: 'DBE Outreach audit check completed. KSA & Pape-Dawson joint ventures verify over-compliance meeting 13.1% (target 12.5%).',
    operator: 'Dr. Helen Vance',
    ipAddress: '10.198.42.115'
  },
  {
    id: 'LOG-3157',
    timestamp: '2026-06-16T14:41:22-07:00',
    agency: 'Federal Aviation Administration (FAA)',
    category: 'SECURITY',
    severity: 'WARNING',
    message: 'Airport Security Area clearance access variance request logged for secondary fence coordinates.',
    operator: 'SYSTEM_FIREWALL',
    ipAddress: 'Auto-deflected'
  },
  {
    id: 'LOG-3156',
    timestamp: '2026-06-16T14:35:50-07:00',
    agency: 'Pond Aviation Planning Division (PAPD)',
    category: 'PUBLIC_REQUEST',
    severity: 'SUCCESS',
    message: 'French Valley Site Design Height Determination under FAA Order 6480.4B finalized at 84-foot floor clearance. Layout approved.',
    operator: 'DISPATCH_AGENT',
    ipAddress: '10.201.5.34'
  },
  {
    id: 'LOG-3155',
    timestamp: '2026-06-16T14:28:10-07:00',
    agency: 'Riverside County Aviation Division (RCAD)',
    category: 'SYSTEM',
    severity: 'ERROR',
    message: 'Wind shear telemetry sensor at Cochran runway coordinates reported offline due to hardware timeout on active node.',
    operator: 'STATION_MONITOR',
    ipAddress: '172.16.89.41'
  },
  {
    id: 'LOG-3154',
    timestamp: '2026-06-16T14:15:00-07:00',
    agency: 'Federal Aviation Administration (FAA)',
    category: 'SECURITY',
    severity: 'SUCCESS',
    message: 'Federal single sign-on security credential vault regenerated. Next automated renewal cycle scheduled in 90 days.',
    operator: 'RENEW_DAEMON',
    ipAddress: 'Localhost'
  },
  {
    id: 'LOG-3153',
    timestamp: '2026-06-16T13:59:45-07:00',
    agency: 'Pond Aviation Planning Division (PAPD)',
    category: 'RECORDS',
    severity: 'INFO',
    message: 'Ingestion of FAA Order JO 7210.78 contract tower operational startup manuals into localized RAG index finalized.',
    operator: 'Vance Chen',
    ipAddress: '10.224.12.3'
  }
];
