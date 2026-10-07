import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { READINESS_CHECKS, TOOL_SIGNATURES } from '@/lib/stackSignatures';

/**
 * Scans a visitor's website for the martech tools it loads.
 *
 * Reads the homepage, every GTM container it references and the site's own
 * script bundles (where an npm-installed SDK ends up), then matches them all
 * against the signatures in stackSignatures.ts. Only what a browser could see
 * is visible here: warehouse tools and server-side APIs never show up.
 *
 * The URL comes from the public, so the fetch refuses private and loopback
 * addresses, follows redirects by hand to check each hop, and caps size and
 * time.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 7000;
const MAX_REDIRECTS = 4;
const MAX_CONTAINERS = 3;
const MAX_BUNDLES = 8;

/** Best effort, per instance: enough to stop one visitor hammering the endpoint. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

function privateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return privateAddress(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublic(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only web addresses can be scanned');
  if (url.port && url.port !== '80' && url.port !== '443') throw new Error('That address cannot be scanned');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => privateAddress(a.address))) {
    throw new Error('That address cannot be scanned');
  }
}

async function fetchText(start: string): Promise<{ text: string; finalUrl: string }> {
  let url = new URL(start);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url);
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; martechdevs-stack-scan/1.0; +https://martechdevs.com)',
        Accept: 'text/html,application/javascript,*/*',
      },
    });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    if (!res.ok || !res.body) throw new Error(`The site answered ${res.status}`);

    // Read up to the cap and stop, so a huge or endless response cannot tie
    // the function up.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    reader.cancel().catch(() => {});
    return { text: new TextDecoder().decode(Buffer.concat(chunks)), finalUrl: url.toString() };
  }
  throw new Error('Too many redirects');
}

/** Undo JS string escaping, so `connect.facebook.net\/en_US` matches like the plain URL. */
function normalise(text: string): string {
  return text.replace(/\\\//g, '/').replace(/\\"/g, '"').replace(/\\'/g, "'");
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many scans, try again in a minute' }, { status: 429 });
  }

  let raw = '';
  try {
    raw = String((await request.json()).url || '').trim();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  if (!raw || raw.length > 300) {
    return NextResponse.json({ ok: false, error: 'Enter your website address' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ ok: false, error: 'That address does not look right' }, { status: 400 });
  }

  let page: { text: string; finalUrl: string };
  try {
    page = await fetchText(target.toString());
  } catch (err) {
    const message = err instanceof Error && /scanned|answered|redirects/.test(err.message) ? err.message : 'We could not reach that site';
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }

  const html = normalise(page.text);
  const containerIds = [...new Set(html.match(/\bGTM-[A-Z0-9]{4,10}\b/g) || [])].slice(0, MAX_CONTAINERS);
  const containers = await Promise.all(
    containerIds.map((id) =>
      fetchText(`https://www.googletagmanager.com/gtm.js?id=${id}`)
        .then((r) => normalise(r.text))
        .catch(() => '')
    )
  );

  // Same-site scripts only: third-party ones are already named by their URL in
  // the HTML, and reading them would mean fetching whatever the page points at.
  const host = new URL(page.finalUrl).hostname;
  const bundles = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => {
      try {
        return new URL(m[1], page.finalUrl);
      } catch {
        return null;
      }
    })
    .filter((u): u is URL => !!u && u.hostname === host)
    .slice(0, MAX_BUNDLES);
  const bundleTexts = await Promise.all(
    bundles.map((u) => fetchText(u.toString()).then((r) => normalise(r.text)).catch(() => ''))
  );

  const sources = [html, ...containers, ...bundleTexts];

  const found = TOOL_SIGNATURES.filter((sig) => sources.some((text) => sig.patterns.some((p) => p.test(text)))).map(
    (sig) => ({ tool: sig.tool, evidence: sig.evidence })
  );
  const readiness = READINESS_CHECKS.map((check) => {
    const ok = sources.some((text) => check.patterns.some((p) => p.test(text)));
    return { key: check.key, ok, note: ok ? check.found : check.missing };
  });

  return NextResponse.json({
    ok: true,
    site: new URL(page.finalUrl).hostname.replace(/^www\./, ''),
    containers: containerIds.length,
    checked: TOOL_SIGNATURES.length,
    found,
    readiness,
  });
}
