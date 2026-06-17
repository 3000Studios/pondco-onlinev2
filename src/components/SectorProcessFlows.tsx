import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Search, 
  Terminal, 
  Folder, 
  File, 
  ShieldAlert, 
  Sliders, 
  RotateCcw,
  Check, 
  Undo,
  Lock, 
  Unlock,
  Key,
  Database,
  Radio,
  FileSignature,
  FileText,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Save,
  Command,
  HelpCircle
} from 'lucide-react';
import { AccessibilitySettings, AuditLog, UserSession } from '../types';

interface SectorProcessFlowsProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  activeLogs?: AuditLog[];
  sectors?: SectorItem[];
  setSectors?: (sectors: SectorItem[]) => void;
  notePermissions?: Record<string, 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN'>;
  session?: UserSession | null;
}

export interface SectorItem {
  id: string;
  name: string;
  code: string;
  status: 'ONLINE' | 'BYPASSED' | 'ALERT';
  videoUrl: string;
  inspector: string;
  notes: string;
  directories: {
    name: string;
    files: {
      name: string;
      description: string;
      lastModified: string;
      size: string;
      type: string;
    }[];
  }[];
  parameters: {
    key: string;
    label: string;
    value: string | number;
    type: 'number' | 'text' | 'boolean';
    unit?: string;
    min?: number;
    max?: number;
    isBypassed: boolean;
  }[];
}

