import { identifyLead, pushEvent } from '@/lib/analytics';
import { companyDomain } from '@/lib/freeDomains';

/**
 * Opening the quote form from anywhere on the page.
 *
 * The CTAs live in several components and the form lives in one modal, so they
 * talk through a window event rather than shared state. A button only needs to
 * call `openQuote`; nothing has to be threaded through props.
 */

export type QuoteOffer = 'startup_50';

/** The needs on the form's second step, by the label the visitor sees. */
export type QuoteArea =
  | 'Tracking & ad conversions'
  | 'Analytics & attribution'
  | 'CDP & data warehouse'
  | 'CRM & lifecycle messaging'
  | 'GTM engineering & outbound'
  | 'Support & AI agents'
  | 'Not sure yet';

export type OpenQuoteDetail = {
  /** Where the form was opened from, for reporting. */
  source: string;
  offer?: QuoteOffer;
  /** Ticked in advance on the second step. The visitor can still change it. */
  area?: QuoteArea;
};

export const OPEN_QUOTE_EVENT = 'mtd:open-quote';

/**
 * Set once a lead goes through. Local rather than session storage: someone who
 * already asked for a quote should not be offered a discount form next week.
 */
const SUBMITTED_KEY = 'mtd_quote_submitted';

export function openQuote(source: string, offer?: QuoteOffer, area?: QuoteArea) {
  window.dispatchEvent(new CustomEvent<OpenQuoteDetail>(OPEN_QUOTE_EVENT, { detail: { source, offer, area } }));
}

export function markQuoteSubmitted() {
  try {
    localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
  } catch {
    // Blocked storage means the exit offer may show again. Harmless.
  }
}

export function hasSubmittedQuote(): boolean {
  try {
    return !!localStorage.getItem(SUBMITTED_KEY);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------ conversion */

/** Where a sent lead lands, and the URL Google Ads counts as the conversion. */
export const THANK_YOU_PATH = '/quote/thank-you';

/**
 * A sent lead on its way to the thank-you page.
 *
 * The form stores it just before leaving and the thank-you page reports it,
 * deleting it as it reads, so a reload cannot count the lead twice and a
 * direct visit counts nothing. Session storage keeps the email out of the URL
 * and out of any later visit.
 */
const CONVERSION_KEY = 'mtd_quote_conversion';

/** Older than this, a stored lead did not come straight from the form. */
const CONVERSION_MAX_AGE_MS = 30 * 60 * 1000;

export type QuoteLead = {
  email: string;
  tools: string[];
  areas: string[];
  offer: string;
  /** When the form was sent, in epoch milliseconds. */
  at: number;
};

/** False when storage is blocked, so the caller can report in place instead. */
export function stashConversion(lead: Omit<QuoteLead, 'at'>): boolean {
  try {
    sessionStorage.setItem(CONVERSION_KEY, JSON.stringify({ ...lead, at: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function takeConversion(): QuoteLead | null {
  try {
    const raw = sessionStorage.getItem(CONVERSION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(CONVERSION_KEY);
    const lead = JSON.parse(raw) as QuoteLead;
    if (!lead?.email || !(Date.now() - lead.at < CONVERSION_MAX_AGE_MS)) return null;
    return lead;
  } catch {
    return null;
  }
}

/**
 * Run `fn` once Intercom exists. GTM installs it, so on a freshly loaded page
 * it turns up a moment after the app. Gives up after 20s, the same limit as
 * the Mixpanel queue: by then it is blocked or absent.
 */
function whenIntercom(fn: (intercom: NonNullable<Window['Intercom']>) => void) {
  let waited = 0;
  const attempt = () => {
    const intercom = window.Intercom;
    if (typeof intercom === 'function') {
      try {
        fn(intercom);
      } catch {
        // A reporting side effect, never a reason to break the page.
      }
      return;
    }
    waited += 300;
    if (waited < 20000) setTimeout(attempt, 300);
  };
  attempt();
}

/**
 * Report a sent lead everywhere it is counted: the dataLayer, where GTM fires
 * the Google Ads conversion on `quote_form_submitted`; Mixpanel, as an
 * identified profile; and Intercom, as a contact plus the `quote_requested`
 * event its rule listens for.
 */
export function reportConversion(lead: QuoteLead) {
  const domain = companyDomain(lead.email);
  const tools = lead.tools.join(', ');
  const areas = lead.areas.join(', ');
  const offer = lead.offer || 'none';
  const profile = {
    company_domain: domain,
    quote_tools: tools,
    quote_areas: areas,
    quote_offer: offer,
    quote_submitted_at: new Date(lead.at).toISOString(),
  };

  // Email for Google Ads enhanced conversions, pushed ahead of the event so it
  // is already set when the conversion tag reads it. Kept out of pushEvent, so
  // it never rides along to Mixpanel or a GA4 event tag.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ user_data: { email: lead.email } });

  // Profile first, so the event below lands on it.
  identifyLead(lead.email, profile);

  pushEvent({
    event: 'Quote Form Submitted',
    tools,
    areas,
    tool_count: lead.tools.length,
    area_count: lead.areas.length,
    offer,
  });

  whenIntercom((intercom) => {
    intercom('update', {
      email: lead.email,
      ...(domain ? { company: { company_id: domain, name: domain } } : {}),
      ...profile,
    });
    intercom('trackEvent', 'quote_requested', { tools, areas, offer });
  });
}
