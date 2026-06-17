import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Lock, 
  Activity, 
  Briefcase, 
  FolderGit2, 
  Cpu, 
  Milestone, 
  Shield,
  Newspaper,
  ShieldAlert
} from 'lucide-react';
import { AccessibilitySettings, UserSession } from '../types';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  session: UserSession | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  onAnnounce,
  playSound,
  session
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Civil Dashboard',
      description: 'Overview of national registries, active services, alerts, and vital statistics.',
      icon: LayoutDashboard
    },
    {
      id: 'acquisition',
      label: 'Acquisition Hub',
      description: 'Interact with the pipeline, Go/No-Go probability estimators, and proposal bidding trackers.',
      icon: Briefcase
    },
    {
      id: 'project-controls',
      label: 'Project Controls',
      description: 'Inspect live flight-cab design sprints, record EOD workbook rows, and log Change Orders.',
      icon: FolderGit2
    },
    {
      id: 'process-flows',
      label: 'Sectors Simulator',
      description: 'Interact with sectors process flows, inspect live subdirectories, and toggle bypass parameters.',
      icon: Activity
    },
    {
      id: 'rag-agent',
      label: 'RAG & AI Agent',
      description: 'Query aeronautical guidelines, geomechanical borehole records, and converse with grounded role-scoped agents.',
      icon: Cpu
    },
    {
      id: 'client-portal',
      label: 'Twin-Tower Sponsor Portal',
      description: 'Monitor Jacqueline Cochran & French Valley progress trackers, milestones, and approved deliverables.',
      icon: Milestone
    },
    {
      id: 'aviation-stories',
      label: 'Aviation News Desk',
      description: 'Review top Northeast Regional aviation news bulletins, automated airspace updates, and telemetries.',
      icon: Newspaper
    },
    {
      id: 'logs',
      label: 'Public Audit Ledger',
      description: 'Authorized secure log files, service events, and digital transaction registries.',
      icon: FileText
    },
    {
      id: 'agencies',
      label: 'Agency Service Nodes',
      description: 'Review latency metrics, response runtimes, and real-time health levels of public nodes.',
      icon: Database
    },
    {
      id: 'auth',
      label: 'Clearance Gate',
      description: 'Registry authentication center for citizen logins, secure credentials registration, and cryptographic clearing.',
      icon: Lock
    },
    {
      id: 'admin',
      label: 'Admin Desk',
      description: 'Administrative cockpit for input overrides, compliance thresholds, and note write permissions.',
      icon: Shield
    },
    {
      id: 'legal',
      label: 'Legal Policy & Disclaimer',
      description: 'Legal disclaimers, terms of use, non-affiliation disclosures, and full liability releases.',
      icon: ShieldAlert
    }
  ];

  // Filter menu choices strictly per user's requests:
  // "make the client login only has client pertainent infor mation on it and have to insiders information listed on the client side"
  const isClient = session?.clearanceLevel === 'CITIZEN';
  const filteredItems = menuItems.filter(item => {
    if (isClient) {
      // Clients can only access the Overview (Civil Dashboard), Twin-Tower Sponsor Portal, Aviation Stories Desk, active Clearance Gate, and Legal.
      return ['overview', 'client-portal', 'auth', 'aviation-stories', 'legal'].includes(item.id);
    }
    return true; // Employees, Admins, Auditors and guests can interact with standard hubs.
  });

  const handleTabSelect = (id: string, label: string) => {
    setCurrentTab(id);
    onAnnounce(`Navigated to ${label} view.`);
    playSound();
  };

  // Grouping for dropdowns
  const groupedItems = [
    { label: 'Dashboards', items: ['overview', 'project-controls', 'client-portal'] },
    { label: 'Operations', items: ['acquisition', 'process-flows', 'rag-agent'] },
    { label: 'Resources', items: ['aviation-stories', 'logs', 'agencies'] },
    { label: 'Admin', items: ['auth', 'admin', 'legal'] },
  ];

  // Modified menu structure - just keeping existing filteredItems for now to not break anything
  // but I can add a simple select dropdown on mobile
  return (
    <nav 
      aria-label="Federal Portal Section Navigation" 
      role="navigation"
      className="w-full bg-white border-b border-slate-200"
    >
      <div className="md:hidden p-2">
         <select onChange={(e) => handleTabSelect(e.target.value, filteredItems.find(i => i.id === e.target.value)?.label || '')} className="w-full p-2 border rounded">
            {filteredItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
         </select>
      </div>
      <div className="hidden md:block max-w-7xl mx-auto px-4">
        {/* Navigation list with semantic tablist role */}
        <ul 
          role="tablist" 
          className="flex flex-row items-stretch overflow-x-auto gap-1 py-1 border-slate-200"
        >
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <li role="presentation" key={item.id} className="block">
                <button
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={0}
                  className={`px-5 py-4 text-sm font-semibold flex items-center gap-3 transition-all relative border-b-2 outline-none cursor-pointer ${
                    isActive 
                      ? (settings.highContrast 
                          ? 'border-black text-black bg-slate-100 font-extrabold' 
                          : 'border-blue-900 text-blue-900 bg-blue-50/70') 
                      : (settings.highContrast 
                          ? 'border-transparent text-slate-700 hover:text-black hover:bg-slate-50' 
                          : 'border-transparent text-slate-600 hover:text-blue-900 hover:bg-slate-50/50')
                  }`}
                  onClick={() => handleTabSelect(item.id, item.label)}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900 font-bold' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  
                  {/* Subtle active state visual underline */}
                  {isActive && !settings.highContrast && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
