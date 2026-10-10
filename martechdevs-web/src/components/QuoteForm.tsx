'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { pushEvent } from '@/lib/analytics';
import { THANK_YOU_PATH, markQuoteSubmitted, reportConversion, stashConversion, type QuoteArea, type QuoteOffer } from '@/lib/quote';

/* Site palette, the same values the footer uses. */
const BORDER = '#E4E9E6';

const TOOL_ICON = (file: string) => `/assets/tool logos icons/${file} logo icon.svg`;

/** Question one. Logos are the ones already shipped for the service sections. */
const TOOLS = [
  { label: 'HubSpot', icon: TOOL_ICON('hubspot') },
  { label: 'Segment', icon: TOOL_ICON('segment') },
  { label: 'GA4', icon: TOOL_ICON('ga4') },
  { label: 'GTM', icon: TOOL_ICON('gtm') },
  { label: 'Google Ads', icon: TOOL_ICON('google ads') },
  { label: 'Mixpanel', icon: TOOL_ICON('mixpanel') },
  { label: 'Braze', icon: TOOL_ICON('braze') },
  { label: 'Intercom', icon: TOOL_ICON('intercom') },
  { label: 'Snowflake', icon: TOOL_ICON('snowflake') },
  { label: 'Fivetran', icon: TOOL_ICON('fivetran') },
];

