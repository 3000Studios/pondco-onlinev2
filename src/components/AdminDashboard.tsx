import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  Sliders, 
  Key, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Users, 
  Fingerprint, 
  Eye, 
  Cpu, 
  Save, 
  HelpCircle,
  Database,
  Radio,
  SlidersHorizontal,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AccessibilitySettings, AuditLog, UserSession, ServiceStatusItem } from '../types';
import { SectorItem } from './SectorProcessFlows';

export interface AdminDashboardProps {
  settings: AccessibilitySettings;
  session: UserSession | null;
  sectors: SectorItem[];
  setSectors: (sectors: SectorItem[]) => void;
  notePermissions: Record<string, 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN'>;
  setNotePermissions: (perms: Record<string, 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN'>) => void;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  statuses: ServiceStatusItem[];
  setStatuses: React.Dispatch<React.SetStateAction<ServiceStatusItem[]>>;
  onSwitchUserClearance?: (clearance: 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN') => void;
}

const CLEARANCE_LEVELS = [
  { id: 'CITIZEN', label: 'Citizen (L1)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'CIVIL_ANALYST', label: 'Civil Analyst (L2)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'REGISTRY_AUDITOR', label: 'Registry Auditor (L3)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'SYSTEM_ADMIN', label: 'System Admin (L4)', color: 'bg-rose-100 text-rose-800 border-rose-200' }
] as const;

const CLEARANCE_HIERARCHY: Record<string, number> = {
  'CITIZEN': 1,
  'CIVIL_ANALYST': 2,
  'REGISTRY_AUDITOR': 3,
  'SYSTEM_ADMIN': 4
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  session,
  sectors,
  setSectors,
  notePermissions,
  setNotePermissions,
  onAnnounce,
  playSound,
  onAddLog,
  statuses,
  setStatuses,
  onSwitchUserClearance
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'parameters' | 'permissions' | 'global_controls' | 'operators'>('parameters');
  const [selectedSecId, setSelectedSecId] = useState<string>('sector-atc');
  const [editingParams, setEditingParams] = useState<Record<string, string | number>>({});
  const [editingNotes, setEditingNotes] = useState<string>('');
  
  const isAdmin = session?.clearanceLevel === 'SYSTEM_ADMIN' || session?.email === 'mr.jwswain@gmail.com';

  // Local master override code for the admin workspace
  const [overridePasscodeInput, setOverridePasscodeInput] = useState<string>('');
  const [isWorkspaceUnlocked, setIsWorkspaceUnlocked] = useState<boolean>(() => {
    return session?.clearanceLevel === 'SYSTEM_ADMIN';
  });
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Automatically unlock space if user session clearance matches SYSTEM_ADMIN
  useEffect(() => {
    if (session?.clearanceLevel === 'SYSTEM_ADMIN') {
      setIsWorkspaceUnlocked(true);
    }
  }, [session]);

  const activeSector = sectors.find(s => s.id === selectedSecId) || sectors[0];

  // Keep the intermediate parameter form inputs updated when the sector changes
  useEffect(() => {
    if (activeSector) {
      setEditingNotes(activeSector.notes);
      const paramMap: Record<string, string | number> = {};
      activeSector.parameters.forEach(p => {
        paramMap[p.key] = p.value;
      });
      setEditingParams(paramMap);
    }
  }, [selectedSecId, sectors]);

  const handleOverrideLockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (overridePasscodeInput.trim() === 'ADMIN508-BYPASS' || overridePasscodeInput.trim() === 'POND-SYSTEMS-2026') {
      setIsWorkspaceUnlocked(true);
      setPasscodeError('');
      onAnnounce('Clearance verification succeeded. Security matrix and threshold controls decrypted.');
      playSound();
      
      onAddLog({
        agency: 'Pond Systems Security Gate',
        category: 'SECURITY',
        severity: 'SUCCESS',
        message: 'ADMIN WORKSPACE DECRYPTION SUCCESS: Master bypass code validated from secure terminal. Cryptographic control blocks released.',
        operator: session?.username || 'ANONYMOUS_OPERATOR',
        ipAddress: '10.224.4.99'
      });
    } else {
      setPasscodeError('Error: Access code does not match active flight-cab authority files.');
      onAnnounce('Clearance verification failed. Access denied.');
      playSound();
    }
  };

  const handleSimulatedClearanceChange = (level: typeof CLEARANCE_LEVELS[number]['id']) => {
    if (onSwitchUserClearance) {
      onSwitchUserClearance(level);
      onAnnounce(`Simulated clearance escalated or realigned to ${level}.`);
      playSound();
    }
  };

  // Check if current user session has enough clearance to edit notes according to NotePermissions
  const activeUserClearance = session?.clearanceLevel || 'CITIZEN';
  const requiredClearanceForActiveNotes = notePermissions[activeSector.id] || 'SYSTEM_ADMIN';
  const hasAccessToEditActiveNotes = CLEARANCE_HIERARCHY[activeUserClearance] >= CLEARANCE_HIERARCHY[requiredClearanceForActiveNotes];

  // Modify individual parameter value input
  const handleValueChange = (key: string, val: string | number) => {
    setEditingParams(prev => ({ ...prev, [key]: val }));
  };

  // Toggle Parameter Bypass
  const handleToggleBypass = (paramKey: string) => {
    if (!isWorkspaceUnlocked) {
      onAnnounce('Bypass toggle locked. Please authenticate Workspace above.');
      playSound();
      return;
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === activeSector.id) {
        let hasAnyBypassed = false;
        const updatedParams = sec.parameters.map(p => {
          if (p.key === paramKey) {
            const nextBypassed = !p.isBypassed;
            if (nextBypassed) hasAnyBypassed = true;
            return { ...p, isBypassed: nextBypassed };
          }
          if (p.isBypassed) hasAnyBypassed = true;
          return p;
        });

        let nextStatus: SectorItem['status'] = 'ONLINE';
        if (hasAnyBypassed) {
          nextStatus = 'BYPASSED';
        } else if (sec.id === 'sector-eco') {
          nextStatus = 'ALERT';
        }

        const toggledParam = sec.parameters.find(p => p.key === paramKey);
        onAddLog({
          agency: sec.name,
          category: 'SECURITY',
          severity: toggledParam?.isBypassed ? 'INFO' : 'WARNING',
          message: `CRITERION OVERRIDE: ${toggledParam?.label} (${paramKey}) has been ${toggledParam?.isBypassed ? 'RESTORED to compliance standard' : 'BYPASSED by administrative authority'}.`,
          operator: session?.username || 'SYSTEM_ADMIN',
          ipAddress: '10.224.4.15'
        });

        return {
          ...sec,
          parameters: updatedParams,
          status: nextStatus
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    localStorage.setItem('civil_portal_sectors_state', JSON.stringify(updatedSectors));
    onAnnounce(`Bypass condition toggled for threshold ID ${paramKey}.`);
    playSound();
  };

  // Save Sector Notes & Parameters
  const handleCommitChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWorkspaceUnlocked) {
      onAnnounce('Commit rejected. Please authenticate Workspace first.');
      playSound();
      return;
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === activeSector.id) {
        // Map parameter edits
        const updatedParams = sec.parameters.map(p => {
          const edited = editingParams[p.key];
          if (edited !== undefined) {
            if (p.type === 'number' && typeof edited === 'number') {
              const bounded = Math.max(p.min ?? 0, Math.min(p.max ?? 99999, edited));
              return { ...p, value: bounded };
            }
            return { ...p, value: edited };
          }
          return p;
        });

        // Check if notes are edited & permission is allowed
        const nextNotes = hasAccessToEditActiveNotes ? editingNotes : sec.notes;

        return {
          ...sec,
          notes: nextNotes,
          parameters: updatedParams
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    localStorage.setItem('civil_portal_sectors_state', JSON.stringify(updatedSectors));
    
    onAnnounce(`Administrative stamp applied to ${activeSector.name}. Variables registered.`);
    playSound();

    onAddLog({
      agency: activeSector.name,
      category: 'RECORDS',
      severity: 'SUCCESS',
      message: `COMPLIANCE OVERRIDE SEALED: Administrative thresholds altered for design variables in sector [${activeSector.code}]. Notes modified: ${hasAccessToEditActiveNotes ? 'YES' : 'NO (PASSED DUE TO INSUFFICIENT LEVEL)'}.`,
      operator: session?.username || 'OPERATOR_DESK',
      ipAddress: '10.224.4.15'
    });
  };

  // Manage notes permissions setter
  const handlePermissionChange = (sectorId: string, level: 'CITIZEN' | 'CIVIL_ANALYST' | 'REGISTRY_AUDITOR' | 'SYSTEM_ADMIN') => {
    const updated = {
      ...notePermissions,
      [sectorId]: level
    };
    setNotePermissions(updated);
    localStorage.setItem('civil_portal_note_permissions', JSON.stringify(updated));
    onAnnounce(`Note adjustment clearance for ${sectorId} raised to ${level}.`);
    playSound();

    onAddLog({
      agency: 'Pond Security Administration',
      category: 'SECURITY',
      severity: 'WARNING',
      message: `ACCESS PERMISSION MATRIX AMENDED: Sector [${sectorId}] now restricts notes adjustment to clearance level [${level}] and higher.`,
      operator: session?.username || 'SYSTEM_ADMIN',
      ipAddress: '127.0.0.1'
    });
  };

  // Global diagnostics controls triggers
  const handleGlobalStatusShift = (statusId: string, command: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE') => {
    const updated = statuses.map(s => {
      if (s.id === statusId) {
        return {
          ...s,
          status: command,
          latency: command === 'ONLINE' ? '12ms' : command === 'DEGRADED' ? '650ms' : '0ms',
          lastChecked: 'Just now'
        };
      }
      return s;
    });
    setStatuses(updated);
    onAnnounce(`Server state command executed: ${statusId} status shifted to ${command}.`);
    playSound();

    onAddLog({
      agency: 'FAA Central Integration Core',
      category: 'SYSTEM',
      severity: command === 'ONLINE' || command === 'MAINTENANCE' ? 'INFO' : 'ERROR',
      message: `GLOBAL DIAGNOSTIC COMMAND EXECUTION: Node telemetry status for server code [${statusId}] shifted to ${command} by administrative console override.`,
      operator: session?.username || 'SYSTEM_ADMIN',
      ipAddress: '10.224.4.12'
    });
  };

  return (
    <div id="panel-admin-dashboard" className="space-y-6" role="tabpanel" aria-labelledby="tab-admin-dashboard">
      
      {/* SECTION HEADER BAR */}
      <div className={`p-6 rounded-lg border shadow-sm ${
        settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-mono tracking-widest font-bold text-amber-500 uppercase">
                Pond Administrative clearance gate
              </span>
            </div>
            <h2 className="text-2xl font-serif font-extrabold tracking-tight">
              Aviation Operations &amp; Criteria Control Console
            </h2>
            <p className={`text-xs ${settings.highContrast ? 'text-black' : 'text-slate-400'} leading-normal`}>
              Administrative dashboard for viewing and editing flight-cab telemetry inputs, wind limits, and note security protocols.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-mono rounded font-bold uppercase flex items-center gap-1.5 border ${
              isWorkspaceUnlocked 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isWorkspaceUnlocked ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isWorkspaceUnlocked ? 'Matrix Decrypted' : 'Matrix Sealed (L4 Required)'}
            </span>
            <span className="px-2 py-1 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              Uptime Check: 100% Secure
            </span>
          </div>
        </div>

        {/* SECURITY ACCORDION INSTRUCTIONS / BYPASS TERMINAL BOX */}
        {!isWorkspaceUnlocked && (
          <div className={`mt-5 p-4 rounded border text-xs leading-relaxed ${
            settings.highContrast ? 'border-2 border-black bg-slate-50' : 'bg-slate-950 border-amber-500/30 text-slate-300'
          }`}>
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-3 w-full">
                <div>
                  <h3 className="font-bold font-serif text-slate-100 text-sm">Administrative Console Encryption Shield</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    To prevent accidental parameter shifts on French Valley &amp; Jacqueline Cochran telemetry systems, this console requires a <strong>SYSTEM_ADMIN</strong> login or an active <strong>Flight-Cab Master Passcode</strong>.
                  </p>
                </div>
                
                <form onSubmit={handleOverrideLockIn} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <div className="relative flex-1">
                    <input 
                      id="passcode-input"
                      type="password"
                      placeholder="Enter Authority Passcode (e.g., ADMIN508-BYPASS)"
                      className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      value={overridePasscodeInput}
                      onChange={(e) => setOverridePasscodeInput(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    id="submit-decryption-code"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs tracking-wider uppercase transition cursor-pointer shrink-0"
                  >
                    Authorize Workspace
                  </button>
                </form>

                {passcodeError && (
                  <p className="text-red-400 font-mono text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    {passcodeError}
                  </p>
                )}

                <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 flex items-center gap-2">
                  <span className="font-bold uppercase text-amber-500">Security Tip:</span>
                  <span>Use pre-authorized bypass token <strong>ADMIN508-BYPASS</strong> to immediately inspect.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEMONSTRATION SIMULATOR PANEL FOR EXPERIMENTS */}
        <div className={`mt-4 p-3 rounded text-xs flex flex-col md:flex-row items-stretch justify-between gap-3 ${
          settings.highContrast ? 'border border-black bg-slate-50' : 'bg-slate-800/50 border-slate-700/60'
        }`}>
          <div className="space-y-1 flex-1">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-400">
              <Users className="w-4 h-4 text-amber-400" />
              Role Clearance Simulator Desk
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Toggle your simulated persona clearance below on-the-fly to test access conditions. The currently selected user session translates actions based on these rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-center">
            {CLEARANCE_LEVELS.map((level) => {
              const isActive = session?.clearanceLevel === level.id;
              return (
                <button
                  key={level.id}
                  id={`sim-btn-${level.id}`}
                  onClick={() => handleSimulatedClearanceChange(level.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border transition cursor-pointer ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-sm scale-102' 
                      : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION INTEGRATION TABS */}
      <div className="flex border-b border-slate-200">
        <button
          id="btn-tab-params"
          onClick={() => { setActiveSubTab('parameters'); playSound(); }}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeSubTab === 'parameters'
              ? 'border-blue-900 text-blue-900 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Criteria Overrides &amp; Inputs
        </button>
        <button
          id="btn-tab-permissions"
          onClick={() => { setActiveSubTab('permissions'); playSound(); }}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeSubTab === 'permissions'
              ? 'border-blue-900 text-blue-900 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          Maturity Lock Matrices
        </button>
        <button
          id="btn-tab-diagnostics"
          onClick={() => { setActiveSubTab('global_controls'); playSound(); }}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeSubTab === 'global_controls'
              ? 'border-blue-900 text-blue-900 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Global Telemetry Forcing
        </button>

        {isAdmin && (
          <button
            id="btn-tab-operators"
            onClick={() => { setActiveSubTab('operators'); playSound(); }}
            className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeSubTab === 'operators'
                ? 'border-blue-900 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Operator Master Directory
          </button>
        )}
      </div>

      {/* SUB PANELS CONTENT CORES */}
      {activeSubTab === 'parameters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTOR LIST COLUMN SELECTOR */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-[10px] font-mono tracking-widest font-bold text-slate-400 block uppercase">
              Select Sector Node
            </span>
            <div className="flex flex-col gap-2">
              {sectors.map((sec) => {
                const isSelected = sec.id === selectedSecId;
                const statusColors = {
                  ONLINE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  BYPASSED: 'bg-amber-100 text-amber-800 border-amber-200',
                  ALERT: 'bg-rose-100 text-rose-800 border-rose-200'
                };
                return (
                  <button
                    key={sec.id}
                    id={`sec-select-${sec.id}`}
                    onClick={() => { setSelectedSecId(sec.id); playSound(); }}
                    className={`p-3 rounded-lg border text-left flex items-start justify-between gap-3 transition cursor-pointer ${
                      isSelected
                        ? (settings.highContrast ? 'border-2 border-black bg-slate-100' : 'bg-blue-50/50 border-blue-900 shadow-xs')
                        : (settings.highContrast ? 'border border-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
                        {sec.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">
                        CODE: {sec.code}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold uppercase border shrink-0 ${statusColors[sec.status]}`}>
                      {sec.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SECTOR NOTE PRIVILEGE QUICK STAT CARD */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs">
              <h5 className="font-serif font-bold text-slate-800">
                Active Clearance Matrix Matches
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-150">
                  <span className="text-slate-500">Your Current Level:</span>
                  <span className="font-mono font-bold text-indigo-900">{activeUserClearance}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-150">
                  <span className="text-slate-500">Required Level for Notes:</span>
                  <span className="font-mono font-bold text-slate-700">{requiredClearanceForActiveNotes}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-150">
                  <span className="text-slate-500">Write Permission Granted:</span>
                  <span className={`font-mono font-bold ${hasAccessToEditActiveNotes ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {hasAccessToEditActiveNotes ? 'GRANTED' : 'RESTRICTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE SECTOR EDITING CHASSIS */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCommitChanges} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              
              <div className="p-4 sm:p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-900" />
                    Modify {activeSector.name} Inputs
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    System Node: {activeSector.code} &bull; Inspector Officer: {activeSector.inspector}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold">
                  OVERRIDE PORTAL
                </span>
              </div>

              {/* EDITS FORM CORE */}
              <div className="p-4 sm:p-6 space-y-6">

                {/* NOTES ADJUSTMENTS FIELD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <label htmlFor="active-sec-notes-field" className="text-xs font-serif font-bold text-slate-800 block">
                      Sector Operational Notes
                    </label>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition block ${
                      hasAccessToEditActiveNotes 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-800 border border-rose-100'
                    }`}>
                      {hasAccessToEditActiveNotes ? 'Write Access Granted' : `Locked: Requires ${requiredClearanceForActiveNotes}+`}
                    </span>
                  </div>

                  {hasAccessToEditActiveNotes ? (
                    <div className="space-y-1">
                      <textarea
                        id="active-sec-notes-field"
                        rows={3}
                        className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded font-sans focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none leading-relaxed"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        disabled={!isWorkspaceUnlocked}
                      />
                      <p className="text-[10px] text-slate-400">
                        Operational description saved upon clicking "Commit and Seal" below.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50/40 border border-rose-150 rounded leading-relaxed text-xs text-slate-600 block">
                      <div className="font-bold font-serif text-slate-800 mb-0.5">Read-Only Safety Lock Initiated</div>
                      <p className="text-[11px] text-slate-600">
                        "{activeSector.notes}"
                      </p>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        Increase simulated clearance level to <strong>{requiredClearanceForActiveNotes}</strong> or higher to amend sector logs.
                      </div>
                    </div>
                  )}
                </div>

                {/* PARAMETERS LIST GRID */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="text-xs font-serif font-bold text-slate-800">
                      Telemetry Input Threshold Parameters
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeSector.parameters.length} Variables Configured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeSector.parameters.map((p) => {
                      const inputVal = editingParams[p.key] ?? p.value;
                      
                      return (
                        <div 
                          key={p.key} 
                          className={`p-3 rounded border text-xs font-mono transition-all duration-200 ${
                            p.isBypassed 
                              ? 'bg-amber-500/5 border-amber-300/80 shadow-3xs' 
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <div>
                              <div className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                {p.label}
                                {p.isBypassed && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase font-bold bg-amber-400 text-slate-950">
                                    Bypassed
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                COMPLIANCE VARIABLE: {p.key}
                              </span>
                            </div>

                            {/* TOGGLE BYPASS PIN BUTTON */}
                            <button
                              type="button"
                              id={`toggle-bypass-${p.key}`}
                              disabled={!isWorkspaceUnlocked}
                              onClick={() => handleToggleBypass(p.key)}
                              className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition cursor-pointer flex items-center gap-1 shrink-0 ${
                                p.isBypassed
                                  ? 'bg-amber-400 border-amber-500 text-slate-950 hover:bg-amber-500'
                                  : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <Unlock className="w-3 h-3 shrink-0" />
                              {p.isBypassed ? 'Active Bypass Engaged' : 'Permit Override'}
                            </button>
                          </div>

                          {/* DYNAMIC FIELD EDITOR FOR PARAMETER VALUES */}
                          <div className="flex items-center gap-2 max-w-sm mt-1">
                            {p.type === 'number' ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  id={`param-input-${p.key}`}
                                  type="number"
                                  min={p.min ?? 0}
                                  max={p.max ?? 9999}
                                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
                                  value={inputVal}
                                  disabled={!isWorkspaceUnlocked}
                                  onChange={(e) => handleValueChange(p.key, parseFloat(e.target.value) || 0)}
                                />
                                {p.unit && <span className="text-[10px] text-slate-400">{p.unit}</span>}
                                <span className="text-[9px] text-slate-400 italic font-sans">
                                  Bounds: ({p.min} to {p.max})
                                </span>
                              </div>
                            ) : p.type === 'text' ? (
                              <input
                                id={`param-input-${p.key}`}
                                type="text"
                                className="w-full max-w-xs px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800 font-mono"
                                value={inputVal}
                                disabled={!isWorkspaceUnlocked}
                                onChange={(e) => handleValueChange(p.key, e.target.value)}
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* SAVE / COMMIT PANEL BUTTON FOOTER */}
              <div className="p-4 sm:p-5 border-t border-slate-150 bg-slate-50 flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Info className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Stamping updates immediately appends an audit record to public registries.</span>
                </div>

                <button
                  type="submit"
                  id="admin-commit-thresholds-btn"
                  disabled={!isWorkspaceUnlocked}
                  className={`px-4 py-2 bg-blue-950 hover:bg-slate-900 text-white font-bold rounded text-xs gap-1.5 flex items-center shadow-xs transition uppercase ${
                    isWorkspaceUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4 text-amber-500" />
                  Commit &amp; Seal Thresholds
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* MATRIX ACCESS PERMISSIONS ADJUSTMENT CORE */}
      {activeSubTab === 'permissions' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-blue-900" />
              Notes Security &amp; Access Clearance Administrator
            </h3>
            <p className="text-xs text-slate-600 leading-normal">
              Assign minimum clearance level requirements required to edit operational notes in individual planning zones. Higher clearance guarantees more strict physical sign-offs on airfields before layouts or telemetry modifications occur.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table id="tbl-clearance-levels" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 tracking-wider">
                    <th className="p-4 font-bold">Planned Sector Info</th>
                    <th className="p-4 font-bold">Registry Code</th>
                    <th className="p-4 font-bold">Current Required Notes Level</th>
                    <th className="p-4 font-bold">Adjust Access Permission</th>
                    <th className="p-4 font-bold">Security Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sectors.map((sec) => {
                    const currentReq = notePermissions[sec.id] || 'SYSTEM_ADMIN';
                    
                    return (
                      <tr key={sec.id} className="hover:bg-slate-50/40">
                        <td className="p-4">
                          <div>
                            <span className="font-serif font-bold text-slate-900 block">{sec.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{sec.inspector}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-900">
                          {sec.code}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded font-mono font-bold text-[10px] uppercase border ${
                            currentReq === 'SYSTEM_ADMIN' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            currentReq === 'REGISTRY_AUDITOR' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            currentReq === 'CIVIL_ANALYST' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {currentReq}+ Required
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            id={`permission-select-${sec.id}`}
                            className="bg-white border border-slate-300 rounded p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-900 text-[11px] font-sans"
                            value={currentReq}
                            disabled={!isWorkspaceUnlocked}
                            onChange={(e) => handlePermissionChange(sec.id, e.target.value as any)}
                          >
                            <option value="CITIZEN">Citizen Level (L1+)</option>
                            <option value="CIVIL_ANALYST">Civil Analyst (L2+)</option>
                            <option value="REGISTRY_AUDITOR">Registry Auditor (L3+)</option>
                            <option value="SYSTEM_ADMIN">System Admin (L4+)</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-slate-500">
                            {currentReq === 'SYSTEM_ADMIN' ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>High Restriction</span>
                              </>
                            ) : currentReq === 'REGISTRY_AUDITOR' ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Medium Restriction</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Standard Safe</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECURITY GUIDELINE ADVISORY */}
            <div className="p-4 bg-slate-900 text-white font-serif border-t border-slate-800 flex items-start gap-3 text-xs leading-normal">
              <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-500 font-mono tracking-wider text-[10px] block uppercase">
                  Audit Sign-Off Directives
                </span>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  Under FAA Order JO 7210.78, notes altered on active control tower operations must trace back to verified agents. Lowering security clearance below <strong>REGISTRY_AUDITOR (L3)</strong> for French Valley and Jacqueline Cochran airspaces can lead to telemetry discrepancies. Keep active oversight locked in.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DIAGNOSTIC FORCING CONTROL CONSOLE */}
      {activeSubTab === 'global_controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ACTIVE STATUS TELEMETRY CONTROL PANEL */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Radio className="w-4 h-4 text-blue-900" />
                Live Node Status Diag Interceptor
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Force telemetry status levels of crucial API nodes on Jacqueline Cochran Regional Airport or secondary FAA hubs to test downstream response matrices.
              </p>
            </div>

            <div className="space-y-3.5">
              {statuses.map(st => {
                return (
                  <div key={st.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block font-serif">{st.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">CODE: {st.code} &bull; UPTIME: {st.uptime}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-mono font-bold border ${
                        st.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                        st.status === 'DEGRADED' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                        st.status === 'MAINTENANCE' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                        'bg-slate-200 text-slate-800 border-slate-300'
                      }`}>
                        {st.status}
                      </span>
                    </div>

                    {/* CONTROLS COMMANDS */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        id={`btn-force-online-${st.id}`}
                        disabled={!isWorkspaceUnlocked || st.status === 'ONLINE'}
                        onClick={() => handleGlobalStatusShift(st.id, 'ONLINE')}
                        className="px-2 py-0.5 text-[9px] font-mono bg-white hover:bg-slate-100 text-emerald-700 border border-slate-200 rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Force Online
                      </button>
                      <button
                        type="button"
                        id={`btn-force-degraded-${st.id}`}
                        disabled={!isWorkspaceUnlocked || st.status === 'DEGRADED'}
                        onClick={() => handleGlobalStatusShift(st.id, 'DEGRADED')}
                        className="px-2 py-0.5 text-[9px] font-mono bg-white hover:bg-slate-100 text-amber-600 border border-slate-200 rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Degrade
                      </button>
                      <button
                        type="button"
                        id={`btn-force-offline-${st.id}`}
                        disabled={!isWorkspaceUnlocked || st.status === 'OFFLINE'}
                        onClick={() => handleGlobalStatusShift(st.id, 'OFFLINE')}
                        className="px-2 py-0.5 text-[9px] font-mono bg-white hover:bg-slate-100 text-rose-700 border border-slate-200 rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Down/Offline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIMULATION SUMMARY REPORT BOX */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 sm:p-5 border border-slate-800 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-amber-500 tracking-wider font-bold uppercase block">
                  INTEGRITY SEALS STATUS
                </span>
                <h4 className="font-serif font-bold text-white text-base">
                  Operations Cryptographic Log Summary
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Whenever an administrator bypasses a safety gate check, alters a wind velocity warning threshold, or enforces security changes on notes access, the transaction gets digitally sealed. These stamps guarantee that third-party entities can verify regulatory compliance at any moment.
                </p>

                <div className="bg-slate-950 p-3 rounded font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Audit Registry Code:</span>
                    <span className="text-emerald-500">REV-ARC-2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sealed Security Mode:</span>
                    <span className="text-indigo-400">Zero Trust TLS 1.3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authorized IP Space Range:</span>
                    <span className="text-slate-400">10.224.*.* Approved</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Security Gate Sentinel: Active</span>
                <button
                  type="button"
                  id="btn-trigger-diagnostics-reset"
                  disabled={!isWorkspaceUnlocked}
                  onClick={() => {
                    onAnnounce('Hard database diagnostics reload simulated.');
                    playSound();
                  }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[9px] uppercase font-mono font-bold hover:text-white hover:bg-slate-700 transition disabled:opacity-40"
                >
                  Hard Reload Database
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* OPERATORS MASTER DIRECTORY PANEL */}
      {activeSubTab === 'operators' && isAdmin && (
        <div className="space-y-6 animate-fadeIn" id="operators-directory-panel">
          
          {/* SECURITY WARNING BANNER */}
          <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-left">
              <span className="text-[9.5px] font-mono tracking-widest text-amber-500 font-bold uppercase block">
                🔐 AUTHORIZED ENCRYPTED DIRECTORY (L4 REGISTRY CLASSIFICATION)
              </span>
              <h4 className="text-base font-serif font-bold text-white tracking-tight">
                Secure Operator &amp; Inspector Contact Register
              </h4>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed font-sans">
                As the authenticated System Admin (<strong className="text-blue-400 font-mono font-bold">{session?.email}</strong>), you are granted clearance level credentials to view this contact register.
              </p>
            </div>
            
            <div className="px-3 py-1.5 bg-slate-950 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-mono tracking-wider font-bold shrink-0">
              VERIFIED: SYSTEM_ADMIN privileges active
            </div>
          </div>

          {/* GRID OF OPERATORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { name: 'Mr. J.W. Swain', email: 'mr.jwswain@gmail.com', role: 'System Owner & Principal Sponsor', badge: 'OWNER (L4)', color: 'bg-red-500', phone: '+1 (555) 019-2842', sector: 'All Siting Quadrants', status: 'ONLINE', bgClass: 'from-rose-950/10 to-transparent border-rose-500/30' },
              { name: 'Kyle Freedman', email: 'kyle.freedman@pondco.com', role: 'Engineering Lead & Project Architect', badge: 'SYS ADMIN (L4)', color: 'bg-amber-500', phone: '+1 (555) 012-9284', sector: 'System Core Controls', status: 'ONLINE', bgClass: 'from-amber-950/10 to-transparent border-amber-500/30' },
              { name: 'Sarah Vance', email: 's.vance@pondco.com', role: 'Lead Operations & Airfield Analyst', badge: 'REGISTRY AUDITOR (L3)', color: 'bg-blue-500', phone: '+1 (555) 015-3841', sector: 'ATC Operations & Height Clearance', status: 'ONLINE', bgClass: 'from-blue-950/10 to-transparent border-blue-500/30' },
              { name: 'Marcus Harrison', email: 'm.harrison@pondco.com', role: 'Project Coordinator & Siting Lead', badge: 'REGISTRY AUDITOR (L3)', color: 'bg-purple-500', phone: '+1 (555) 014-9128', sector: 'Acquisition & Siting', status: 'STANDBY', bgClass: 'from-purple-950/10 to-transparent border-purple-500/30' },
              { name: 'Joanna O\'Connor', email: 'j.oconnor@pondco.com', role: 'Geotechnical & Borehole Inspector', badge: 'REGISTRY AUDITOR (L3)', color: 'bg-emerald-500', phone: '+1 (555) 017-7321', sector: 'Compaction & Civil Geotech', status: 'OFFLINE', bgClass: 'from-slate-900/15 to-transparent border-slate-700/30' },
              { name: 'Client Sponsor', email: 'client@pondco.online', role: 'Riverside Supervisor Liaison', badge: 'CITIZEN SPONSOR (L1)', color: 'bg-indigo-500', phone: '+1 (555) 011-1084', sector: 'Client Deliverables Monitor', status: 'STANDBY', bgClass: 'from-indigo-950/10 to-transparent border-indigo-500/30' }
            ].map((op, idx) => (
              <div 
                key={idx} 
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5 flex flex-col justify-between gap-4 shadow-sm bg-gradient-to-br ${op.bgClass} hover:shadow-md transition-all duration-200`}
                id={`operator-card-${idx}`}
              >
                <div className="space-y-3">
                  {/* Profile line row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-full ${op.color} text-white font-bold flex items-center justify-center text-sm font-sans tracking-tight uppercase shadow-2xs`}>
                        {op.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white font-serif">{op.name}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-normal">{op.role}</p>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-mono tracking-widest bg-slate-950 text-white font-bold px-2 py-0.5 rounded uppercase shrink-0 border border-white/5">
                      {op.badge}
                    </span>
                  </div>

                  <hr className="border-slate-200/50 dark:border-slate-800/60" />

                  {/* Parameters */}
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase text-[9px] font-mono">Simulated Workspace:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{op.sector}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase text-[9px] font-mono">Routing Line:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{op.phone}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 uppercase text-[9px] font-mono">Sim Link Status:</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          op.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' :
                          op.status === 'STANDBY' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`} />
                        <span className="text-[10px] font-bold font-mono tracking-wider">{op.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email container row */}
                <div className="bg-slate-50 dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800/60 rounded p-2 flex items-center justify-between text-[11px]">
                  <div className="truncate font-mono text-slate-600 dark:text-sky-305 font-bold select-all overflow-hidden max-w-[180px]">
                    {op.email}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(op.email);
                      onAnnounce(`Copied email to clipboard buffer: ${op.email}`);
                      playSound();
                    }}
                    className="p-1 px-1.5 rounded bg-blue-50 hover:bg-blue-105/90 text-blue-900 border border-blue-200 dark:bg-slate-800 dark:text-white dark:border-transparent font-mono text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                    title="Copy operator email"
                  >
                    COPY
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
