/**
 * Opening the quote form from anywhere on the page.
 *
 * The CTAs live in several components and the form lives in one modal, so they
 * talk through a window event rather than shared state. A button only needs to
 * call `openQuote`; nothing has to be threaded through props.
 */

export type QuoteOffer = 'startup_50';

export type OpenQuoteDetail = {
  /** Where the form was opened from, for reporting. */
  source: string;
  offer?: QuoteOffer;
};

export const OPEN_QUOTE_EVENT = 'mtd:open-quote';

/**
 * Set once a lead goes through. Local rather than session storage: someone who
 * already asked for a quote should not be offered a discount form next week.
 */
const SUBMITTED_KEY = 'mtd_quote_submitted';

export function openQuote(source: string, offer?: QuoteOffer) {
  window.dispatchEvent(new CustomEvent<OpenQuoteDetail>(OPEN_QUOTE_EVENT, { detail: { source, offer } }));
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