export const SectorProcessFlows: React.FC<SectorProcessFlowsProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog,
  activeLogs = [],
  sectors: parentSectors,
  setSectors: parentSetSectors,
  notePermissions,
  session
}) => {
  // Admin delegation portal auth state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showKeyHint, setShowKeyHint] = useState<boolean>(false);

  // Auto admin mode elevation for system administrators
  useEffect(() => {
    if (session?.clearanceLevel === 'SYSTEM_ADMIN') {
      setIsAdminMode(true);
    }
  }, [session]);

  const CLEARANCE_HIERARCHY: Record<string, number> = {
    'CITIZEN': 1,
    'CIVIL_ANALYST': 2,
    'REGISTRY_AUDITOR': 3,
    'SYSTEM_ADMIN': 4
  };

  // Active selected or hovered sector
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sector-atc');
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);
  
  // Real-time hover information box state
  const [hoverBoxPosition, setHoverBoxPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating Directory Search State
  const [dirSearchQuery, setDirSearchQuery] = useState<string>('');

  // Messenger Modal State
  const [activeMessageTarget, setActiveMessageTarget] = useState<{ name: string; email: string; sector: string } | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  
  // Video status dictionary (playing / paused)
  const [isVideosPlaying, setIsVideosPlaying] = useState<Record<string, boolean>>({
    'sector-atc': true,
    'sector-cyber': true,
    'sector-border': true,
    'sector-eco': true,
    'sector-maritime': true
  });

  // Base sectors state
  const [localSectors, setLocalSectors] = useState<SectorItem[]>(() => {
    const defaultSectors: SectorItem[] = [
      {
        id: 'sector-atc',
        name: 'Aviation Control & Tower Telemetry',
        code: 'AOC-T-22',
        status: 'ONLINE',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-airport-control-tower-with-moving-antenna-42525-large.mp4',
        inspector: 'Senior ATC Lead M. Harrison',
        notes: 'Airspace control tower running peak concurrency. Precision radar handshake currently calibrated. Wind-shear threshold indicators active on major runways. No flight delays reported.',
        directories: [
          {
            name: '/tower_telemetry',
            files: [
              { name: 'atc_radar_handshake_44.cfg', description: 'Federal airspace beacon ping check and synchronization variables.', lastModified: '2 mins ago', size: '12.4 KB', type: 'configuration' },
              { name: 'ground_collision_matrix.bin', description: 'Calculated vector matrices for tarmac movement validation.', lastModified: 'Just now', size: '4.8 MB', type: 'binary' }
            ]
          },
          {
            name: '/flight_plans',
            files: [
              { name: 'faa_schedule_daily_v12.xlsx', description: 'National civil flight coordination schedules and terminal berths.', lastModified: '15 mins ago', size: '242 KB', type: 'document' },
              { name: 'east_coast_airways_bypass.log', description: 'Local terminal delay exceptions and flight corridor updates.', lastModified: '1 hour ago', size: '89 KB', type: 'log' }
            ]
          },
          {
            name: '/safety_overrides',
            files: [
              { name: 'wind_shear_override_threshold.yaml', description: 'Static wind limits triggering visual warning banners on runways.', lastModified: '10 hours ago', size: '1.2 KB', type: 'override' }
            ]
          }
        ],
        parameters: [
          { key: 'atc_max_flights', label: 'Maximum Concurrency Capacity', value: 48, type: 'number', unit: 'flights', min: 10, max: 100, isBypassed: false },
          { key: 'wind_shear_trigger', label: 'Wind Shear Advisory Threshold', value: 45, type: 'number', unit: 'knots', min: 10, max: 80, isBypassed: false },
          { key: 'radar_handshake_gate', label: 'Radar Handshake Filter Gate', value: 'Gate Delta-Active', type: 'text', isBypassed: false }
        ]
      },
      {
        id: 'sector-cyber',
        name: 'Cryptographic Gateway & Vaults',
        code: 'CCG-C-09',
        status: 'ONLINE',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-computer-keyboard-40280-large.mp4',
        inspector: 'Chief Security Officer Dr. S. Vance',
        notes: 'National cryptographic ledger sealed with zero-trust high-entropy keys. Multi-factor authentication required. SSL rotation cycles scheduled. Firewall rules actively intercepting gateway noise.',
        directories: [
          {
            name: '/encryption_certs',
            files: [
              { name: 'ssl_root_ca_rotation.crt', description: 'Unified public registry root certificate credentials.', lastModified: '90 days remaining', size: '4 KB', type: 'security' },
              { name: 'tls_hmac_handshake.key', description: 'HMAC validation signature check secrets.', lastModified: '30 days ago', size: '256 bytes', type: 'binary' }
            ]
          },
          {
            name: '/intrusion_logs',
            files: [
              { name: 'unauthorized_range_denial.log', description: 'Mitigation telemetry logging of blocked IP addresses.', lastModified: '3 mins ago', size: '12 MB', type: 'log' },
              { name: 'firewall_integrity_report.json', description: 'Self-healing firewall security audit logs.', lastModified: 'Just now', size: '45 KB', type: 'report' }
            ]
          },
          {
            name: '/bypass_rules',
            files: [
              { name: 'admin_vault_bypass_rule.json', description: 'Authorization checkgate exception rule definitions (Admin role).', lastModified: 'Dec 2025', size: '2.1 KB', type: 'override' }
            ]
          }
        ],
        parameters: [
          { key: 'key_rotation_days', label: 'SSL Rotation Buffer Interval', value: 90, type: 'number', unit: 'days', min: 30, max: 365, isBypassed: false },
          { key: 'firewall_sensitivity', label: 'IDS Firewall Detection Level', value: 95, type: 'number', unit: '%', min: 50, max: 100, isBypassed: false },
          { key: 'mfa_bypass_gate', label: 'Tokenless Access Bypass Rules', value: 'Deactivated', type: 'text', isBypassed: false }
        ]
      },
      {
        id: 'sector-border',
        name: 'Border Protection & Biometrics',
        code: 'BPSS-B-71',
        status: 'ONLINE',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-security-camera-scanning-a-corridor-41655-large.mp4',
        inspector: 'Security Commissioner J. O\'Connor',
        notes: 'Biometric scan resolutions conform to DHS surveillance standards. RFID customs sensors reporting constant incoming streams of cargo tracking indices. Clearance rates fully meet standard expectations.',
        directories: [
          {
            name: '/biometrics',
            files: [
              { name: 'facial_scan_resolution_v2.cfg', description: 'Image resolution and contrast matching configurations.', lastModified: '1 day ago', size: '1.8 KB', type: 'configuration' },
              { name: 'rfid_border_sensor_stream.dat', description: 'Continuous payload data from gate cargo barcode scanner nodes.', lastModified: '2s ago', size: '89 MB', type: 'binary' }
            ]
          },
          {
            name: '/clearance_manifests',
            files: [
              { name: 'expedited_foia_visitor_manifest.csv', description: 'Pre-vetted visitor list with authorized physical security codes.', lastModified: '1 hour ago', size: '14 KB', type: 'document' },
              { name: 'customs_exceptions_list.db', description: 'Quarantine and inspection files for suspicious cargo markings.', lastModified: '12 mins ago', size: '512 KB', type: 'database' }
            ]
          }
        ],
        parameters: [
          { key: 'scan_delay_allowance', label: 'Permitted Scan Window Delay', value: 1.2, type: 'number', unit: 'seconds', min: 0.5, max: 5.0, isBypassed: false },
          { key: 'biometric_confidence', label: 'Face Match Confidence Threshold', value: 94.5, type: 'number', unit: '%', min: 80, max: 99.9, isBypassed: false }
        ]
      },
      {
        id: 'sector-eco',
        name: 'Environmental Trust Telemetry',
        code: 'NEST-E-41',
        status: 'ALERT',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-spinning-on-a-windy-day-31998-large.mp4',
        inspector: 'Environmental Steward L. Vance',
        notes: 'Autonomous sensing stations auditing territorial atmospheric and particulate levels. Sensing Station 412 (Substation Northeast) is flagged offline due to packet telemetry timeout. Dispatch team coordinates with site techs.',
        directories: [
          {
            name: '/air_sensors',
            files: [
              { name: 'particulate_matter_sensor_412.json', description: 'Station 412 hardware feedback log. Triggered timeout fault.', lastModified: 'Warning: 5m ago', size: '840 bytes', type: 'log' },
              { name: 'nitrogen_dioxide_live_levels.xml', description: 'Atmospheric density sensor arrays.', lastModified: 'Just now', size: '5.2 KB', type: 'telemetry' }
            ]
          },
          {
            name: '/disaster_charts',
            files: [
              { name: 'coastal_flood_risks_2026.shp', description: 'Regional geospatial database showing projected sea-level maps.', lastModified: 'April 2026', size: '22 MB', type: 'database' },
              { name: 'seismic_sensor_trigger_override.yaml', description: 'Baseline calibration factors to prevent false alarm triggers.', lastModified: '1 month ago', size: '4.1 KB', type: 'configuration' }
            ]
          }
        ],
        parameters: [
          { key: 'aqi_pollution_tolerance', label: 'Permissible AQI Index Tolerance', value: 50, type: 'number', unit: 'AQI', min: 10, max: 150, isBypassed: false },
          { key: 'telemetry_pulse_rate', label: 'Sensor Heartbeat Pulse Rate', value: 30, type: 'number', unit: 'seconds', min: 5, max: 120, isBypassed: false }
        ]
      },
      {
        id: 'sector-maritime',
        name: 'Maritime Cargo & Custom Logistics',
        code: 'MCCL-M-12',
        status: 'ONLINE',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shipping-containers-stored-at-the-port-terminal-42930-large.mp4',
        inspector: 'Port Superintendent Capt. R. Singh',
        notes: 'Inbound cargo volume active. Automated customs clearance processing manifests. Priority agricultural and perishable cargo exceptions authorized to prevent port logistical gridlock.',
        directories: [
          {
            name: '/cargo_manifests',
            files: [
              { name: 'freight_shipment_inbound_june.csv', description: 'Commercial carrier freight weights, source ports, and destination locks.', lastModified: '40 mins ago', size: '1.2 MB', type: 'document' },
              { name: 'hazmat_clearance_verification.log', description: 'Geiger scans and chemical safety registry logs.', lastModified: '5 mins ago', size: '64 KB', type: 'log' }
            ]
          },
          {
            name: '/berthing_control',
            files: [
              { name: 'dock_assignment_scheduler.xlsx', description: 'Mooring berth lists and ship tug boat dispatch schedule.', lastModified: '12 mins ago', size: '92 KB', type: 'document' },
              { name: 'port_customs_override_protocol.bin', description: 'Encrypted instructions for customs exemption triggers.', lastModified: '2 days ago', size: '512 bytes', type: 'binary' }
            ]
          }
        ],
        parameters: [
          { key: 'berth_latency_avg', label: 'Mooring Vessel Dock Assignment Delay', value: 4.2, type: 'number', unit: 'hours', min: 1.0, max: 24.0, isBypassed: false },
          { key: 'hazmat_scan_intensity', label: 'Radiation Scanner Sensitivity', value: 4, type: 'number', unit: 'Level', min: 1, max: 10, isBypassed: false }
        ]
      }
    ];

    try {
      const cached = localStorage.getItem('civil_portal_sectors_state');
      if (cached) {
        // Hydrate from localStorage, but ensure all fields exist
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === defaultSectors.length) {
          return parsed;
        }
      }
    } catch (e) {}
    return defaultSectors;
  });

  const sectors = parentSectors || localSectors;

  // Track edits in progress for a temporary admin editor
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [editingParams, setEditingParams] = useState<Record<string, string | number>>({});

  // Sync edits when selected sector changes
  useEffect(() => {
    const currentSector = sectors.find(s => s.id === selectedSectorId);
    if (currentSector) {
      setEditingNotes(currentSector.notes);
      const paramMap: Record<string, string | number> = {};
      currentSector.parameters.forEach(p => {
        paramMap[p.key] = p.value;
      });
      setEditingParams(paramMap);
    }
  }, [selectedSectorId, sectors]);

  // Save sector state helper
  const saveSectorsToCache = (newSectors: SectorItem[]) => {
    if (parentSetSectors) {
      parentSetSectors(newSectors);
    } else {
      setLocalSectors(newSectors);
      try {
        localStorage.setItem('civil_portal_sectors_state', JSON.stringify(newSectors));
      } catch (e) {}
    }
  };

  // Video playback toggle
  const toggleVideo = (id: string) => {
    setIsVideosPlaying(prev => ({ ...prev, [id]: !prev[id] }));
    playSound();
    onAnnounce(`${isVideosPlaying[id] ? 'Paused' : 'Playing'} live surveillance feed for sector ${id}.`);
  };

  // Authenticate Admin delegate
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-authorized master clearance code as per government requirements
    if (adminKeyInput.trim() === 'ADMIN508-BYPASS') {
      setIsAdminMode(true);
      setAuthError('');
      onAnnounce('AUTHORIZATION GRANTED. Administrative delegate privileges activated on all registry networks.');
      playSound();
    } else {
      setAuthError('INVALID ACCESS TOKEN. Verification failed with code SEC-AUTH-403.');
      onAnnounce('Authorization failed. Access denied to registry parameters.');
      playSound();
    }
  };

  // De-authorize admin delegate
  const handleAdminSignOut = () => {
    setIsAdminMode(false);
    setAdminKeyInput('');
    onAnnounce('Administrative session terminated. Returned to public view status.');
    playSound();
  };

  // Change input values (Admin)
  const handleParamChange = (pKey: string, newValue: string | number) => {
    setEditingParams(prev => ({ ...prev, [pKey]: newValue }));
  };

  // Toggle Parameter Bypass (Admin Overrides)
  const handleToggleBypass = (sectorId: string, paramKey: string) => {
    if (!isAdminMode) return;
    
    const updated = sectors.map(sec => {
      if (sec.id === sectorId) {
        let isAnyBypassed = false;
        const updatedParams = sec.parameters.map(p => {
          if (p.key === paramKey) {
            const nextBypass = !p.isBypassed;
            if (nextBypass) isAnyBypassed = true;
            return { ...p, isBypassed: nextBypass };
          }
          if (p.isBypassed) isAnyBypassed = true;
          return p;
        });

        // If any parameters are bypassed, status becomes BYPASSED, otherwise ONLINE/ALERT
        let nextStatus: SectorItem['status'] = 'ONLINE';
        if (isAnyBypassed) {
          nextStatus = 'BYPASSED';
        } else if (sec.id === 'sector-eco') {
          nextStatus = 'ALERT'; // keep ALERT baseline for eco station 412
        }

        return {
          ...sec,
          parameters: updatedParams,
          status: nextStatus
        };
      }
      return sec;
    });

    saveSectorsToCache(updated);
    playSound();

    // Log the override
    const sec = sectors.find(s => s.id === sectorId);
    const param = sec?.parameters.find(p => p.key === paramKey);
    const textStatus = param?.isBypassed ? "RESTORED" : "BYPASSED & DEACTIVATION ATTEMPT";
    
    onAnnounce(`ADMIN DECISION: Authorized checkgate override for ${param?.label}. Status toggled to ${textStatus}.`);
    
    onAddLog({
      agency: sec?.name || 'Bureau of Public Compliance (BPC)',
      category: 'SECURITY',
      severity: param?.isBypassed ? 'INFO' : 'WARNING',
      message: `ADMIN OVERRIDE DETECTED: Regulatory criterion [${paramKey}] is manually bypassed on system gateway ${sec?.code}. Integrity state overridden.`,
      operator: 'ADMIN_DELEGATE_508',
      ipAddress: '10.224.2.105'
    });
  };

  // Commit and Save Sector Parameters & Notes (Admin Stamp)
  const handleSaveSectorBypass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminMode) return;

    const updated = sectors.map(sec => {
      if (sec.id === selectedSectorId) {
        // update parameter values
        const updatedParams = sec.parameters.map(p => {
          const editedVal = editingParams[p.key];
          if (editedVal !== undefined) {
            // enforce bounds if number
            if (p.type === 'number' && typeof editedVal === 'number') {
              const bounded = Math.max(p.min || 0, Math.min(p.max || 9999, editedVal));
              return { ...p, value: bounded };
            }
            return { ...p, value: editedVal };
          }
          return p;
        });

        const activeUserClearance = session?.clearanceLevel || 'CITIZEN';
        const requiredClearanceForActiveNotes = notePermissions?.[sec.id] || 'SYSTEM_ADMIN';
        const hasAccessToEditActiveNotes = CLEARANCE_HIERARCHY[activeUserClearance] >= CLEARANCE_HIERARCHY[requiredClearanceForActiveNotes];
        const nextNotes = hasAccessToEditActiveNotes ? editingNotes : sec.notes;

        return {
          ...sec,
          notes: nextNotes,
          parameters: updatedParams
        };
      }
      return sec;
    });

    saveSectorsToCache(updated);
    playSound();
    onAnnounce(`Administrative stamp applied to ${selectedSectorId}. Audit telemetry variables stored and sealed.`);

    const currentSec = sectors.find(s => s.id === selectedSectorId);
    onAddLog({
      agency: currentSec?.name || 'Federal Archives & Records Office (FARO)',
      category: 'RECORDS',
      severity: 'SUCCESS',
      message: `SYSTEM PARAMETERS STAMPED: Administrative adjustment completed on ${currentSec?.code}. Parameter thresholds realigned successfully.`,
      operator: 'ADMIN_DELEGATE_508',
      ipAddress: '10.224.2.105'
    });
  };

  // Reset sector to initial defaults
  const handleResetSector = (sectorId: string) => {
    if (!isAdminMode) return;
    
    // Original values mapping
    const originalNotes = {
      'sector-atc': 'Airspace control tower running peak concurrency. Precision radar handshake currently calibrated. Wind-shear threshold indicators active on major runways. No flight delays reported.',
      'sector-cyber': 'National cryptographic ledger sealed with zero-trust high-entropy keys. Multi-factor authentication required. SSL rotation cycles scheduled. Firewall rules actively intercepting gateway noise.',
      'sector-border': 'Biometric scan resolutions conform to DHS surveillance standards. RFID customs sensors reporting constant incoming streams of cargo tracking indices. Clearance rates fully meet standard expectations.',
      'sector-eco': 'Autonomous sensing stations auditing territorial atmospheric and particulate levels. Sensing Station 412 (Substation Northeast) is flagged offline due to packet telemetry timeout. Dispatch team coordinates with site techs.',
      'sector-maritime': 'Inbound cargo volume active. Automated customs clearance processing manifests. Priority agricultural and perishable cargo exceptions authorized to prevent port logistical gridlock.'
    };

    const updated = sectors.map(sec => {
      if (sec.id === sectorId) {
        const resetParams = sec.parameters.map(p => ({
          ...p,
          isBypassed: false,
          value: p.key === 'atc_max_flights' ? 48 :
                 p.key === 'wind_shear_trigger' ? 45 :
                 p.key === 'radar_handshake_gate' ? 'Gate Delta-Active' :
                 p.key === 'key_rotation_days' ? 90 :
                 p.key === 'firewall_sensitivity' ? 95 :
                 p.key === 'mfa_bypass_gate' ? 'Deactivated' :
                 p.key === 'scan_delay_allowance' ? 1.2 :
                 p.key === 'biometric_confidence' ? 94.5 :
                 p.key === 'aqi_pollution_tolerance' ? 50 :
                 p.key === 'telemetry_pulse_rate' ? 30 :
                 p.key === 'berth_latency_avg' ? 4.2 :
                 p.key === 'hazmat_scan_intensity' ? 4 : p.value
        }));

        let defaultStatus: SectorItem['status'] = 'ONLINE';
        if (sec.id === 'sector-eco') {
          defaultStatus = 'ALERT';
        }

        return {
          ...sec,
          notes: originalNotes[sec.id as keyof typeof originalNotes],
          parameters: resetParams,
          status: defaultStatus
        };
      }
      return sec;
    });

    saveSectorsToCache(updated);
    playSound();
    onAnnounce(`Parameters reset completed for ${sectorId}. Default registry security thresholds restored.`);
    
    onAddLog({
      agency: 'Bureau of Public Compliance (BPC)',
      category: 'SYSTEM',
      severity: 'INFO',
      message: `THRESHOLD RESTORATION: Operational parameters reset to secure baseline on gateway ${sectorId}. Bypasses revoked.`,
      operator: 'ADMIN_DELEGATE_508',
      ipAddress: '10.224.2.105'
    });
  };

  // Hover tracker to build a majestic hover window overlay
  const handleMouseMove = (e: React.MouseEvent) => {
    // Keep popover coordinates within bounds relative to parent
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverBoxPosition({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  const handleSectorHover = (id: string | null) => {
    setHoveredSectorId(id);
    if (id) {
      const activeSec = sectors.find(s => s.id === id);
      if (activeSec && settings.screenReaderActive) {
        onAnnounce(`Reviewing Processes for ${activeSec.name}. Code label: ${activeSec.code}. Status level is ${activeSec.status}. Hover window directories ready for lookup.`);
      }
    }
  };

  // Directory and files search filtering logic
  const getFilteredDirectories = (sector: SectorItem) => {
    if (!dirSearchQuery) return sector.directories;
    
    const query = dirSearchQuery.toLowerCase();
    
    return sector.directories.map(dir => {
      // If the directory name matches or any files matched
      const matchedFiles = dir.files.filter(f => 
        f.name.toLowerCase().includes(query) || 
        f.description.toLowerCase().includes(query) || 
        f.type.toLowerCase().includes(query)
      );
      
      const dirMatches = dir.name.toLowerCase().includes(query);
      
      if (dirMatches || matchedFiles.length > 0) {
        return {
          ...dir,
          // If dir name matched but files didn't, show all files in it, else show matched files
          files: dirMatches ? dir.files : matchedFiles
        };
      }
      
      return null;
    }).filter(Boolean) as SectorItem['directories'];
  };

  const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];
  const hoveredSector = sectors.find(s => s.id === hoveredSectorId);

  // Different style presets for each sector to feel completely distinct
  const sectorThemeMap: Record<string, {
    bg: string;
    border: string;
    badge: string;
    text: string;
    glow: string;
  }> = {
    'sector-atc': {
      bg: 'bg-gradient-to-br from-amber-500/5 via-white to-sky-500/5',
      border: 'border-amber-300/60',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      text: 'text-amber-800',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]'
    },
    'sector-cyber': {
      bg: 'bg-gradient-to-br from-emerald-500/5 via-slate-900/5 to-emerald-50/10',
      border: 'border-emerald-300/65',
      badge: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      text: 'text-emerald-805',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.08)]'
    },
    'sector-border': {
      bg: 'bg-gradient-to-br from-purple-500/5 via-white to-slate-100',
      border: 'border-purple-300/60',
      badge: 'bg-purple-100 text-purple-900 border-purple-300',
      text: 'text-purple-800',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.08)]'
    },
    'sector-eco': {
      bg: 'bg-gradient-to-br from-teal-500/5 via-white to-emerald-500/5',
      border: 'border-teal-300/60',
      badge: 'bg-teal-100 text-teal-900 border-teal-300',
      text: 'text-teal-800',
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.08)]'
    },
    'sector-maritime': {
      bg: 'bg-gradient-to-br from-blue-500/5 via-white to-indigo-500/5',
      border: 'border-blue-300/60',
      badge: 'bg-blue-100 text-blue-900 border-blue-305',
      text: 'text-blue-800',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.08)]'
    }
  };

  const getActiveTheme = () => {
    if (settings.highContrast) {
      return {
        bg: 'bg-white text-black',
        border: 'border-2 border-black',
        badge: 'bg-white text-black border-black',
        text: 'text-black font-extrabold',
        glow: ''
      };
    }
    return sectorThemeMap[activeSector.id] || sectorThemeMap['sector-atc'];
  };

  const activeTheme = getActiveTheme();

  // Total override counters
  const bypassedSectorsCount = sectors.filter(s => s.status === 'BYPASSED').length;

  return (
    <div className="space-y-6" id="panel-process-flows" role="tabpanel" aria-labelledby="tab-process-flows">
      
      {/* SECTORS OVERALL STATUS HEADER */}
      <div className={`p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            REGISTRY PIPELINE &amp; SECTORS CONTROL CONSOLE
          </span>
          <h2 className="text-xl font-serif font-bold tracking-tight">Active Operations Sectors &amp; Overrides</h2>
          <p className="text-xs text-slate-400 font-sans max-w-2xl leading-normal">
            Below are physical and virtual federal sectors monitored for Section 508 and operational compliance. Admins may configure inputs to bypass protocols under emergency conditions. All citizens can view files and reviews.
          </p>
        </div>

        {/* STATS COUNT */}
        <div className="flex gap-4 text-xs font-mono">
          <div className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded">
            <div className="text-slate-400 text-[10px] uppercase">TOTAL SECTORS</div>
            <div className="text-base font-bold text-white mt-0.5">{sectors.length} Nodes</div>
          </div>
          <div className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded">
            <div className="text-slate-400 text-[10px] uppercase">ACTIVE BYPASSES</div>
            <div className={`text-base font-bold mt-0.5 ${bypassedSectorsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {bypassedSectorsCount} Active
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN SESSION CONTROL CARD */}
      <div className={`p-5 rounded-lg border shadow-xs transition-all ${
        isAdminMode
          ? (settings.highContrast 
              ? 'border-4 border-dashed border-red-600 bg-white text-black' 
              : 'border-2 border-amber-500 bg-amber-500/5 text-amber-950')
          : (settings.highContrast
              ? 'border-2 border-black bg-white text-black'
              : 'bg-white border-slate-200')
      }`}>
        {isAdminMode ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-full flex-shrink-0 animate-pulse">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 bg-amber-200 text-amber-900 border border-amber-300 rounded font-bold uppercase">
                    AUTHORIZED SESSION ACTIVE
                  </span>
                  <span className="text-xs font-mono text-slate-500">GATEWAY IP: 10.224.2.105</span>
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900 mt-1">
                  Administrative Override Interface Enabled
                </h3>
                <p className="text-xs text-slate-600 leading-normal max-w-2xl">
                  You are identified as an <strong>Authorized System Administrator Delegate</strong> under Federal Directive Title 44. You possess bypass credentials to override sensor parameters and adjust operational safety buffers.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleAdminSignOut}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-bold tracking-wider uppercase transition shadow-sm w-full md:w-auto"
            >
              TERMINATE ADMIN CREDENTIALS
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminAuth} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                Administrative Credentials Access Gate
              </h3>
              <p className="text-xs text-slate-500 leading-normal max-w-xl">
                Bypassing active process parameters requires an authenticated security clearance key. Public users possess view-only permissions.
              </p>
            </div>

            <div className="flex items-start flex-col gap-1.5 w-full md:w-auto">
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="password"
                  placeholder="Enter authorized delegate key..."
                  className="px-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 w-full md:w-60"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold tracking-wider font-mono uppercase shrink-0 transition"
                >
                  VALIDATE
                </button>
              </div>
              
              {authError && (
                <span className="text-[10px] text-red-600 font-mono block font-bold">{authError}</span>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowKeyHint(!showKeyHint);
                  playSound();
                }}
                className="text-[10px] text-slate-500 hover:text-blue-900 underline font-semibold transition"
              >
                {showKeyHint ? "Hide Authorized Verification Hint" : "Reveal Authorized Demo Verification Key"}
              </button>
              
              {showKeyHint && (
                <div className="p-2 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono text-slate-700 max-w-xs mt-1 leading-normal animate-fade-in">
                  🔑 Demonstration Key: <strong className="text-blue-900 block mt-1 bg-white p-1 rounded font-bold border border-slate-200 text-center">ADMIN508-BYPASS</strong>
                  Use this key above to authenticate as site administrator.
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* METRIC SECTOR DIRECTORY MAP INTERACTIVE GRID AREA */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative"
        onMouseMove={handleMouseMove}
      >
        
        {/* LEFT TWO-COLUMNS: SECTOR SELECTORS & SURVEILLANCE VIDEOS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectors.map((sec) => {
              const isActive = selectedSectorId === sec.id;
              const isBypassed = sec.status === 'BYPASSED';
              const isAlert = sec.status === 'ALERT';
              const isPl = isVideosPlaying[sec.id] !== false;

              let statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              let statusLabel = 'ACTIVE BASING';
              
              if (isBypassed) {
                statusColor = 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse font-bold';
                statusLabel = '⚠️ OVERRIDE BYPASS';
              } else if (isAlert) {
                statusColor = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                statusLabel = '⚡ TELEMETRY OFFLINE';
              }

              return (
                <div
                  key={sec.id}
                  className={`rounded-lg border overflow-hidden flex flex-col justify-between transition-all group scale-100 hover:scale-[1.01] active:scale-100 relative ${
                    isActive 
                      ? (settings.highContrast 
                          ? 'border-4 border-black bg-slate-100 shadow-md' 
                          : 'border-blue-900 bg-white ring-2 ring-blue-900/10 shadow-md')
                      : (settings.highContrast 
                          ? 'border-2 border-slate-300 hover:border-black bg-white' 
                          : 'border-slate-200 hover:border-slate-300 bg-white/70 shadow-2xs')
                  }`}
                  onMouseEnter={() => handleSectorHover(sec.id)}
                  onMouseLeave={() => handleSectorHover(null)}
                  onClick={() => {
                    setSelectedSectorId(sec.id);
                    onAnnounce(`Selected Sector: ${sec.name}. Operational notes loaded.`);
                    playSound();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  id={`sector-card-${sec.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedSectorId(sec.id);
                      onAnnounce(`Selected Sector: ${sec.name}.`);
                      playSound();
                    }
                  }}
                >
                  {/* CINEMATIC VIDEO UNDERLAYMENT BACKGROUND BAR */}
                  <div className="h-28 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    {/* Dark gradient shadow layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                    <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono font-bold text-slate-300 tracking-wider">
                        {sec.code}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded backdrop-blur-xs text-[9px] font-mono border ${statusColor} z-20`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Live indicator tag */}
                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPl ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
                      <span className="text-[9px] font-mono text-slate-300 tracking-tighter">FEED 508_C1</span>
                    </div>

                    {/* Play/Pause control for cinematic videos */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVideo(sec.id);
                      }}
                      className="absolute bottom-2 right-2 z-20 p-1 rounded bg-black/65 text-slate-400 hover:text-white transition cursor-pointer"
                      title={isPl ? "Pause surveillance footage" : "Play surveillance footage"}
                    >
                      {isPl ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* Surrounding video player - Plays automatically on hovered sector card or if active */}
                    {isPl ? (
                      <video
                        key={`${sec.id}-${hoveredSectorId === sec.id ? 'hovering' : 'idle'}`}
                        src={sec.videoUrl}
                        autoPlay={hoveredSectorId === sec.id || isActive}
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-65 scale-105 pointer-events-none transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 border border-white/5 flex items-center justify-center opacity-60">
                        <Terminal className="w-6 h-6 text-slate-500 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* BOTTOM HOVER/CONTENT DATA CARD */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                        {sec.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {sec.notes}
                      </p>
                    </div>

                    {/* Telemetry quick look metrics */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2 flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[120px]" title={sec.inspector}>Head: {sec.inspector}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound();
                          let emailAddress = 's.vance@pondco.com';
                          if (sec.inspector.includes('Harrison')) emailAddress = 'm.harrison@pondco.com';
                          else if (sec.inspector.includes('O\'Connor')) emailAddress = 'j.oconnor@pondco.com';
                          else if (sec.inspector.includes('Singh')) emailAddress = 'r.singh@pondco.com';
                          else if (sec.inspector.includes('L. Vance')) emailAddress = 'l.vance@pondco.com';
                          
                          setActiveMessageTarget({
                            name: sec.inspector,
                            email: emailAddress,
                            sector: sec.name
                          });
                          setMessageSubject(`Inquiry on ${sec.name} operational parameters`);
                          setMessageBody(`Reference code: ${sec.code}. Requesting further engineering schemas or audit trails.`);
                          setMessageSuccess(false);
                        }}
                        className="px-2 py-0.5 rounded bg-blue-900 hover:bg-blue-950 text-white font-mono font-bold tracking-wider uppercase text-[9px] flex items-center gap-1 cursor-pointer transition hover:scale-105 active:scale-95"
                        title={`Send details inquiry email to ${sec.inspector}`}
                      >
                        <span>✉️ MESSAGE</span>
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE INDICATOR FOOTER BAND */}
                  {isActive && !settings.highContrast && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTIVE HOVER OVERLAY NOTIFICATION POPUP PANEL */}
          {hoveredSector && (
            <div 
              style={{
                position: 'absolute',
                left: `${Math.min(hoverBoxPosition.x, 380)}px`,
                top: `${hoverBoxPosition.y}px`,
                zIndex: 40,
                pointerEvents: 'none'
              }}
              className="max-w-xs w-72 bg-slate-950 text-white p-4 rounded-lg border border-white/20 shadow-xl font-mono text-xs leading-normal animate-fade-in space-y-2.5"
            >
              <div className="pb-1.5 border-b border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Command className="w-3 h-3 animate-spin" />
                  Live Directory Peek
                </span>
                <span className="text-[9px] text-slate-500">{hoveredSector.code}</span>
              </div>
              
              <div className="space-y-1 text-[11px]">
                <div className="text-slate-400 font-bold">Subdirectories Indexed:</div>
                {hoveredSector.directories.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 pl-2 text-slate-200">
                    <Folder className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{d.name}/</span>
                    <span className="text-[10px] text-slate-500">({d.files.length} files)</span>
                  </div>
                ))}
              </div>

              {/* Head Person Dynamic Contact Info inside Hover Box */}
              <div className="pt-2 border-t border-white/10 space-y-1 text-[10px]">
                <div className="text-sky-400 font-bold uppercase tracking-widest text-[9px]">Head Official / Contact:</div>
                <div className="text-white font-sans font-bold text-[11.5px]">{hoveredSector.inspector}</div>
                <div className="text-slate-300 font-mono code select-all truncate">
                  {hoveredSector.inspector.includes('Harrison') ? 'm.harrison@pondco.com' :
                   hoveredSector.inspector.includes('O\'Connor') ? 'j.oconnor@pondco.com' :
                   hoveredSector.inspector.includes('Singh') ? 'r.singh@pondco.com' :
                   hoveredSector.inspector.includes('L. Vance') ? 'l.vance@pondco.com' : 's.vance@pondco.com'}
                </div>
              </div>
              
              <p className="text-[9px] text-slate-500 border-t border-white/10 pt-1.5 leading-normal italic">
                Tip: Click CONTACT on the card to direct-message this sector official.
              </p>
            </div>
          )}

          {/* CHOSEN COMPREHENSIVE SECTOR DETAILED VIEWPORT - THEMED DISTINCTIVELY PER SECTOR */}
          <div className={`p-6 rounded-lg border space-y-6 transition-all duration-300 ${activeTheme.bg} ${activeTheme.border} ${activeTheme.glow}`}>
            
            {/* Header detail */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                  CURRENT FOCUS &bull; OPERATIONS LOG REVIEWS
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">{activeSector.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                    {activeSector.code}
                  </span>
                </div>
              </div>

              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => handleResetSector(activeSector.id)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-mono font-bold flex items-center gap-1 transition"
                  title="Restore baseline parameters for this sector"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESTORE BASE SEC-LIMITS
                </button>
              )}
            </div>

            {/* TWO-COLUMN EXPLORER: FILES/DIRECTORIES & EDITABLE SCHEMAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DIRECTORY BROWSER PANEL WITH FILTERING & LIVE SEARCH */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pb-1">
                    <Folder className="w-4 h-4 text-amber-600" />
                    Directory Search &amp; Subdirectories Index
                  </h4>
                </div>

                {/* Live Real-time Subdirectories Search input box */}
                <div className="relative">
                  <label htmlFor="dirSearch" className="sr-only">Filter subdirectories and registry files</label>
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="dirSearch"
                    type="text"
                    placeholder="Search folder files, overrides, .cfg ..."
                    className="pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 w-full"
                    value={dirSearchQuery}
                    onChange={(e) => setDirSearchQuery(e.target.value)}
                  />
                  {dirSearchQuery && (
                    <button
                      onClick={() => setDirSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Subdirectories file tree viewer */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 max-h-80 overflow-y-auto space-y-4 font-mono text-xs">
                  {getFilteredDirectories(activeSector).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic bg-white border border-slate-100 rounded">
                      No files or subdirectories matched &quot;{dirSearchQuery}&quot;. Please revise query terms.
                    </div>
                  ) : (
                    getFilteredDirectories(activeSector).map((dir) => (
                      <div key={dir.name} className="space-y-2">
                        {/* Directory Header folder index */}
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200 pb-1">
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{dir.name}/</span>
                          <span className="text-[10px] font-normal text-slate-400 ml-auto">Folder</span>
                        </div>

                        {/* Folder Contents */}
                        <div className="pl-4 space-y-2">
                          {dir.files.map((file) => (
                            <div 
                              key={file.name} 
                              className="p-2.5 bg-white border border-slate-150 rounded hover:border-slate-300 transition-colors flex flex-col justify-between gap-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-700 truncate">
                                  <File className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200 shrink-0">
                                  {file.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal font-sans">
                                {file.description}
                              </p>
                              <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-100 mt-1">
                                <span>SIZE: {file.size}</span>
                                <span>MODIFIED: {file.lastModified}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTOR NOTES & ADJUSTABLE PARAMETERS SHEET (WITH OVEROVERRIDES) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pb-1">
                  <SlidersHorizontal className="w-4 h-4 text-blue-900" />
                  Inspectors Registry Settings &amp; Notes
                </h4>

                {/* Form to commit edits */}
                <form onSubmit={handleSaveSectorBypass} className="space-y-4">
                  {/* Notes Field */}
                  <div className="space-y-1.5Grid">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor={`sec-notes-${activeSector.id}`} className="text-xs font-serif font-bold text-slate-705 block">
                        Sector Operational Notes
                      </label>
                      {isAdminMode && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          CLEARANCE_HIERARCHY[session?.clearanceLevel || 'CITIZEN'] >= CLEARANCE_HIERARCHY[notePermissions?.[activeSector.id] || 'SYSTEM_ADMIN']
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : 'bg-rose-50 text-rose-800 border border-rose-100'
                        }`}>
                          {CLEARANCE_HIERARCHY[session?.clearanceLevel || 'CITIZEN'] >= CLEARANCE_HIERARCHY[notePermissions?.[activeSector.id] || 'SYSTEM_ADMIN']
                            ? 'Permission Granted'
                            : `Restricted: Requires ${notePermissions?.[activeSector.id] || 'SYSTEM_ADMIN'}+`}
                        </span>
                      )}
                    </div>
                    {isAdminMode && CLEARANCE_HIERARCHY[session?.clearanceLevel || 'CITIZEN'] >= CLEARANCE_HIERARCHY[notePermissions?.[activeSector.id] || 'SYSTEM_ADMIN'] ? (
                      <textarea
                        id={`sec-notes-${activeSector.id}`}
                        rows={3}
                        className="p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded font-sans focus:outline-none focus:ring-2 focus:ring-blue-900 w-full resize-none"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 font-sans text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {activeSector.notes}
                        </div>
                        {isAdminMode && (
                          <p className="text-[10px] text-rose-600 font-mono italic">
                            Error: Your active clearance level ({session?.clearanceLevel || 'CITIZEN'}) is below the required notes adjustment threshold ({notePermissions?.[activeSector.id] || 'SYSTEM_ADMIN'}). Field locked.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active parameter checklist slider list */}
                  <div className="space-y-3">
                    <label className="text-xs font-serif font-bold text-slate-700 block border-b border-slate-100 pb-1">
                      Parameters &amp; Bypass Flags
                    </label>

                    <div className="space-y-3">
                      {activeSector.parameters.map((p) => {
                        const editedVal = editingParams[p.key] ?? p.value;
                        
                        return (
                          <div 
                            key={p.key}
                            className={`p-3 rounded border text-xs font-mono ${
                              p.isBypassed
                                ? (settings.highContrast ? 'border-2 border-black bg-slate-100' : 'bg-amber-500/5 border-amber-300/60')
                                : (settings.highContrast ? 'border border-slate-200' : 'bg-slate-50/70 border-slate-150')
                            } flex flex-col gap-2`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <span className="font-bold text-slate-800 font-sans text-xs">{p.label}</span>
                                <span className="text-[10px] text-slate-400 block font-mono mt-0.5 uppercase">ID: {p.key}</span>
                              </div>

                              {/* Toggle override trigger button for admin */}
                              {isAdminMode ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBypass(activeSector.id, p.key)}
                                  className={`px-2 py-1 rounded text-[10px] tracking-wider font-mono font-bold uppercase transition flex items-center gap-1 border shrink-0 ${
                                    p.isBypassed
                                      ? 'bg-amber-400 text-slate-950 border-amber-500'
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300'
                                  }`}
                                  title={`Toggle bypass override state for regulatory threshold: ${p.label}`}
                                >
                                  {p.isBypassed ? (
                                    <>
                                      <Unlock className="w-3 h-3 text-slate-900" />
                                      <span>BYPASSED</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3 text-slate-500" />
                                      <span>REGULATED</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 tracking-wider ${
                                  p.isBypassed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {p.isBypassed ? '⚠️ ACTIVE BYPASS' : '✓ COMPLIANT'}
                                </span>
                              )}
                            </div>

                            {/* Range controls inputs */}
                            <div className="pt-1.5 border-t border-slate-200/50 flex flex-col gap-2">
                              {p.type === 'number' && p.min !== undefined && p.max !== undefined ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] text-slate-500">
                                    <span>Scale range: {p.min}{p.unit} - {p.max}{p.unit}</span>
                                    <span className="font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                                      Value: {editedVal}{p.unit}
                                    </span>
                                  </div>

                                  {isAdminMode ? (
                                    <input
                                      type="range"
                                      min={p.min}
                                      max={p.max}
                                      step={1}
                                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
                                      value={editedVal}
                                      onChange={(e) => handleParamChange(p.key, Number(e.target.value))}
                                    />
                                  ) : (
                                    <div className="w-full h-1 bg-slate-150 rounded">
                                      <div 
                                        className="h-1 bg-slate-500 rounded" 
                                        style={{ width: `${((Number(p.value) - p.min) / (p.max - p.min)) * 100}%` }} 
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : p.type === 'text' ? (
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] text-slate-400">Current string state:</span>
                                  {isAdminMode ? (
                                    <input
                                      type="text"
                                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 text-xs font-mono w-48 text-right focus:ring-1 focus:ring-blue-900 outline-none"
                                      value={editedVal}
                                      onChange={(e) => handleParamChange(p.key, e.target.value)}
                                    />
                                  ) : (
                                    <span className="font-bold text-slate-700">{p.value}</span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit actions (Only visible when admin edits) */}
                  {isAdminMode && (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          // restore local edit buffers to activeSector's current state
                          setEditingNotes(activeSector.notes);
                          const paramMap: Record<string, string | number> = {};
                          activeSector.parameters.forEach(p => {
                            paramMap[p.key] = p.value;
                          });
                          setEditingParams(paramMap);
                          playSound();
                          onAnnounce("Discarded temporary parameters modifications.");
                        }}
                        className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                      >
                        RESET EDITS
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold font-mono tracking-wider uppercase rounded flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>STAMP CERTIFIED BYPASS</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
              
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: AUDIT LEDGER SUB-PORTAL FOR SELECTED SECTOR */}
        <div className="space-y-6">
          
          {/* SECTOR SUMMARY INFO BOX */}
          <div className={`p-6 rounded-lg border shadow-xs ${
            settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className="font-serif font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-900 shrink-0" />
              Guidelines: Sector Reviews
            </h3>
            
            <div className="text-xs text-slate-600 leading-relaxed space-y-2.5">
              <p>
                As required by Section 508 and USA Title 44, every critical infrastructure process is subjected to dual-audit telemetry checks.
              </p>
              <div className="p-3 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 pb-1 mb-1 border-b border-slate-150">Verification Modes:</div>
                <div className="flex gap-1.5 items-start mt-1">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>REGULATED:</strong> Normal operating compliance parameters applying continuous validation checkgates.</span>
                </div>
                <div className="flex gap-1.5 items-start mt-1.5 text-amber-800">
                  <span className="text-amber-600 font-bold">⚠️</span>
                  <span><strong>BYPASSED:</strong> Manual override active on specific attributes to bypass checkgates under certified crisis scenarios.</span>
                </div>
              </div>
              <p>
                To adjust metrics, users must supply an authenticated administrative delegate signature on the control console above.
              </p>
            </div>
          </div>

          {/* HISTORIC AUDIT TRACE SPECIFIC TO CHOSEN SECTOR */}
          <div className={`p-6 rounded-lg border shadow-xs ${
            settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-serif font-bold text-slate-900 text-sm mb-1 flex items-center gap-1">
              <Terminal className="w-4 h-4 text-blue-900 shrink-0" />
              Latest Audits (This Sector)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Chronological telemetry audit logs tracing {activeSector.code}.</p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activeLogs.filter(l => 
                l.agency.toLowerCase().includes(activeSector.name.toLowerCase()) || 
                l.message.toLowerCase().includes(activeSector.code.toLowerCase()) ||
                l.message.toLowerCase().includes(activeSector.id.toLowerCase()) ||
                (activeSector.id === 'sector-atc' && l.agency.includes('FARO')) || // ATC-FARO link
                (activeSector.id === 'sector-cyber' && l.category === 'SECURITY') ||
                (activeSector.id === 'sector-border' && l.category === 'COMPLIANCE') ||
                (activeSector.id === 'sector-eco' && l.agency.includes('Environmental'))
              ).length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic bg-slate-50 border border-slate-150 rounded text-xs leading-normal">
                  No registered manual overrides or status alerts filed for {activeSector.code} during this active monitoring cycle.
                </div>
              ) : (
                activeLogs.filter(l => 
                  l.agency.toLowerCase().includes(activeSector.name.toLowerCase()) || 
                  l.message.toLowerCase().includes(activeSector.code.toLowerCase()) ||
                  l.message.toLowerCase().includes(activeSector.id.toLowerCase()) ||
                  (activeSector.id === 'sector-atc' && l.agency.includes('FARO')) ||
                  (activeSector.id === 'sector-cyber' && l.category === 'SECURITY') ||
                  (activeSector.id === 'sector-border' && l.category === 'COMPLIANCE') ||
                  (activeSector.id === 'sector-eco' && l.agency.includes('Environmental'))
                ).map((log) => {
                  const isErr = log.severity === 'ERROR';
                  const isWarn = log.severity === 'WARNING';
                  const isSuccess = log.severity === 'SUCCESS';
                  
                  let txt = 'text-slate-500';
                  let bg = 'bg-slate-100 border-slate-200';
                  if (isErr) { txt = 'text-rose-600 font-bold'; bg = 'bg-rose-50 border-rose-250'; }
                  else if (isWarn) { txt = 'text-amber-700 font-bold'; bg = 'bg-amber-50 border-amber-250'; }
                  else if (isSuccess) { txt = 'text-emerald-700 font-bold'; bg = 'bg-emerald-50 border-emerald-250'; }

                  return (
                    <div key={log.id} className={`p-3 bg-slate-50 border rounded text-[11px] font-mono leading-normal shadow-2xs ${bg}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`px-1 rounded text-[9px] font-bold uppercase tracking-wider ${txt} bg-white border`}>
                          {log.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.id}</span>
                      </div>
                      
                      <div className="text-slate-700 font-sans mt-1 text-xs">{log.message}</div>
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 pt-1.5 border-t border-black/5">
                        <span>OP: {log.operator}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* SECURE BROADCAST MESSENGER MODAL (Satisfying the "send a message to get details" directive) */}
      {activeMessageTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" id="messenger-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-lg w-full text-white">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-blue-950 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-400/40 flex items-center justify-center text-lg animate-pulse">
                  📡
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif uppercase tracking-wider text-white">
                    Secure Radio Wire Relay
                  </h4>
                  <p className="text-[10px] text-blue-300 font-mono uppercase tracking-widest mt-0.5">
                    To: {activeMessageTarget.sector} Coordinator
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playSound();
                  setActiveMessageTarget(null);
                }}
                className="p-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition text-xs font-mono font-bold cursor-pointer"
              >
                ESC / CLOSE
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {messageSuccess ? (
                <div className="p-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/40 mx-auto flex items-center justify-center text-xl text-emerald-400 animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Transmission Dispatched
                    </p>
                    <p className="text-xs text-slate-300 leading-normal max-w-sm mx-auto font-sans">
                      Encrypted message payload securely routed through the Pond operations backbone. Head Person <strong className="text-white">{activeMessageTarget.name}</strong> will receive notification at <strong className="text-blue-300">{activeMessageTarget.email}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playSound();
                      setActiveMessageTarget(null);
                    }}
                    className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs font-mono uppercase cursor-pointer"
                  >
                    Confirm & Return
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <p className="text-[11px] text-slate-400 font-sans leading-normal">
                    This encrypted transmitter routes queries directly to the sector inspector's official email queue. Audits are monitored and registered under FAA CFR-Part-13 protocol.
                  </p>

                  {/* READ ONLY RECIP METADATA */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-white/5 rounded font-mono text-[10px] text-slate-300">
                    <div>
                      <span className="block text-slate-500 uppercase text-[9px]">Recipient Official:</span>
                      <strong className="text-amber-400 font-bold">{activeMessageTarget.name}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500 uppercase text-[9px]">Official Inbox:</span>
                      <strong className="text-sky-300 select-all font-mono font-bold">{activeMessageTarget.email}</strong>
                    </div>
                  </div>

                  {/* SUBJECT */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">Message Subject Header</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans font-medium"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                    />
                  </div>

                  {/* BODY TEXTAREA */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-slate-400">Detailed Query Payload</label>
                    <textarea
                      rows={4}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans font-normal resize-none"
                      placeholder="Write your query details here..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                    />
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      onClick={() => {
                        playSound();
                        setActiveMessageTarget(null);
                      }}
                      className="py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!messageSubject || !messageBody) {
                          onAnnounce("Error: Please specify the message subject and body contents.");
                          return;
                        }
                        playSound();
                        setIsSendingMessage(true);
                        
                        setTimeout(() => {
                          setIsSendingMessage(false);
                          setMessageSuccess(true);
                          
                          // Write real success trace log for the user to verify!
                          onAddLog({
                            message: `Direct encrypted wire inquiry routed successfully to ${activeMessageTarget.name} (${activeMessageTarget.email}) from ${session?.username || 'Authenticated Client'} regarding ${activeMessageTarget.sector}.`,
                            severity: "SUCCESS",
                            agency: activeMessageTarget.sector.toUpperCase(),
                            category: "RECORDS",
                            operator: activeMessageTarget.name,
                            ipAddress: "127.0.0.1"
                          });
                          onAnnounce(`Secure message payload transmitted successfully to ${activeMessageTarget.name}!`);
                        }, 1200);
                      }}
                      className="py-2 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg text-xs font-mono uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      disabled={isSendingMessage}
                    >
                      {isSendingMessage ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>ROUTING WIRE...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND SECURE TRANSMISSION</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
