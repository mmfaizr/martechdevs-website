/**
 * dataLayer plumbing for GTM.
 *
 * The container is loaded in the root layout; this is the only place the app
 * writes to the queue. Every push carries an `event` key so a single GTM
 * trigger matching any custom event picks all of them up.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

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
 * Push one event. The array is created if GTM has not landed yet: the snippet
 * reuses whatever `window.dataLayer` already holds, so events fired before the
 * container loads are still delivered once it does.
 *
 * Every event carries `user_id` when one is known, so identity is attached in
 * one place rather than at each call site.
 */
export function pushEvent(payload: DataLayerEvent) {
  if (typeof window === 'undefined') return;

  const userId = currentUserId();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(userId ? { ...payload, user_id: userId } : payload);
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
