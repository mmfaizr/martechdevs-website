'use client';

import type { ReactNode } from 'react';
import { openQuote, type QuoteArea, type QuoteOffer } from '@/lib/quote';

/** A button that opens the quote form, for pages that are otherwise server-rendered. */
export default function QuoteButton({
  source,
  offer,
  area,
  className,
  children,
}: {
  source: string;
  offer?: QuoteOffer;
  area?: QuoteArea;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" data-track="quote_requested" onClick={() => openQuote(source, offer, area)} className={className}>
      {children}
    </button>
  );
}
