interface DomainInput {
  id: string;
  domain: string;
  url: string;
  role: string;
  repo?: string;
  cloudflareProject?: string;
}

const MAX_DOMAINS = 12;
const FETCH_TIMEOUT_MS = 8000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function sanitizeDomains(value: unknown): DomainInput[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_DOMAINS).flatMap((domain) => {
    if (!domain || typeof domain !== 'object') return [];
    const candidate = domain as Record<string, unknown>;
    const url = typeof candidate.url === 'string' ? candidate.url : '';
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (parsed.protocol !== 'https:') return [];
    } catch {
      return [];
    }

    return [{
      id: String(candidate.id || parsed.hostname),
      domain: String(candidate.domain || parsed.hostname),
      url: parsed.toString(),
      role: String(candidate.role || 'Managed site'),
      repo: typeof candidate.repo === 'string' ? candidate.repo : undefined,
      cloudflareProject: typeof candidate.cloudflareProject === 'string' ? candidate.cloudflareProject : undefined,
    }];
  });
}

async function checkDomain(domain: DomainInput) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(domain.url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': '3000Studios-Master-Site-Monitor/1.0',
      },
    });
    const responseMs = Date.now() - started;
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('text/html') ? await response.text() : '';
    const title = body.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, ' ').trim();
    const securityHeaders = {
      csp: response.headers.has('content-security-policy'),
      hsts: response.headers.has('strict-transport-security'),
      frameOptions: response.headers.has('x-frame-options'),
    };

    return {
      ...domain,
      status: response.ok ? 'online' : 'warning',
      httpStatus: response.status,
      responseMs,
      title,
      finalUrl: response.url,
      checkedAt: new Date().toISOString(),
      securityHeaders,
    };
  } catch (error) {
    return {
      ...domain,
      status: 'offline',
      responseMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const domains = sanitizeDomains(body?.domains);
    if (!domains.length) return json({ error: 'No valid HTTPS domains supplied.' }, 400);

    const results = await Promise.all(domains.map(checkDomain));
    return json({ domains: results, checkedAt: new Date().toISOString() });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Domain status check failed.' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Use POST with a domains array.' }, 405);
}
