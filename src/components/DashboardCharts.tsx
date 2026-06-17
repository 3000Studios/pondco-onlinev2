import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Volume2, 
  RefreshCw, 
  Info, 
  Layers, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AccessibilitySettings, AuditLog, ServiceStatusItem } from '../types';

interface DashboardChartsProps {
  logs: AuditLog[];
  statuses: ServiceStatusItem[];
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  logs,
  statuses,
  settings,
  onAnnounce,
  playSound
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'category' | 'temporal' | 'agency'>('temporal');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [liveSimulation, setLiveSimulation] = useState<boolean>(false);
  const [simTrafficSpeed, setSimTrafficSpeed] = useState<number>(45); // simulated concurrent incoming ticks
  const [historicalData, setHistoricalData] = useState<Array<{ time: string; cpu: number; requests: number; memory: number }>>([
    { time: '14:00', cpu: 22, requests: 140, memory: 40 },
    { time: '15:00', cpu: 34, requests: 185, memory: 42 },
    { time: '16:00', cpu: 45, requests: 290, memory: 45 },
    { time: '17:00', cpu: 28, requests: 210, memory: 44 },
    { time: '18:00', cpu: 56, requests: 380, memory: 48 },
    { time: '19:00', cpu: 74, requests: 460, memory: 55 },
    { time: '20:00', cpu: 42, requests: 310, memory: 50 },
    { time: '21:00', cpu: 32, requests: 220, memory: 48 },
  ]);

