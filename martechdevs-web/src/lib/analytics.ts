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
  }
}

/** Project token. Public by design: it ships in client JS wherever it lives. */
export const MIXPANEL_TOKEN = '8cc0805e778be30bfa978b98aa4b65dd';

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

  // Split the Mixpanel copy off BEFORE handing the object to GTM. The container
  // stamps its own keys onto whatever is pushed, in place, so reading the
  // properties afterwards ships `gtm.uniqueEventId` to Mixpanel with every
  // event. Mixpanel also takes the name as its own argument, so `event` is not
  // repeated inside the properties.
  const { event, ...props } = enriched;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(enriched);

  trackMixpanel(event, props);
}

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
