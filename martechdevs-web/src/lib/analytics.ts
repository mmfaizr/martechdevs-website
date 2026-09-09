/**
 * Event plumbing. One call site, two destinations: the GTM dataLayer and
 * Mixpanel.
 *
 * Mixpanel is loaded from the app rather than through GTM, so nothing here
 * depends on a container tag existing. Every push carries an `event` key, so a
 * single GTM trigger matching any custom event still picks all of them up.
 */

type Mixpanel = {
  track: (name: string, props?: Record<string, unknown>) => void;
  identify: (id: string) => void;
  init: (token: string, config?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    mixpanel?: Partial<Mixpanel>;
    Intercom?: (command: string, ...args: unknown[]) => void;
  }
}

/**
 * Project token. Public by design: it ships in client JS wherever it lives.
 *
 * Set NEXT_PUBLIC_MIXPANEL_TOKEN to point a local or preview build at a
 * separate project, so development traffic stays out of production reporting.
 * Unset, it falls back to production, which is what Vercel builds use today.
 */
export const MIXPANEL_TOKEN =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '8cc0805e778be30bfa978b98aa4b65dd';

export type DataLayerEvent = Record<string, unknown> & { event: string };

/**
 * Where the visitor's id is kept once the landing URL has been read.
 *
 * Session scope, not local: it identifies this visit. Carrying an id into a
 * later direct visit would attribute that visit to a campaign the person did
 * not arrive from, and on a shared browser it would attribute it to the wrong
 * person entirely.
 */
const USER_ID_KEY = 'mtd_user_id';

/**
 * The visitor's id, taken from `utm_campaign` on the landing URL.
 *
 * Outbound links carry a per-recipient value there, so it answers who clicked
 * rather than which campaign they came from. The URL wins whenever it carries
 * one, so a fresh link re-identifies someone mid-session; otherwise the value
 * stored on arrival is reused, which is what keeps the id on events fired long
 * after landing and on any URL that has since lost its query string.
 *
 * Returns empty for organic and direct visits, and `pushEvent` then omits the
 * key rather than sending a blank id.
 */
function currentUserId(): string {
  let id = '';

  try {
    id = new URLSearchParams(window.location.search).get('utm_campaign')?.trim() || '';
  } catch {
    // A malformed query string is not worth losing the event over.
  }

  try {
    if (id) sessionStorage.setItem(USER_ID_KEY, id);
    else id = sessionStorage.getItem(USER_ID_KEY) || '';
  } catch {
    // Private mode and blocked site data both throw on access. The id from the
    // URL still stands for this page, it just will not outlive it.
  }

  return id;
}

/**
 * The dataLayer spelling of an event name: "Book a Call Clicked" becomes
 * "book_a_call_clicked".
 *
 * Mixpanel reads better in Title Case, but a GTM event name with spaces in it
 * is awkward to match on and GA4 rejects one outright, so each destination gets
 * the spelling it wants. Deriving the second from the first keeps them in step
 * without a lookup table to forget to update.
 */