  // Handle live traffic generation when simulation is active
  useEffect(() => {
    if (!liveSimulation) return;
    
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const nextTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        // Generate values around baseline with noise
        const prevPoint = prev[prev.length - 1] || { cpu: 40, requests: 250, memory: 48 };
        const dCpu = Math.floor((Math.random() - 0.5) * 12);
        const dRequests = Math.floor((Math.random() - 0.5) * 60);
        
        const newCpu = Math.max(10, Math.min(95, prevPoint.cpu + dCpu));
        const newRequests = Math.max(50, Math.min(600, prevPoint.requests + dRequests));
        const newMemory = Math.max(30, Math.min(85, prevPoint.memory + Math.floor((Math.random() - 0.5) * 4)));
        
        // Update simulation bar concurrently
        setSimTrafficSpeed(newRequests);

        const updated = [...prev.slice(1), { time: nextTime, cpu: newCpu, requests: newRequests, memory: newMemory }];
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [liveSimulation]);

  // Aggregate stats from direct logs
  const categories = ['SECURITY', 'RECORDS', 'COMPLIANCE', 'SYSTEM', 'PUBLIC_REQUEST'] as const;
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = logs.filter(l => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const totalLogs = logs.length || 1;
  const categoryData = categories.map(cat => ({
    name: cat.replace('_', ' '),
    rawName: cat,
    count: categoryCounts[cat] || 0,
    percentage: Math.round(((categoryCounts[cat] || 0) / totalLogs) * 100)
  }));

  // Aggregate severity indices
  const severityCounts = {
    INFO: logs.filter(l => l.severity === 'INFO').length,
    SUCCESS: logs.filter(l => l.severity === 'SUCCESS').length,
    WARNING: logs.filter(l => l.severity === 'WARNING').length,
    ERROR: logs.filter(l => l.severity === 'ERROR').length,
  };

  // Aggregate agency counts
  const agencies = Array.from(new Set(logs.map(l => l.agency))) as string[];
  const agencyData = agencies.map(agency => ({
    name: agency,
    shortName: agency.split('(')[1]?.replace(')', '') || agency.substring(0, 8),
    count: logs.filter(l => l.agency === agency).length
  })).sort((a, b) => b.count - a.count);

  // Announcement triggers for each visualization
  const handleAnnounceChartState = () => {
    playSound();
    if (activeChartTab === 'temporal') {
      const latest = historicalData[historicalData.length - 1];
      const summary = `Temporal load analysis showing ${historicalData.length} records. Active CPU is ${latest.cpu} percent. Network traffic concurrency is ${latest.requests} concurrent requests per second. Memory indexing at ${latest.memory} percent capacity. Standard safe baselines apply.`;
      onAnnounce(summary);
    } else if (activeChartTab === 'category') {
      const summaryLines = categoryData.map(c => `${c.name}: ${c.count} items, comprising ${c.percentage}% of the ledger.`).join(' ');
      onAnnounce(`Registry categorization overview distribution. ${summaryLines} Grand total is ${logs.length} logged events.`);
    } else {
      const leading = agencyData[0] ? `${agencyData[0].name} leads with ${agencyData[0].count} logs.` : '';
      onAnnounce(`Agency registry metrics showing ${agencyData.length} departments. ${leading} High compliance consistency reported.`);
    }
  };

  // Color mappings
  const getContrastColor = (index: number, type: 'fill' | 'stroke') => {
    if (settings.highContrast) {
      if (type === 'fill') {
        const fills = ['#000000', '#FFFFFF', '#333333', '#666666', '#999999'];
        return fills[index % fills.length];
      } else {
        return '#000000';
      }
    }
    
    // Modern deep civil brand palette
    const colors = [
      '#1E3A8A', // Blue 900
      '#F59E0B', // Amber 500
      '#10B981', // Emerald 500
      '#EF4444', // Red 500
      '#8B5CF6', // Violet 500
    ];
    return colors[index % colors.length];
  };

  return (
    <section 
      className={`p-6 rounded-lg border shadow-xs transition-all space-y-6 ${
        settings.highContrast ? 'border-2 border-black bg-white text-black' : 'bg-slate-900/60 backdrop-blur-md border border-white/10 text-white'
      }`}
      aria-label="Federal registries interactive data visualizations"
    >
      {/* CARD TOP ROW TITLES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-600 font-bold tracking-widest uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 animate-pulse" />
            REGISTRY STATISTICAL VISUALIZATIONS PLATFORM (RSVP)
          </span>
          <h3 className="font-serif font-bold text-slate-900 text-base mt-1">
            Authorized System Telemetry Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans leading-normal">
            Real-time interactive monitoring of federal audit logs, CPU workloads, and peripheral service loads. Meets Section 508 accessibility norms with descriptive synthesizer announcements.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Assistive announcer voice btn */}
          <button
            onClick={handleAnnounceChartState}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.highContrast 
                ? 'border-2 border-black bg-black text-white hover:bg-slate-900' 
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
            }`}
            title="Listen to comprehensive screen reader textual description of visual graphs"
          >
            <Volume2 className="w-4 h-4" />
            Announce Visual Summary
          </button>

          {/* Pulse Simulation Trigger */}
          <button
            onClick={() => {
              setLiveSimulation(!liveSimulation);
              playSound();
              onAnnounce(liveSimulation ? "Live server telemetry simulation paused." : "Live server telemetry simulation started. Charting active requests dynamically.");
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              liveSimulation 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${liveSimulation ? 'animate-spin' : ''}`} />
            {liveSimulation ? 'SIMULATOR: LIVE' : 'SIMULATE REAL-TIME'}
          </button>
        </div>
      </div>

      {/* THREE INTERACTIVE PERSPECTIVES FILTER TABS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveChartTab('temporal');
            playSound();
            onAnnounce("Switched view to System Resource and Load telemetries. Interactive line graph loaded.");
          }}
          className={`px-4 py-2.5 text-xs font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeChartTab === 'temporal'
              ? 'border-blue-900 text-blue-900 font-bold bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          aria-selected={activeChartTab === 'temporal'}
          role="tab"
        >
          <Cpu className="w-3.5 h-3.5" />
          Gateway Load &amp; Traffic
        </button>

        <button
          onClick={() => {
            setActiveChartTab('category');
            playSound();
            onAnnounce("Switched view to Audit distribution by Categories. Segmented SVG donut chart is focused.");
          }}
          className={`px-4 py-2.5 text-xs font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeChartTab === 'category'
              ? 'border-blue-900 text-blue-900 font-bold bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          aria-selected={activeChartTab === 'category'}
          role="tab"
        >
          <PieChart className="w-3.5 h-3.5" />
          Ledger Category Breakdown
        </button>

        <button
          onClick={() => {
            setActiveChartTab('agency');
            playSound();
            onAnnounce("Switched view to Agency compliance comparisons. Bar charting metrics have loaded.");
          }}
          className={`px-4 py-2.5 text-xs font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeChartTab === 'agency'
              ? 'border-blue-900 text-blue-900 font-bold bg-blue-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          aria-selected={activeChartTab === 'agency'}
          role="tab"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Agency Registry Compare
        </button>
      </div>

      {/* DISPLAY GRAPH PORT AREA (FULLY RESPONSIVE SVGS) */}
      <div className={`p-4 rounded-lg min-h-[300px] flex flex-col justify-center relative ${
        settings.highContrast ? 'bg-white border border-black' : 'bg-slate-50/60 border border-slate-100'
      }`}>
        
        {/* TAB 1: TEMPORAL RESOURCE AREA CHART */}
        {activeChartTab === 'temporal' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-4 h-4 text-blue-900" />
                Live CPU Workload vs Network Request Throughput (Past 8 Intervals)
              </span>
              {liveSimulation && (
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  CONCURRENT INCOMING HITS: {simTrafficSpeed} requests/s
                </span>
              )}
            </div>

            {/* Area SVG Chart */}
            <div className="relative w-full h-64 bg-white rounded border border-slate-200">
              <svg 
                viewBox="0 0 800 240" 
                className="w-full h-full p-2 overflow-visible"
                aria-label="Line graph showing rise and fall of active processor load and network queries. Fully accessible table below."
              >
                {/* Horizontal Guide lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                  const y = 20 + 180 * p;
                  return (
                    <g key={i}>
                      <line 
                        x1="50" y1={y} x2="760" y2={y} 
                        stroke={settings.highContrast ? '#000000' : '#E2E8F0'} 
                        strokeWidth="1" 
                        strokeDasharray={settings.highContrast ? '1 1' : '3 3'} 
                      />
                      <text 
                        x="15" y={y + 4} 
                        fill="#64748B" 
                        className="text-[10px] font-mono font-medium"
                      >
                        {Math.round(100 - p * 100)}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Time Marks */}
                <line x1="50" y1="200" x2="760" y2="200" stroke="#94A3B8" strokeWidth="1.5" />
                {historicalData.map((pt, i) => {
                  const x = 50 + (710 / (historicalData.length - 1)) * i;
                  return (
                    <g key={i}>
                      <line x1={x} y1="200" x2={x} y2="204" stroke="#94A3B8" strokeWidth="1" />
                      <text 
                        x={x} y="222" 
                        textAnchor="middle" 
                        fill="#64748B" 
                        className="text-[10px] font-mono leading-none"
                      >
                        {pt.time}
                      </text>
                    </g>
                  );
                })}

                {/* AREA CHART PATH (CPU Load) */}
                {(() => {
                  const points = historicalData.map((pt, i) => {
                    const x = 50 + (710 / (historicalData.length - 1)) * i;
                    const y = 200 - (pt.cpu / 100) * 180;
                    return `${x},${y}`;
                  });
                  const pathStr = `M 50,200 L ${points.join(' L ')} L 760,200 Z`;
                  const lineStr = `M ${points.join(' L ')}`;

                  return (
                    <g>
                      <path 
                        d={pathStr} 
                        fill={settings.highContrast ? 'none' : 'rgba(30,58,138,0.06)'} 
                        stroke="none"
                      />
                      <path 
                        d={lineStr} 
                        fill="none" 
                        stroke={settings.highContrast ? '#000000' : '#1E3A8A'} 
                        strokeWidth={settings.highContrast ? '3' : '2.5'} 
                      />
                    </g>
                  );
                })()}

                {/* LINE CHART PATH 2 (Requests/s, scaled down dynamically) */}
                {(() => {
                  const points = historicalData.map((pt, i) => {
                    const x = 50 + (710 / (historicalData.length - 1)) * i;
                    // Scale requests (max 600 map to 180 height)
                    const normalizedVal = (pt.requests / 600) * 100;
                    const y = 200 - (normalizedVal / 100) * 180;
                    return `${x},${y}`;
                  });
                  const lineStr = `M ${points.join(' L ')}`;

                  return (
                    <g>
                      <path 
                        d={lineStr} 
                        fill="none" 
                        stroke={settings.highContrast ? '#000000' : '#F59E0B'} 
                        strokeWidth="2" 
                        strokeDasharray={settings.highContrast ? '1 1' : 'none'}
                      />
                    </g>
                  );
                })()}

                {/* HOVER INTERACTION DOTS */}
                {historicalData.map((pt, i) => {
                  const x = 50 + (710 / (historicalData.length - 1)) * i;
                  const yCpu = 200 - (pt.cpu / 100) * 180;
                  const yReq = 200 - ((pt.requests / 600) * 180);

                  const isFocused = focusedIndex === i;

                  return (
                    <g key={i} className="cursor-pointer group">
                      {/* Invisible wider hover pillar */}
                      <rect
                        x={x - 20} y="20" width="40" height="180"
                        fill="transparent"
                        onMouseEnter={() => {
                          setHoveredDataPoint({ ...pt, idx: i });
                          setFocusedIndex(i);
                        }}
                        onMouseLeave={() => {
                          setHoveredDataPoint(null);
                          setFocusedIndex(null);
                        }}
                        onFocus={() => {
                          setFocusedIndex(i);
                          if (settings.screenReaderActive) {
                            onAnnounce(`Time interval ${pt.time}: CPU Load is ${pt.cpu} percent. Network hits are ${pt.requests} requests per second.`);
                          }
                        }}
                        tabIndex={0}
                        aria-label={`Time point ${pt.time}. CPU ${pt.cpu} percent. Network queries ${pt.requests}`}
                      />

                      {/* Display Dots with focus enlargement */}
                      <circle 
                        cx={x} cy={yCpu} 
                        r={isFocused ? '7' : '4'} 
                        fill={settings.highContrast ? '#000000' : '#1E3A8A'} 
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                      <circle 
                        cx={x} cy={yReq} 
                        r={isFocused ? '7' : '4'} 
                        fill={settings.highContrast ? '#000000' : '#F59E0B'} 
                        stroke="#FFFFFF" 
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* FLOATING DATA TOOLTIP */}
              {hoveredDataPoint && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded border border-white/20 shadow-lg text-[11px] font-mono space-y-1 z-10 leading-normal">
                  <div className="text-amber-400 font-bold border-b border-white/10 pb-1 flex justify-between gap-6">
                    <span>TIME STAMP INDEX //</span>
                    <span>{hoveredDataPoint.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4 text-slate-200">
                    <span>ACTIVE CPU CORE UTILIZATION:</span>
                    <strong className="text-white">{hoveredDataPoint.cpu}%</strong>
                  </div>
                  <div className="flex justify-between items-center gap-4 text-slate-200">
                    <span>NETWORK GATEWAY hits:</span>
                    <strong className="text-amber-400">{hoveredDataPoint.requests} reqs/s</strong>
                  </div>
                  <div className="flex justify-between items-center gap-4 text-slate-200">
                    <span>LOCAL INDEXING MEM BUFFER:</span>
                    <strong className="text-white">{hoveredDataPoint.memory}%</strong>
                  </div>
                </div>
              )}
            </div>

            {/* LEGEND ROW info details */}
            <div className="flex flex-wrap gap-4 text-[10px] font-mono justify-center">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold dark:text-blue-700">
                <span className="w-3 h-3 bg-blue-900 border border-white rounded-full inline-block" />
                <span>CPU LOADING RATIO</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-3 h-3 bg-amber-500 border border-white rounded-full inline-block" />
                <span>SYSTEMIC REQUEST HITS (scaled req/s)</span>
              </div>
              <span className="text-slate-400">| Press tab or hover to scan timepoint peaks</span>
            </div>
          </div>
        )}

        {/* TAB 2: LEDGER SECTOR CATEGORIZATION (DONUT) */}
        {activeChartTab === 'category' && (
          <div className="space-y-4 animate-fade-in text-center flex flex-col items-center">
            <span className="text-xs font-serif font-bold text-slate-800 text-left self-start flex items-center gap-1">
              <Layers className="w-4 h-4 text-blue-900" />
              Dynamic Donut Distribution of Active Audit Ledger Logs ({logs.length} Total records)
            </span>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6 w-full py-4">
              {/* Pie/Donut SVG drawing */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    let cumulativePercentage = 0;
                    return categoryData.map((item, i) => {
                      if (item.count === 0) return null;
                      
                      const strokeDash = `${item.percentage} ${100 - item.percentage}`;
                      const strokeOffset = 100 - cumulativePercentage;
                      cumulativePercentage += item.percentage;

                      const isFocused = focusedIndex === i;

                      return (
                        <circle
                          key={item.name}
                          cx="50" cy="50" r="15.91549430918954" // radius for exact circumference of 100
                          fill="transparent"
                          stroke={getContrastColor(i, 'fill')}
                          strokeWidth={isFocused ? "10" : "8"}
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 cursor-pointer outline-none focus:stroke-slate-900"
                          title={`${item.name}: ${item.percentage}%`}
                          onMouseEnter={() => {
                            setHoveredDataPoint({ ...item, idx: i });
                            setFocusedIndex(i);
                          }}
                          onMouseLeave={() => {
                            setHoveredDataPoint(null);
                            setFocusedIndex(null);
                          }}
                          onFocus={() => {
                            setFocusedIndex(i);
                            if (settings.screenReaderActive) {
                              onAnnounce(`${item.name} category contains ${item.count} logs. That represents ${item.percentage} percent of the active ledger.`);
                            }
                          }}
                          tabIndex={0}
                          aria-label={`${item.name} registry category: ${item.count} items, ${item.percentage} percent`}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Centered Donut Hole metadata count */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none">
                  <span className="text-xl font-bold text-slate-800 font-serif leading-none">{logs.length}</span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">LOG FILES</span>
                </div>
              </div>

              {/* Category legends with exact count listings (Enlarged hit target for easy hovering) */}
              <div className="text-left space-y-2 max-w-xs md:max-w-md w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {categoryData.map((item, i) => {
                    const isF = focusedIndex === i;
                    return (
                      <div 
                        key={item.name} 
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer select-none ${
                          isF 
                            ? 'border-blue-900 bg-blue-50/40 shadow-xs scale-[1.02]' 
                            : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onMouseEnter={() => {
                          setFocusedIndex(i);
                          setHoveredDataPoint({ ...item, idx: i });
                        }}
                        onMouseLeave={() => {
                          setFocusedIndex(null);
                          setHoveredDataPoint(null);
                        }}
                        onClick={() => {
                          setFocusedIndex(i);
                          setHoveredDataPoint({ ...item, idx: i });
                          if (settings.screenReaderActive) {
                            onAnnounce(`${item.name}: ${item.count} counts, representing ${item.percentage} percent.`);
                          }
                          playSound();
                        }}
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span 
                            className="w-3.5 h-3.5 inline-block rounded-full shrink-0 border border-white shadow-xs" 
                            style={{ backgroundColor: getContrastColor(i, 'fill') }}
                          />
                          <span className="truncate tracking-tight uppercase text-[11px]">{item.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-5.5 mt-1 flex justify-between">
                          <span>{item.count} items</span>
                          <span className="font-extrabold text-blue-950">{item.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Static diagnostic checklist summary of severity codes */}
            <div className="w-full pt-4 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-600 bg-slate-50/40 p-3 rounded">
              <div className="flex justify-between px-2">
                <span>INFO INDEX:</span> <strong className="text-blue-900">{severityCounts.INFO}</strong>
              </div>
              <div className="flex justify-between px-2">
                <span>SEC SUCCESS:</span> <strong className="text-emerald-700">{severityCounts.SUCCESS}</strong>
              </div>
              <div className="flex justify-between px-2">
                <span>WARNING TRIGGERS:</span> <strong className="text-amber-700">{severityCounts.WARNING}</strong>
              </div>
              <div className="flex justify-between px-2 flex-wrap sm:flex-nowrap">
                <span>ERROR FAULTS:</span> <strong className="text-rose-600">{severityCounts.ERROR}</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGENCY REGISTRY COMPILER (BAR CHART) */}
        {activeChartTab === 'agency' && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-serif font-bold text-slate-800 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-blue-900" />
              Comparative Ledger Volume by Active Federal Compliance Agency
            </span>

            {/* Horizontal Bar charts layout */}
            <div className="space-y-3.5 max-w-2xl mx-auto py-2">
              {agencyData.length === 0 ? (
                <div className="text-center italic text-slate-500 py-8 font-mono">
                  No active agency log records found to compile.
                </div>
              ) : (
                agencyData.map((item, i) => {
                  const maxCount = Math.max(...agencyData.map(a => a.count)) || 1;
                  const ratio = (item.count / maxCount) * 100;
                  const isF = focusedIndex === i;

                  return (
                    <div 
                      key={item.name}
                      className={`p-2 rounded-md transition-all cursor-pointer select-none ${
                        isF 
                          ? 'bg-blue-50/50 border-l-4 border-blue-900 pl-3 scale-[1.01]' 
                          : 'hover:bg-slate-100/50 border-l-4 border-transparent'
                      }`}
                      onMouseEnter={() => setFocusedIndex(i)}
                      onMouseLeave={() => setFocusedIndex(null)}
                      onClick={() => {
                        setFocusedIndex(i);
                        if (settings.screenReaderActive) {
                          onAnnounce(`${item.name} responsible for ${item.count} ledger logs.`);
                        }
                        playSound();
                      }}
                      onFocus={() => {
                        setFocusedIndex(i);
                        if (settings.screenReaderActive) {
                          onAnnounce(`${item.name} responsible for ${item.count} ledger logs.`);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`${item.name}: ${item.count} logs`}
                    >
                      <div className="flex justify-between text-xs font-mono text-slate-600">
                        <span className="font-extrabold truncate max-w-[400px] text-slate-800">{item.name}</span>
                        <span className="font-extrabold text-blue-950 shrink-0">{item.count} records</span>
                      </div>
                      
                      <div className={`w-full h-5 mt-1 bg-slate-150 rounded-sm overflow-hidden border border-slate-200 transition-all ${
                        isF ? 'bg-slate-200 ring-2 ring-blue-900/10' : ''
                      }`}>
                        <div
                          className="h-full rounded-r-xs transition-all duration-500"
                          style={{ 
                            width: `${ratio}%`,
                            backgroundColor: getContrastColor(i, 'fill')
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="text-[10px] text-center font-mono text-slate-400">
              Agency data updates dynamically in sync with the live civil registration desk.
            </div>
          </div>
        )}
      </div>

      {/* SECTION 508 ACCESSIBLE TABULAR DATA TABLE PORT (FOR SCREEN READERS AND KEYBOARD DEPENDENTS) */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => {
            const tableEl = document.getElementById('rsvp-accessible-table');
            if (tableEl) {
              tableEl.classList.toggle('hidden');
              playSound();
              const isH = tableEl.classList.contains('hidden');
              onAnnounce(isH ? "Accessible data spreadsheet collapsed." : "Accessible data spreadsheet revealed. Tab down to explore registry log indices.");
            }
          }}
          className="text-xs text-blue-950 font-bold underline hover:text-blue-900 flex items-center gap-1 cursor-pointer py-1"
          aria-expanded="false"
          aria-controls="rsvp-accessible-table"
        >
          <Info className="w-3.5 h-3.5 inline text-blue-900 shrink-0" />
          <span>Toggle Accessible High-Contrast Data Spreadsheet (Standard Section 508 Layout)</span>
        </button>

        <div id="rsvp-accessible-table" className="hidden mt-4 border border-slate-300 rounded overflow-x-auto bg-slate-50/50">
          <table className="w-full text-left text-xs font-mono text-slate-800 min-w-[500px]">
            <caption className="sr-only">Comprehensive compliance grid mapping exact ledger volume values compiled in visual dashboard graphs.</caption>
            <thead>
              <tr className="border-b border-slate-300 bg-slate-200 text-slate-900">
                <th scope="col" className="p-2.5 font-bold border-r border-slate-300">REGISTRY DATATYPE PERSPECTIVE</th>
                <th scope="col" className="p-2.5 font-bold border-r border-slate-300">CRITERIA LABEL / TIME INTERV</th>
                <th scope="col" className="p-2.5 font-bold border-r border-slate-300">RECORDS INDEX / METRIC VALUE</th>
                <th scope="col" className="p-2.5 font-bold">LEDGER STATUS KEY</th>
              </tr>
            </thead>
            <tbody>
              {/* Categories */}
              {categoryData.map((c) => (
                <tr className="border-b border-slate-200 hover:bg-slate-100" key={c.name}>
                  <td className="p-2 border-r border-slate-200">Ledger Category</td>
                  <td className="p-2 border-r border-slate-200 font-bold">{c.name}</td>
                  <td className="p-2 border-r border-slate-200 text-slate-900 font-bold">{c.count} Logs</td>
                  <td className="p-2 text-emerald-800 font-bold uppercase">{c.percentage}% ratio</td>
                </tr>
              ))}
              {/* Live telemetry times */}
              {historicalData.slice(-3).map((pt, i) => (
                <tr className="border-b border-slate-200 hover:bg-slate-100/80" key={`time-${i}`}>
                  <td className="p-2 border-r border-slate-200">Resource Load Check</td>
                  <td className="p-2 border-r border-slate-200 font-bold">NTP Time {pt.time}</td>
                  <td className="p-2 border-r border-slate-200 font-bold">CPU: {pt.cpu}% | network: {pt.requests} hits/s</td>
                  <td className="p-2 text-blue-900 font-bold">Live Synced</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
