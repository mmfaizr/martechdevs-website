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
 * Push one event. The array is created if GTM has not landed yet: the snippet
 * reuses whatever `window.dataLayer` already holds, so events fired before the
 * container loads are still delivered once it does.
 */
export function pushEvent(payload: DataLayerEvent) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
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
