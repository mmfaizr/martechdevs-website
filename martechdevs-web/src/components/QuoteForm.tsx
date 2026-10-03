'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { identifyLead, pushEvent } from '@/lib/analytics';
import { markQuoteSubmitted, type QuoteOffer } from '@/lib/quote';

/* Site palette, the same values the footer uses. */
const BORDER = '#E4E9E6';

const TOOL_ICON = (file: string) => `/assets/tool logos icons/${file} logo icon.svg`;

/** Question one. Logos are the ones already shipped for the service sections. */
const TOOLS = [
  { label: 'HubSpot', icon: TOOL_ICON('hubspot') },
  { label: 'Salesforce', icon: TOOL_ICON('salesforce') },
  { label: 'Segment', icon: TOOL_ICON('segment') },
  { label: 'RudderStack', icon: TOOL_ICON('rudderstuck') },
  { label: 'GA4', icon: TOOL_ICON('ga4') },
  { label: 'GTM', icon: TOOL_ICON('gtm') },
  { label: 'Google Ads', icon: TOOL_ICON('google ads') },
  { label: 'Meta Ads', icon: TOOL_ICON('meta ads') },
  { label: 'Mixpanel', icon: TOOL_ICON('mixpanel') },
  { label: 'Amplitude', icon: TOOL_ICON('amplitude') },
  { label: 'Braze', icon: TOOL_ICON('braze') },
  { label: 'Customer.io', icon: TOOL_ICON('customerio') },
  { label: 'Intercom', icon: TOOL_ICON('intercom') },
  { label: 'Zendesk', icon: TOOL_ICON('zendesk') },
  { label: 'Snowflake', icon: TOOL_ICON('snowflake') },
  { label: 'BigQuery', icon: TOOL_ICON('bigquery') },
  { label: 'Fivetran', icon: TOOL_ICON('fivetran') },
  { label: 'Hightouch', icon: TOOL_ICON('hightouch') },
];

/* Stroke icons on a 24 box, 1.75 wide, round caps: the footer's icon language. */
const AREAS = [
  {
    label: 'Ad conversion tracking',
    hint: 'Server-side GTM, CAPI, enhanced conversions',
    path: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 12h.01',
  },
  {
    label: 'Consent & compliance',
    hint: 'Consent Mode v2, GDPR, cookie banners',
    path: 'M12 3.5l7 2.6v5.6c0 4.3-3 7.4-7 8.8-4-1.4-7-4.5-7-8.8V6.1zM9 12l2.2 2.2L15.5 10',
  },
  {
    label: 'Product analytics',
    hint: 'Event plans, funnels, retention',
    path: 'M4 20h16M7 16v-5M12 16V6M17 16v-8',
  },
  {
    label: 'CDP & identity',
    hint: 'Segment or RudderStack, one customer view',
    path: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5',
  },
  {
    label: 'CRM & lead routing',
    hint: 'Pipelines, lead scoring, MQL to SQL',
    path: 'M4 5h16l-6 7.5V19l-4-2v-4.5z',
  },
  {
    label: 'Lifecycle messaging',
    hint: 'Email, push and in-app journeys',
    path: 'M3.5 6.5h17v11h-17zM3.5 7.2 12 13l8.5-5.8',
  },
  {
    label: 'Data warehouse',
    hint: 'Snowflake or BigQuery, pipelines, dbt',
    path: 'M12 3.5c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3M4 6.5v11c0 1.7 3.6 3 8 3s8-1.3 8-3v-11M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  },
  {
    label: 'Reverse ETL & audiences',
    hint: 'Warehouse segments into your tools',
    path: 'M4 9h13l-3.5-3.5M20 15H7l3.5 3.5',
  },
  {
    label: 'Reporting & attribution',
    hint: 'Dashboards you can trust, true ROI',
    path: 'M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12zM15 3.8A8.5 8.5 0 0 1 20.2 9H15z',
  },
  {
    label: 'Support & AI chatbots',
    hint: 'Intercom or Zendesk, Fin, routing',
    path: 'M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5zM9 10.5h.01M12 10.5h.01M15 10.5h.01',
  },
  {
    label: 'AI agents & automation',
    hint: 'Agents wired into your own data',
    path: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  },
  {
    label: 'Not sure yet',
    hint: 'Tell us the goal, we will scope it',
    path: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7M12 17h.01',
  },
];

const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com', 'zoho.com',
]);

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];

