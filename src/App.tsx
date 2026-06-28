import { Suspense, lazy, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clipboard,
  Code2,
  Eye,
  Globe2,
  Radio,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';

const LegacyPortal = lazy(() => import('./LegacyPortal'));

type DomainStatus = 'online' | 'warning' | 'offline' | 'unknown';

interface DomainRecord {
  id: string;
  domain: string;
  url: string;
  role: string;
  repo?: string;
  cloudflareProject?: string;
}

interface DomainCheck extends DomainRecord {
  status: DomainStatus;
  httpStatus?: number;
  responseMs?: number;
  title?: string;
  finalUrl?: string;
  checkedAt?: string;
  error?: string;
  securityHeaders?: {
    csp: boolean;
    hsts: boolean;
    frameOptions: boolean;
  };
}

const DOMAINS: DomainRecord[] = [
  {
    id: 'pondco',
    domain: 'pondco.online',
    url: 'https://pondco.online/',
    role: 'Airport operations portal',
    repo: 'https://github.com/3000Studios/pondco-online',
    cloudflareProject: 'pondco-online',
  },
  {
    id: 'voicetowebsite',
    domain: 'voicetowebsite.com',
    url: 'https://voicetowebsite.com/',
    role: 'Voice to website generator',
    repo: 'https://github.com/3000Studios/voicetowebsite-copyright-mrjwswain',
    cloudflareProject: 'voicetowebsite',
  },
  {
    id: 'referrals',
    domain: 'referrals.live',
    url: 'https://referrals.live/',
    role: 'Referral engine',
    repo: 'https://github.com/3000Studios/referrals-live',
  },
  {
    id: 'swainpro',
    domain: 'swain.pro',
    url: 'https://swain.pro/',
    role: 'Personal portfolio',
    repo: 'https://github.com/3000Studios/Swain-Pro',
    cloudflareProject: 'swain-pro',
  },
  {
    id: 'myappai',
    domain: 'myappai.net',
    url: 'https://myappai.net/',
    role: 'AI app surface',
    repo: 'https://github.com/3000Studios/myappai',
  },
];

function createMatrixRows(count: number) {
  const glyphs = '01ZXCVBNMPOUNDCOAIRPORTRUNWAYTOWER';
  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: 46 }, (_, column) => glyphs[(row * 11 + column * 7) % glyphs.length]).join(''),
  );
}

function LiveWallpaper({ breach }: { breach: boolean }) {
  const rows = useMemo(() => createMatrixRows(18), []);

  return (
    <div className="wallpaper" aria-hidden="true">
      <div className="wallpaperShade" />
      <div className="sceneGrid" />
      <div className="ambientWave ambientWaveA" />
      <div className="ambientWave ambientWaveB" />
      <div className="orbital orbitalA" />
      <div className="orbital orbitalB" />
      <div className="glassShard shardA" />
      <div className="glassShard shardB" />
      <div className="glassShard shardC" />
      <div className="matrixField">
        {rows.map((row, index) => (
          <span key={`${row}-${index}`}>{row}</span>
        ))}
      </div>
      {breach ? <div className="breachFlash" /> : null}
    </div>
  );
}

function statusLabel(status: DomainStatus) {
  if (status === 'online') return 'Online';
  if (status === 'warning') return 'Warning';
  if (status === 'offline') return 'Offline';
  return 'Unknown';
}

