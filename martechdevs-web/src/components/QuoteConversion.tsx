'use client';

import { useEffect } from 'react';
import { reportConversion, takeConversion } from '@/lib/quote';

/**
 * Reports the lead that brought the visitor to the thank-you page, once.
 *
 * Nothing happens on a direct visit or a reload, because the form's handoff is
 * deleted as it is read. That keeps the Google Ads conversion tied to a lead
 * the server actually accepted.
 */
export default function QuoteConversion() {
  useEffect(() => {
    const lead = takeConversion();
    if (lead) reportConversion(lead);
  }, []);

  return null;
}
