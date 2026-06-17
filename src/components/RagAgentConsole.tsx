import React, { useState } from 'react';
import { 
  Search, 
  Cpu, 
  Sparkles, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Send, 
  Terminal, 
  CornerDownRight, 
  Check, 
  AlertCircle, 
  Database, 
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AccessibilitySettings, AuditLog } from '../types';

interface RagAgentConsoleProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
  onAddLog: (newLog: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

interface ChatMessage {
  sender: 'USER' | 'AGENT';
  text: string;
  agentRole?: string;
  citations?: string[];
  trace?: string[];
}

export const RagAgentConsole: React.FC<RagAgentConsoleProps> = ({
  settings,
  onAnnounce,
  playSound,
  onAddLog
}) => {
  // Mock RAG Knowledge Database Documents
  const RAG_LIBRARY = [
    {
      id: 'DOC-FAA-6480B',
      title: 'FAA Order 6480.4B - ATCT Height & Cab Orientation',
      sector: 'Aviation Planning',
      summary: 'Establishes procedural standards for site selection and height calculations of air traffic control towers to maintain optimal visibility over critical runways.',
      chunks: [
        'Section 3.2: Sightline criteria requires 100% visibility of all active runway thresholds from the controller floor.',
        'Section 4.1: Height determinations must calculate physical cab floor heights using the standard cab visibility curve formula.',
        'Section 5.3: Core orientation parameters require control cabs to face roughly perpendicular to the main runway alignment.'
      ]
    },
    {
      id: 'DOC-FAA-7210',
      title: 'FAA Order JO 7210.78 - Contract Tower Program Startups',
      sector: 'Compliance & Legal',
      summary: 'Procedural guidance on contract compliance, benefit-cost ratio eligibility, local airport sponsors responsibilities, and AIP grant limits.',
      chunks: [
        'Benefit-Cost Ratio (BCR) must exceed 1.0 to secure FAA-contractor dispatch support budgets.',
        'Section 2: Airport sponsors maintain full structural capital construction expenses which must be audited by public certification officers.',
        'DBE commitment quotas: All contract tower design and geotech bidding cycles must reserve a minimum participation target of 12.5%.'
      ]
    },
    {
      id: 'DOC-SOIL-JC',
      title: 'Jacqueline Cochran Geotech Borehole study - April 2026',
      sector: 'Geomechanics (KSA)',
      summary: 'Soil moisture, structural integrity, and structural bearing limits surrounding planned runways 17/35 coordinates.',
      chunks: [
        'Geotechnical boring B-1 shows highly compressed clay and gravel compositions supporting bearing loads up to 4500 PSF.',
        'Water table depth discovered at 14.5 feet below foundation baseline. Dewatering is advised during the Phase III layout cycle.'
      ]
    }
  ];

  // RAG Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Agent Chat States
  const [selectedAgent, setSelectedAgent] = useState<'compliance' | 'analyst' | 'executive'>('compliance');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      sender: 'AGENT',
      agentRole: 'Proposal Compliance Officer',
      text: 'Greetings. I am your proposal compliance assistant. I can scan draft technical plans against the FAA Contract Tower startup rules and verify DBE participation benchmarks. Ask me anything regarding FAA-Order JO 7210.78 or Jacqueline Cochran / French Valley bids.',
      trace: [
        'Initialize Supervisor Agent Routine Class [COMPLIANCE]',
        'Load active FAA JO-7210 grounding documents',
        'Model Routing: [gemini-fast]'
      ]
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Perform Simulated RAG hybrid search
  const handleRagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    playSound();
    onAnnounce(`Searching RAG knowledge database for: ${searchQuery}`);

    // Simple keyword-based filtering
    const matchingDocs = RAG_LIBRARY.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.chunks.some(chunk => chunk.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setSearchResults(matchingDocs);

    // Record retrieval action in system log
    onAddLog({
      agency: 'Pond Aviation Planning Division (PAPD)',
      category: 'RECORDS',
      severity: 'INFO',
      message: `RAG RETRIEVAL: Phrase [${searchQuery}] evaluated against RAG knowledge base. Found ${matchingDocs.length} source documents.`,
      operator: 'SYSTEM_BOT',
      ipAddress: '10.224.2.105'
    });
  };

  // Agent response simulation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    playSound();
    const userMsg: ChatMessage = { sender: 'USER', text: userInput };
    setChatLog(prev => [...prev, userMsg]);
    const requestedInput = userInput;
    setUserInput('');
    setIsTyping(true);

    onAnnounce(`Message sent to agent: ${requestedInput}`);

    // Simulated model response delay
    setTimeout(() => {
      let reply = '';
      let citations: string[] = [];
      let traceSteps: string[] = [];

      // Customize response based on role and input query
      if (selectedAgent === 'compliance') {
        reply = `Analyzing proposed regulatory scopes. Based on FAA Order JO 7210.78, Jacqueline Cochran and French Valley airport tower contracts require strict DBE monitoring. The target DBE program participation target is 12.5%. I confirm the current KSA/Pape-Dawson grouping satisfies these regulatory metrics.`;
        citations = [
          'DOC-FAA-7210: FAA Order JO 7210.78 / Section 2 Benefit-Cost & DBE limits'
        ];
        traceSteps = [
          'Model Activated: [gemini-reasoning]',
          'Evaluating user query against context chunking models',
          'Search query formulated: "DBE target and FAA JO 7210 contract rules"',
          'Synthesized grounded query with prompt constraints'
        ];
      } else if (selectedAgent === 'analyst') {
        reply = `Height determinations under FAA Order 6480.4B for French Valley Airport must evaluate the runway physical center points and ensure 100% structural sightline from the cab controller deck to all thresholds. Standard height models indicate an 84-foot structural cab elevation target is optimal given current local obstructions.`;
        citations = [
          'DOC-FAA-6480B: Section 3.2 runway sightline criteria',
          'DOC-FAA-6480B: Section 4.1 Height cab calculation curve formulas'
        ];
        traceSteps = [
          'Model Activated: [gemini-reasoning]',
          'Analyzing cockpit layout visibility parameters for active runpaths',
          'Retrieve: FAA 6480.4b sightline models',
          'Grounding output: 84-foot elevation prediction'
        ];
      } else {
        reply = `Portfolio projection verified. Total award threshold stands at $4,680,990 covering design and oversight loops for active twin towers. In comparison to civil spending parameters, this holds a standard risk score (2/10). All change orders have been locked into our database.`;
        citations = [
          'DOC-RIV-BOARD-2026: Riverside County FAA Tower Award Packet'
        ];
        traceSteps = [
          'Model Activated: [gemini-fast]',
          'Summing total operational costs of French Valley + Cochran scopes',
          'Risk score computed dynamically based on cost buffer curves'
        ];
      }

      setChatLog(prev => [...prev, {
        sender: 'AGENT',
        agentRole: selectedAgent === 'compliance' 
          ? 'Proposal Compliance Officer' 
          : selectedAgent === 'analyst' 
            ? 'Aviation Siting Specialist' 
            : 'Executive Portfolio Advisor',
        text: reply,
        citations,
        trace: traceSteps
      }]);

      setIsTyping(false);
      onAnnounce('Agent response received and displayed.');

      // Push audit log for agent execution
      onAddLog({
        agency: 'Pond Aviation Planning Division (PAPD)',
        category: 'SYSTEM',
        severity: 'SUCCESS',
        message: `AGENT INVOCATION: [${selectedAgent.toUpperCase()}] executed. Prompt tokens: 512, Response tokens: 340. Grounding checks certified green.`,
        operator: 'SYSTEM_BOT',
        ipAddress: '10.224.2.105'
      });

    }, 1200);
  };

  const currentTheme = settings.highContrast 
    ? 'border-2 border-black bg-white text-black' 
    : 'bg-white border-slate-200';

  return (
    <div className="space-y-6" id="panel-rag-agent" role="tabpanel" aria-labelledby="tab-rag-agent">
      
      {/* HEADER */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-blue-900 font-bold tracking-widest uppercase flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5" />
          RAG KNOWLEDGE RETRIEVAL &amp; AGENT SYSTEM
        </span>
        <h3 className="font-serif font-bold text-slate-900 text-lg mt-1">
          Aeronautical Design Grounding Registry &amp; Multi-Agent Simulation Console
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 font-sans leading-normal">
          Query flight-cab design guidelines, mock databases, and geomechanics studies. Converse with simulated specialized, role-scoped AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* SEC 1: RAG SEARCH MANUALS AND DOCUMENTS (COL SPAN 2) */}
        <div className={`lg:col-span-2 p-6 rounded-lg border shadow-xs flex flex-col justify-between ${currentTheme}`}>
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-4 font-mono text-xs font-bold text-slate-700 uppercase">
              <BookOpen className="w-4 h-4 text-blue-900" />
              Grounded Semantic Document Store
            </div>

            {/* SEARCH BAR */}
            <form onSubmit={handleRagSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Query Height determination standard, DBE targets..."
                  className="w-full text-xs p-2.5 pl-9 rounded border border-slate-300 bg-white font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="px-4 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold rounded cursor-pointer transition uppercase"
              >
                Search
              </button>
            </form>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              
              {/* If no search results show, display standard document cards */}
              {searchResults.length === 0 ? (
                <>
                  <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">Pond Vault Document Library:</div>
                  {RAG_LIBRARY.map(doc => (
                    <div key={doc.id} className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-blue-900 font-extrabold mb-1">
                        <span>{doc.id}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded uppercase font-semibold">{doc.sector}</span>
                      </div>
                      <h5 className="font-sans font-bold text-slate-900">{doc.title}</h5>
                      <p className="text-slate-500 mt-1 lines-clamp-2 leading-relaxed text-[11px]">{doc.summary}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="text-[10px] font-mono text-emerald-800 font-extrabold flex justify-between uppercase">
                    <span>Found Document Clues ({searchResults.length})</span>
                    <button 
                      onClick={() => setSearchResults([])}
                      className="text-slate-400 underline hover:text-slate-600 cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                  {searchResults.map(doc => (
                    <div key={doc.id} className="p-3.5 rounded bg-emerald-50/50 border border-emerald-250/50 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
                        <span>{doc.id}</span>
                        <strong className="text-slate-700">{doc.sector}</strong>
                      </div>
                      <h5 className="font-sans font-bold text-slate-900">{doc.title}</h5>
                      
                      {/* Sub-chunks cited */}
                      <div className="space-y-1.5 pt-1.5 border-t border-emerald-200">
                        <span className="text-[9px] font-mono font-extrabold text-emerald-800 tracking-wider block uppercase">Cited Passages:</span>
                        {doc.chunks.map((chk: string, i: number) => (
                          <div key={i} className="flex gap-1 items-start text-[10px] leading-relaxed font-mono text-emerald-950 pl-2 border-l border-emerald-400">
                            <CornerDownRight className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[10px] font-mono text-slate-700">
            🔒 <strong>Grounding Core verified</strong>: RAG queries automatically evaluate secure embeddings matching User Security clearance ratings prior to dispatching text chunks.
          </div>
        </div>

        {/* SEC 2: MULTI-AGENT CHAT CONSOLE (COL SPAN 3) */}
        <div className={`lg:col-span-3 p-6 rounded-lg border shadow-xs flex flex-col h-[560px] ${currentTheme}`}>
          
          {/* HEADER CHOOSE AGENT ROLE */}
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 uppercase">
              <MessageSquare className="w-4 h-4 text-blue-900" />
              Agent Console Selector
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedAgent('compliance')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition ${
                  selectedAgent === 'compliance' 
                    ? 'bg-blue-950 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Compliance Officer
              </button>
              <button
                onClick={() => setSelectedAgent('analyst')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition ${
                  selectedAgent === 'analyst' 
                    ? 'bg-blue-950 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Siting Specialist
              </button>
              <button
                onClick={() => setSelectedAgent('executive')}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition ${
                  selectedAgent === 'executive' 
                    ? 'bg-blue-950 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Exec Advisor
              </button>
            </div>
          </div>

          {/* CHAT LOG SCREEN */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatLog.map((msg, idx) => {
              const isAgent = msg.sender === 'AGENT';
              return (
                <div key={idx} className={`space-y-1.5 ${isAgent ? 'mr-12' : 'ml-12 text-right'}`}>
                  
                  {isAgent && (
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-blue-900 font-extrabold uppercase">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{msg.agentRole} AI</span>
                    </div>
                  )}

                  <div className={`p-3 rounded text-xs leading-normal font-medium shadow-xs border inline-block ${
                    isAgent 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 text-left' 
                      : 'bg-blue-900 border-transparent text-white text-left'
                  }`}>
                    {msg.text}

                    {/* Citations block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-1 border-t border-slate-200/50 text-[10px] font-mono text-slate-500">
                        <strong className="text-slate-700 block text-[9px] uppercase">RAG Citations Checked:</strong>
                        {msg.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-1 mt-0.5 text-blue-950 font-bold">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{cite}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trace debug parameters collapser (Agent only) */}
                  {isAgent && msg.trace && (
                    <details className="text-[9px] font-mono text-slate-400 hover:text-slate-600 block cursor-pointer select-none">
                      <summary className="font-extrabold focus:outline-none">Toggle Reasoning Trace Log details</summary>
                      <div className="p-2 bg-slate-105 border border-slate-250 rounded mt-1.5 space-y-1 text-slate-500 pl-4 border-l-2 border-l-amber-500 font-mono">
                        {msg.trace.map((step, sIdx) => (
                          <div key={sIdx} className="flex gap-1 items-start">
                            <Terminal className="w-2.5 h-2.5 mt-0.5 shrink-0 text-slate-400" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                </div>
              );
            })}

            {isTyping && (
              <div className="text-xs font-mono text-slate-400 animate-pulse flex items-center gap-1.5 pl-3">
                <Cpu className="w-3.5 h-3.5 text-slate-400 spin" />
                <span>Agent parsing and running grounding loops...</span>
              </div>
            )}
          </div>

          {/* CHAT INPUT BAR */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 pt-3">
            <input 
              type="text" 
              placeholder={`Converse with active ${selectedAgent === 'compliance' ? 'Compliance Agent' : selectedAgent === 'analyst' ? 'Aviation Siting Specialist' : 'Executive AI'}...`}
              className="flex-1 text-xs p-2.5 rounded border border-slate-300 bg-white"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="px-4 bg-blue-900 hover:bg-blue-950 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
