import { NextRequest, NextResponse } from 'next/server';

/**
 * The visitor's IP address.
 *
 * A browser is never told its own public address, so reading it needs a request
 * to reach a server that can see where it came from. That is all this does.
 *
 * Never cache this. A cached response would hand every later visitor whichever
 * address happened to be served first, which would be wrong data and somebody
 * else's personal data at the same time. force-dynamic keeps it off the static
 * build and no-store keeps it out of the CDN and the browser.
 */
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  // Vercel puts the client first in x-forwarded-for and appends each proxy it
  // passes through, so the first entry is the visitor and the rest are ours.
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || '';

  return NextResponse.json(
    { ip },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
