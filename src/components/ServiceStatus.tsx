import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Activity,
  GitBranch,
  Wifi,
  HardDrive
} from 'lucide-react';
import { ServiceStatusItem, AccessibilitySettings, AuditLog } from '../types';

interface ServiceStatusProps {
  statuses: ServiceStatusItem[];
  setStatuses: React.Dispatch<React.SetStateAction<ServiceStatusItem[]>>;
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({
  statuses,
  setStatuses,
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDiagnose = (item: ServiceStatusItem) => {
    setDiagnosingId(item.id);
    onAnnounce(`Initiating cryptographic packet handshake test for ${item.name}. Please wait.`);
    playSound();

    setTimeout(() => {
      setStatuses(prev => prev.map(s => {
        if (s.id === item.id) {
          // Heal the only degraded node for demonstration, or randomly change slightly
          const nextStatus: ServiceStatusItem['status'] = s.status === 'DEGRADED' ? 'ONLINE' : s.status;
          const nextLatency = nextStatus === 'ONLINE' ? '30ms' : s.latency;
          
          onAnnounce(`handshake test completed. ${s.name} is now certified ${nextStatus}.`);
          onAddLog({
            agency: 'Department of Digital Services (DDS)',
            category: 'SYSTEM',
            severity: 'SUCCESS',
            message: `Cryptographic packet handshake test for ${s.name} [ID: ${s.code}] completed successfully. Latency improved to ${nextLatency}.`,
            operator: 'GATEWAY_DIAGNOSTIC_DAEMON',
            ipAddress: '127.0.0.1'
          });
          
          return {
            ...s,
            status: nextStatus,
            latency: nextLatency,
            lastChecked: 'Just now'
          };
        }
        return s;
      }));

      setDiagnosingId(null);
      playSound();
    }, 1500);
  };

  const filteredStatuses = statuses.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ServiceStatusItem['status']) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded ${
            settings.highContrast 
              ? 'bg-black text-lime-400 border border-lime-400' 
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded ${
            settings.highContrast 
              ? 'bg-black text-amber-300 border border-amber-300' 
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DEGRADED</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded ${
            settings.highContrast 
              ? 'bg-black text-cyan-300 border border-cyan-300' 
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>MAINTENANCE</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded ${
            settings.highContrast 
              ? 'bg-black text-red-400 border border-red-400' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <XCircle className="w-3.5 h-3.5" />
            <span>SYS_DOWN</span>
          </span>
        );
    }
  };

  return (
    <section 
      aria-labelledby="status-section-title" 
      className={`p-6 rounded-lg shadow-sm border ${
        settings.highContrast ? 'bg-white border-black text-black' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="status-section-title" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-900" />
            National Core Service Health Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status indicators across distributed databases, FOIA interfaces, and agency endpoints.
          </p>
        </div>

        {/* Local Search and Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Filter by service name..."
              className="pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filter specific agency nodes"
            />
          </div>
        </div>
      </div>

      {/* Summary grid stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-mono">GLOBAL HEALTH INDEX</div>
            <div className="text-xl font-serif font-bold text-slate-900 mt-0.5">99.81%</div>
          </div>
          <div className="p-1.5 bg-emerald-100 rounded text-emerald-800">
            <Wifi className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-mono">TOTAL ACCESSIBLE NODES</div>
            <div className="text-xl font-serif font-bold text-slate-900 mt-0.5">
              {statuses.length} / {statuses.length} Live
            </div>
          </div>
          <div className="p-1.5 bg-blue-100 rounded text-blue-900">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-mono">ENCRYPTED ENDPOINTS</div>
            <div className="text-xl font-serif font-bold text-slate-900 mt-0.5">100% SHA-256</div>
          </div>
          <div className="p-1.5 bg-amber-100 rounded text-amber-800">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Health Grid list */}
      <div className="overflow-x-auto border border-slate-200 rounded">
        <table className="w-full text-left text-sm border-collapse" role="table">
          <thead>
            <tr className={`text-xs font-mono select-none ${settings.highContrast ? 'bg-slate-200 text-black border-b border-black' : 'bg-slate-100 text-slate-700 border-b border-slate-200'}`}>
              <th scope="col" className="p-3">SERVICE NAME &amp; CODE</th>
              <th scope="col" className="p-3">NETWORK STATUS</th>
              <th scope="col" className="p-3">AV. LATENCY</th>
              <th scope="col" className="p-3">UPTIME</th>
              <th scope="col" className="p-3">LAST AUDITED</th>
              <th scope="col" className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStatuses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-mono italic">
                  No matching services or security nodes found in the public ledger.
                </td>
              </tr>
            ) : (
              filteredStatuses.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50 transition-colors ${
                    item.status === 'DEGRADED' ? 'bg-amber-50/20' : ''
                  }`}
                  role="row"
                >
                  <td className="p-3">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">SYSTEM CODE // {item.code}</div>
                    </div>
                  </td>
                  <td className="p-3 align-middle">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-3 align-middle font-mono font-medium text-slate-700">
                    {item.latency}
                  </td>
                  <td className="p-3 align-middle font-mono text-slate-600">
                    {item.uptime}
                  </td>
                  <td className="p-3 align-middle text-slate-500 text-xs">
                    {item.lastChecked}
                  </td>
                  <td className="p-3 align-middle text-right">
                    <button
                      onClick={() => handleDiagnose(item)}
                      disabled={diagnosingId !== null}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all ${
                        diagnosingId === item.id 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed animate-pulse' 
                          : (settings.highContrast 
                              ? 'bg-black text-white hover:bg-slate-900 border border-black' 
                              : 'bg-blue-900 hover:bg-blue-950 text-white shadow-sm')
                      }`}
                      aria-busy={diagnosingId === item.id}
                      aria-label={`Initiate digital audit ping for ${item.name}`}
                    >
                      <RefreshCw className={`w-3 h-3 ${diagnosingId === item.id ? 'animate-spin' : ''}`} />
                      <span>{diagnosingId === item.id ? 'VERIFYING...' : 'TEST HANDSHAKE'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Accessible Footer Banner */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded mt-5 text-xs text-slate-800 leading-relaxed flex gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <span className="font-bold">Important Notice to System Officers:</span> Public Handshake logs are recorded strictly in compliance with Title 44 of the United States Code. Attempted security manipulation or brute-forcing triggers automated gateway deflection procedures and creates a log report.
        </div>
      </div>
    </section>
  );
};
