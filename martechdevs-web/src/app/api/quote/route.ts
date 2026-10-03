import { NextRequest, NextResponse } from 'next/server';

/**
 * Quote form submissions.
 *
 * The site has no database, so a lead is forwarded rather than stored, to
 * either or both of:
 *
 * - Email through Resend. RESEND_API_KEY and QUOTE_TO_EMAIL are required.
 *   QUOTE_FROM_EMAIL needs a domain verified in Resend; without one it falls
 *   back to Resend's shared sender, which only delivers to the address the
 *   Resend account was opened with. Reply-To is the lead, so answering the
 *   email answers them.
 * - QUOTE_WEBHOOK_URL, for a Slack incoming webhook, a Zapier or Make catch
 *   hook, or anything else that takes a JSON POST. The body carries a `text`
 *   line for Slack and the raw fields for everything else.
 *
 * With neither set the lead is only written to the function log, which is
 * enough to test the form but not to run ads against: Vercel keeps logs for a
 * short while and nobody is notified.
 */
export const dynamic = 'force-dynamic';

const OFFERS: Record<string, string> = { startup_50: 'Startup 50% off (exit offer)' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kept short and server side as well, so a crafted POST cannot skip it. */
const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com', 'zoho.com',
]);

function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string').map((v) => v.slice(0, 80)).slice(0, 40);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot. A person never sees this field; a form-filling bot fills it.
  // Answer as if it worked so the bot has nothing to learn from.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const domain = email.split('@')[1] || '';
  if (!EMAIL_RE.test(email) || FREE_DOMAINS.has(domain)) {
    return NextResponse.json({ ok: false, error: 'Please use your company email' }, { status: 400 });
  }

  const tools = list(body.tools);
  const areas = list(body.areas);
  const attribution =
    body.attribution && typeof body.attribution === 'object'
      ? Object.fromEntries(
          Object.entries(body.attribution as Record<string, unknown>)
            .filter(([, v]) => typeof v === 'string' && v)
            .map(([k, v]) => [k.slice(0, 40), (v as string).slice(0, 300)])
        )
      : {};

  const offer = typeof body.offer === 'string' && OFFERS[body.offer] ? body.offer : '';

  const lead = {
    email,
    company_domain: domain,
    tools,
    areas,
    offer,
    attribution,
    submitted_at: new Date().toISOString(),
  };

  const text =
    `New quote request from ${email}\n` +
    `Tools: ${tools.join(', ') || 'none picked'}\n` +
    `Needs help with: ${areas.join(', ') || 'none picked'}` +
    (offer ? `\nOffer: ${OFFERS[offer]}` : '') +
    (attribution.utm_source || attribution.gclid
      ? `\nSource: ${[attribution.utm_source, attribution.utm_campaign, attribution.gclid ? 'gclid' : '']
          .filter(Boolean)
          .join(' / ')}`
      : '');

  const webhook = process.env.QUOTE_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;

  if (!webhook && !(resendKey && to)) {
    console.log('[quote] no destination set, lead logged only:', JSON.stringify(lead));
    return NextResponse.json({ ok: true });
  }

  const sends: Promise<void>[] = [];
  if (resendKey && to) sends.push(sendEmail(resendKey, to, lead, text));
  if (webhook) sends.push(postWebhook(webhook, { text, ...lead }));

  // The lead counts as delivered if any destination took it. Only when every
  // one failed does the visitor see an error and get the chance to retry.
  const results = await Promise.allSettled(sends);
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failed.length) {
    // Log the lead itself, so an outage does not lose it outright.
    console.error('[quote] delivery failed, lead:', JSON.stringify(lead), failed.map((f) => String(f.reason)));
  }
  if (failed.length === results.length) {
    return NextResponse.json({ ok: false, error: 'Could not send right now' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

type Lead = {
  email: string;
  company_domain: string;
  tools: string[];
  areas: string[];
  offer: string;
  attribution: Record<string, string>;
  submitted_at: string;
};

async function postWebhook(url: string, payload: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`webhook answered ${res.status}`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

async function sendEmail(apiKey: string, to: string, lead: Lead, text: string) {
  const from = process.env.QUOTE_FROM_EMAIL || 'martechdevs leads <onboarding@resend.dev>';
  const subject = `${lead.offer ? '[Startup 50%] ' : ''}New quote request: ${lead.company_domain}`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${label}</td>` +
    `<td style="padding:6px 0;color:#111827">${escapeHtml(value) || '&ndash;'}</td></tr>`;

  const source = Object.entries(lead.attribution)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5">` +
    `<h2 style="margin:0 0 12px;font-size:18px;color:#111827">New quote request</h2>` +
    `<table style="border-collapse:collapse">` +
    row('Email', lead.email) +
    row('Company', lead.company_domain) +
    row('Tools', lead.tools.join(', ')) +
    row('Needs help with', lead.areas.join(', ')) +
    (lead.offer ? row('Offer', OFFERS[lead.offer]) : '') +
    row('Source', source) +
    row('Submitted', lead.submitted_at) +
    `</table>` +
    `<p style="margin-top:16px;color:#6b7280;font-size:13px">Reply to this email to answer the lead directly.</p>` +
    `</div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((a) => a.trim()).filter(Boolean),
      reply_to: lead.email,
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`resend answered ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