/* Stroke icons on a 24 box, 1.75 wide, round caps: the footer's icon language. */
const AREAS: { label: QuoteArea; hint: string; path: string }[] = [
  {
    label: 'Tracking & ad conversions',
    hint: 'GTM, server-side, CAPI, Consent Mode v2',
    path: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 12h.01',
  },
  {
    label: 'Analytics & attribution',
    hint: 'Funnels, retention, dashboards, true ROI',
    path: 'M4 20h16M7 16v-5M12 16V6M17 16v-8',
  },
  {
    label: 'CDP & data warehouse',
    hint: 'Segment, Snowflake, pipelines, reverse ETL',
    path: 'M12 3.5c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3M4 6.5v11c0 1.7 3.6 3 8 3s8-1.3 8-3v-11M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  },
  {
    label: 'CRM & lifecycle messaging',
    hint: 'Lead routing, email and push journeys',
    path: 'M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8',
  },
  {
    label: 'GTM engineering & outbound',
    hint: 'Clay, Apollo, enrichment, cold email infrastructure',
    path: 'M20.5 3.5 3.5 10.6l6.9 3 3 6.9zM10.4 13.6l10.1-10.1',
  },
  {
    label: 'Support & AI agents',
    hint: 'Intercom, Fin, agents on your own data',
    path: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  },
  {
    label: 'Not sure yet',
    hint: 'Tell us the goal, we will scope it',
    path: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7M12 17h.01',
  },
];

/** Where the stack runs. Picked on step one alongside the tools. */
const PLATFORMS = [
  { label: 'Website', path: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5' },
  { label: 'Mobile apps', path: 'M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5M11 17.5h2' },
];

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];

/** Where the landing URL's ad parameters are kept until the form is sent. */
const ATTRIBUTION_STORE = 'mtd_quote_attribution';

function emailProblem(email: string): string {
  const value = email.trim().toLowerCase();
  if (!value) return 'Enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'That email does not look right.';
  return '';
}

function Icon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function Check() {
  return (
    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-700 text-white">
      <Icon path="M5 12.5l4.5 4.5L19 7" className="h-3 w-3" />
    </span>
  );
}

const tileBase =
  'relative flex w-full rounded-xl border-2 bg-white text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';
const tileIdle = 'border-[#E4E9E6] hover:border-teal-600/50 hover:shadow-sm';
const tileOn = 'border-teal-700 bg-teal-50/60 shadow-sm';
/** Platform and tool tiles on step one: icon and name side by side. */
const tileRow = 'items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5';
const tileLabel = 'pr-4 text-sm font-semibold leading-tight text-gray-900 sm:text-base';

const STEPS = ['Your stack', 'What you need', 'Your email'];

/** Every step is the same height, so the dialog does not jump between them. */
const stepFrame = 'quote-step-in flex flex-col sm:min-h-[524px]';

/* One footer and one set of buttons for every step, so Back and the main
   action sit in exactly the same place whichever step is showing. */
const footerRow = 'sticky bottom-0 mt-auto flex items-center justify-between gap-4 bg-white/95 pb-5 pt-6 backdrop-blur-sm';
const primaryBtn =
  'inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none';
const backBtn = 'px-2 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900';

/** `area` comes ticked on step two, for a form opened from a service page. */
export default function QuoteForm({ offer, area }: { offer?: QuoteOffer; area?: QuoteArea }) {
  const [step, setStep] = useState(0);
  const [tools, setTools] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>(area ? [area] : []);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Ad parameters are read on landing, because the visitor can click around
  // and lose the query string before they reach the last step.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found = Object.fromEntries(ATTRIBUTION_KEYS.map((k) => [k, params.get(k) || '']).filter(([, v]) => v));
      if (Object.keys(found).length) sessionStorage.setItem(ATTRIBUTION_STORE, JSON.stringify(found));
    } catch {
      // Blocked storage only costs us the source on the lead.
    }
  }, []);

  useEffect(() => {
    if (step === 2) emailRef.current?.focus();
  }, [step]);

  // Functional update, so two quick taps both land rather than the second
  // overwriting the first from a stale list.
  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>, value: string) =>
    set((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));

  const goTo = (next: number) => {
    setStep(next);
    // The picks so far ride on every step event, so a visitor who drops off
    // before the email step still shows what they were after.
    pushEvent({
      event: 'Quote Form Step Viewed',
      step: next + 1,
      step_name: STEPS[next],
      offer: offer || 'none',
      platforms: platforms.join(', '),
      tools: tools.join(', '),
      areas: areas.join(', '),
      tool_count: tools.length,
      area_count: areas.length,
    });
    // The form sits in a scrolling modal, so bring its top back into view
    // rather than scrolling the page underneath.
    rootRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const problem = emailProblem(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (problem || sending) return;

    setSending(true);
    setSendError('');

    let attribution: Record<string, string> = {};
    try {
      attribution = JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORE) || '{}');
    } catch {
      // As above.
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          platforms,
          tools,
          areas,
          website: honeypot,
          offer: offer || '',
          attribution: { ...attribution, page: window.location.pathname },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong');
    } catch (err) {
      setSending(false);
      setSendError(err instanceof Error ? err.message : 'Something went wrong');
      return;
    }

    markQuoteSubmitted();

    // The thank-you page reports the lead, not this one, and is loaded in full
    // rather than routed to in place. That gives Google Ads a real page view on
    // the conversion URL, and puts `quote_form_submitted` in that page's own
    // dataLayer, which is where GTM preview and Tag Assistant look for it.
    const lead = { email: cleanEmail, tools, areas, offer: offer || '' };
    if (stashConversion(lead)) {
      window.location.assign(THANK_YOU_PATH);
    } else {
      // Storage is blocked, so report from here and give the tags a moment to
      // send before the page changes.
      reportConversion({ ...lead, at: Date.now() });
      setTimeout(() => window.location.assign(THANK_YOU_PATH), 800);
    }
  }

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-4xl scroll-mt-4">
      {/* Progress */}
      <div className="mb-7 flex items-center gap-2 sm:gap-3" aria-label={`Step ${step + 1} of 3`}>
        {STEPS.map((name, i) => (
          <div key={name} className="flex flex-1 flex-col gap-2">
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: BORDER }}>
              <div
                className="h-full rounded-full bg-teal-700 transition-[width] duration-300"
                style={{ width: i <= step ? '100%' : '0%' }}
              />
            </div>
            <span className={`text-xs font-medium sm:text-sm ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>
              {i + 1}. {name}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={submit} noValidate>
        {/* Off screen rather than display:none, which some bots skip. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>

        {/* Steps fade in with CSS rather than framer's AnimatePresence. Its
            exit-then-enter sequencing waits on animation frames, and a
            throttled tab can leave the form blank between steps. */}
          {step === 0 && (
            <div
              key="tools"
              role="group"
              aria-labelledby="quote-step-tools"
              className={stepFrame}
            >
              <h2 id="quote-step-tools" className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Tell us about your stack
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">Pick everything that applies. It tells us what we are integrating.</p>

              <p className="mt-6 text-sm font-semibold text-gray-900">Where do your customers use your product?</p>
              <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PLATFORMS.map((p) => {
                  const on = platforms.includes(p.label);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      aria-pressed={on}
                      data-track="quote_platform"
                      onClick={() => toggle(setPlatforms, p.label)}
                      className={`${tileBase} ${on ? tileOn : tileIdle} ${tileRow}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: '#F2F6F4' }}>
                        <Icon path={p.path} className={`h-5 w-5 ${on ? 'text-teal-700' : 'text-gray-600'}`} />
                      </span>
                      <span className={tileLabel}>{p.label}</span>
                      {on && <Check />}
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-sm font-semibold text-gray-900">Do you use any of these tools currently? <span className="font-normal text-gray-400">(optional)</span></p>
              <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TOOLS.map((tool) => {
                  const on = tools.includes(tool.label);
                  return (
                    <button
                      key={tool.label}
                      type="button"
                      aria-pressed={on}
                      data-track="quote_tool"
                      onClick={() => toggle(setTools, tool.label)}
                      className={`${tileBase} ${on ? tileOn : tileIdle} ${tileRow}`}
                    >
                      <Image src={tool.icon} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg" />
                      <span className={tileLabel}>{tool.label}</span>
                      {on && <Check />}
                    </button>
                  );
                })}
                {(() => {
                  const on = tools.includes('Other');
                  return (
                    <button
                      type="button"
                      aria-pressed={on}
                      data-track="quote_tool"
                      onClick={() => toggle(setTools, 'Other')}
                      className={`${tileBase} ${on ? tileOn : tileIdle} ${tileRow}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500" style={{ background: '#F2F6F4' }}>
                        <Icon path="M12 5v14M5 12h14" className="h-4 w-4" />
                      </span>
                      <span className={tileLabel}>Other</span>
                      {on && <Check />}
                    </button>
                  );
                })()}
              </div>

              <div className={footerRow}>
                <span />
                <button
                  type="button"
                  disabled={!platforms.length}
                  onClick={() => goTo(1)}
                  className={primaryBtn}
                >
                  Continue
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div
              key="areas"
              role="group"
              aria-labelledby="quote-step-areas"
              className={stepFrame}
            >
              <h2 id="quote-step-areas" className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Where do you need support?
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">Pick all that apply. We price each area separately.</p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {AREAS.map((area) => {
                  const on = areas.includes(area.label);
                  return (
                    <button
                      key={area.label}
                      type="button"
                      aria-pressed={on}
                      data-track="quote_area"
                      onClick={() => toggle(setAreas, area.label)}
                      className={`${tileBase} ${on ? tileOn : tileIdle} ${tileRow} sm:py-4`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${on ? 'bg-teal-700 text-white' : 'text-teal-800'}`}
                        style={on ? undefined : { background: '#F2F6F4' }}
                      >
                        <Icon path={area.path} className="h-5 w-5" />
                      </span>
                      <span className="pr-4">
                        <span className="block text-sm font-semibold leading-tight text-gray-900 sm:text-base">{area.label}</span>
                        <span className="mt-1 block text-xs leading-snug text-gray-500 sm:text-sm">{area.hint}</span>
                      </span>
                      {on && <Check />}
                    </button>
                  );
                })}
              </div>

              <div className={footerRow}>
                <button type="button" onClick={() => goTo(0)} className={backBtn}>
                  Back
                </button>
                <button
                  type="button"
                  disabled={!areas.length}
                  onClick={() => goTo(2)}
                  className={primaryBtn}
                >
                  Continue
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div
              key="email"
              className={stepFrame}
            >
              <div className="mx-auto w-full max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Where should we send your quote?
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                {offer === 'startup_50'
                  ? 'With the 50% startup discount applied, usually within one business day.'
                  : 'A fixed price and timeline, usually within one business day.'}
              </p>

              <div className="mt-6 rounded-xl border p-4 text-sm text-gray-600" style={{ borderColor: BORDER, background: '#F7FAF8' }}>
                {!!platforms.length && <p className="mb-1"><span className="font-semibold text-gray-900">Platforms:</span> {platforms.join(', ')}</p>}
                <p><span className="font-semibold text-gray-900">Tools:</span> {tools.join(', ') || 'None yet'}</p>
                <p className="mt-1"><span className="font-semibold text-gray-900">Support:</span> {areas.join(', ')}</p>
              </div>

              <label htmlFor="quote-email" className="mt-6 block text-sm font-semibold text-gray-900">
                Email
              </label>
              <input
                ref={emailRef}
                id="quote-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSendError(''); }}
                onBlur={() => setTouched(true)}
                aria-invalid={touched && !!problem}
                aria-describedby="quote-email-error"
                className={`mt-2 w-full rounded-xl border-2 bg-white px-4 py-3.5 text-lg text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-700 ${touched && problem ? 'border-red-400' : 'border-[#E4E9E6]'}`}
              />
              <p id="quote-email-error" className="mt-2 min-h-5 text-sm text-red-600" role="alert">
                {(touched && problem) || sendError}
              </p>

              </div>

              <div className={footerRow}>
                <button type="button" onClick={() => goTo(1)} className={backBtn}>
                  Back
                </button>
                <div className="flex items-center gap-4">
                  <p className="hidden items-center gap-1.5 text-xs text-gray-500 sm:flex">
                    <Icon path="M12 3.5l7 2.6v5.6c0 4.3-3 7.4-7 8.8-4-1.4-7-4.5-7-8.8V6.1zM9 12l2.2 2.2L15.5 10" className="h-4 w-4" />
                    No spam. One email with your quote.
                  </p>
                  <button type="submit" disabled={sending} className={primaryBtn}>
                    {sending ? 'Sending…' : 'Get my quote'}
                    {!sending && <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
      </form>

    </div>
  );
}
