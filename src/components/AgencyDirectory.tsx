import React, { useState } from 'react';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { OFFICIAL_AGENCIES } from '../data/mockData';

interface AgencyDirectoryProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
}

interface AgencyDetail {
  name: string;
  code: string;
  head: string;
  phone: string;
  email: string;
  address: string;
  mission: string;
  workingHours: string;
  foiaClearingRate: string;
}

export const AgencyDirectory: React.FC<AgencyDirectoryProps> = ({
  settings,
  onAnnounce,
  playSound
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const agencyDetailsList: AgencyDetail[] = [
    {
      name: OFFICIAL_AGENCIES[0], // DDS
      code: 'GOV-DDS-99',
      head: 'Director Aris Thorne',
      phone: '+1 (800) 555-0191',
      email: 'intake@dds.archives.gov',
      address: '1200 Digital Avenue NW, Suite 500, Washington, DC 20005',
      mission: 'Enabling unified multi-cloud container infrastructure operations and securing cryptographically verified citizen API handshakes to support modern digital governance.',
      workingHours: 'MON - FRI // 08:30 - 17:00 EST',
      foiaClearingRate: '98.42% Compliance Uptime'
    },
    {
      name: OFFICIAL_AGENCIES[1], // FARO
      code: 'GOV-FARO-04',
      head: 'Archivist Dr. Marilyn Finch',
      phone: '+1 (800) 555-0142',
      email: 'reception@faro.sec.gov',
      address: '700 Constitution Avenue NW, Washington, DC 20408',
      mission: 'Preserving national documents, cryptographic history ledgers, and processing civil FOIA records requests to maintain transparent democracy registries.',
      workingHours: 'MON - FRI // 09:00 - 16:30 EST',
      foiaClearingRate: '99.10% Compliance Uptime'
    },
    {
      name: OFFICIAL_AGENCIES[2], // BPC
      code: 'GOV-BPC-22',
      head: 'Commissioner Gerald Vance',
      phone: '+1 (833) 555-0177',
      email: 'audit@bpc.compliance.gov',
      address: '350 E Street SW, Washington, DC 20224',
      mission: 'Auditing civic applications for supreme WCAG 2.2 accessibility, Section 508 legal obedience, and evaluating federal compliance guidelines.',
      workingHours: 'MON - FRI // 08:00 - 16:00 EST',
      foiaClearingRate: '100% WCAG certified'
    },
    {
      name: OFFICIAL_AGENCIES[3], // NET
      code: 'GOV-NET-88',
      head: 'Secretary Laura Vance',
      phone: '+1 (800) 555-0163',
      email: 'telemetry@net.trust.gov',
      address: '1200 Pennsylvania Ave NW, Washington, DC 20460',
      mission: 'Monitoring regional telemetry endpoints containing air, soil, and aquatic health sensors, reporting public environmental updates safely.',
      workingHours: 'MON - FRI // 08:30 - 17:30 EST',
      foiaClearingRate: '92.80% Telemetry Latency'
    },
    {
      name: OFFICIAL_AGENCIES[4], // CSID
      code: 'GOV-CSID-02',
      head: 'Ombudsman Samuel K. Rivera',
      phone: '+1 (833) 555-2200',
      email: 'citizen.support@csid.gov',
      address: '1717 Pennsylvania Ave NW, Washington, DC 20006',
      mission: 'Managing public support intake records, coordinating official case assignments, and mediating local citizen-record discrepancies.',
      workingHours: 'MON - FRI // 24-HOUR EMERGENCY REDIRECT',
      foiaClearingRate: '95.6% Citizen Satisfaction'
    }
  ];

  const filteredAgencies = agencyDetailsList.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.mission.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section 
      aria-labelledby="dir-title"
      className={`p-6 rounded-lg shadow-sm border ${
        settings.highContrast ? 'bg-white border-black text-black' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
        <div>
          <h2 id="dir-title" className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-900" />
            Federal Agency Directory &amp; Contact Indexes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse physical locations, contact coordinates, mission files, and digital compliance standards of receiving offices.
          </p>
        </div>

        {/* Agency Search bar */}
        <div className="relative">
          <label htmlFor="agencySearch" className="sr-only">Search agency list</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="agencySearch"
            type="text"
            placeholder="Search agencies or heads..."
            className="pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 w-full md:w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAgencies.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic bg-slate-50 border border-slate-200 rounded col-span-2">
            No agencies match your search query. Please review spelling or contact Washington Central Directory support.
          </div>
        ) : (
          filteredAgencies.map((agency) => (
            <div 
              key={agency.code}
              className={`p-5 rounded border bg-slate-50 relative flex flex-col justify-between ${
                settings.highContrast ? 'border-2 border-black bg-white text-black' : 'border-slate-200 hover:border-slate-300'
              } transition-colors`}
              role="article"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                      {agency.code} &bull; DIRECTORY RECORD
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-base mt-0.5">{agency.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    settings.highContrast ? 'bg-black text-lime-400' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  }`}>
                    {agency.foiaClearingRate}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  <strong>Core Mission Statement:</strong> {agency.mission}
                </p>

                {/* Coordinates Info list holding map locations and emails */}
                <div className="space-y-2 text-xs font-mono text-slate-600">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Officer in Charge: <strong className="text-slate-800 font-sans">{agency.head}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Toll Free Call: <strong className="text-slate-800">{agency.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Secure Email: <strong className="text-blue-900 underline font-sans">{agency.email}</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="font-sans leading-tight">Physical Base: <strong className="text-slate-800">{agency.address}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Working: {agency.workingHours}</span>
                <button
                  onClick={() => {
                    onAnnounce(`Attempted to open official sub-portal for ${agency.name}. External popups are routed via Secure Handshake.`);
                    playSound();
                  }}
                  className={`text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded flex items-center gap-1 hover:text-blue-900 transition`}
                  aria-label={`Open website for ${agency.name}`}
                >
                  <span>MEMBER ACCESS</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
