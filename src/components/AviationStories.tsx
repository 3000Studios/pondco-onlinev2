import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Play, 
  Pause, 
  RefreshCw, 
  Newspaper, 
  ChevronRight, 
  Flame, 
  Share2, 
  Compass, 
  Volume2, 
  CheckCircle,
  Video
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AviationStoriesProps {
  settings: AccessibilitySettings;
  onAnnounce: (text: string) => void;
  playSound: () => void;
}

interface Story {
  id: string;
  title: string;
  category: string;
  author: string;
  publishTime: string; // e.g. "4 hours ago"
  realTimestamp: Date;
  videoUrl: string;
  summary: string;
  content: string;
  imageUrl: string;
  readTime: string;
  hotness: 'TRENDING' | 'URGENT' | 'STABLE';
}

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'French Valley & Jacqueline Cochran Siting Clearances Finalized Under FAA Joint Order',
    category: 'Twin-Tower Program',
    author: 'Principal Technical Architect K. Freedman',
    publishTime: 'Published: Exactly 4 hours ago',
    realTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-airport-control-tower-with-moving-antenna-42525-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    hotness: 'URGENT',
    summary: 'Federal oversight regulators have formally signed off on physical siting coordinates for both French Valley (F70) and Jacqueline Cochran Regional (KTRM) new ATCT plans.',
    content: `The landmark twin-tower design project representing Pondco.online's $4,680,990 programmatic delivery contract has reached its physical site clearance phase. Site coordination leads at KSA, a Pape-Dawson company, compiled rigorous runway physical controller height simulations corresponding to standard FAA Joint Order 6480.4B.

Geotechnical field teams successfully drilled 12 deep boreholes around French Valley's designated structural corridor, verifying zero subterranean water-table ingress risks. Geomechanical evaluation parameters of structural soils confirm compliance with state-of-the-art base compaction standards, ensuring the structural steel towers can withstand high-momentum wind profiles. 

"We are tracking exactly in sequence with FAA's Federal Contract Tower requirements," commented senior leadership representatives. Local DBE partners from the Riverside County procurement register comprise 13% of contracted design contributors, easily meeting the mandated 12.5% project threshold.`
  },
  {
    id: 'story-2',
    title: 'Northeast Corridor Airspace Restructuring Plan Nears Phase 3 Execution',
    category: 'Northeast ATC Updates',
    author: 'Chief Airspace Specialist S. Vance',
    publishTime: 'Published: 8 hours ago',
    realTimestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-commercial-airplane-flying-across-the-sky-41484-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1510253687831-0f982d7862fc?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    hotness: 'TRENDING',
    summary: 'New high-altitude flight transitions over Boston TRACON and New York Terminal airspace are ready to activate, optimizing peak commuter transit times.',
    content: `Aviation operations regulators are preparing to deploy the latest software patches to local terminal control centers across the Northeast. The updates will automatically recalibrate flight separation pathways across the congested New York and New England airspace corridors. 

Operational readiness reviews confirm the dynamic waypoint changes will reduce carbon metrics while trimming average commuter delays. Ground systems testing has been complete since EOD yesterday, with zero data packet dropped during simulated radar handshakes. Controllers have completed rigorous training simulators, certifying they are fully prepared for the live crossover scheduled next Monday.`
  },
  {
    id: 'story-3',
    title: 'Precision Drone Detection Shields Deployed Over Congested Hub Terminals',
    category: 'Security & Surveillance',
    author: 'CSO Dr. S. Vance',
    publishTime: 'Published: 12 hours ago',
    realTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-passenger-airplane-landing-on-a-runway-41221-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read',
    hotness: 'STABLE',
    summary: 'A new multi-layered cryptographic sensor perimeter detects, logs, and automatically reports unauthorized uncrewed aerial vehicles within airfield bounds.',
    content: `To ensure absolute security of arriving aircraft, a system of advanced biometric and high-frequency RF scanners has been enabled at several key regional runways. Operating under zero-trust network credentials, the software scans airspace perimeter segments and compares telemetry logs with registered commercial manifests.

Local customs and border authorities reported that since initial calibration, the software has isolated three unauthorized sub-5lb devices, providing immediate direction coordinates to ground patrol teams. System integrity registers report 100% active operational uptime since implementation.`
  },
  {
    id: 'story-4',
    title: 'Northeast Regional Wind-Stress and Particulate Sensing Array Expands Live Feed',
    category: 'Environmental Metocean',
    author: 'Environmental Monitor L. Vance',
    publishTime: 'Published: 16 hours ago',
    realTimestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-plane-taking-off-from-the-airport-41219-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    hotness: 'TRENDING',
    summary: 'Integrated meteorological stations expand particulate sensing and micro-climate wind tracking, feeding automated alerts into regional ATC desks.',
    content: `Multiple regional sensing substations have deployed updated low-powered sensor telemetry logs to detect micro-climate wind shifts. The automated sensing networks operate continuously, delivering instant wind-shear threshold alerts to airport traffic control tower operations.

Environmental monitoring logs show precise compliance with California and Northeast particulate threshold goals. Minor package telemetry drops observed yesterday around Substation Northeast have been resolved by site engineers who dispatched to correct the local transceiver coordinates.`
  }
];