/** Where the landing URL's ad parameters are kept until the form is sent. */
const ATTRIBUTION_STORE = 'mtd_quote_attribution';

function emailProblem(email: string): string {
  const value = email.trim().toLowerCase();
  if (!value) return 'Enter your work email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'That email does not look right.';
  if (FREE_DOMAINS.has(value.split('@')[1])) return 'Please use your company email, not a personal one.';
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

const STEPS = ['Your tools', 'What you need', 'Your email'];

export default function QuoteForm({ offer }: { offer?: QuoteOffer }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tools, setTools] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
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
    pushEvent({ event: 'Quote Form Step Viewed', step: next + 1, step_name: STEPS[next], offer: offer || 'none' });
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

    // Email for Google Ads enhanced conversions. Pushed on its own, outside
    // pushEvent, so it never rides along to Mixpanel or a GA4 event tag.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ user_data: { email: cleanEmail } });

    const domain = cleanEmail.split('@')[1];
    const profile = {
      company_domain: domain,
      quote_tools: tools.join(', '),
      quote_areas: areas.join(', '),
      quote_offer: offer || 'none',
      quote_submitted_at: new Date().toISOString(),
    };

    // Profile first, so the submit event below lands on it.
    identifyLead(cleanEmail, profile);

    pushEvent({
      event: 'Quote Form Submitted',
      tools: tools.join(', '),
      areas: areas.join(', '),
      tool_count: tools.length,
      area_count: areas.length,
      offer: offer || 'none',
    });

    // Intercom, when GTM has loaded it: `update` with an email creates or
    // updates the contact, then `quote_requested` fires the Intercom rule for
    // quote requests, so that rule only runs for people who sent the form.
    if (typeof window.Intercom === 'function') {
      try {
        window.Intercom('update', { email: cleanEmail, company: { company_id: domain, name: domain }, ...profile });
        window.Intercom('trackEvent', 'quote_requested', {
          tools: profile.quote_tools,
          areas: profile.quote_areas,
          offer: profile.quote_offer,
        });
      } catch {
        // The lead already went through the API.
      }
    }

    router.push('/quote/thank-you');
  }

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-4xl scroll-mt-4">
      {/* Progress */}
      <div className="mb-5 flex items-center gap-2 sm:gap-3" aria-label={`Step ${step + 1} of 3`}>
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
            <fieldset
              key="tools"
              className="quote-step-in"
            >
              <legend className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Which tools do you use today?
              </legend>
              <p className="mt-1 text-sm text-gray-500">Pick all that apply. It tells us what we are integrating.</p>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-5">
                {TOOLS.map((tool) => {
                  const on = tools.includes(tool.label);
                  return (
                    <button
                      key={tool.label}
                      type="button"
                      aria-pressed={on}
                      data-track="quote_tool"
                      onClick={() => toggle(setTools, tool.label)}
                      className={`${tileBase} ${on ? tileOn : tileIdle} flex-col items-center gap-1 px-1.5 py-2 text-center sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left`}
                    >
                      <Image src={tool.icon} alt="" width={32} height={32} className="h-6 w-6 shrink-0 rounded-md sm:h-7 sm:w-7" />
                      <span className="text-xs font-semibold leading-tight text-gray-900 sm:pr-4 sm:text-sm">{tool.label}</span>
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
                      className={`${tileBase} ${on ? tileOn : tileIdle} flex-col items-center gap-1 px-1.5 py-2 text-center sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500" style={{ background: '#F2F6F4' }}>
                        <Icon path="M12 5v14M5 12h14" className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-semibold leading-tight text-gray-900 sm:pr-4 sm:text-sm">Other</span>
                      {on && <Check />}
                    </button>
                  );
                })()}
              </div>

              <div className="sticky bottom-0 mt-4 flex justify-end bg-white/95 py-3 backdrop-blur-sm">
                <button
                  type="button"
                  disabled={!tools.length}
                  onClick={() => goTo(1)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  Continue
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />
                </button>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset
              key="areas"
              className="quote-step-in"
            >
              <legend className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Where do you need support?
              </legend>
              <p className="mt-1 text-sm text-gray-500">Pick all that apply. We price each area separately.</p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4">
                {AREAS.map((area) => {
                  const on = areas.includes(area.label);
                  return (
                    <button
                      key={area.label}
                      type="button"
                      aria-pressed={on}
                      data-track="quote_area"
                      onClick={() => toggle(setAreas, area.label)}
                      className={`${tileBase} ${on ? tileOn : tileIdle} items-center gap-2.5 p-2.5 sm:items-start sm:p-3`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${on ? 'bg-teal-700 text-white' : 'text-teal-800'}`}
                        style={on ? undefined : { background: '#F2F6F4' }}
                      >
                        <Icon path={area.path} className="h-5 w-5" />
                      </span>
                      <span className="pr-3">
                        <span className="block text-xs font-semibold leading-tight text-gray-900 sm:text-sm">{area.label}</span>
                        <span className="mt-0.5 hidden text-xs leading-snug text-gray-500 sm:block">{area.hint}</span>
                      </span>
                      {on && <Check />}
                    </button>
                  );
                })}
              </div>

              <div className="sticky bottom-0 mt-4 flex items-center justify-between bg-white/95 py-3 backdrop-blur-sm">
                <button type="button" onClick={() => goTo(0)} className="px-2 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!areas.length}
                  onClick={() => goTo(2)}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  Continue
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="h-4 w-4" />
                </button>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div
              key="email"
              className="quote-step-in mx-auto max-w-xl"
            >
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Where should we send your quote?
              </h2>
              <p className="mt-2 text-gray-500">
                {offer === 'startup_50'
                  ? 'Your quote comes with the 50% startup discount applied, usually within one business day.'
                  : 'A fixed price and timeline, usually within one business day.'}
              </p>

              <div className="mt-6 rounded-xl border p-4 text-sm text-gray-600" style={{ borderColor: BORDER, background: '#F7FAF8' }}>
                <p><span className="font-semibold text-gray-900">Tools:</span> {tools.join(', ')}</p>
                <p className="mt-1"><span className="font-semibold text-gray-900">Support:</span> {areas.join(', ')}</p>
              </div>

              <label htmlFor="quote-email" className="mt-6 block text-sm font-semibold text-gray-900">
                Company email
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
                className={`mt-2 w-full rounded-xl border-2 bg-white px-4 py-4 text-lg text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-700 ${touched && problem ? 'border-red-400' : 'border-[#E4E9E6]'}`}
              />
              <p id="quote-email-error" className="mt-2 min-h-5 text-sm text-red-600" role="alert">
                {(touched && problem) || sendError}
              </p>

              <button
                type="submit"
                disabled={sending}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-teal-800 hover:shadow-lg disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Get my quote'}
                {!sending && <Icon path="M5 12h14M13 6l6 6-6 6" className="h-5 w-5" />}
              </button>

              <div className="mt-4 flex items-center justify-between">
                <button type="button" onClick={() => goTo(1)} className="px-2 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                  Back
                </button>
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon path="M12 3.5l7 2.6v5.6c0 4.3-3 7.4-7 8.8-4-1.4-7-4.5-7-8.8V6.1zM9 12l2.2 2.2L15.5 10" className="h-4 w-4" />
                  No spam. One email with your quote.
                </p>
              </div>
            </div>
          )}
      </form>

    </div>
  );
}
