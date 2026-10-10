'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QuoteForm from '@/components/QuoteForm';
import { Confetti, Popper } from '@/components/Festive';
import { pushEvent } from '@/lib/analytics';
import { OPEN_QUOTE_EVENT, hasSubmittedQuote, type OpenQuoteDetail, type QuoteArea, type QuoteOffer } from '@/lib/quote';

/**
 * The quote form as a modal, plus the exit-intent startup offer.
 *
 * Any CTA opens it through `openQuote`. Opening the page at `/#quote` opens it
 * too, so an ad or an email can land someone straight on the form.
 *
 * A service page passes its own `area`, so the form opens with that need
 * ticked however it was opened: a CTA, the header, the exit offer or the link.
 *
 * Plain CSS for the entrance rather than framer's AnimatePresence: its exit
 * sequencing waits on animation frames, and a throttled tab could leave the
 * dialog stuck half drawn.
 */

/** Once per visit. Someone who closed it once does not want it again today. */
const EXIT_SHOWN_KEY = 'mtd_exit_offer_shown';

/** No exit offer in the first moments: a bounce that fast is not a lead. */
const EXIT_ARM_DELAY_MS = 8000;

const PROOF = ['Fixed price, no hourly billing', 'Live in weeks, not quarters', 'Specialists, not generalists'];

function exitOfferAllowed(): boolean {
  if (hasSubmittedQuote()) return false;
  try {
    return !sessionStorage.getItem(EXIT_SHOWN_KEY);
  } catch {
    return true;
  }
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export default function QuoteModal({ area: pageArea }: { area?: QuoteArea }) {
  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState<QuoteOffer | undefined>();
  const [area, setArea] = useState<QuoteArea | undefined>();
  // "Wait," only makes sense to someone on their way out. A visitor who
  // clicked a startup offer on the page gets the plain headline.
  const [fromExit, setFromExit] = useState(false);
  const openRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback((detail: OpenQuoteDetail) => {
    if (openRef.current) return;
    openRef.current = true;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const preselected = detail.area ?? pageArea;
    setOffer(detail.offer);
    setArea(preselected);
    setFromExit(detail.source === 'exit_intent');
    setOpen(true);
    pushEvent({
      event: 'Quote Form Opened',
      source: detail.source,
      offer: detail.offer || 'none',
      ...(preselected ? { preselected_area: preselected } : {}),
    });
  }, [pageArea]);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    pushEvent({ event: 'Quote Form Closed' });
    returnFocus.current?.focus?.();
  }, []);

  // CTA clicks, and the `#quote` deep link.
  useEffect(() => {
    const onOpen = (e: Event) => show((e as CustomEvent<OpenQuoteDetail>).detail);
    const onHash = () => {
      if (window.location.hash === '#quote') show({ source: 'link' });
    };
    window.addEventListener(OPEN_QUOTE_EVENT, onOpen);
    window.addEventListener('hashchange', onHash);
    // Deferred a tick so the landing check runs as a callback, after mount.
    const landing = setTimeout(onHash, 0);
    return () => {
      clearTimeout(landing);
      window.removeEventListener(OPEN_QUOTE_EVENT, onOpen);
      window.removeEventListener('hashchange', onHash);
    };
  }, [show]);

  // Exit intent. On desktop that is the pointer leaving through the top of the
  // window, towards the tabs or the address bar. Phones have no pointer to
  // watch, so there it is a sharp scroll back up after reading a fair way down,
  // which is how people head for the browser bar on mobile.
  useEffect(() => {
    let armed = false;
    const arm = setTimeout(() => { armed = true; }, EXIT_ARM_DELAY_MS);

    const trigger = (how: string) => {
      if (!armed || openRef.current || !exitOfferAllowed()) return;
      try {
        sessionStorage.setItem(EXIT_SHOWN_KEY, '1');
      } catch {
        // Without storage it may show once per page load instead.
      }
      armed = false;
      pushEvent({ event: 'Exit Offer Shown', trigger: how });
      show({ source: 'exit_intent', offer: 'startup_50' });
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) trigger('mouse_leave');
    };

    let lastY = window.scrollY;
    let lastT = performance.now();
    let deepest = 0;
    const touch = window.matchMedia('(hover: none)').matches;
    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      deepest = Math.max(deepest, y);
      const up = lastY - y;
      // A quarter of a screen upwards in under 300ms, after at least two
      // screens of reading.
      if (touch && deepest > window.innerHeight * 2 && up > window.innerHeight * 0.25 && t - lastT < 300) {
        trigger('fast_scroll_up');
      }
      if (t - lastT > 150) {
        lastY = y;
        lastT = t;
      }
    };

    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(arm);
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, [show]);

  // Escape to close, page scroll locked behind the dialog.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Hides Intercom's launcher and proactive messages while the form is up,
    // see `.quote-open` in globals.css. They sit above any z-index we can set.
    document.documentElement.classList.add('quote-open');
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.classList.remove('quote-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const startup = offer === 'startup_50';

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-3">
      <div className="quote-overlay-in absolute inset-0 bg-[#1B251E]/60 backdrop-blur-[2px]" onClick={close} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-dialog-title"
        tabIndex={-1}
        className="quote-dialog-in relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:max-h-[96vh] sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="overflow-y-auto overscroll-contain px-4 pb-2 pt-10 sm:px-8 sm:pt-7">
          <div className={`relative mx-auto mb-4 text-center ${startup ? '-mx-4 -mt-10 px-4 pb-4 pt-10 sm:-mx-8 sm:-mt-7 sm:px-8 sm:pt-6' : 'max-w-2xl'}`}
               style={startup ? { background: 'radial-gradient(90% 100% at 50% 0%, #E3F4EC 0%, #FFFFFF 75%)' } : undefined}>
            {startup && <Confetti />}
            {startup ? (
              <div className="relative mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                  <Popper className="h-5 w-5" />
                  martechdevs startup offer
                </span>
                <h2 id="quote-dialog-title" className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {fromExit ? 'Wait, startups get' : 'Startups get'}{' '}
                  <span className="relative whitespace-nowrap text-teal-700">
                    50% off
                    <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2 w-full" aria-hidden="true">
                      <path d="M2 7c30-5 70-6 116-2" fill="none" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>
                <p className="mt-2.5 text-sm text-gray-600 sm:text-base">Tell us your stack and get a fixed quote with the discount applied.</p>
              </div>
            ) : (
              <>
                <h2 id="quote-dialog-title" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Get a fixed-price quote
                </h2>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">Three quick steps. Takes under a minute.</p>
              </>
            )}
            <ul className="relative mt-3 hidden flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-600 sm:flex">
              {PROOF.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Tick />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <QuoteForm offer={offer} area={area} />
        </div>
      </div>
    </div>
  );
}