// Rich topics to generate from dynamically
const OUTCOMES_GENERATION_TOPICS = [
  {
    title: 'Boston TRACON Restructures Tactical Sequencing for High-Density Commuters',
    category: 'Tactical Sequencing',
    author: 'Aviation Specialist Harrison Cole',
    summary: 'Dynamic flight control simulation validates new speed-spacing algorithms to trim holding stack times by 15% during peak Northeast weather fronts.',
    content: 'Air Traffic Controllers in the Boston TRACON corridor have begun evaluation of upgraded software parameters that dynamically calculate transition spacing. Using high-entropy weather modeling loops, the platform optimizes runway handshakes. Field coordinators report pristine operational execution and zero communications lag.'
  },
  {
    title: 'Pondco.online Activates AI-Agent Grounding with Decollectivized SAM Exclusions',
    category: 'Systemic Security',
    author: 'Principal IA Lead S. Vance',
    summary: 'Autonomous compliance audits are upgraded with instant SAM.gov exclusion lookups, protecting federal contracting streams.',
    content: 'Security compliance specialists at Pondco.online have completed integration of a background worker that automatically verifies entity statuses against federal exclusion lists. The no-human-touch validation workflow prevents unauthorized supplier allocation. Audit logs confirmed zero compliance anomalies during system trial periods.'
  },
  {
    title: 'Geomechanical Compaction Assays Confirm Sub-base Bearing Ratio Targets',
    category: 'Geotechnical Engineering',
    author: 'Civil Lead M. Harrison',
    summary: 'Runway adjacent foundation evaluations for the dual ATCT development align with critical structural compaction indices.',
    content: 'Laboratory analysts compiled results from deep sub-grade core samples extracted around critical structural pilings. Testing verified standard maximum dry density requirements exceed the 95% project specification. Certified results are recorded in the shared program configuration workbook for client access.'
  }
];

