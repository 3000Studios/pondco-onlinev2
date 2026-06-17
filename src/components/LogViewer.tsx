import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Terminal, 
  Download, 
  Copy, 
  PlusCircle, 
  Check, 
  Trash2,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { AuditLog, AccessibilitySettings } from '../types';
import { OFFICIAL_AGENCIES } from '../data/mockData';

interface LogViewerProps {
  logs: AuditLog[];
  setLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  setLogs,
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  // Filter settings
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Copy status
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Manual Log Injector Simulator drawer states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [simAgency, setSimAgency] = useState(OFFICIAL_AGENCIES[0]);
  const [simCategory, setSimCategory] = useState<AuditLog['category']>('SECURITY');
  const [simSeverity, setSimSeverity] = useState<AuditLog['severity']>('WARNING');

  // Multi Filtering logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleCopyLogItem = (log: AuditLog) => {
    const logString = `[${log.timestamp}] [ID: ${log.id}] [${log.severity}] [${log.category}] [Agency: ${log.agency}] Message: ${log.message} (Operator: ${log.operator} IP: ${log.ipAddress})`;
    navigator.clipboard.writeText(logString);
    setCopiedLogId(log.id);
    onAnnounce(`Copied record ${log.id} to clipboard.`);
    playSound();
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleExportTxtFile = () => {
    const logHeader = `=========================================================================\n` +
                      `OFFICIAL FEDERAL TRANSCRIPT: NATIONAL SERVICES AUDIT LEDGER\n` +
                      `Export Origin: National Unified Registry Gateway\n` +
                      `Date Generated: ${new Date().toLocaleString()}\n` +
                      `Total Records Exported: ${filteredLogs.length}\n` +
                      `Checksum Integrity Tag: SHA256-${Math.random().toString(36).substr(2, 9).toUpperCase()}\n` +
                      `=========================================================================\n\n`;
    
    const logBody = filteredLogs.map(log => 
      `TIMESTAMP: ${log.timestamp}\n` +
      `RECORD ID: ${log.id}\n` +
      `AGENCY:    ${log.agency}\n` +
      `LEVEL:     ${log.severity} | CATEGORY: ${log.category}\n` +
      `OPERATOR:  ${log.operator} (IP: ${log.ipAddress})\n` +
      `MESSAGE:   ${log.message}\n` +
      `-------------------------------------------------------------------------`
    ).join('\n');

    const fullExportData = logHeader + logBody + `\n\n=== VERIFIED DOCUMENT TRANSCRIPT ENDS ===`;

    const blob = new Blob([fullExportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `federal_audit_log_export_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    onAnnounce(`Downloaded report containing ${filteredLogs.length} audit logs.`);
    playSound();
  };

  const handleCopyAllJson = () => {
    navigator.clipboard.writeText(JSON.stringify(filteredLogs, null, 2));
    setCopiedAll(true);
    onAnnounce("Full JSON dataset of filtered logs copied to clipboard.");
    playSound();
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const clearLogsHistory = () => {
    if (window.confirm("Are you sure you want to clear the local logs trace? F.A.R.O regulations require audit compliance.")) {
      setLogs([]);
      onAnnounce("All audit records cleared from active viewport. Local ledger is empty.");
      playSound();
    }
  };

  const handleInjectSimulatedLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) {
      alert("Please provide a log message details.");
      return;
    }

    onAddLog({
      agency: simAgency,
      category: simCategory,
      severity: simSeverity,
      message: simMessage,
      operator: 'SIMULATION_BOT',
      ipAddress: '10.255.255.10'
    });

    setSimMessage('');
    setIsSimulatorOpen(false);
    onAnnounce(`Simulated log event successfully injected into the public ledger.`);
    playSound();
  };

  const getSeverityStyles = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'SUCCESS':
        return settings.highContrast 
          ? { text: 'text-lime-400 font-bold', bg: 'bg-black border-lime-400', icon: CheckCircle }
          : { text: 'text-emerald-700 font-bold', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle };
      case 'WARNING':
        return settings.highContrast 
          ? { text: 'text-amber-300 font-bold', bg: 'bg-black border-amber-300', icon: AlertTriangle }
          : { text: 'text-amber-700 font-bold', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle };
      case 'ERROR':
        return settings.highContrast 
          ? { text: 'text-rose-400 font-bold', bg: 'bg-black border-rose-400', icon: AlertOctagon }
          : { text: 'text-rose-700 font-bold', bg: 'bg-rose-50 border-rose-200', icon: AlertOctagon };
      case 'INFO':
      default:
        return settings.highContrast 
          ? { text: 'text-cyan-400 font-bold', bg: 'bg-black border-cyan-400', icon: Clock }
          : { text: 'text-slate-700 font-bold', bg: 'bg-slate-50 border-slate-200', icon: Clock };
    }
  };

  return (
    <section 
      aria-labelledby="logs-section-title"
      className={`p-6 rounded-lg shadow-sm border ${
        settings.highContrast ? 'bg-white border-black text-black' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
        <div>
          <h2 id="logs-section-title" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-900" />
            Federal Digital Log &amp; Transaction Ledger
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Certified system telemetry events, automated access warnings, FOIA processing audit logs, and citizen submission records.
          </p>
        </div>

        {/* LOG AGENT EXPORT TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Inject Log button */}
          <button
            onClick={() => {
              setIsSimulatorOpen(!isSimulatorOpen);
              onAnnounce(isSimulatorOpen ? "Simulation control panel minimized." : "Simulation drawer opened. You can now inject custom telemetry alarms directly.");
              playSound();
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSimulatorOpen 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isSimulatorOpen ? 'HIDE INJECTOR' : 'MOCK LOG INJECTOR'}</span>
          </button>

          {/* Copy as JSON */}
          <button
            onClick={handleCopyAllJson}
            disabled={filteredLogs.length === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
            title="Copy filtered logs as a structured JSON representation"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'COPIED!' : 'COPY ALL JSON'}</span>
          </button>

          {/* Export compliance logs */}
          <button
            onClick={handleExportTxtFile}
            disabled={filteredLogs.length === 0}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 shadow-sm transition"
            title="Download formal text audit file report with checksum headers"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .TXT REPORT</span>
          </button>

          {/* Purge trace logs */}
          <button
            onClick={clearLogsHistory}
            className="p-1.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition"
            title="Clear active view's logs memory cache"
            aria-label="Purge log audit histories"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SIMULATION INJECTOR INNER BOX PANEL */}
      {isSimulatorOpen && (
        <form onSubmit={handleInjectSimulatedLog} className="p-4 bg-slate-100 border border-slate-300 rounded mb-6 space-y-4 font-sans animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase flex items-center gap-1">
              <span>LEDGER EVENT SIMULATOR</span>
            </h3>
            <span className="text-[10px] text-slate-500 italic font-mono">// Sandbox Injection Zone</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Set Agency */}
            <div>
              <label htmlFor="simAgency" className="block font-bold text-slate-700 mb-1">SELECT MOCK AGENCY</label>
              <select
                id="simAgency"
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                value={simAgency}
                onChange={(e) => setSimAgency(e.target.value)}
              >
                {OFFICIAL_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Set Category */}
            <div>
              <label htmlFor="simCategory" className="block font-bold text-slate-700 mb-1">LOG CLASSIFICATION</label>
              <select
                id="simCategory"
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value as AuditLog['category'])}
              >
                <option value="SECURITY">SECURITY (Unauthorized Access, Firewall)</option>
                <option value="RECORDS">RECORDS (FOIA compliance, checksum verification)</option>
                <option value="COMPLIANCE">COMPLIANCE (WCAG accessibility audit check)</option>
                <option value="SYSTEM">SYSTEM (Database node, sensor communication alerts)</option>
                <option value="PUBLIC_REQUEST">PUBLIC_REQUEST (New citizen requests submitted)</option>
              </select>
            </div>

            {/* Set Severity */}
            <div>
              <label htmlFor="simSeverity" className="block font-bold text-slate-700 mb-1">DANGER / SEVERITY LEVEL</label>
              <select
                id="simSeverity"
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                value={simSeverity}
                onChange={(e) => setSimSeverity(e.target.value as AuditLog['severity'])}
              >
                <option value="INFO">INFO (Normal routine logs)</option>
                <option value="SUCCESS">SUCCESS (Task completed successfully)</option>
                <option value="WARNING">WARNING (Minor security anomalies caught)</option>
                <option value="ERROR">ERROR (System crash or telemetry timeouts)</option>
              </select>
            </div>
          </div>

          {/* Message Prompt */}
          <div>
            <label htmlFor="simMessage" className="block text-xs font-bold text-slate-700 mb-1">TELEMETRY MESSAGE CONTENT</label>
            <div className="flex gap-2">
              <input
                id="simMessage"
                type="text"
                placeholder="e.g. Host port audit scanner detected trace route requests from unusual IP."
                className="flex-1 p-2 text-xs border border-slate-300 rounded bg-white text-slate-900"
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs bg-blue-900 hover:bg-blue-950 text-white font-bold rounded"
              >
                INJECT RECORD
              </button>
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-mono py-1">Quick Presets:</span>
              <button 
                type="button"
                onClick={() => setSimMessage("Substantially elevated request query volume cleared on authentication nodes.")}
                className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded hover:bg-slate-300"
              >
                Sync Cleared
              </button>
              <button 
                type="button"
                onClick={() => setSimMessage("Automatic daily system backup finished on secondary cryptographic nodes.")}
                className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded hover:bg-slate-300"
              >
                Daily Backup
              </button>
              <button 
                type="button"
                className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded hover:bg-slate-300"
                onClick={() => setSimMessage("Intrusion mitigation shields activated against denial-of-service simulation vectors.")}
              >
                Mitigate Attack
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SEARCH AND FILTER BAR CONTROLS */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-100 p-4 rounded border border-slate-200 mb-5 text-xs font-sans">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <label htmlFor="searchLogs" className="sr-only">Search logs message or metadata</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="searchLogs"
            type="text"
            placeholder="Search records by operator, message keywords, IP, or record ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <label htmlFor="catFilter" className="sr-only">Select Log Category</label>
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="catFilter"
              className="py-1.5 pr-6 pl-1 bg-white focus:outline-none border-none text-[11px] text-slate-800 text-xs font-medium"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="SECURITY">SECURITY</option>
              <option value="RECORDS">RECORDS</option>
              <option value="COMPLIANCE">COMPLIANCE</option>
              <option value="SYSTEM">SYSTEM</option>
              <option value="PUBLIC_REQUEST">PUBLIC_REQUEST</option>
            </select>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="w-full md:w-auto">
          <label htmlFor="sevFilter" className="sr-only">Select Severity level</label>
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sevFilter"
              className="py-1.5 pr-6 pl-1 bg-white focus:outline-none border-none text-[11px] text-slate-800 text-xs font-medium"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="INFO">INFO (ROUTINE)</option>
              <option value="SUCCESS">SUCCESS (COMPLETED)</option>
              <option value="WARNING">WARNING (ATTENTION)</option>
              <option value="ERROR">ERROR (HAZARDOUS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILTER METADATA CHIPS REVEAL */}
      {(searchTerm || categoryFilter !== 'ALL' || severityFilter !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono py-1 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Active filters:</span>
            {searchTerm && <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">Query: "{searchTerm}"</span>}
            {categoryFilter !== 'ALL' && <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">{categoryFilter}</span>}
            {severityFilter !== 'ALL' && <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">{severityFilter}</span>}
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                onAnnounce("Log filters cleared. Showing all archives.");
                playSound();
              }}
              className="text-blue-900 underline hover:text-blue-950 font-bold ml-1"
            >
              Clear filters
            </button>
          </div>
          <div className="font-semibold text-slate-900">{filteredLogs.length} registry entries found</div>
        </div>
      )}

      {/* LOG DATA LEDGER LIST VIEW */}
      <div className="space-y-3 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic bg-slate-50 border border-slate-200 rounded">
            No matching federal ledger logs found in current clearance database. Try relaxing search filters.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const styles = getSeverityStyles(log.severity);
            const SeverityIcon = styles.icon;
            
            return (
              <div 
                key={log.id}
                className={`p-4 rounded border-l-4 transition-all flex flex-col md:flex-row md:items-start gap-4 ${styles.bg} ${
                  settings.highContrast ? 'border border-black' : ''
                }`}
                role="article"
              >
                {/* Severity Badge column */}
                <div className="flex-shrink-0 flex items-center md:flex-col gap-2 align-top text-left md:w-28">
                  <div className={`p-1.5 rounded-full ${settings.highContrast ? 'bg-slate-200' : 'bg-slate-100'} ${styles.text}`}>
                    <SeverityIcon className="w-5 h-5" />
                  </div>
                  <div className={`text-[10px] font-bold ${styles.text}`}>
                    {log.severity}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">// {log.id}</div>
                </div>

                {/* Audit specifications column */}
                <div className="flex-1 min-w-0 space-y-1.5 pr-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-extrabold text-slate-900 text-xs font-serif">{log.agency}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-blue-900 uppercase text-[10px] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">{log.category}</span>
                  </div>

                  <p className="text-slate-800 font-sans leading-relaxed text-sm antialiased font-normal">
                    {log.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span>&bull;</span>
                    <span>Operator: <strong className="text-slate-800">{log.operator}</strong></span>
                    <span>&bull;</span>
                    <span>IP Gateway: <strong className="text-slate-800 font-mono">{log.ipAddress}</strong></span>
                  </div>
                </div>

                {/* Individual log actions column */}
                <div className="flex-shrink-0 flex md:flex-col justify-end gap-1 px-1 pt-1 md:self-center">
                  <button
                    onClick={() => handleCopyLogItem(log)}
                    className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold transition"
                    title="Copy this log entry message to clipboard"
                    aria-label={`Copy log file details for record ${log.id}`}
                  >
                    {copiedLogId === log.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-800 font-bold" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Accessibility screen reporting panel */}
      {settings.screenReaderActive && (
        <div className="mt-6 p-3 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-950 font-sans">
          <strong>Screen Reader Virtual Assistant:</strong> Auditing {filteredLogs.length} matching rows. Press TAB to navigate each row. Press Space/Enter to trigger localized copying operations.
        </div>
      )}
    </section>
  );
};
