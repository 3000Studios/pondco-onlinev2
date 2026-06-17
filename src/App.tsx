import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle, 
  HelpCircle, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Send, 
  Terminal,
  ArrowRight,
  Info,
  Clock,
  Radio,
  Sliders,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { AccessibilitySettings, AuditLog, ServiceStatusItem, UserSession } from './types';
import { INITIAL_AUDIT_LOGS, INITIAL_SERVICE_STATUSES, OFFICIAL_AGENCIES } from './data/mockData';
import { OfficialHeader } from './components/OfficialHeader';
import { Navigation } from './components/Navigation';
import { CustomCursor } from './components/CustomCursor';
import { ServiceStatus } from './components/ServiceStatus';
import { ServiceRequestForm } from './components/ServiceRequestForm';
import { LogViewer } from './components/LogViewer';
import { AgencyDirectory } from './components/AgencyDirectory';
import { SectorProcessFlows, SectorItem } from './components/SectorProcessFlows';
import { DashboardCharts } from './components/DashboardCharts';
import { UserAuthentication } from './components/UserAuthentication';
import { BusinessAcquisition } from './components/BusinessAcquisition';
import { ProjectControlCenter } from './components/ProjectControlCenter';
import { RagAgentConsole } from './components/RagAgentConsole';
import { ClientProgressView } from './components/ClientProgressView';
import { AdminDashboard } from './components/AdminDashboard';
import { AviationStories } from './components/AviationStories';
import { LegalDisclaimer } from './components/LegalDisclaimer';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Firebase Lock Gate state hooks
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isFirebaseConnecting, setIsFirebaseConnecting] = useState(false);
  const [firebaseStep, setFirebaseStep] = useState('');
  const [lockGateError, setLockGateError] = useState('');

  // Logs & Service Health database state
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [statuses, setStatuses] = useState<ServiceStatusItem[]>(INITIAL_SERVICE_STATUSES);

  // Active User session initialized from local storage for robust persistence
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const cached = localStorage.getItem('civil_portal_active_session');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });

  // Accessibility Settings initialized from local storage for robust persistence
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const cached = localStorage.getItem('civil_portal_ac_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      fontSize: 'standard',
      highContrast: false,
      screenReaderActive: false,
      soundEnabled: true
    };
  });

  // Global sectors state shared with the Admin Dashboard for instant parameter changes
  const [sectors, setSectors] = useState<SectorItem[]>(() => {
    try {
      const cached = localStorage.getItem('civil_portal_sectors_state');
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return [
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
  });

  // Minimum required clearance levels to edit sector operational notes
  const [notePermissions, setNotePermissions] = useState<Record<string, 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN'>>(() => {
    try {
      const cached = localStorage.getItem('civil_portal_note_permissions');
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return {
      'sector-atc': 'SYSTEM_ADMIN',
      'sector-cyber': 'SYSTEM_ADMIN',
      'sector-border': 'REGISTRY_AUDITOR',
      'sector-eco': 'CIVIL_ANALYST',
      'sector-maritime': 'CIVIL_ANALYST'
    };
  });

  const handleSwitchUserClearance = (clearance: 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN') => {
    const nextSession: UserSession = {
      username: session?.username || 'Simulated Officer',
      email: session?.email || 'officer@pondco.online',
      clearanceLevel: clearance,
      token: session?.token || 'MOCK_TERMINAL_JWT_2026',
      authenticatedTime: session?.authenticatedTime || new Date().toISOString(),
      avatarIcon: session?.avatarIcon || 'Shield'
    };
    setSession(nextSession);
    localStorage.setItem('civil_portal_active_session', JSON.stringify(nextSession));
  };

  // Context highlight card show/hide toggle state
  const [showContextHighlights, setShowContextHighlights] = useState<boolean>(true);

  // Screen reader announcer translation state
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('National Services Portal initialized successfully. Accessibility mode is ready.');

  // Persistent settings save hook
  useEffect(() => {
    try {
      localStorage.setItem('civil_portal_ac_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Persistent user session save hook
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem('civil_portal_active_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('civil_portal_active_session');
      }
    } catch (e) {}
  }, [session]);

  // Screen Reader Announcer core functionality
  const handleAnnounce = (text: string) => {
    setLastAnnouncement(text);
    
    if (settings.screenReaderActive) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // cancel pre-loaded voice
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05; // natural rate
          utterance.pitch = 0.95; // authoritative voice
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.warn("Speech Synthesis blocked or unsupported in current browser frame environment.");
      }
    }
  };

  // Nav chime audio generator
  const playClickSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(450, audioCtx.currentTime); // standard beep
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  // Passcode verification logic for Lock screen
  const handlePasscodeUnlock = () => {
    playClickSound();
    
    if (passcodeInput === '92842') {
      const sessionData: UserSession = {
        username: "Mr. J.W. Swain",
        email: "mr.jwswain@gmail.com",
        clearanceLevel: "SYSTEM_ADMIN",
        token: "POND-PASSCODE-92842",
        authenticatedTime: new Date().toISOString(),
        avatarIcon: "🛡️"
      };
      setSession(sessionData);
      localStorage.setItem('civil_portal_active_session', JSON.stringify(sessionData));
      setPasscodeInput('');
      setLockGateError('');
      handleAddNewLog({
        message: "Successful administrative override login verified for mr.jwswain@gmail.com.",
        severity: "SUCCESS",
        agency: "PONDCO SECURE NODE",
        category: "SYSTEM",
        operator: "Security Gate Console",
        ipAddress: "12.44.82.90"
      });
      handleAnnounce("Workstation unlocked! Swapped to Pondco System dashboard.");
    } else if (passcodeInput === '10842') {
      const sessionData: UserSession = {
        username: "Riverside Corporate Client",
        email: "client@pondco.online",
        clearanceLevel: "CITIZEN",
        token: "POND-PASSCODE-10842",
        authenticatedTime: new Date().toISOString(),
        avatarIcon: "💼"
      };
      setSession(sessionData);
      localStorage.setItem('civil_portal_active_session', JSON.stringify(sessionData));
      setPasscodeInput('');
      setLockGateError('');
      handleAddNewLog({
        message: "Successful client sponsor login verified for client@pondco.online.",
        severity: "SUCCESS",
        agency: "PONDCO SECURE NODE",
        category: "SYSTEM",
        operator: "Sponsor Verification Console",
        ipAddress: "12.44.82.94"
      });
      handleAnnounce("Workstation unlocked for Sponsor viewing! Swapped to Sponsor Portal.");
    } else {
      setLockGateError("ACCESS TERMINATED: Secure Passcode record not found in Pondco directory.");
      setPasscodeInput('');
      
      handleAddNewLog({
        message: `Failed passcode entry attempt. Target security clearance rejected.`,
        severity: "ERROR",
        agency: "SECURITY ESCALATION UNIT",
        category: "SECURITY",
        operator: "Intrusion Audit Logic",
        ipAddress: "192.168.10.45"
      });
      handleAnnounce("Error: Access denied. Safe passcode check failed.");
    }
  };

  // Log injection helper
  const handleAddNewLog = (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const formattedLog: AuditLog = {
      ...newLog,
      id: `LOG-${Math.floor(4000 + Math.random() * 5999)}`,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [formattedLog, ...prev]);
  };

  // Stats calculate numbers
  const totalLogsCount = logs.length;
  const warningCount = logs.filter(l => l.severity === 'WARNING').length;
  const errorCount = logs.filter(l => l.severity === 'ERROR').length;
  const citizenRequestsCount = logs.filter(l => l.category === 'PUBLIC_REQUEST').length;

  return (
    <div
      className="relative min-h-screen"
      style={{ 
        fontSize: settings.fontSize === 'large' ? '112.5%' : settings.fontSize === 'extra' ? '125%' : '100%' 
      }}
    >
      {/* Global Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/runway.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-white/20 z-0 pointer-events-none" />

      <div 
        className={`relative z-10 min-h-screen flex flex-col transition-all duration-300 ${
          settings.highContrast ? 'high-contrast bg-white text-black' : 'bg-transparent text-slate-900'
        }`}
      >
      {/* RED MOCK-UP DISCLAIMER TICKER */}
      <div 
        className="w-full bg-red-600 text-white text-[11px] py-2 px-4 shadow-md font-bold text-center flex flex-wrap items-center justify-center gap-2 relative z-[100] animate-pulse border-b border-red-800 uppercase tracking-widest leading-relaxed"
        role="alert"
        aria-label="Interactive Prototyping Disclaimer Ticker"
      >
        <span className="bg-white text-red-700 px-2 py-0.5 rounded text-[9px] font-black shrink-0 shadow-sm">
          ⚠️ SIMULATED PRESENTATION ONLY
        </span>
        <span className="font-sans font-extrabold">
          This system is an educational interactive design mock-up. It has NO affiliation with Pond &amp; Co. (Pondco), its associates, or any local/national aviation projects.
        </span>
        <button 
          onClick={() => {
            playClickSound();
            setCurrentTab('legal');
          }}
          className="underline text-amber-200 hover:text-white transition font-black uppercase text-[9.5px] ml-1 shrink-0 px-2 py-0.5 bg-red-800 rounded font-mono hover:scale-102 cursor-pointer outline-none"
        >
          READ LEGAL LIABILITY RELEASE
        </button>
      </div>

      {/* 3D Realistic Glossy Metallic Metal Custom Cursor (disabled in high contrast accessibility) */}
      <CustomCursor highContrast={settings.highContrast} />

      {/* HEADER BANNER & ACCESSIBILITY CONTROLS */}
      <OfficialHeader 
        settings={settings} 
        setSettings={setSettings} 
        onAnnounce={handleAnnounce}
        lastAnnouncement={lastAnnouncement}
        session={session}
        onLogin={setSession}
        onLogout={() => setSession(null)}
        setCurrentTab={setCurrentTab}
      />

      {/* ACCESSIBLE TAB SWITCH NAVIGATION MENU */}
      <Navigation 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        settings={settings}
        onAnnounce={handleAnnounce}
        playSound={playClickSound}
        session={session}
      />

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main 
        id="main-content" 
        className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 outline-none"
        tabIndex={-1}
        role="main"
      >
        {/* FLASHING BROADCAST CIVIL ALERTS ALONG THE TOP */}
        <div 
          className={`mb-6 p-3 rounded border-l-4 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 leading-relaxed shadow-sm ${
            settings.highContrast 
              ? 'bg-black text-amber-300 border border-amber-300' 
              : 'bg-amber-100/70 border-amber-500 text-amber-900'
          }`}
          role="region"
          aria-label="National Alerts Broadcast ticker"
        >
          <div className="flex items-center gap-2">
            <span className="animate-ping w-2 h-2 rounded-full bg-amber-600 flex-shrink-0" />
            <Radio className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>BROADCAST CLASSIFIED NOTICE:</strong> Handshake compliance audit scheduled on FARO database server #4459-D tonight. No citizen outages projected.
            </span>
          </div>
          <button 
            onClick={() => {
              handleAnnounce("Civil alert broadcast: Server Handshake maintenance scheduled tonight. Integrity checksum stays safe.");
              playClickSound();
            }}
            className="text-[10px] uppercase font-bold underline text-amber-950 hover:text-amber-800 tracking-wider text-left sm:text-right"
          >
            VERIFY DETAILS
          </button>
        </div>

        {/* CONDITIONALLY RENDER VIEWPORTS BASED ON ACTIVE NAV TAB */}
        {!session ? (
          <div className="max-w-xl mx-auto my-12 animate-fadeIn" id="auth-lock-gate">
            {/* The secure gate box */}
            <div className={`p-8 rounded-xl border-t bg-slate-950 border border-slate-800 text-white relative overflow-hidden shadow-2xl`}>
              {/* Radial gradient backing for that elite holographic look */}
              <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                
                {/* Official seal image / logo */}
                <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-white/10">
                  <div className="w-16 h-16 rounded-full bg-blue-900/40 border border-blue-400/30 flex items-center justify-center text-2xl animate-pulse">
                    🛰️
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-extrabold tracking-tight text-white uppercase sm:text-2xl">
                      Pondco.Online Flight Operations
                    </h2>
                    <p className="text-xs text-blue-300 font-mono uppercase tracking-widest mt-1">
                      🔐 Authorized Personnel Clearance Checkpoint
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed text-center font-sans">
                  This secure workstation contains official twin-tower airport civil mockups, geotechnical compaction telemetries, and business client pipelines. Access is logged under simulated site security protocols.
                </p>

                {/* ERROR FEEDBACK BAR */}
                {lockGateError && (
                  <div className="p-3 bg-red-950/80 border border-red-500/30 rounded text-xs text-red-200 font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{lockGateError}</span>
                  </div>
                )}

                {/* METHOD A: FIREBASE GOOGLE SIGN IN OAUTH GATE */}
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-300 text-[10px] font-mono tracking-wider rounded font-bold uppercase">
                      Method A: Secure Federated SSO
                    </span>
                  </div>

                  {isFirebaseConnecting ? (
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                          Firebase Handshaking...
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {firebaseStep}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsFirebaseConnecting(true);
                        setLockGateError('');
                        setFirebaseStep('Initiating secure OAuth redirect via Firebase Authentication...');
                        
                        setTimeout(() => {
                          setFirebaseStep('Querying G-Suite user directories for mr.jwswain@gmail.com...');
                          playClickSound();
                        }, 500);

                        setTimeout(() => {
                          setFirebaseStep('Retrieving verified JWT claims (SYSTEM_ADMIN role verified)...');
                          playClickSound();
                        }, 1000);

                        setTimeout(() => {
                          setIsFirebaseConnecting(false);
                          const sessionData: UserSession = {
                            username: "Mr. J.W. Swain",
                            email: "mr.jwswain@gmail.com",
                            clearanceLevel: "SYSTEM_ADMIN",
                            token: "POND-FIREBASE-SSO-92842",
                            authenticatedTime: new Date().toISOString(),
                            avatarIcon: "🛡️"
                          };
                          setSession(sessionData);
                          localStorage.setItem('civil_portal_active_session', JSON.stringify(sessionData));
                          handleAddNewLog({
                            message: "Successful Firebase Auto Sign-In with Google verified for Administrator mr.jwswain@gmail.com.",
                            severity: "SUCCESS",
                            agency: "PONDCO SECURE NODE",
                            category: "SYSTEM",
                            operator: "Firebase SSO Daemon",
                            ipAddress: "12.44.82.90"
                          });
                          handleAnnounce("Authenticated with Google via Firebase! Welcome back, Mr. Swain.");
                        }, 1600);
                      }}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-lg font-bold border border-slate-200 transition-all flex items-center justify-center gap-2.5 shadow-sm text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wide"
                    >
                      {/* SVG Google Multi-color G logo */}
                      <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.13C18.465 1.91 15.54 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.976 0-.742-.078-1.3-.177-1.821H12.24z"/>
                      </svg>
                      <span>Auto Sign In with Google</span>
                    </button>
                  )}
                </div>

                {/* VISUAL SEPARATOR */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-mono uppercase">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* METHOD B: PASSCODE MATRIX GATEWAY */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-300 text-[10px] font-mono tracking-wider rounded font-bold uppercase">
                      Method B: Enter Safe Passcode
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="•••••"
                        maxLength={8}
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value.replace(/\D/g, ''));
                        }}
                        className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold bg-slate-900 border border-slate-850 text-amber-400 p-3 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePasscodeUnlock();
                          }
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono font-bold">
                        {passcodeInput.length}/8 DIGITS
                      </div>
                    </div>
                  </div>

                  {/* HIGH-CONTRAST DIGITAL PASCODE PAD */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          playClickSound();
                          if (passcodeInput.length < 8) {
                            setPasscodeInput(prev => prev + num);
                          }
                        }}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-mono rounded font-bold text-center text-xs cursor-pointer transition active:scale-95"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        playClickSound();
                        setPasscodeInput('');
                      }}
                      className="p-2.5 bg-rose-950/20 hover:bg-rose-950/60 text-rose-300 border border-rose-900/30 font-mono rounded font-medium text-center text-xs cursor-pointer transition"
                    >
                      CLEAR
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        if (passcodeInput.length < 8) {
                          setPasscodeInput(prev => prev + '0');
                        }
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-mono rounded font-bold text-center text-xs cursor-pointer transition active:scale-95"
                    >
                      0
                    </button>
                    <button
                      onClick={() => {
                        handlePasscodeUnlock();
                      }}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono rounded font-bold text-center text-xs cursor-pointer transition flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95"
                    >
                      <span>ENTER</span>
                    </button>
                  </div>

                  {/* VISUAL COMPLIANCE NOTICE BAR */}
                  <div className="p-3 bg-slate-900/70 rounded border border-white/5 text-[10px] font-mono text-slate-400 space-y-1">
                    <p className="text-amber-500/90 font-bold uppercase text-[9px] tracking-wider">🔒 Standard Clearance Keys:</p>
                    <p>&bull; Corporate Client: <strong className="text-white bg-slate-850 px-1 py-0.2 rounded font-sans text-[11px]">10842</strong> (Sponsor Gateways)</p>
                    <p>&bull; Admin / Owner passcode: <strong className="text-white bg-slate-850 px-1 py-0.2 rounded font-sans text-[11px]">92842</strong> (System Mastery)</p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'overview' && (
          <div className="space-y-6">
            
            {/* CIVIL DASHBOARD BLUE HERO BANNER WITH LIVE LOOPING AIRPORT TOWER VIDEO & RADAR GRID UNDERLAYMENT */}
            <div className="w-full h-80 rounded-xl relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 border border-slate-800 text-white flex flex-col justify-end p-6 md:p-8 shadow-lg">
              
              {/* Live Looping Video Background of Terminal Tower */}
              <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-airport-control-tower-with-moving-antenna-42525-large.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen pointer-events-none"
              />

              {/* RADAR TARGETING/GRID UNDERLAYMENT FILTER SHEEN */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:18px_18px] opacity-75 z-10" />
              
              {/* Radar concentric concentric glow vector underlayment */}
              <div className="absolute top-1/2 right-12 md:right-24 -translate-y-1/2 w-80 h-80 rounded-full border border-blue-500/10 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border border-blue-500/5" />
                <div className="w-28 h-28 rounded-full border border-blue-500/5" />
                {/* Sweep indicator lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-sky-500/10" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-sky-500/10" />
              </div>

              {/* Banner Content elements */}
              <div className="relative z-20 max-w-4xl space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] uppercase font-mono tracking-widest font-black rounded shadow-sm">
                    TWIN-TOWER CIVIL PROJECT PLANS
                  </span>
                  <span className="text-xs text-blue-300 font-mono tracking-wider font-semibold">
                    FRN-CH-2026 // COCHRAN REGIONAL CONTROLS
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-extrabold tracking-tight text-white leading-tight shadow-sm">
                  Twin-Tower ATCT Environmental & Airport Design Program
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl bg-black/20 p-2 md:p-0 rounded">
                  Monitoring engineering milestones, geotechnical Compaction parameters, and local DBE partner alignments under cooperative municipal guidelines. Est. 1965.
                </p>
              </div>
            </div>

            {/* BRIEF DIRECT CIVIL OUTCOMES CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded border shadow-xs flex items-center justify-between ${
                settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase">LEDE RECORDS INDEXED</div>
                  <div className="text-2xl font-serif font-extrabold text-slate-900 mt-1">{totalLogsCount} Records</div>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> Integrity Sealing Active
                  </span>
                </div>
                <div className={`p-3 rounded ${settings.highContrast ? 'bg-black text-white' : 'bg-blue-50 text-blue-900'}`}>
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded border shadow-xs flex items-center justify-between ${
                settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase">SECURITY ESCALATIONS</div>
                  <div className="text-2xl font-serif font-extrabold text-slate-900 mt-1">{warningCount + errorCount} Flagged</div>
                  <span className="text-[10px] text-amber-700 font-mono font-semibold mt-0.5 block">
                    {warningCount} Warnings &bull; {errorCount} Faults
                  </span>
                </div>
                <div className={`p-3 rounded ${settings.highContrast ? 'bg-black text-white' : 'bg-red-50 text-rose-800'}`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded border shadow-xs flex items-center justify-between ${
                settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase">CITIZEN SUBMISSIONS</div>
                  <div className="text-2xl font-serif font-extrabold text-slate-900 mt-1">{citizenRequestsCount} Cases</div>
                  <span className="text-[10px] text-blue-800 font-mono font-semibold mt-0.5 block">
                    Intake Gateways active 24h
                  </span>
                </div>
                <div className={`p-3 rounded ${settings.highContrast ? 'bg-black text-white' : 'bg-amber-50 text-amber-700'}`}>
                  <Send className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded border shadow-xs flex items-center justify-between ${
                settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <div className="text-xs font-bold font-mono text-slate-400 uppercase">ACCESSIBILITY CERTIFICATION</div>
                  <div className="text-2xl font-serif font-extrabold text-slate-900 mt-1">WCAG 2.2 AA</div>
                  <span className="text-[10px] text-emerald-800 font-mono font-semibold flex items-center gap-0.5 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Section 508 Compliant
                  </span>
                </div>
                <div className={`p-3 rounded ${settings.highContrast ? 'bg-black text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* TWO-COLUMN INTUITIVE MASTER DASHBOARD SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT & CENTER PORTAL INFO WIDGETS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* WELCOME INFORMATIVE INFORMATION SECTION - THE REVOLUTIONARY CONTEXT HIGHLIGHT CARD */}
                <div className={`p-6 rounded-lg shadow-sm border relative overflow-hidden transition-all duration-300 ${
                  settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
                }`}>
                  
                  {/* Fixed-Position Hide/Show Button on the highlight card top margin */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => {
                        setShowContextHighlights(!showContextHighlights);
                        handleAnnounce(showContextHighlights ? "Context highlights collapsed." : "Context highlights fully revealed.");
                        playClickSound();
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-800 hover:text-slate-950 border border-slate-300 transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title={showContextHighlights ? "Collapse information context card overview" : "Expand information context card overview"}
                    >
                      <span>{showContextHighlights ? 'HIDE OVERVIEW [-]' : 'SHOW OVERVIEW [+]'}</span>
                    </button>
                  </div>

                  <div className={`text-[10px] font-mono font-bold tracking-wider mb-2 pr-28 ${
                    settings.highContrast ? 'text-black' : 'text-slate-400'
                  }`}>
                    POND AVIATION OPERATING SYSTEM &bull; EXECUTIVE VIEW
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-2.5 pr-28">
                    Welcome to the Pondco.online Flight-Cab Operations Core
                  </h3>

                  {/* Collapsible Area */}
                  {showContextHighlights ? (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Founded in <strong>1965</strong>, Pond delivers integrated aviation engineering, architectural planning, and programmatic oversight. This secure hub showcases our recent <strong>$4,680,990 twin-tower design award</strong> from the Riverside County Board of Supervisors, covering state-of-the-art ATCT structures at both <strong>French Valley Airport</strong> and <strong>Jacqueline Cochran Regional Airport</strong> under regional municipal contract programs.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                           <h4 className="font-bold text-slate-900 font-serif mb-1 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-blue-900" />
                            Riverside Tower Program Highlights
                          </h4>
                          <p className="text-slate-600 leading-normal">
                             Site designs are led by partner <strong>KSA, a Pape-Dawson company</strong>, executing runway geotechnical boreholes and standard 6480.4B physical controller height computations.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                          <h4 className="font-bold text-slate-900 font-serif mb-1 flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-blue-900" />
                            Accessible Operations Assisting
                          </h4>
                          <p className="text-slate-600 leading-normal">
                            Use the utility bar above to scale display typography, toggle high-contrast layouts, or activate the assistive Speech Narrator with reactive audio chimes.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 italic flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-900 flex-shrink-0" />
                      <span>Executive context details collapsed. Click the &bull;SHOW OVERVIEW [+]&bull; button to restore.</span>
                    </div>
                  )}

                  {/* Immediate Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 mt-6 pt-2">
                    <button
                      onClick={() => {
                        setCurrentTab('acquisition');
                        handleAnnounce("Opening Bidding win/loss Pipeline page.");
                        playClickSound();
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>CRM &amp; PROPOSAL CRITERIA</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('project-controls');
                        handleAnnounce("Opening sprint backlog and geotechnical workbook controls.");
                        playClickSound();
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>SPRINTS &amp; WORKBOOK SECTOR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('rag-agent');
                        handleAnnounce("Opening engineering schema grounded semantic database.");
                        playClickSound();
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition cursor-pointer"
                    >
                      Grounded AI RAG Search
                    </button>
                  </div>
                </div>

                {/* ADVANCED COHESIVE INTERACTIVE COMPRESSIVE SYSTEM TELEMETRIES */}
                <DashboardCharts 
                  logs={logs}
                  statuses={statuses}
                  settings={settings}
                  onAnnounce={handleAnnounce}
                  playSound={playClickSound}
                />

                {/* HISTORICAL RECENT SYSTEMIC TRANSACTIONS COMPILATION */}
                <div className={`p-6 rounded-lg shadow-xs border ${
                  settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-150 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-blue-900" />
                        Live Registry Activity Log (Latest Feed)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Showing newest 3 ledger logs written over remote systems.</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTab('logs');
                        handleAnnounce("Navigated to complete Public Audit Ledger review tab.");
                        playClickSound();
                      }}
                      className="text-xs underline text-blue-900 hover:text-blue-950 font-bold"
                    >
                      View All Logs
                    </button>
                  </div>

                  <div className="space-y-3">
                    {logs.slice(0, 3).map((log) => {
                      const isErr = log.severity === 'ERROR';
                      const isWarn = log.severity === 'WARNING';
                      const isSuccess = log.severity === 'SUCCESS';
                      
                      let textBadge = 'text-slate-500';
                      let bgBadge = 'bg-slate-100';
                      if (isErr) { textBadge = 'text-rose-600 font-bold'; bgBadge = 'bg-rose-50 border border-rose-250'; }
                      else if (isWarn) { textBadge = 'text-amber-700 font-bold'; bgBadge = 'bg-amber-50 border border-amber-250'; }
                      else if (isSuccess) { textBadge = 'text-emerald-700 font-bold'; bgBadge = 'bg-emerald-50 border border-emerald-250'; }

                      return (
                        <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${bgBadge} ${textBadge}`}>
                                {log.severity}
                              </span>
                              <span className="font-bold text-slate-800 text-xs font-serif">{log.agency}</span>
                            </div>
                            <p className="text-slate-700 font-sans line-clamp-1 text-xs">{log.message}</p>
                          </div>
                          
                          <div className="text-slate-400 text-[10px] self-end sm:self-center font-mono flex-shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT-SIDE BAR WIDGETS STATS Panel */}
              <div className="space-y-6">
                
                {/* NATIONAL CORE SYSTEMS HEALTH WIDGET */}
                <div className={`p-6 rounded-lg border shadow-xs ${
                  settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-serif font-bold text-slate-900 text-sm mb-1">State of Services Registry</h3>
                  <p className="text-xs text-slate-500 mb-4">Uptime check across central access points.</p>

                  <div className="space-y-4 text-xs font-mono">
                    {statuses.slice(0, 3).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-150">
                        <div>
                          <div className="font-semibold text-slate-800 text-xs font-sans truncate max-w-[150px]">{s.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{s.code} &bull; UPTIME: {s.uptime}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          s.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setCurrentTab('agencies');
                        handleAnnounce("Navigated to federal service status checklist.");
                        playClickSound();
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded text-center block"
                    >
                      VERIFY ALL NODES HEALTH
                    </button>
                  </div>
                </div>

                {/* INQUIRIES SECTOR COMPILATION GRAPHICAL PILES */}
                <div className={`p-6 rounded-lg border shadow-xs ${
                  settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-serif font-bold text-slate-900 text-sm mb-1">Audit Ledger Volume Distribution</h3>
                  <p className="text-xs text-slate-500 mb-4">Distribution of audit ledger records by systemic categorization.</p>

                  <div className="space-y-3.5 text-xs">
                    {/* Security category bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-600">
                        <span>SECURITY GATEWAYS</span>
                        <span className="font-bold">{logs.filter(l => l.category === 'SECURITY').length} logs</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-900 rounded-full" 
                          style={{ width: `${Math.min(100, (logs.filter(l => l.category === 'SECURITY').length / logs.length) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Records category bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-600">
                        <span>RECORDS CERTIFICATIONS</span>
                        <span className="font-bold">{logs.filter(l => l.category === 'RECORDS').length} logs</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-900 rounded-full" 
                          style={{ width: `${Math.min(100, (logs.filter(l => l.category === 'RECORDS').length / logs.length) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Compliance Category bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-600">
                        <span>ACCESSIBILITY / COMPLIANCE</span>
                        <span className="font-bold">{logs.filter(l => l.category === 'COMPLIANCE').length} logs</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-700 rounded-full" 
                          style={{ width: `${Math.min(100, (logs.filter(l => l.category === 'COMPLIANCE').length / logs.length) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Citizen inquiry category bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-600">
                        <span>PUBLIC RECORDS REQUESTS</span>
                        <span className="font-bold">{logs.filter(l => l.category === 'PUBLIC_REQUEST').length} logs</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, (logs.filter(l => l.category === 'PUBLIC_REQUEST').length / logs.length) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CITIZEN FOIA COMPLIANCE ASSISTANCE BAR */}
                <div className="p-4 bg-slate-900 text-white rounded-lg border-2 border-amber-500 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-amber-500 text-xs tracking-wider uppercase mb-1">FOIA Clearance Hotline</h4>
                    <p className="text-[11px] text-slate-300 leading-normal mb-3">
                      Need direct help seeking historical archive printouts under federal requests? Connect with a FOIA Compliance Officer immediately.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleAnnounce("Opening centralized telecommunication gateway coordinates. Hotline is active +1 800 000 508.");
                      playClickSound();
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded flex items-center justify-center gap-1"
                  >
                    <span>CONNECT VERIFICATION CALL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {currentTab === 'process-flows' && (
          <SectorProcessFlows 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
            activeLogs={logs}
            sectors={sectors}
            setSectors={setSectors}
            notePermissions={notePermissions}
            session={session}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            settings={settings}
            session={session}
            sectors={sectors}
            setSectors={setSectors}
            notePermissions={notePermissions}
            setNotePermissions={setNotePermissions}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
            statuses={statuses}
            setStatuses={setStatuses}
            onSwitchUserClearance={handleSwitchUserClearance}
          />
        )}

        {currentTab === 'acquisition' && (
          <BusinessAcquisition 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
          />
        )}

        {currentTab === 'project-controls' && (
          <ProjectControlCenter 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
          />
        )}

        {currentTab === 'rag-agent' && (
          <RagAgentConsole 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
          />
        )}

        {currentTab === 'client-portal' && (
          <ClientProgressView 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
          />
        )}

        {currentTab === 'aviation-stories' && (
          <AviationStories 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
          />
        )}

        {currentTab === 'auth' && (
          <UserAuthentication
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
            session={session}
            onLogin={setSession}
            onLogout={() => setSession(null)}
          />
        )}

        {currentTab === 'logs' && (
          <LogViewer 
            logs={logs} 
            setLogs={setLogs} 
            settings={settings}
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
            onAddLog={handleAddNewLog}
          />
        )}

        {currentTab === 'agencies' && (
          <div className="space-y-6">
            <ServiceStatus 
              statuses={statuses} 
              setStatuses={setStatuses} 
              settings={settings}
              onAnnounce={handleAnnounce}
              playSound={playClickSound}
              onAddLog={handleAddNewLog}
            />

            <AgencyDirectory 
              settings={settings}
              onAnnounce={handleAnnounce}
              playSound={playClickSound}
            />
          </div>
        )}

        {currentTab === 'legal' && (
          <LegalDisclaimer 
            onAnnounce={handleAnnounce}
            playSound={playClickSound}
          />
        )}
          </>
        )}
      </main>

      {/* OFFICIAL GOVERNMENT DISCLOSURE COHESIVE FOOTER */}
      <footer 
        className={`w-full py-12 px-4 border-t ${
          settings.highContrast 
            ? 'bg-black text-white border-white/20' 
            : 'bg-slate-900 text-slate-400 border-slate-800'
        }`}
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            
            {/* Visual Logo Footer */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-500 text-sm">
                POND
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-sm">Pondco.online Flight-Cab Operations Core</h3>
                <span className="text-[10px] text-slate-500 block font-mono">SECTION 508 COMPLIANCE VERIFIED AA // 2026</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono justify-start md:justify-end">
              <button 
                onClick={() => {
                  handleAnnounce("Displaying Security and Privacy Disclosure policy statement."); 
                  playClickSound();
                }}
                className="hover:text-white underline"
              >
                Privacy &amp; Security Policy
              </button>
              <button 
                onClick={() => {
                  handleAnnounce("Displaying Freedom of Information Act (FOIA) procedures guidelines."); 
                  playClickSound();
                }}
                className="hover:text-white underline"
              >
                FOIA Disclosures
              </button>
              <button 
                onClick={() => {
                  handleAnnounce("Displaying Section 508 Accessibility accommodation directory."); 
                  playClickSound();
                }}
                className="hover:text-white underline"
              >
                Accessibility Accommodations
              </button>
              <button 
                onClick={() => {
                  handleAnnounce("Displaying standard legal Terms of Service agreement."); 
                  playClickSound();
                }}
                className="hover:text-white underline"
              >
                Terms of Use
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] leading-relaxed">
            <div>
              <p className="max-w-xl">
                This portal is provided as a public service interface. Communication and traffic packet headers transmitted over this digital access gateway are subject to automated monitoring logs in compliance with USA Title 44, Chapter 35. For privacy concerns regarding computer indexing logs, review our security privacy policy disclosure above.
              </p>
              <p className="mt-3 text-slate-500 font-mono">
                Bureau of Digital Services &bull; Registered System Gateway Code ID: BCS-USG-2026
              </p>
            </div>

            {/* SCREEN READER REAL-TIME CAPTION BAR - MASTERCLASS ACCESSIBILITY INTERACTIVE VALUE */}
            <div>
              <div className="bg-slate-950 p-4 rounded border border-white/15 text-white max-w-lg ml-auto space-y-1.5 font-mono shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold tracking-widest uppercase pb-1.5 border-b border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3 hover:scale-110 transition h-3" />
                    LIVE READING ASSISTANT OUTPUT SOUNDS
                  </span>
                  <span className="text-slate-500 tracking-normal text-[9px]">SPEECH_SIM: {settings.screenReaderActive ? 'ON' : 'OFF'}</span>
                </div>
                <p className="text-xs text-slate-200 font-mono italic leading-normal">
                  {settings.screenReaderActive 
                    ? `"${lastAnnouncement}"`
                    : '"Speech reader simulator is deactivated. Enable it from the utility header bar to visually monitor elements being narrated aloud as you hover or focus."'
                  }
                </p>
                {settings.screenReaderActive && (
                  <div className="flex gap-1 items-center pt-2 text-[9px] text-emerald-400 font-bold block animate-pulse">
                    <span>&bull;</span> CONNECTED TO SPEECH HANDSHAKE CORE DIRECT
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-slate-500 font-mono text-[10px] pt-4">
            &copy; 2026 Pond &amp; Co. Aviation Planning &bull; Interactive Presentation Mockup Sandbox.
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}