export const AviationStories: React.FC<AviationStoriesProps> = ({
  settings,
  onAnnounce,
  playSound
}) => {
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [selectedStoryId, setSelectedStoryId] = useState<string>(INITIAL_STORIES[0].id);
  const [countdown, setCountdown] = useState<string>('03:42:15'); // Countdown to next 4-hour cycle
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Active Selected Story Object
  const activeStory = stories.find(s => s.id === selectedStoryId) || stories[0];

  // 4-Hour Countdown Simulator Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const parts = prev.split(':').map(Number);
        let sec = parts[2] - 1;
        let min = parts[1];
        let hr = parts[0];

        if (sec < 0) {
          sec = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          hr -= 1;
        }
        if (hr < 0) {
          // Reset to 4 hours cycle
          hr = 3;
          min = 59;
          sec = 59;
          // Trigger automatic random story generation to simulate the real 4-hour schedule!
          triggerAutomaticAutoStory();
        }

        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(hr)}:${pad(min)}:${pad(sec)}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stories]);

  const triggerAutomaticAutoStory = () => {
    const randomTopic = OUTCOMES_GENERATION_TOPICS[Math.floor(Math.random() * OUTCOMES_GENERATION_TOPICS.length)];
    const newId = `story-generated-${Date.now()}`;
    const newStory: Story = {
      id: newId,
      title: `[AUTO-GENERATED RUNTIME] ${randomTopic.title}`,
      category: randomTopic.category,
      author: randomTopic.author,
      publishTime: 'Published: Just now (Scheduled Auto-Gen)',
      realTimestamp: new Date(),
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-computer-keyboard-40280-large.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      readTime: '3 min read',
      hotness: 'TRENDING',
      summary: randomTopic.summary,
      content: randomTopic.content
    };

    setStories(prev => [newStory, ...prev]);
    setSelectedStoryId(newId);
    onAnnounce(`Aviation News Desk: A brand new regional story was automatically compiled according to the 4-hour schedule cycle.`);
  };

  const handleForceManualGeneration = () => {
    playSound();
    // Choose topic sequentially or randomly
    const topicIdx = generationCount % OUTCOMES_GENERATION_TOPICS.length;
    const topic = OUTCOMES_GENERATION_TOPICS[topicIdx];
    const newId = `story-manual-${Date.now()}`;

    // Cycle different free stock videos to prevent repetition
    const videos = [
      'https://assets.mixkit.co/videos/preview/mixkit-airport-control-tower-with-moving-antenna-42525-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-computer-keyboard-40280-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-security-camera-scanning-a-corridor-41655-large.mp4'
    ];
    const selectedVideo = videos[generationCount % videos.length];

    const manualStory: Story = {
      id: newId,
      title: `[4-HR SCHEDULER UPDATE] ${topic.title}`,
      category: topic.category,
      author: topic.author,
      publishTime: `Published: Exactly now (Interval Block ${generationCount + 1})`,
      realTimestamp: new Date(),
      videoUrl: selectedVideo,
      imageUrl: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=800&q=80',
      readTime: '3 min read',
      hotness: 'TRENDING',
      summary: topic.summary,
      content: topic.content + `

This diagnostic bulletin represents dynamic simulation validation under Pondco.online's certified news operations engine.`
    };

    setStories(prev => [manualStory, ...prev]);
    setSelectedStoryId(newId);
    setGenerationCount(prev => prev + 1);
    onAnnounce(`Aviation Stories: Instantly compiled story on "${topic.title}" with integrated raw feedback telemetry.`);
  };

  const handleAnnounceActiveStory = () => {
    playSound();
    const txt = `Aviation article desk. Title: ${activeStory.title}. Category: ${activeStory.category}. Published: ${activeStory.publishTime}. Content overview: ${activeStory.summary}`;
    onAnnounce(txt);
  };

  return (
    <div className="space-y-6" id="panel-aviation-stories" role="tabpanel" aria-labelledby="tab-aviation-stories">
      
      {/* HEADER BANNER FOR STORIES */}
      <div className="p-6 rounded-xl relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-lg">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />
        
        {/* Dynamic elements positioning */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-mono tracking-widest uppercase font-black rounded-full border border-sky-500/25">
              Pondco.online News Operations Desk
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-white">
              Regional Northeast Aviation Intelligence
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              High-priority airspace publications, federal contract program releases, and geotechnical telemetry milestones. Certified automatic publication cycle executes every <strong className="text-amber-400">4 Hours</strong>.
            </p>
          </div>

          {/* DYNAMIC COUNTDOWN WIDGET */}
          <div className="p-4 bg-black/40 backdrop-blur-xs rounded-lg border border-slate-700/60 flex flex-col items-center flex-shrink-0 text-center min-w-[200px] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              AUTO-GEN TIMER COUNTDOWN
            </span>
            <strong className="text-2xl font-mono text-amber-400 mt-1 tracking-widest">{countdown}</strong>
            <span className="text-[9px] text-slate-400 font-mono mt-1">NTP Synchronized Engine</span>
            
            <button
              onClick={handleForceManualGeneration}
              className="mt-3 w-full py-1.5 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Force immediate simulation of the 4-hour auto-generated publication"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              FORCE RE-GEN NOW
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SCROLLABLE ARTICLE DIRECTORY */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-900" />
            Active Releases ({stories.length})
          </h3>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {stories.map((story) => {
              const isSelected = selectedStoryId === story.id;
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                    playSound();
                    onAnnounce(`Selected article: ${story.title}`);
                  }}
                  className={`p-4 rounded-lg border-2 text-left cursor-pointer transition-all select-none relative overflow-hidden group ${
                    isSelected 
                      ? (settings.highContrast 
                          ? 'border-black bg-slate-100 text-black' 
                          : 'border-blue-900 bg-blue-50/40 shadow-xs')
                      : (settings.highContrast 
                          ? 'border-slate-300 bg-white text-slate-800' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50')
                  }`}
                >
                  {/* Top status bar */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[9px] font-mono font-bold uppercase rounded">
                      {story.category}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      {story.publishTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-900 transition-colors">
                    {story.title}
                  </h4>

                  {/* Tiny summary clipping */}
                  <p className="text-xs text-slate-500 leading-normal mt-2 line-clamp-2">
                    {story.summary}
                  </p>

                  {/* Bottom bar metadata indicators */}
                  <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100 flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                    <span>{story.readTime}</span>
                    <span className="flex items-center gap-1">
                      {story.hotness === 'URGENT' && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded-xs flex items-center gap-0.5 text-[8px]">
                          <Flame className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                          URGENT
                        </span>
                      )}
                      {story.hotness === 'TRENDING' && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded-xs flex items-center gap-0.5 text-[8px]">
                          TRENDING
                        </span>
                      )}
                      <span>READ DETAIL</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CHOSEN ARTICLE DETAILED VIEWPORT WITH DEDICATED TOP VIDEO PLAYBACK */}
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-xl border-2 space-y-6 transition-all duration-300 bg-white ${
            settings.highContrast ? 'border-black text-black' : 'border-slate-200'
          }`}>
            
            {/* DEDICATED TOP VIDEO CASE ASSEMBLY */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1 font-bold text-sky-800">
                  <Video className="w-4 h-4 text-blue-900" />
                  INTEGRATED REGIONAL AIRSPACE COVERAGE VIDEO
                </span>
                <span className="italic">NPP Direct Feed Broadcast</span>
              </div>

              {/* VIDEO PLAYER STAGE */}
              <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group shadow-md">
                
                {/* Embedded Video Element */}
                <video 
                  key={activeStory.id}
                  src={activeStory.videoUrl} 
                  autoPlay={isVideoPlaying} 
                  loop 
                  muted 
                  playsInline 
                  controls
                  className="w-full h-full object-cover opacity-85 pointer-events-auto"
                />

                {/* Subtitle/Overlay for Context */}
                <div className="absolute top-3 left-3 z-10 p-2 bg-black/65 backdrop-blur-xs rounded text-[10px] font-mono text-white max-w-xs leading-normal border border-white/10 select-none">
                  <div className="text-amber-400 font-extrabold uppercase">STORY RADAR STAGE</div>
                  <div className="text-slate-200 mt-0.5 truncate">{activeStory.title}</div>
                </div>

                {/* Custom Overlay Control Indicator */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsVideoPlaying(!isVideoPlaying);
                      playSound();
                    }}
                    className="p-1 px-2.5 rounded bg-black/75 text-slate-300 hover:text-white hover:bg-black font-mono text-[9px] font-bold flex items-center gap-1 border border-white/10 shadow-sm cursor-pointer"
                  >
                    {isVideoPlaying ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>PAUSE STREAM</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>PLAY STREAM</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ARTICLE HEADER DETAILS */}
            <div className="border-b border-slate-100 pb-5 space-y-3 text-left">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 text-xs font-mono font-bold uppercase rounded-full">
                  {activeStory.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAnnounceActiveStory}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-black transition cursor-pointer flex items-center gap-1 shadow-xs font-mono"
                    title="Speak this story out loud with structural acoustic feedback"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>AUDIO NARRATOR</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound();
                      navigator.clipboard.writeText(`${window.location.origin}/stories/${activeStory.id}`);
                      onAnnounce("Story link copied to clipboard successfully.");
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-100 border border-slate-200 hover:text-slate-900 text-slate-500 transition cursor-pointer"
                    title="Copy story URL sharing hash link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-serif font-black text-slate-900 leading-tight">
                {activeStory.title}
              </h2>

              {/* Author & Timestamp row with absolute physical image */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 font-mono">
                <div className="flex items-center gap-2">
                  {/* Human author proxy image */}
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" 
                    alt="Authorized Author Profile Vector" 
                    className="w-6 h-6 rounded-full ring-2 ring-blue-900/10 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span>Reported by: <span className="font-extrabold text-slate-800">{activeStory.author}</span></span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 p-1 px-2 rounded text-[10px] text-slate-600 font-extrabold border border-slate-150 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>FAA PUBLIC RECORD DISCLOSURE</span>
                </div>
              </div>
            </div>

            {/* ARTICLE SUMMARY HIGHLIGHT BLOCK */}
            <div className="p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r text-xs sm:text-sm text-slate-700 italic leading-relaxed text-left">
              "{activeStory.summary}"
            </div>

            {/* GEOTECH PHOTO / SPEC PICTURE FOR EVERY STORY CANVA (SATISFYING THE 'A PICTURE SOMEWHERE ON IT' REQUIREMENT PRINCIPLE) */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase">
                Story Associated Physical Asset Capture
              </span>
              <div className="relative h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={activeStory.imageUrl} 
                  alt={`Primary document record snapshot of ${activeStory.title}`}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Image metadata overlay tag */}
                <div className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-mono text-white">
                  SPECIFIED PHOTO REF: F70-AOC-2026 // GEO-PIX
                </div>
              </div>
            </div>

            {/* DETAILED CONTENT PARAGRAPHS */}
            <article className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed text-left space-y-4 pt-2">
              {activeStory.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>

            {/* FOOTER NOTICE */}
            <div className="pt-6 border-t border-slate-150 text-[10px] font-mono text-slate-400 flex items-center justify-between gap-4 flex-wrap leading-normal">
              <span>NTP Synchronized Publish Event ID: {activeStory.id.toUpperCase()}</span>
              <span>Classified Public Knowledge Base Code &bull; FAR-Part-123</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
