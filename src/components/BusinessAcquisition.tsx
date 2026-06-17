import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Calculator, 
  Award, 
  UserCheck, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  Users, 
  CheckSquare, 
  Layers 
} from 'lucide-react';
import { AccessibilitySettings, AuditLog } from '../types';

interface BusinessAcquisitionProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

interface Opportunity {
  id: string;
  title: string;
  client: string;
  market: string;
  estValue: number;
  dueDate: string;
  stage: 'Lead' | 'Qualified' | 'Go-NoGo' | 'Proposal' | 'Review' | 'Submitted' | 'Won';
  owner: string;
}

export const BusinessAcquisition: React.FC<BusinessAcquisitionProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  // Mock Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 'OPP-RIV-84',
      title: 'Riverside French Valley ATCT Design',
      client: 'Riverside County Aviation Division',
      market: 'Aviation',
      estValue: 2125000,
      dueDate: '2026-07-15',
      stage: 'Proposal',
      owner: 'Vance Chen'
    },
    {
      id: 'OPP-RIV-85',
      title: 'Jacqueline Cochran Tower Planning & Height cab Study',
      client: 'Riverside County Aviation Division',
      market: 'Aviation',
      estValue: 2555990,
      dueDate: '2026-08-30',
      stage: 'Qualified',
      owner: 'J. Martinez'
    },
    {
      id: 'OPP-LAX-12',
      title: 'LAX General Auxiliary Terminal Gates Program',
      client: 'Los Angeles World Airports',
      market: 'Aviation / Transport',
      estValue: 8400000,
      dueDate: '2026-10-10',
      stage: 'Lead',
      owner: 'Sarah Connor'
    },
    {
      id: 'OPP-FAA-09',
      title: 'FAA Federal Contract Tower Security Standardization',
      client: 'Federal Aviation Administration',
      market: 'Federal Government',
      estValue: 12500000,
      dueDate: '2026-12-01',
      stage: 'Go-NoGo',
      owner: 'Vance Chen'
    }
  ]);

  const [selectedOppId, setSelectedOppId] = useState<string>('OPP-RIV-84');
  
  // Real-time Win Probability Calculator Metrics (Sourced from Master Plan)
  const [clientRelationship, setClientRelationship] = useState(80);
  const [pastPerformance, setPastPerformance] = useState(75);
  const [technicalFit, setTechnicalFit] = useState(90);
  const [staffingReady, setStaffingReady] = useState(65);
  const [scheduleFeasibility, setScheduleFeasibility] = useState(75);
  const [complianceReadiness, setComplianceReadiness] = useState(85);
  const [differentiation, setDifferentiation] = useState(60);
  const [priceCompetitiveness, setPriceCompetitiveness] = useState(70);
  const [dbeAlignment, setDbeAlignment] = useState(80);
  const [interviewReadiness, setInterviewReadiness] = useState(65);
  const [partnerStrength, setPartnerStrength] = useState(85);
  const [isIncumbentDisadvantage, setIsIncumbentDisadvantage] = useState(false);

  // Compliance Readiness Checklist (Sourced from Master Plan)
  const [complianceMatrixComplete, setComplianceMatrixComplete] = useState(true);
  const [requiredArtifactsReady, setRequiredArtifactsReady] = useState(true);
  const [staffingCommitted, setStaffingCommitted] = useState(false);
  const [reviewerAvailability, setReviewerAvailability] = useState(true);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [costModelReady, setCostModelReady] = useState(true);
  const [legalResolved, setLegalResolved] = useState(true);
  const [bufferPercent, setBufferPercent] = useState(80);

  const selectedOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  // Pipeline stages
  const stages = ['Lead', 'Qualified', 'Go-NoGo', 'Proposal', 'Review', 'Submitted', 'Won'] as const;

  // Probability calculations based on plan formulas
  const calculateWinProbability = () => {
    let score = 
      0.18 * clientRelationship +
      0.15 * pastPerformance +
      0.12 * technicalFit +
      0.10 * staffingReady +
      0.08 * scheduleFeasibility +
      0.08 * complianceReadiness +
      0.08 * differentiation +
      0.06 * priceCompetitiveness +
      0.05 * dbeAlignment +
      0.05 * interviewReadiness +
      0.05 * partnerStrength;

    if (isIncumbentDisadvantage) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const calculateCompletionProbability = () => {
    let score =
      0.22 * (complianceMatrixComplete ? 100 : 0) +
      0.18 * (requiredArtifactsReady ? 100 : 0) +
      0.15 * (staffingCommitted ? 100 : 0) +
      0.12 * (reviewerAvailability ? 100 : 0) +
      0.10 * (graphicsReady ? 100 : 0) +
      0.08 * (costModelReady ? 100 : 0) +
      0.08 * (legalResolved ? 100 : 0) +
      0.07 * bufferPercent;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const winProb = calculateWinProbability();
  const completionProb = calculateCompletionProbability();

  // Save current calculator results to Opportunity Profile and log it
  const handleApplyCalculations = () => {
    playSound();
    onAnnounce(`Go No-Go scores validated. Weighted win probability calculated as ${winProb}% and bid compliance probability as ${completionProb}%`);
    
    // Log record
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'COMPLIANCE',
      severity: winProb > 60 ? 'SUCCESS' : 'WARNING',
      message: `GO/NO-GO EVALUATION COMPLETED: Opportunity claim [${selectedOpp.title}] computed at win-likelihood ${winProb}%, compliance rating ${completionProb}%. DBE compliance verified.`,
      operator: 'SYSTEM_DAEMON',
      ipAddress: '10.224.2.105'
    });

    alert(`Calculated values successfully bound to Active Pursuit index ${selectedOppId}.\nWin Likelihood: ${winProb}%\nCompliance Readiness: ${completionProb}%`);
  };

  const handleUpdateStage = (id: string, newStage: Opportunity['stage']) => {
    playSound();
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, stage: newStage } : o));
    onAnnounce(`Opportunity stage shifted to ${newStage}.`);
    
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'RECORDS',
      severity: 'INFO',
      message: `PURSUIT TRIGGER: Opp [${id}] advanced to pipeline phase [${newStage}] for executive review.`,
      operator: 'Vance Chen',
      ipAddress: '10.224.2.105'
    });
  };

  const currentTheme = settings.highContrast 
    ? 'border-2 border-black bg-white text-black' 
    : 'bg-white border-slate-200';

  return (
    <div className="space-y-6" id="panel-acquisition" role="tabpanel" aria-labelledby="tab-acquisition">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-600 font-bold tracking-widest uppercase flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            BUSINESS ACQUISITION HUB
          </span>
          <h3 className="font-serif font-bold text-slate-900 text-lg mt-1">
            Capture, Qualification, and Proposal Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans leading-normal">
            Manage regional A/E pursuits, compute real-time Go/No-Go parameters based on federal past performance, and coordinate DBE commitments.
          </p>
        </div>
      </div>

      {/* KANBAN PIPEBOARD */}
      <div className={`p-4 rounded-lg border shadow-xs ${currentTheme}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-900" />
            Centralized Opportunity Pipeline Status
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Drag/Select stage filters to change project phases</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {stages.map(stage => {
            const oppsInStage = opportunities.filter(o => o.stage === stage);
            return (
              <div 
                key={stage} 
                className={`p-3 rounded border flex flex-col justify-between min-h-[140px] transition-all ${
                  settings.highContrast ? 'border-black bg-white text-black' : 'bg-slate-50/50 border-slate-150'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200 mb-2">
                    <span className="text-[10px] font-bold font-mono text-blue-950 uppercase">{stage}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                      {oppsInStage.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {oppsInStage.map(opp => {
                      const isSelected = opp.id === selectedOppId;
                      return (
                        <div 
                          key={opp.id}
                          onClick={() => {
                            setSelectedOppId(opp.id);
                            playSound();
                            onAnnounce(`Selected pursuit: ${opp.title}`);
                          }}
                          className={`p-2 rounded text-[10px] font-mono leading-normal cursor-pointer transition-all border ${
                            isSelected 
                              ? 'border-blue-900 bg-blue-50/50 font-bold shadow-xs' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="text-slate-800 font-bold truncate leading-snug">{opp.title}</div>
                          <div className="text-slate-500 mt-1 flex justify-between font-medium">
                            <span>ID: {opp.id}</span>
                            <span className="text-amber-700 font-bold">${(opp.estValue / 1000000).toFixed(2)}M</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {oppsInStage.length === 0 && (
                  <div className="text-[9px] text-slate-400 italic text-center py-4">Empty stage</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED GO/NO-GO SCORING PANEL & INTERACTIVE CALCULATORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT FACTORS SLIDERS (2 COLS) */}
        <div className={`col-span-1 lg:col-span-2 p-6 rounded-lg border shadow-xs space-y-6 ${currentTheme}`}>
          
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-serif font-bold text-base text-slate-905">
                Go/No-Go Pursuit Criteria Estimator
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluating target metrics for <strong className="text-blue-900 font-mono">{selectedOpp.title} ({selectedOpp.id})</strong>.
              </p>
            </div>
            <div className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded flex items-center gap-1.5 border border-slate-200">
              <span className="text-slate-500">PROPOSAL OWNER:</span>
              <strong className="text-blue-950">{selectedOpp.owner}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN 1: WIN PROBABILITY FACTORS */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <Calculator className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-mono font-bold text-slate-700 uppercase">Win Probability Sliders (Weights applied)</span>
              </div>

              {/* Slider 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-700">
                  <span className="font-semibold">Client Relationship (18%):</span>
                  <strong className="text-blue-900">{clientRelationship}%</strong>
                </div>
                <input 
                  type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={clientRelationship} onChange={(e) => setClientRelationship(parseInt(e.target.value))}
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-700">
                  <span className="font-semibold">FAA Past Performance Match (15%):</span>
                  <strong className="text-blue-900">{pastPerformance}%</strong>
                </div>
                <input 
                  type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={pastPerformance} onChange={(e) => setPastPerformance(parseInt(e.target.value))}
                />
              </div>

              {/* Slider 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-700">
                  <span className="font-semibold">Technical / Cab Height Engineering (12%):</span>
                  <strong className="text-blue-900">{technicalFit}%</strong>
                </div>
                <input 
                  type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={technicalFit} onChange={(e) => setTechnicalFit(parseInt(e.target.value))}
                />
              </div>

              {/* Slider 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-700">
                  <span className="font-semibold">Staffing Sizing Readiness (10%):</span>
                  <strong className="text-blue-900">{staffingReady}%</strong>
                </div>
                <input 
                  type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={staffingReady} onChange={(e) => setStaffingReady(parseInt(e.target.value))}
                />
              </div>

              {/* Slider 5 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-700">
                  <span className="font-semibold">DBE / SBE Teaming Alignment (5%):</span>
                  <strong className="text-blue-900">{dbeAlignment}%</strong>
                </div>
                <input 
                  type="range" min="0" max="100" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={dbeAlignment} onChange={(e) => setDbeAlignment(parseInt(e.target.value))}
                />
              </div>

              {/* Incumbent Checkbox */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-150 rounded">
                <input 
                  id="incumbent-dis" type="checkbox" className="w-4 h-4 text-blue-900 focus:ring-blue-950 border-slate-300 rounded"
                  checked={isIncumbentDisadvantage} onChange={(e) => setIsIncumbentDisadvantage(e.target.checked)}
                />
                <label htmlFor="incumbent-dis" className="text-[11px] font-mono font-semibold text-slate-700 cursor-pointer">
                  Flag Incumbent Disadvantage Penalty (-10% Penalty)
                </label>
              </div>
            </div>

            {/* COLUMN 2: REGULATION COMPLIANCE CHECKLIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-mono font-bold text-slate-700 uppercase">Compliance / Quality Gates Checklist</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input 
                    id="chk-matrix" type="checkbox" className="w-4 h-4 text-blue-900 rounded"
                    checked={complianceMatrixComplete} onChange={(e) => setComplianceMatrixComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-matrix" className="text-[11px] text-slate-700 cursor-pointer">Compliance Matrix Draft Completed (22%)</label>
                </div>

                <div className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input 
                    id="chk-artifacts" type="checkbox" className="w-4 h-4 text-blue-900 rounded"
                    checked={requiredArtifactsReady} onChange={(e) => setRequiredArtifactsReady(e.target.checked)}
                  />
                  <label htmlFor="chk-artifacts" className="text-[11px] text-slate-700 cursor-pointer">AIP/FAA Certifications Dispatched (18%)</label>
                </div>

                <div className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input 
                    id="chk-staffing" type="checkbox" className="w-4 h-4 text-blue-900 rounded"
                    checked={staffingCommitted} onChange={(e) => setStaffingCommitted(e.target.checked)}
                  />
                  <label htmlFor="chk-staffing" className="text-[11px] text-slate-700 cursor-pointer">Staff Committed / Resumes Cataloged (15%)</label>
                </div>

                <div className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input 
                    id="chk-reviewer" type="checkbox" className="w-4 h-4 text-blue-900 rounded"
                    checked={reviewerAvailability} onChange={(e) => setReviewerAvailability(e.target.checked)}
                  />
                  <label htmlFor="chk-reviewer" className="text-[11px] text-slate-700 cursor-pointer">Red-Team Reviewers Assigned (12%)</label>
                </div>

                <div className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50">
                  <input 
                    id="chk-cost" type="checkbox" className="w-4 h-4 text-blue-900 rounded"
                    checked={costModelReady} onChange={(e) => setCostModelReady(e.target.checked)}
                  />
                  <label htmlFor="chk-cost" className="text-[11px] text-slate-700 cursor-pointer">Cost LOE Calculations Sealed (8%)</label>
                </div>

                {/* Buffer */}
                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-slate-700">
                    <span className="font-semibold">Schedule Plan Buffer remaining (7%):</span>
                    <strong className="text-slate-800">{bufferPercent}%</strong>
                  </div>
                  <input 
                    type="range" min="0" max="100" className="w-full h-1"
                    value={bufferPercent} onChange={(e) => setBufferPercent(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            {/* Quick-shift stage dropdown */}
            <div className="flex items-center gap-1 border border-slate-200 rounded px-2 bg-white text-xs text-slate-700 font-mono">
              <span>SHIFT STAGE:</span>
              <select 
                value={selectedOpp.stage}
                onChange={(e) => handleUpdateStage(selectedOpp.id, e.target.value as any)}
                className="font-bold text-blue-950 py-1 bg-transparent border-none outline-none cursor-pointer"
              >
                {stages.map(s => <option value={s} key={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={handleApplyCalculations}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate &amp; Commit Ratings
            </button>
          </div>
        </div>

        {/* PROBABILITY RESULTS GRAPHIC CARD */}
        <div className="space-y-6">
          
          {/* WIN PROBABILITY SCORE GAUGE */}
          <div className={`p-6 rounded-lg border-2 text-center relative overflow-hidden ${
            settings.highContrast ? 'border-black bg-white text-black' : 'border-blue-900 bg-slate-900 text-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900" />
            
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Computed Win Probability</span>
            
            <div className="my-6">
              <span className={`text-5xl font-serif font-extrabold ${settings.highContrast ? 'text-black' : 'text-amber-400'}`}>
                {winProb}%
              </span>
              <div className="text-xs font-mono text-slate-400 mt-2">Weighted Probability Score</div>
            </div>

            {/* Threshold check */}
            <div className={`p-3 rounded text-left font-mono text-[10px] leading-relaxed ${
              winProb >= 65 
                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' 
                : 'bg-amber-900/30 text-amber-300 border border-amber-500/10'
            }`}>
              <div className="font-bold uppercase flex items-center gap-1 mb-1 text-xs">
                {winProb >= 65 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                {winProb >= 65 ? 'GO DIRECTIVE REVEALED' : 'CAUTION THRESHOLD'}
              </div>
              <span>
                {winProb >= 65
                  ? `This pursuit holds an exceptional rating. It meets or overrides the standard 65% civil bidding baseline.`
                  : `Evaluation fails the typical 65% win threshold. Redouble DBE, teaming partner metrics, or review the past-performance logs.`}
              </span>
            </div>
          </div>

          {/* COMPLIANCE COMPLETION SCORE GAUGE */}
          <div className={`p-6 rounded-lg border text-center ${currentTheme}`}>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">Bid Completion Readiness</span>
            
            <div className="my-4">
              <span className="text-4xl font-serif font-extrabold text-slate-900">
                {completionProb}%
              </span>
              <div className="text-[10px] font-mono text-slate-500 mt-1">Checklist Compliance Index</div>
            </div>

            {/* Simulated progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-300 ${
                  completionProb > 80 ? 'bg-emerald-600' : completionProb > 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${completionProb}%` }}
              />
            </div>

            <p className="text-[10px] font-sans text-slate-500 mt-4 leading-normal text-left">
              🔒 <strong>Federal Compliance Rule</strong>: Complete required FAA design parameters (FAA Order 6480.4B, AIP DBE certifications) to scale readiness output metrics to 100%.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