function MasterDashboard({ onOpenLegacy }: { onOpenLegacy: () => void }) {
  const [domains, setDomains] = useState<DomainCheck[]>(() =>
    DOMAINS.map((domain) => ({ ...domain, status: 'unknown' })),
  );
  const [selectedId, setSelectedId] = useState(DOMAINS[0].id);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState('');
  const selected = domains.find((domain) => domain.id === selectedId) || domains[0];
  const onlineCount = domains.filter((domain) => domain.status === 'online').length;
  const warningCount = domains.filter((domain) => domain.status === 'warning').length;
  const offlineCount = domains.filter((domain) => domain.status === 'offline').length;
  const averageResponse = Math.round(
    domains.reduce((total, domain) => total + (domain.responseMs || 0), 0) /
      Math.max(1, domains.filter((domain) => domain.responseMs).length),
  );

  async function refreshDomains() {
    setLoading(true);
    setLastError('');
    try {
      const response = await fetch('/api/domain-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: DOMAINS }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Domain monitor failed.');
      setDomains(payload.domains);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Domain monitor failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDomains();
  }, []);

  async function copyDeployCommand(domain: DomainCheck) {
    const command = domain.cloudflareProject
      ? `npm run build && npx wrangler pages deploy dist --project-name ${domain.cloudflareProject} --branch main`
      : `npm run build # configure Cloudflare Pages project for ${domain.domain}`;
    await navigator.clipboard.writeText(command);
  }

  return (
    <main className="dashboardShell">
      <LiveWallpaper breach={false} />
      <header className="dashboardHeader">
        <div>
          <span className="gateEyebrow">Airport console</span>
          <h1>Pondco Airport Operations</h1>
          <p>Live domain monitor, repo launchpad, deploy readiness cockpit, and airport operations workspace.</p>
        </div>
        <div className="dashboardActions">
          <button type="button" onClick={refreshDomains} className="iconButton">
            <RefreshCw className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button type="button" onClick={onOpenLegacy} className="iconButton ghost">
            <Terminal /> Legacy portal
          </button>
        </div>
      </header>

      {lastError ? (
        <div className="noticeBar"><AlertTriangle /> {lastError}</div>
      ) : null}

      <section className="metricGrid" aria-label="Portfolio summary">
        <article><CheckCircle2 /><strong>{onlineCount}</strong><span>Online domains</span></article>
        <article><AlertTriangle /><strong>{warningCount}</strong><span>Warnings</span></article>
        <article><XCircle /><strong>{offlineCount}</strong><span>Offline</span></article>
        <article><Activity /><strong>{averageResponse || '--'}ms</strong><span>Avg response</span></article>
      </section>

      <section className="dashboardGrid">
        <aside className="siteRail" aria-label="Managed domains">
          {domains.map((domain) => (
            <button
              key={domain.id}
              className={domain.id === selectedId ? 'siteCard active' : 'siteCard'}
              type="button"
              onClick={() => setSelectedId(domain.id)}
            >
              <span className={`statusDot ${domain.status}`} />
              <span>
                <strong>{domain.domain}</strong>
                <small>{domain.role}</small>
              </span>
              <em>{statusLabel(domain.status)}</em>
            </button>
          ))}
        </aside>

        <section className="commandPanel">
          <div className="panelTop">
            <div>
              <span className="gateEyebrow">Selected domain</span>
              <h2>{selected.domain}</h2>
              <p>{selected.title || selected.role}</p>
            </div>
            <span className={`statusBadge ${selected.status}`}>{statusLabel(selected.status)}</span>
          </div>

          <div className="signalGraph" aria-label="Response history visualization">
            {domains.map((domain) => (
              <span
                key={domain.id}
                style={{ '--bar': `${Math.max(12, Math.min(100, 120 - (domain.responseMs || 90) / 8))}%` } as CSSProperties}
                title={`${domain.domain}: ${domain.responseMs || 0}ms`}
              />
            ))}
          </div>

          <div className="detailGrid">
            <article><Globe2 /><span>HTTP</span><strong>{selected.httpStatus || '--'}</strong></article>
            <article><Radio /><span>Latency</span><strong>{selected.responseMs ? `${selected.responseMs}ms` : '--'}</strong></article>
            <article><Shield /><span>HSTS</span><strong>{selected.securityHeaders?.hsts ? 'On' : 'Check'}</strong></article>
            <article><Code2 /><span>CSP</span><strong>{selected.securityHeaders?.csp ? 'On' : 'Check'}</strong></article>
          </div>

          <div className="toolGrid">
            <a href={selected.url} target="_blank" rel="noreferrer" className="toolButton">
              <Eye /> Visit live site <ArrowUpRight />
            </a>
            {selected.repo ? (
              <a href={selected.repo} target="_blank" rel="noreferrer" className="toolButton">
                <Server /> Open repo <ArrowUpRight />
              </a>
            ) : null}
            <button type="button" className="toolButton" onClick={() => copyDeployCommand(selected)}>
              <Clipboard /> Copy deploy command
            </button>
          </div>

          <div className="readinessPanel">
            <h3><Sparkles /> Master-site build pipeline</h3>
            <ul>
              <li><CheckCircle2 /> Public surface sealed behind synthetic login.</li>
              <li><CheckCircle2 /> Domain checks run server-side through `/api/domain-status`.</li>
              <li><AlertTriangle /> One-click deploy must be backed by a server-side Cloudflare token executor before activation.</li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState<'dashboard' | 'legacy'>('dashboard');

  if (mode === 'legacy') {
    return (
      <Suspense fallback={<div className="ownerLoading">Opening legacy portal...</div>}>
        <LegacyPortal />
      </Suspense>
    );
  }

  return <MasterDashboard onOpenLegacy={() => setMode('legacy')} />;
}
