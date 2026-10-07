'use client';

import { useEffect, useRef, useState } from 'react';
import { pushEvent } from '@/lib/analytics';

/** Shown in turn while the scan runs. The last one holds until the result lands. */
const STAGES = [
  'Fetching your homepage',
  'Reading your tag manager containers',
  'Looking for analytics, ad pixels and CRM scripts',
  'Checking consent and server-side tagging',
  'Running the readiness audit',
];
const STAGE_MS = 1000;

type Found = { tool: string; evidence: string };
type Readiness = { key: string; ok: boolean; note: string };
type Result = { site: string; checked: number; found: Found[]; readiness: Readiness[] };

export default function StackScan({
  onFound,
  onSite,
}: {
  /** Tools seen on the site, to preselect on the form. */
  onFound: (tools: string[]) => void;
  /** The scanned site, kept with the lead. */
  onSite: (site: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const scanning = stage >= 0;

  async function scan() {
    if (scanning || !url.trim()) return;
    setError('');
    setResult(null);
    setStage(0);
    pushEvent({ event: 'Quote Stack Scan Started', site: url.trim() });

    // The stages tick on their own and stop on the last one, so a fast answer
    // still shows the work and a slow one never runs out of things to say.
    const started = Date.now();
    clearInterval(timer.current);
    timer.current = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), STAGE_MS);

    let data: { ok?: boolean; error?: string } & Partial<Result> = {};
    try {
      const res = await fetch('/api/stack-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      data = await res.json().catch(() => ({}));
    } catch {
      data = { ok: false, error: 'We could not reach that site' };
    }

    const minimum = STAGE_MS * (STAGES.length - 1) + 600;
    const wait = Math.max(0, minimum - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    clearInterval(timer.current);
    setStage(-1);

    if (!data.ok || !data.found) {
      setError(data.error || 'We could not scan that site');
      pushEvent({ event: 'Quote Stack Scan Failed', site: url.trim(), error: data.error || 'unknown' });
      return;
    }

    const found = data as Result;
    setResult(found);
    onSite(found.site);
    onFound(found.found.map((f) => f.tool));
    pushEvent({
      event: 'Quote Stack Scan Completed',
      site: found.site,
      found_tools: found.found.map((f) => f.tool).join(', '),
      found_count: found.found.length,
      ...Object.fromEntries(found.readiness.map((r) => [`has_${r.key}`, r.ok])),
    });
  }

  return (
    <div className="mt-4 rounded-xl border p-3 sm:p-4" style={{ borderColor: '#E4E9E6', background: '#F7FAF8' }}>
      <label htmlFor="quote-site" className="block text-sm font-semibold text-gray-900">
        Not sure? Scan your website and we will pick them for you
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="quote-site"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="yourcompany.com"
          value={url}
          disabled={scanning}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onKeyDown={(e) => {
            // Enter scans rather than submitting the whole quote form.
            if (e.key === 'Enter') {
              e.preventDefault();
              scan();
            }
          }}
          className="w-full min-w-0 rounded-lg border-2 border-[#E4E9E6] bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-700 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={scan}
          disabled={scanning || !url.trim()}
          data-track="quote_stack_scan"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Fetch Current Stack'}
        </button>
      </div>

      {scanning && (
        <div className="mt-3" role="status" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-teal-700 transition-all duration-700 ease-out"
              style={{ width: `${((stage + 1) / STAGES.length) * 92}%` }}
            />
          </div>
          <ul className="mt-2.5 space-y-1 text-sm">
            {STAGES.map((label, i) => (
              <li
                key={label}
                className={`flex items-center gap-2 ${i < stage ? 'text-gray-500' : i === stage ? 'font-medium text-gray-900' : 'text-gray-300'}`}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {i < stage ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-teal-700" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  ) : i === stage ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && !scanning && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}. You can still pick your tools below.
        </p>
      )}

      {result && !scanning && (
        <div className="mt-3 text-sm" role="status" aria-live="polite">
          <p className="font-semibold text-gray-900">
            {result.found.length
              ? `Found ${result.found.length} of the ${result.checked} tools we check for on ${result.site}. They are selected below.`
              : `We could not see any of the ${result.checked} tools we check for on ${result.site}. Pick yours below.`}
          </p>
          {!!result.found.length && (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {result.found.map((f) => (
                <li key={f.tool} title={f.evidence} className="rounded-full border border-teal-700/30 bg-white px-2.5 py-0.5 text-xs font-medium text-teal-800">
                  {f.tool}
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-2 space-y-0.5 text-gray-600">
            {result.readiness.map((r) => (
              <li key={r.key} className="flex items-start gap-1.5">
                <span aria-hidden="true" className={r.ok ? 'text-teal-700' : 'text-amber-600'}>{r.ok ? '✓' : '!'}</span>
                {r.note}
              </li>
            ))}
            <li className="text-xs text-gray-400">Warehouse and server-side tools do not show on a website, so add those yourself.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
