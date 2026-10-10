'use client';

import { useEffect, useState } from 'react';
import { openQuote, type QuoteArea } from '@/lib/quote';

/**
 * A quote button pinned to the bottom of the screen on phones, whenever none
 * of the page's own big ones is in view: the hero buttons, the closing call to
 * action, the calendar or the footer. On a short phone the hero buttons start
 * below the fold, so it shows from the first screen.
 *
 * The right-hand corner stays clear for Intercom's launcher, which sits above
 * anything the page can stack.
 */
export default function MobileQuoteBar({ source, area }: { source: string; area?: QuoteArea }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets: Element[] = ['hero-cta', 'get-quote', 'book-call']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const footer = document.querySelector('footer');
    if (footer) targets.push(footer);

    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      setShow(![...visible.values()].some(Boolean));
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 pt-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="pr-20">
        <button
          type="button"
          data-track="quote_requested"
          onClick={() => openQuote(source, undefined, area)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-800"
        >
          Get a fixed-price quote
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
