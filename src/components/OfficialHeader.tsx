import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Type, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Building,
  UserCheck,
  Building2,
  Users,
  LogOut
} from 'lucide-react';
import { AccessibilitySettings, UserSession } from '../types';

interface OfficialHeaderProps {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  onAnnounce: (text: string) => void;
  lastAnnouncement: string;
  session: UserSession | null;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
  setCurrentTab: (tab: string) => void;
}

export const OfficialHeader: React.FC<OfficialHeaderProps> = ({ 
  settings, 
  setSettings, 
  onAnnounce,
  lastAnnouncement,
  session,
  onLogin,
  onLogout,
  setCurrentTab
}) => {
  const [isBannerExpanded, setIsBannerExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeUsersCount, setActiveUsersCount] = useState<number>(14);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Soft random fluctuation in active users (between 12 and 16)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveUsersCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 12 && next <= 16 ? next : prev;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleHighContrast = () => {
    const nextVal = !settings.highContrast;
    setSettings(prev => ({ ...prev, highContrast: nextVal }));
    onAnnounce(nextVal ? "High contrast mode enabled." : "High contrast mode disabled.");
  };

  const toggleScreenReader = () => {
    const nextVal = !settings.screenReaderActive;
    setSettings(prev => ({ ...prev, screenReaderActive: nextVal }));
    onAnnounce(nextVal 
      ? "Screen reader speech simulator activated. Elements will be read aloud on focus and hover." 
      : "Screen reader speech simulator deactivated."
    );
  };

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: nextVal }));
    onAnnounce(nextVal ? "Chimes and audio signals enabled." : "Audio signals disabled.");
  };

  const adjustFontSize = () => {
    const sizes: AccessibilitySettings['fontSize'][] = ['standard', 'large', 'extra'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextVal = sizes[nextIndex];
    setSettings(prev => ({ ...prev, fontSize: nextVal }));
    
    const sizeLabels = {
      standard: "Standard text size (100%)",
      large: "Large text size (120%)",
      extra: "Extra Large text size (140%)"
    };
    onAnnounce(`Text scaling set to ${sizeLabels[nextVal]}.`);
  };

  const playClickSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // high chime
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Handled if browser blocks autoplay
    }
  };

  // Pre-seed instant Google-style logins as requested
  const handlePondcoEmployeeLogin = () => {
    playClickSound();
    const sessionData: UserSession = {
      username: "Mr. J.W. Swain",
      email: "mr.jwswain@gmail.com",
      clearanceLevel: "SYSTEM_ADMIN",
      token: "POND-SEC-92842",
      authenticatedTime: new Date().toISOString(),
      avatarIcon: "🛡️"
    };
    onLogin(sessionData);
    setCurrentTab("overview");
    onAnnounce("Instantly authenticated via Firebase Google SSO as Mr. J.W. Swain (Site Owner & System Admin). Swapped to Dashboard.");
  };

  const handleClientLogin = () => {
    playClickSound();
    const sessionData: UserSession = {
      username: "Mr. J.W. Swain",
      email: "mr.jwswain@gmail.com",
      clearanceLevel: "SYSTEM_ADMIN",
      token: "POND-CLN-10842",
      authenticatedTime: new Date().toISOString(),
      avatarIcon: "💼"
    };
    onLogin(sessionData);
    setCurrentTab("client-portal");
    onAnnounce("Instantly authenticated via Google Login as Mr. J.W. Swain with System Admin Privileges.");
  };

  const tickerStories = [
    { text: "⭐ [AWARD] Pond wins key $4,680,990 ATCT design contract from Riverside County Supervisors...", tab: "client-portal" },
    { text: "✈️ [FAA ORDER] French Valley Airport sightline calculations passed under FAA Order 6480.4B parameters...", tab: "client-portal" },
    { text: "🏗️ [GEOTECH] Pape-Dawson partner KSA completes runway borehold compaction and hydration audits...", tab: "client-portal" },
    { text: "🤝 [DBE STATUS] Disadvantaged Business Enterprise outreach scores level to 13.1% (exceeding 12.5% quota)...", tab: "client-portal" },
    { text: "🔐 [COMPLIANCE] Digital access ledger upgraded successfully to WCAG 2.2 Section 508 AA standards...", tab: "overview" }
  ];

  const handleStoryClick = (tab: string, text: string) => {
    playClickSound();
    setCurrentTab(tab);
    onAnnounce(`Ticker notification selected: ${text}. Navigating to related section.`);
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white" id="main-header" role="banner">
      {/* SKIP LINK FOR ACCESSIBILITY */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-amber-500 focus:text-slate-900 focus:px-4 focus:py-2 focus:ring-4 focus:ring-slate-900 focus:rounded font-semibold text-sm outline-none"
        onClick={() => {
          onAnnounce("Navigation bypassed. Moved focus to major contents.");
          playClickSound();
        }}
      >
        Skip to main content
      </a>

      {/* TOP LIGHT BLUE BAR - INTERACTIVE SCROLLING TICKER WITH CLICKABLE COMPANY STORIES */}
      <div 
        className="w-full bg-blue-50 py-2.5 px-4 text-xs border-b border-blue-150 text-blue-900 overflow-hidden relative" 
        aria-label="Interactive Company News and Latest Builds Progress Ticker"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
          {/* Ticker Title Badge */}
          <div className="bg-blue-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider shrink-0 z-10 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            SYS STATUS TICKER
          </div>

          {/* Marquee Content */}
          <div className="flex-1 overflow-hidden relative h-5 flex items-center select-none">
            <div className="absolute flex whitespace-nowrap gap-16 animate-marquee text-xs font-semibold">
              {tickerStories.map((story, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStoryClick(story.tab, story.text)}
                  className="hover:text-blue-950 hover:underline cursor-pointer flex items-center gap-2 text-left shrink-0 transition"
                >
                  <span className="text-amber-600 font-bold">●</span>
                  <span>{story.text}</span>
                  <span className="text-[10px] px-1 bg-blue-100 rounded text-blue-800 font-mono">View Tab</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500 hidden lg:block font-mono text-[11px] shrink-0" aria-hidden="true">
            {currentTime || 'Synchronizing NTP atomic clock...'}
          </div>
        </div>
      </div>

      {/* DETAILED SIMULATOR IDENTIFIER BAR */}
      <div className="w-full bg-slate-100 py-1.5 px-4 text-xs border-b border-slate-200 text-slate-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-900 text-white rounded text-[11px] font-sans font-bold shadow-2xs shrink-0 select-none">
              🏢 PONDCO LABS
            </div>
            <span className="font-semibold text-slate-800">Pondco.Online Workstation Interactive Simulator</span>
            <button 
              type="button"
              className="text-blue-900 underline hover:text-blue-950 font-semibold flex items-center gap-0.5"
              onClick={() => {
                setIsBannerExpanded(!isBannerExpanded);
                onAnnounce(isBannerExpanded ? "Simulation details closed." : "Simulation details expanded.");
                playClickSound();
              }}
            >
              Verify Sandbox Status {isBannerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* ACTIVE USERS COUNTER DISPLAY */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-bold text-slate-900">Active Operators: {activeUsersCount}</span>
            <span className="text-slate-400">concurrently processing</span>
          </div>
        </div>
      </div>

      {isBannerExpanded && (
        <div id="gov-verification-details" className="bg-slate-50 border-b border-slate-200 py-4 px-4 text-xs text-slate-700">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-50 text-blue-900 rounded-full h-fit">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Educational Web Sandbox &amp; Mock Interface</h3>
                <p>This workspace is built as an interactive mockup demonstration representing custom business dashboards, mock databases, and telemetry logs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-full h-fit">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Secure communication is encrypted</h3>
                <p>SSL handshakes prevent interception of mock metrics, geotech logs, and simulated telemetry data payloads.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY & PRE-POPULATED QUICK LOGIN BUTTONS */}
      <div 
        className={`w-full py-2.5 border-b border-slate-100 ${settings.highContrast ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-200'}`}
        aria-label="Security Clearance Login and Visual Accessibility Settings"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Section 508 Compliant Gateway Control Console</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-end text-xs">
            {/* GOOGLE PRE-POPULATED QUICK LOGINS - LOCATED TO THE LEFT OF SPEECH READER */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-700/60">
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-300 font-mono">
                    Session: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{session.email}</strong>
                  </span>
                  <button
                    onClick={() => {
                      playClickSound();
                      onLogout();
                      setCurrentTab("overview");
                      onAnnounce("Logged out.");
                    }}
                    className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-[10px] flex items-center gap-1 border border-slate-700 cursor-pointer"
                    title="Terminate Active Token Session"
                  >
                    <LogOut className="w-3 h-3" />
                    Exit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase mr-1">Pre-Check logins:</span>
                  
                  {/* Pondco employee/admin login */}
                  <button
                    onClick={handlePondcoEmployeeLogin}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-3 py-1 rounded text-[11px] flex items-center gap-1 shadow-sm transition border border-amber-600 font-mono cursor-pointer"
                    title="Sign In automatically using Kyle.freedman@ponco.com (System Admin clearance)"
                  >
                    <Building2 className="w-3 h-3" />
                    Pondco Employee Entry
                  </button>

                  {/* Client login */}
                  <button
                    onClick={handleClientLogin}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold px-3 py-1 rounded text-[11px] flex items-center gap-1 shadow-sm transition border border-blue-800 font-mono cursor-pointer"
                    title="Sign In automatically using Mr.jwswain@gmail.co (Citizen Clearance)"
                  >
                    <UserCheck className="w-3 h-3" />
                    Client Entry
                  </button>
                </div>
              )}
            </div>

            {/* Speech Reader active simulator */}
            <button
              onClick={() => {
                toggleScreenReader();
                playClickSound();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition border cursor-pointer ${
                settings.screenReaderActive 
                  ? 'bg-amber-500 border-amber-600 text-slate-950 font-bold' 
                  : (settings.highContrast ? 'bg-black text-white hover:bg-slate-900 border-white/40' : 'bg-slate-700 hover:bg-slate-600 border-transparent')
              }`}
              title="Toggle synthetic voiceover announcer"
              aria-pressed={settings.screenReaderActive}
            >
              <span>Speech Reader Sim:</span>
              <span className="uppercase text-[9px] tracking-wider px-1 bg-black/20 rounded">
                {settings.screenReaderActive ? 'Active' : 'Off'}
              </span>
            </button>

            {/* Typography Scale */}
            <button
              onClick={() => {
                adjustFontSize();
                playClickSound();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition border cursor-pointer ${
                settings.highContrast 
                  ? 'bg-black text-white border-white/40 hover:bg-slate-950' 
                  : 'bg-slate-700 hover:bg-slate-600 border-transparent'
              }`}
              title="Cycle text scaling levels"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Scale: <span className="uppercase text-[9px] bg-black/20 px-1 rounded">{settings.fontSize}</span></span>
            </button>

            {/* Contrast switch */}
            <button
              onClick={() => {
                toggleHighContrast();
                playClickSound();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition border cursor-pointer ${
                settings.highContrast 
                  ? 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300' 
                  : 'bg-slate-700 hover:bg-slate-600 border-transparent'
              }`}
              title="Toggle layout accessibility high contrast mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Contrast: {settings.highContrast ? 'ON' : 'OFF'}</span>
            </button>

            {/* Audio Indicator */}
            <button
              onClick={() => {
                toggleSound();
                playClickSound();
              }}
              className={`p-1 rounded transition border cursor-pointer ${
                settings.highContrast 
                  ? 'bg-black text-white border-white/40' 
                  : 'bg-slate-700 hover:bg-slate-600 border-transparent'
              }`}
              aria-label="Toggle navigation sound effects"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* CORE IDENTITY HEADER BRANDING WITH PLANE BACKGROUND VIDEO AND BLUE OVERLAY TINT */}
      <div className={`relative py-8 px-4 overflow-hidden ${settings.highContrast ? 'bg-white text-black' : 'bg-slate-950 text-white'}`}>
        {!settings.highContrast && (
          <>
            {/* Background Plane Runway Video Loop */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none"
            >
              <source src="/assets/input_file_0.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/preview/mixkit-airport-control-tower-with-moving-antenna-42525-large.mp4" type="video/mp4" />
            </video>
            {/* Absolute Blue tint overlay screen with subtle backdrop blur */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-slate-950/90 backdrop-blur-[1px] z-0 pointer-events-none" />
          </>
        )}

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            {/* OFFICIAL PONDCO.ONLINE EMBLEM LOGO */}
            <div 
              className="w-16 h-16 rounded-full border-2 border-amber-400 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0 shadow-lg"
              title="Official Pondco.Online Logo Seal"
              aria-label="Pondco.Online Official Emblem"
            >
              <div className="absolute inset-0 border border-slate-700/40 rounded-full"></div>
              {/* Blue tint background */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-blue-950 to-slate-900 border border-amber-400/20 flex flex-col items-center justify-center select-none">
                <Globe className="w-6 h-6 text-amber-400" />
                <span className="text-[7.5px] text-white font-sans tracking-wide font-black mt-0.5">PONDCO</span>
                <span className="text-[6.5px] text-amber-400 font-mono tracking-widest font-bold">ONLINE</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className={`text-[9px] tracking-widest font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                  settings.highContrast ? 'bg-black text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  PONDCO.ONLINE ATCT DIGITAL OPERATIONS
                </span>
                <span className="text-xs text-slate-300 font-mono hidden sm:inline">Riverside ID: RIV-ATCT-4.68M</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight mt-1 text-slate-100">
                Pondco.online Operating System
              </h1>
              <p className={`text-xs mt-0.5 ${settings.highContrast ? 'text-slate-800 font-bold' : 'text-slate-300'} font-sans`}>
                Riverside County Supervisors Twin-Tower Program Dashboard &bull; ISO-9001 Audited Design Matrix
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative text-xs">
              <div className="flex shadow-sm rounded border border-slate-300/45">
                <div className={`p-2.5 flex items-center justify-center font-mono ${settings.highContrast ? 'bg-slate-300 text-black' : 'bg-slate-900 text-slate-300'}`}>
                  NTP SYNCED //
                </div>
                <input 
                  type="text" 
                  disabled
                  placeholder="All registers verified and active..." 
                  className="px-3 py-2 text-slate-300 bg-slate-950/60 w-52 focus:outline-none placeholder-slate-400 font-sans cursor-not-allowed italic font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
