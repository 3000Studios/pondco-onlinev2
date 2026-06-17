import React from 'react';
import { 
  Milestone, 
  MapPin, 
  Check, 
  ChevronRight, 
  Percent, 
  Download, 
  DollarSign, 
  HelpCircle, 
  PhoneCall, 
  ShieldAlert, 
  FileCheck,
  Award
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface ClientProgressViewProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
}

export const ClientProgressView: React.FC<ClientProgressViewProps> = ({
  settings,
  onAnnounce,
  playSound
}) => {
  // Mock Progress Phases (Sourced from Master Plan / FAA guidelines)
  const phases = [
    {
      id: 'PH-1',
      name: 'Phase I: Geotechnical Boreholes & Soil Survey',
      status: 'VERIFIED',
      desc: 'Soil compaction boreholes at Jacqueline Cochran runway coordinates. Bearing threshold evaluated and certified at 4,500 PSF.',
      completion: 100,
      badge: 'Completed April 2026'
    },
    {
      id: 'PH-2',
      name: 'Phase II: Cab Height & Airspace Visibility Study',
      status: 'VERIFIED',
      desc: 'Determination of runway threshold sightlines under FAA Order 6480.4B. Recommended tower height set to 84 feet.',
      completion: 100,
      badge: 'Completed May 2026'
    },
    {
      id: 'PH-3',
      name: 'Phase III: Bid Administration & DBE Contracting',
      status: 'IN_PROGRESS',
      desc: 'Contracting partner reviews with Pape-Dawson and KSA site groups. DBE quota validation checklist in actively open state.',
      completion: 72,
      badge: 'Active & Audited'
    },
    {
      id: 'PH-4',
      name: 'Phase IV: Airfield Construction Oversight & Tower Commissions',
      status: 'PENDING',
      desc: 'Excavation management, dewatering operations audit, and final physical cab certification handover to FAA Contract Tower inspectors.',
      completion: 0,
      badge: 'Future Target'
    }
  ];

  // Approved Deliverables list
  const deliverables = [
    { id: 'DEL-FV-01', name: 'French Valley Sightline Analysis Report (FAA 6480.4b)', size: '4.5MB', date: 'May 14, 2026' },
    { id: 'DEL-JC-02', name: 'Jacqueline Cochran Compaction & Hydration Borehole study', size: '12.8MB', date: 'April 28, 2026' },
    { id: 'DEL-DBE-04', name: 'DBE Outreach & SBE Teaming agreement matrix', size: '1.2MB', date: 'June 01, 2026' }
  ];

  // Invoices and financial progress records
  const invoices = [
    { num: 'INV-PAPD-041', milestone: 'Phase I Geotech Closeout', date: 'May 02, 2026', amount: 480000, status: 'PAID' },
    { num: 'INV-PAPD-042', milestone: 'Phase II Sightline approval', date: 'May 28, 2026', amount: 550000, status: 'PAID' },
    { num: 'INV-PAPD-043', milestone: 'Phase III DBE audit and bid launch', date: 'June 10, 2026', amount: 310000, status: 'PENDING CLIENT APPROVAL' }
  ];

  // Key Project Contact Roster
  const contacts = [
    { role: 'Pond Project Director', name: 'Vance Chen, P.E.', email: 'v.chen@pondco.online', phone: '+1 (951) 555-0190' },
    { role: 'KSA Chief Geologist', name: 'Dr. Helen Vance', email: 'vance.h@pape-dawson.com', phone: '+1 (951) 555-0144' },
    { role: 'Riverside Contract Officer', name: 'Citizen Sponsor Rep', email: 'rcad-liaison@rivco.gov', phone: '+1 (951) 555-0101' }
  ];

  const handleDownload = (name: string) => {
    playSound();
    onAnnounce(`Initiated download of: ${name}`);
    alert(`Simulating secure download of validated deliverable dossier [${name}].`);
  };

  const currentTheme = settings.highContrast 
    ? 'border-2 border-black bg-white text-black' 
    : 'bg-white border-slate-200';

  return (
    <div className="space-y-6" id="panel-client-portal" role="tabpanel" aria-labelledby="tab-client-portal">
      
      {/* HEADER ROW */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-800 font-bold tracking-widest uppercase flex items-center gap-1">
          <Milestone className="w-3.5 h-3.5" />
          GOVERNMENT &amp; CLIENT PROGRESS VIEW
        </span>
        <h3 className="font-serif font-bold text-slate-900 text-lg mt-1">
          Riverside County Aviation Tower Program Dashboard
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 font-sans leading-normal">
          Authorized monitoring terminal for Riverside Board of Supervisors and FAA Contract Program officers tracking the French Valley &amp; Cochran twin-tower design schedules.
        </p>
      </div>

      {/* METRICS ROW (DBE AND DESIGN TARGET PROGRESS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className={`p-5 rounded-lg border flex items-center justify-between shadow-xs ${currentTheme}`}>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Twin-Tower Overall Completion</span>
            <span className="text-3xl font-serif font-extrabold text-slate-900 block mt-1">68%</span>
            <span className="text-[9px] font-mono text-emerald-800 font-bold block mt-1">✓ On track against Board expectations (Nov 2026)</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-900">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`p-5 rounded-lg border flex items-center justify-between shadow-xs ${currentTheme}`}>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">DBE/SBE Quota Commitment</span>
            <span className="text-3xl font-serif font-extrabold text-emerald-800 block mt-1">13.1%</span>
            <span className="text-[9px] font-mono text-slate-500 block mt-1">Goal: <strong>12.5%</strong>. Level: <strong className="text-emerald-700">OVER-COMPLIANCE</strong></span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-800">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-5 rounded-lg border flex items-center justify-between shadow-xs ${currentTheme}`}>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Sealed Capital Values</span>
            <span className="text-3xl font-serif font-extrabold text-blue-905 block mt-1">$4,680,990</span>
            <span className="text-[9px] font-mono text-amber-700 font-bold block mt-1">Award locked by Board of Supervisors</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-700">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CORE PORTAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT COLUMN: VISUAL STEPPER PROCESS WHEEL (COL SPAN 3) */}
        <div className={`lg:col-span-3 p-6 rounded-lg border shadow-xs space-y-6 ${currentTheme}`}>
          <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Milestone className="w-4 h-4 text-blue-900" />
            PSA Contract Milestone Stepper (FAA program model)
          </h4>

          <div className="space-y-4">
            {phases.map((ph, idx) => {
              const isCompleted = ph.status === 'VERIFIED';
              const isInProgress = ph.status === 'IN_PROGRESS';
              return (
                <div 
                  key={ph.id} 
                  className={`p-4 rounded border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : isInProgress 
                        ? 'bg-blue-50/40 border-blue-200 animate-pulse' 
                        : 'bg-slate-50/50 border-slate-150 text-slate-400'
                  }`}
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        isCompleted 
                          ? 'bg-emerald-800 text-white' 
                          : isInProgress 
                            ? 'bg-blue-900 text-white' 
                            : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ph.status}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-500">{ph.badge}</span>
                    </div>

                    <h5 className="font-serif font-bold text-slate-900 text-sm">{ph.name}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{ph.desc}</p>
                  </div>

                  <div className="flex-shrink-0 md:text-right flex flex-col items-start md:items-end gap-1 font-mono text-xs">
                    <span className="font-bold text-slate-800">Completion:</span>
                    <strong className={`text-base font-serif ${isCompleted ? 'text-emerald-700' : 'text-blue-900'}`}>{ph.completion}%</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DELIVERABLES, INVOICES, ROSTERS & LEGAL DISCLAIMER (COL SPAN 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* APPROVED DELIVERABLES LIST */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentTheme}`}>
            <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-900" />
              County Approved Deliverables Cache
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              {deliverables.map(d => (
                <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center hover:bg-slate-100">
                  <div className="truncate max-w-[200px]">
                    <div className="font-bold text-slate-800 text-xs truncate">{d.name}</div>
                    <span className="text-[9px] text-slate-400">ID: {d.id} • Verified {d.date}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(d.name)}
                    className="p-1.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded text-slate-600 cursor-pointer"
                    title="Download certified PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RETRIEVED REGISTERED INVOICES */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentTheme}`}>
            <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase mb-4 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-900" />
              Pond Billing Gate releases
            </h4>

            <div className="space-y-3 font-mono text-[11px] leading-normal">
              {invoices.map((inv, i) => (
                <div key={i} className="flex justify-between items-start pb-2 border-b border-slate-100 last:border-none last:pb-0">
                  <div>
                    <div className="font-semibold text-slate-800">{inv.milestone}</div>
                    <span className="text-[9px] text-slate-400">Invoice: {inv.num} • {inv.date}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-bold text-slate-900">${inv.amount.toLocaleString()}</div>
                    <span className={`text-[9px] font-bold uppercase ${inv.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT ROSTER */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentTheme}`}>
            <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-blue-900" />
              Program Roster
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              {contacts.map((c, i) => (
                <div key={i} className="p-2 border border-slate-200 rounded bg-white">
                  <div className="font-semibold text-slate-900 text-[11px] flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-normal">{c.role}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between mt-0.5">
                    <span>{c.email}</span>
                    <span>{c.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEGAL PROGRESS DISCLAIMER AS DIRECTED BY PLAN */}
          <div className="p-4 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-sans text-[11px] leading-relaxed relative overflow-hidden shadow-xs">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500" />
            <div className="font-mono text-[10px] uppercase font-bold text-amber-500 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Client progress disclaimer
            </div>
            <p className="italic">
              The Client Progress View presents approved high-level project status for informational purposes only. It does not amend the contract, alter payment terms, approve additional scope, or replace formal written notices, change orders, or executed deliverables.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
