import React, { useState } from 'react';
import { 
  FolderGit2, 
  Layers, 
  HelpCircle, 
  DollarSign, 
  FileCheck2, 
  Camera, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Plus, 
  ArrowUpRight, 
  Percent, 
  ShieldAlert, 
  Sparkles,
  ClipboardCheck,
  Wrench
} from 'lucide-react';
import { AccessibilitySettings, AuditLog } from '../types';

interface ProjectControlCenterProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

interface ProjectSprintTask {
  id: string;
  task: string;
  owner: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  predecessor?: string;
  weight: number;
}

interface ChangeOrder {
  id: string;
  requestNo: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  scopeImpact: string;
  costImpact: number;
  scheduleImpactDays: number;
}

export const ProjectControlCenter: React.FC<ProjectControlCenterProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  // Shared state of active tasks
  const [tasks, setTasks] = useState<ProjectSprintTask[]>([
    { id: 'TSK-201', task: 'Soil integrity survey dispatch - Jacqueline Cochran', owner: 'KSA Site Team', status: 'COMPLETED', weight: 15 },
    { id: 'TSK-202', task: 'Review core air traffic cab orientation parameters (FAA 6480.4B)', owner: 'Vance Chen', status: 'IN_PROGRESS', predecessor: 'TSK-201', weight: 25 },
    { id: 'TSK-203', task: 'Draft benefit-cost analysis calculation metrics report', owner: 'J. Martinez', status: 'IN_PROGRESS', weight: 20 },
    { id: 'TSK-204', task: 'Finalize DBE subconsultant contracting with Pape-Dawson group', owner: 'Sarah Connor', status: 'BLOCKED', weight: 15 },
    { id: 'TSK-205', task: 'Publish initial tower height rendering study', owner: 'Vance Chen', status: 'PENDING', predecessor: 'TSK-202', weight: 25 }
  ]);

  // Shared state of Change Orders
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([
    {
      id: 'CO-092',
      requestNo: 'CR-RIV-FV-01',
      status: 'APPROVED',
      scopeImpact: 'Addition of dedicated secondary radar telemetry lines for French Valley',
      costImpact: 145000,
      scheduleImpactDays: 14
    },
    {
      id: 'CO-093',
      requestNo: 'CR-RIV-JC-02',
      status: 'PENDING',
      scopeImpact: 'FAA Order 6480.4C regulatory sweep and extra cab height simulation loops',
      costImpact: 87500,
      scheduleImpactDays: 10
    }
  ]);

  // Workbook row interactive forms state
  const [wbProject, setWbProject] = useState('PRJ-RIV-TOWER');
  const [wbSector, setWbSector] = useState('SEC-AVIATION-CAB');
  const [wbLead, setWbLead] = useState('Vance Chen');
  const [wbComments, setWbComments] = useState('');
  const [wbVerificationChecked, setWbVerificationChecked] = useState(false);
  const [wbArtifactUrl, setWbArtifactUrl] = useState('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80');

  // Triggering new simulated change order request
  const [newCoScope, setNewCoScope] = useState('');
  const [newCoCost, setNewCoCost] = useState(45000);

  const handleCreateChangeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoScope.trim()) return;

    playSound();
    const newCo: ChangeOrder = {
      id: `CO-0${94 + changeOrders.length}`,
      requestNo: `CR-RIV-ADD-${changeOrders.length + 1}`,
      status: 'PENDING',
      scopeImpact: newCoScope,
      costImpact: newCoCost,
      scheduleImpactDays: 7
    };

    setChangeOrders(prev => [...prev, newCo]);
    setNewCoScope('');
    
    onAnnounce(`New Change Order ${newCo.requestNo} recorded successfully.`);
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'BUDGET',
      severity: 'INFO',
      message: `CHANGE ORDER PROPOSAL: Scope [${newCo.scopeImpact}] filed with budget impact $${newCo.costImpact}. Under regulatory executive review.`,
      operator: wbLead,
      ipAddress: '10.224.2.105'
    });
  };

  // Standup recap generator
  const [showStandupModal, setShowStandupModal] = useState(false);
  const triggerStandupRecap = () => {
    playSound();
    setShowStandupModal(true);
    onAnnounce('Standup recap summary opened.');
  };

  // Workbook certification submission
  const handleWorkbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wbVerificationChecked) {
      alert('Error: You must check the digital validation and certification box to sign off.');
      return;
    }

    playSound();
    onAnnounce('Configuration workbook certified and pushed to immutable audit registry.');
    
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'COMPLIANCE',
      severity: 'SUCCESS',
      message: `CONFIG WORKBOOK CERTIFIED: Lead [${wbLead}] signed off Sector [${wbSector}] rows. Certified under Project Code [${wbProject}]. Screenshot Evidence logged.`,
      operator: wbLead,
      ipAddress: '10.224.2.105'
    });

    alert(`Successfully Certified configuration workbook!\nProject: ${wbProject}\nSector: ${wbSector}\nVerifier: ${wbLead}\nComments: ${wbComments || 'None'}`);
    setWbComments('');
    setWbVerificationChecked(false);
  };

  // Change Task Status
  const handleToggleTaskStatus = (id: string, s: ProjectSprintTask['status']) => {
    playSound();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
    onAnnounce(`Task ${id} updated to ${s}`);
    
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'RECORDS',
      severity: 'INFO',
      message: `TASK REVISION: Project Item [${id}] status transitioned to [${s}].`,
      operator: wbLead,
      ipAddress: '10.224.2.105'
    });
  };

  const currentTheme = settings.highContrast 
    ? 'border-2 border-black bg-white text-black' 
    : 'bg-white border-slate-200';

  return (
    <div className="space-y-6" id="panel-project-controls" role="tabpanel" aria-labelledby="tab-project-controls">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-900 font-bold tracking-widest uppercase flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            PROJECT CONTROL CENTER
          </span>
          <h3 className="font-serif font-bold text-slate-900 text-lg mt-1">
            Operations &amp; Regulatory Delivery Desk
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans leading-normal">
            Track FAA-program design sprints, submit daily compliance logs, record contract change order impacts, and monitor stop-work thresholds.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Daily Standup Recapping Trigger */}
          <button
            onClick={triggerStandupRecap}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold rounded flex items-center gap-1 cursor-pointer transition shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            9:30 AM Daily Standup Recaps
          </button>
        </div>
      </div>

      {/* THREE SECTION GRID: 
          1. LIVE TASK GRID & SPRINT TRACKING
          2. EOD CONFIGURATION WORKBOOK SIGN-OFF
          3. CHANGE ORDERS & PAYMENT THRESHOLDS
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. SPRINT & TASKS TRACKING (COL-SPAN 2) */}
        <div className={`lg:col-span-2 space-y-6`}>
          
          {/* TASK LIST WRAPPER */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentTheme}`}>
            <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-900" />
                Airport Control Tower Sprint backlog
              </span>
              <span className="text-[10px] font-normal text-slate-400 capitalize">Sprint: 2026-AVI-ATCT-3</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px]">
                    <th className="pb-2 font-bold uppercase">ID</th>
                    <th className="pb-2 font-bold uppercase">Action Task</th>
                    <th className="pb-2 font-bold uppercase">Assigned Entity</th>
                    <th className="pb-2 font-bold uppercase text-center">Status</th>
                    <th className="pb-2 font-bold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {tasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-700">{t.id}</td>
                      <td className="py-3">
                        <div className="text-slate-900 font-semibold">{t.task}</div>
                        {t.predecessor && (
                          <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 py-0.2 rounded mt-1 inline-block">
                            Predecessor: {t.predecessor}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-slate-600">{t.owner}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                          t.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : t.status === 'IN_PROGRESS' 
                              ? 'bg-blue-100 text-blue-800' 
                              : t.status === 'BLOCKED' 
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-slate-100 text-slate-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleToggleTaskStatus(t.id, 'COMPLETED')}
                            title="Complete Task"
                            className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleTaskStatus(t.id, 'BLOCKED')}
                            title="Flag Blocker"
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHANGE ORDERS LOG */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentTheme}`}>
            <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" />
              Contract Scope &amp; Change Orders Registry
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CHANGE FORM */}
              <form onSubmit={handleCreateChangeOrder} className="md:col-span-1 space-y-3 p-3.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase block pb-1 border-b">Log Request</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-700">Scope Variance:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Extra geotechnical study" 
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white font-mono"
                    value={newCoScope}
                    onChange={(e) => setNewCoScope(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-700">Impact Value ($):</label>
                  <input 
                    type="number" 
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white font-mono"
                    value={newCoCost}
                    onChange={(e) => setNewCoCost(parseInt(e.target.value))}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-mono text-[10px] font-bold uppercase rounded cursor-pointer transition border border-transparent"
                >
                  Propose Scope Variance
                </button>
              </form>

              {/* LIVE REGISTRY LIST */}
              <div className="md:col-span-2 space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {changeOrders.map(co => (
                  <div key={co.id} className="p-3 bg-white border border-slate-200 rounded text-xs font-mono flex items-start justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <strong className="text-slate-800 font-extrabold">{co.requestNo} (ID: {co.id})</strong>
                        <span className={`px-1.5 py-0.2 text-[9px] rounded font-bold uppercase ${
                          co.status === 'APPROVED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {co.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-normal">{co.scopeImpact}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-amber-700 font-extrabold font-serif">${co.costImpact.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">+{co.scheduleImpactDays} Days</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* 2. EOD CONFIGURATION WORKBOOK (COL-SPAN 1) */}
        <div className="space-y-6">
          
          <div className={`p-6 rounded-lg border shadow-xs flex flex-col justify-between ${currentTheme}`}>
            <div>
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-4">
                <FileCheck2 className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-mono font-bold text-slate-700 uppercase">EOD Config Workbook Sign-Off</span>
              </div>

              <form onSubmit={handleWorkbookSubmit} className="space-y-3 text-xs font-mono">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[10px]">ACTIVE PROJECT KEY:</label>
                  <select 
                    value={wbProject} 
                    onChange={(e) => setWbProject(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="PRJ-RIV-TOWER">French Valley &amp; J. Cochran design program</option>
                    <option value="PRJ-FAA-SEC">FAA Security Standards Integration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[10px]">DEPARTMENT / SECTOR UNIT:</label>
                  <select 
                    value={wbSector} 
                    onChange={(e) => setWbSector(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="SEC-AVIATION-CAB">SEC-Aviation (Cab Orientation &amp; Height)</option>
                    <option value="SEC-GEOTECH">SEC-Geotechnology &amp; Foundations (KSA)</option>
                    <option value="SEC-COMPLIANCE">SEC-Audit &amp; Federal DBE Administration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[10px]">FUNCTIONAL LEAD CERTIFIER:</label>
                  <input 
                    type="text" 
                    value={wbLead}
                    onChange={(e) => setWbLead(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[10px]">STEPS TAKEN / AUDIT COMMONS:</label>
                  <textarea 
                    placeholder="Document rules modified, validation checklist outputs, or soil borehole results..."
                    value={wbComments}
                    onChange={(e) => setWbComments(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white font-sans"
                    required
                  />
                </div>

                {/* Simulated screenshot evidence */}
                <div className="space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                    <span>EVIDENCE ATTACHMENT:</span>
                    <span className="text-amber-600 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                      <Camera className="w-3 h-3" /> Sealed
                    </span>
                  </div>
                  <div className="flex gap-2 items-center text-[10px]">
                    <img 
                      src={wbArtifactUrl} 
                      alt="Telemetry diagram"
                      className="w-10 h-10 object-cover rounded border border-slate-300" 
                    />
                    <div>
                      <div className="font-bold font-mono text-slate-700 truncate max-w-[150px]">site_borehole_telemetry.png</div>
                      <span className="text-[9px] text-slate-400">Pushed to Cloud Storage bucket</span>
                    </div>
                  </div>
                </div>

                {/* Digital Verification Check */}
                <div className="flex items-start gap-2 p-2 bg-blue-50/50 border border-blue-150 rounded">
                  <input 
                    id="wb-cert" type="checkbox" className="w-4 h-4 text-blue-900 mt-0.5"
                    checked={wbVerificationChecked} onChange={(e) => setWbVerificationChecked(e.target.checked)}
                  />
                  <label htmlFor="wb-cert" className="text-[10px] text-slate-700 leading-normal cursor-pointer font-bold">
                    I certify this workbook entry is complete and follows Federal and Board of Supervisors audit procedures.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-750 hover:bg-emerald-800 text-white font-mono font-bold uppercase rounded cursor-pointer text-xs flex justify-center items-center gap-1"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Seal Workbook certification
                </button>

              </form>
            </div>
          </div>

          {/* STOP WORK WARNING & ESCALATION RULES */}
          <div className="p-4 rounded-lg bg-orange-950 text-orange-200 border border-orange-800/40 font-mono text-[10px] space-y-2">
            <div className="flex items-center gap-1.5 text-orange-400 font-extrabold uppercase text-xs">
              <ShieldAlert className="w-4 h-4 text-orange-500 animate-bounce" />
              Stop-Work / Payment Gate Policy
            </div>
            <p className="leading-relaxed">
              <strong>MANDATE TR-201-B</strong>: Active milestones under the Riverside PSA carry a 14-day formal cure limitation. In case of delayed regional payment releases, the PM agent triggers automatic review loops towards contract suspension safeguards.
            </p>
          </div>

        </div>

      </div>

      {/* 9:30 AM STANDUP RECAPS MODAL SIMULATOR */}
      {showStandupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-lg border shadow-xl space-y-4 relative ${
            settings.highContrast ? 'border-4 border-black bg-white text-black' : 'bg-slate-900 text-white border-slate-755'
          }`}>
            <div className="flex justify-between items-start pb-2 border-b border-slate-800">
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase">9:30 AM Daily standup meeting logs</span>
                <h4 className="text-base font-serif font-bold">Consolidated Aviation Sector Standups</h4>
              </div>
              <button 
                onClick={() => setShowStandupModal(false)}
                className="p-1 text-slate-400 hover:text-white font-mono text-sm uppercase cursor-pointer"
              >
                [ESC]
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs leading-normal">
              
              <div className="p-3 bg-slate-850 rounded border border-slate-800">
                <div className="flex justify-between text-slate-400 font-semibold text-[10px] mb-1">
                  <span>SECTOR: SEC-Aviation-Cab</span>
                  <span className="text-emerald-400">✓ Present</span>
                </div>
                <p className="text-slate-200">
                  <strong>Completed:</strong> Finalizing sightline analyses based on FAA Order JO 7110.65 runway orientation models.
                  <br /><strong>Prerequisite Blockers:</strong> Waiting for KSA group&apos;s site coordinates.
                </p>
              </div>

              <div className="p-3 bg-slate-850 rounded border border-slate-800">
                <div className="flex justify-between text-slate-400 font-semibold text-[10px] mb-1">
                  <span>SECTOR: SEC-Geotechnology (KSA)</span>
                  <span className="text-emerald-400">✓ Present</span>
                </div>
                <p className="text-slate-200">
                  <strong>Completed:</strong> Complete trenching and borehole sample catalogs at Jacqueline Cochran runway coordinates.
                  <br /><strong>Planned:</strong> Release coordinates and core bearing weights tomorrow morning.
                </p>
              </div>

            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowStandupModal(false)}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-mono text-xs font-bold uppercase rounded cursor-pointer"
              >
                Dismis Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