export function snakeCase(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/* ------------------------------------------------------------- mixpanel */

/** Events seen before the library finished loading, replayed in order. */
const pending: [string, Record<string, unknown>][] = [];
let identified: string | null = null;
let flushTimer: ReturnType<typeof setInterval> | undefined;

function mixpanelReady(): boolean {
  return typeof window.mixpanel?.track === 'function';
}

function sendToMixpanel(name: string, props: Record<string, unknown>) {
  const mp = window.mixpanel;
  if (!mp?.track) return;

  // The id is bound once per visitor rather than on every event. Repeating it
  // costs a request each time and tells Mixpanel nothing new.
  const userId = props.user_id;
  if (typeof userId === 'string' && userId && userId !== identified) {
    identified = userId;
    try {
      mp.identify?.(userId);
    } catch {
      // A failed identify must not take the event down with it.
    }
  }

  try {
    mp.track(name, props);
  } catch {
    // Mixpanel is a reporting side effect, never a reason to break a click.
  }
}

function flushPending(): boolean {
  if (!mixpanelReady()) return false;
  while (pending.length) {
    const next = pending.shift();
    if (next) sendToMixpanel(next[0], next[1]);
  }
  return true;
}

/**
 * The library is loaded after hydration to keep it off the critical path, so
 * an early click or the first scroll threshold can beat it. Those queue here
 * and replay once it lands rather than being dropped.
 */
function trackMixpanel(name: string, props: Record<string, unknown>) {
  if (mixpanelReady()) {
    sendToMixpanel(name, props);
    return;
  }

  pending.push([name, props]);
  if (flushTimer) return;

  let waited = 0;
  flushTimer = setInterval(() => {
    waited += 300;
    // Give up after 20s and release the queue. A library that has not arrived
    // by then is blocked or absent, and holding events only grows memory.
    if (flushPending() || waited >= 20000) {
      clearInterval(flushTimer);
      flushTimer = undefined;
      if (!mixpanelReady()) pending.length = 0;
    }
  }, 300);
}

/** Called once the library has initialised, to release anything queued. */
export function onMixpanelReady() {
  flushPending();
}

/* ---------------------------------------------------------------- push */

/**
 * Record one event to the dataLayer and to Mixpanel.
 *
 * The dataLayer array is created if GTM has not landed yet: the snippet reuses
 * whatever `window.dataLayer` already holds, so events fired before the
 * container loads are still delivered once it does.
 *
 * Every event carries `user_id` when one is known, so identity is attached in
 * one place rather than at each call site.
 */
export function pushEvent(payload: DataLayerEvent) {
  if (typeof window === 'undefined') return;

  const userId = currentUserId();
  const enriched = userId ? { ...payload, user_id: userId } : payload;

  // Mixpanel takes the name as its own argument, so `event` is not repeated
  // inside the properties.
  const { event, ...props } = enriched;

  // A fresh object goes to GTM rather than the one Mixpanel reads. The
  // container stamps its own keys onto whatever is pushed, in place, so sharing
  // the object would ship `gtm.uniqueEventId` to Mixpanel with every event.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: snakeCase(event), ...props });

  trackMixpanel(event, props);
}

/**
 * Event names for everything that is not a click.
 *
 * Title Case with a past tense verb, matching the names built from click text,
 * so Mixpanel's event list reads one way throughout. Properties stay
 * snake_case, which is Mixpanel's own convention and what the setup guide asks
 * for.
 */
export const EVENTS = {
  scrolled: 'Page Scrolled',
  intercomOpened: 'Intercom Opened',
  intercomClosed: 'Intercom Closed',
} as const;

/** Scroll thresholds, in percent of page depth reached. */
export const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * A readable label for whatever was clicked. Icon-only controls carry no text,
 * so fall back to the labels a screen reader would use before giving up.
 */
export function labelFor(el: HTMLElement): string {
  const text =
    el.innerText?.trim() ||
    el.getAttribute('aria-label')?.trim() ||
    el.getAttribute('title')?.trim() ||
    el.querySelector('img')?.getAttribute('alt')?.trim() ||
    '';
  return text.replace(/\s+/g, ' ').slice(0, 100);
}

/**
 * Event name for a click, built from the control's own label:
 * "Book a call" becomes "Book a call Clicked".
 *
 * This is a deliberate exception to the rule against runtime-built event names.
 * It reads well in Mixpanel without a lookup, at the cost of a new event every
 * time a button's wording changes, so the old name stays in reports and the new
 * one starts from zero. Renaming a CTA is therefore a tracking change too.
 */
export function clickEventName(el: HTMLElement): string {
  const label = titleCase(labelFor(el).replace(/\s+/g, ' ').trim().slice(0, 60));
  return label ? `${label} Clicked` : 'Element Clicked';
}

/** Words that stay lowercase inside a title, unless they open it. */
const MINOR_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor',
  'of', 'on', 'or', 'per', 'the', 'to', 'up', 'via', 'with', 'yet',
]);

/**
 * Title Case a button's own wording, so "Book a call" reports as "Book a Call".
 *
 * Buttons on this site are written in sentence case and some are shouted in
 * caps, which would otherwise put three spellings of the same idea in the event
 * list. Existing case is discarded rather than preserved for that reason.
 */
export function titleCase(text: string): string {
  return text
    .split(' ')
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/**
 * How far down the page the click landed, in percent.
 *
 * On a page this long, which is over 30,000px, "header" alone does not say
 * whether a CTA converts near the top or after someone has read the whole
 * thing. Falls back to 0 when the document has no height to measure against.
 */
export function clickDepth(el: HTMLElement): number {
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  if (!docHeight) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.min(100, Math.max(0, Math.round((top / docHeight) * 100)));
}

/**
 * Which part of the page the click happened in.
 *
 * Sections on this site are identified by id (`#services`, `#testimonials`,
 * `#book-call` and the per-service ids), so the nearest ancestor id is the
 * most useful answer. Header and footer are landmarks rather than ids, so they
 * are checked first.
 */
export function sectionFor(el: HTMLElement): string {
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  const withId = el.closest<HTMLElement>('[id]');
  return withId?.id || 'body';
}
