import React from 'react';
import { ShieldAlert, Scale, AlertTriangle, FileText, CheckCircle2, HeartHandshake } from 'lucide-react';

interface LegalDisclaimerProps {
  onAnnounce: (text: string) => void;
  playSound: () => void;
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ onAnnounce, playSound }) => {
  return (
    <div className="max-w-4xl mx-auto my-8 p-4 font-sans animate-fadeIn" id="legal-disclaimer-view">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-red-700 to-rose-600 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest text-red-100">
              <ShieldAlert className="w-4 h-4 text-white" />
              Statutory Non-Affiliation Notice
            </div>
            <h1 className="text-3xl font-serif font-extrabold tracking-tight">
              Legal Disclaimer &amp; Liability Release Portal
            </h1>
            <p className="text-sm text-red-105/90 max-w-2xl leading-relaxed">
              This document is binding upon any user, visitor, auditor, or client accessing this demonstration application. Please read these terms in their entirety.
            </p>
          </div>
          
          <div className="p-4 bg-white/10 rounded-xl border border-white/20 flex flex-col items-center shrink-0">
            <Scale className="w-12 h-12 text-white animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase mt-2 text-white/80">FORM NO: 104-B</span>
          </div>
        </div>
      </div>

      {/* CORE ALERTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 p-5 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm uppercase tracking-wider font-sans">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            Demo Presentation Only
          </div>
          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-sans">
            This application is <strong>100% simulated</strong>. Any and all charts, maps, process flow parameters, bypass checklists, geomechanics data, RAG search responses, client trackers, and PDF downloads are mock-up graphics designed to demonstrate a premium user experience. No actual physical or engineering activities are executed or processed.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/40 p-5 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm uppercase tracking-wider font-sans">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
            Zero Real Association
          </div>
          <p className="text-xs text-red-900/90 dark:text-red-200/90 leading-relaxed font-sans">
            This product is built solely as an independent, educational frontend demonstration portfolio piece. It is <strong>not affiliated with, associated with, sponsored by, or endorsed by Pond &amp; Co. / Pondco</strong>, Riverside County, nor any other real-world architecture companies, air traffic facilities, airports, or civil engineering consulting firms.
          </p>
        </div>

      </div>

      {/* COMPREHENSIVE WARRANTY DETAILS TABLE OF ARTICLES */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Articles of Mock-Up Operation</span>
          <span className="text-[10px] text-slate-400 font-mono">Published: June 2026 &bull; Version 1.1</span>
        </div>

        <div className="p-6 md:p-8 space-y-6 text-slate-700 leading-relaxed text-xs">
          
          {/* ARTICLE 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 font-sans tracking-tight">
              Article I. Absolute Non-Affiliation and Simulated Scope
            </h4>
            <p className="text-slate-600 font-sans">
              The user acknowledges and certifies that this website is a pure digital simulation. Reference is made to various real-world entities (e.g. Pondco, KSA, Pape-Dawson, Riverside County Board of Supervisors, French Valley, and Jacqueline Cochran Regional airspaces) solely as design context to illustrate civil planning workflows. This site does not process actual documents, coordinate actual airspace, or offer professional consulting services.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* ARTICLE 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 font-sans tracking-tight">
              Article II. Elimination of Government/Federal Association
            </h4>
            <p className="text-slate-600 font-sans">
              Notwithstanding any previous design motifs, this website is not a government agency portal, is not maintained by federal civil servants, is not an official FAA node, and does not hold any official governmental credentialing whatsoever. All security gates, bypass matrices, and clearance levels are local simulated parameters built strictly for sandbox user experience walkthroughs.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* ARTICLE 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 font-sans tracking-tight">
              Article III. Ironclad Disclaimer of Liability and Warranties
            </h4>
            <p className="text-slate-700 font-sans font-medium bg-slate-50 p-4 border-l-4 border-slate-400 rounded-r">
              THE SOFTWARE AND ALL WORK PRODUCT, LOGS, DISCLOSURES, SIMULATORS, AND TEXT ARE PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE DEVELOPERS, AUTHORS, PROJECT CONSTRUCTORS, OR MOCK SPONSORS BE LIABLE FOR ANY CLAIM, DAMAGES, BACKLASH, LITIGATION, DISCREPANCIES, BUSINESS LOSSES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE USE, EXPLOITATION, OR RELIANCE UPON THIS SIMULATOR OR ITS FICTITIOUS DATA POINTS.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* ARTICLE 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 font-sans tracking-tight">
              Article IV. Complete Release, Indemnification and Covenant Not to Sue
            </h4>
            <p className="text-slate-600 font-sans">
              By entering this simulated workspace, entering passcodes, or clicking federated auto-sign-in buttons, you hereby fully and unconditionally release, discharge, hold harmless, and covenant not to sue the creator, hosting servers, or demonstration designers from any and all liabilities, injuries, costs, repercussions, legal backlash, or reputational claims resulting from or in connection with the visual designs, video files, sound oscillators, or simulated content rendered in this digital sandbox.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* ARTICLE 5 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 font-sans tracking-tight">
              Article V. Privacy, Cookies and Data Security Handshake
            </h4>
            <p className="text-slate-600 font-sans">
              No private identity details are stored externally except standard temporary client-side local cookies (e.g. `civil_portal_active_session` keys and local settings variables) needed for layout preference persistence. This simulation collects zero marketing cookies and does not sell or distribute user analytics datasets.
            </p>
          </div>

        </div>

        {/* WARRANTY FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-slate-700 font-semibold font-sans">Compliance and Mutual Trust Agreement Standardized</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-mono font-bold py-1 px-3 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 inline inline-block" />
            <span>BINDING ON ALL PARTIES</span>
          </div>
        </div>
      </div>

      {/* QUICK FAQS */}
      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 space-y-4 text-xs text-slate-700">
        <h3 className="font-serif font-extrabold text-sm uppercase tracking-tight text-slate-800">Frequently Asked Legal Questions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Q: Does this site access any real FAA database registries?</h4>
            <p className="text-slate-600 font-sans">A: No. No connection exists. Every single registry, response delay, or system node displayed is initialized inside static local memory.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Q: Is my email/passcode stored securely?</h4>
            <p className="text-slate-600 font-sans">A: Yes. Passcode evaluations are performed entirely in client-side memory, and session claims are saved in your own local storage only.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Q: Is this associated with Riverside County, CA aviation boards?</h4>
            <p className="text-slate-600 font-sans">A: Absolutely not. This site is a visual conceptual case-study mockup created to showcase professional engineering portal design capabilities.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Q: How do I withdraw agreement?</h4>
            <p className="text-slate-600 font-sans">A: If you do not accept these articles, please clear your browser local storage cache and exit the application immediately.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
