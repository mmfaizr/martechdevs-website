import { NextRequest, NextResponse } from 'next/server';
import { companyDomain } from '@/lib/freeDomains';

/**
 * Quote form submissions.
 *
 * The site has no database, so a lead is forwarded rather than stored, to
 * either or both of:
 *
 * - Email through Resend. RESEND_API_KEY and QUOTE_TO_EMAIL are required.
 *   It is sent from quote.martechdevs.com, the subdomain verified in Resend,
 *   so it passes SPF and DKIM and lands in the inbox rather than in spam.
 *   QUOTE_FROM_EMAIL overrides the sender and needs a verified domain too.
 *   Reply-To is the lead, so answering the email answers them.
 * - Twenty, when TWENTY_API_KEY is set. The lead becomes a person (with the
 *   quote fields filled) and company, plus a New stage opportunity owned by
 *   Faiz (TWENTY_OWNER_MEMBER_ID overrides), with the request as a note. A
 *   Twenty workflow on the person's Quote submitted at field sends the
 *   thank-you email from faiz@martechdevs.com. scripts/twenty-setup.mjs
 *   creates the fields.
 * - Attio, when ATTIO_API_KEY is set. The lead becomes a person and company,
 *   a Lead stage deal owned by ATTIO_DEAL_OWNER, and an entry in the "Quote
 *   requests" list. scripts/attio-setup.mjs creates the fields and the list.
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
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email' }, { status: 400 });
  }

  const platforms = list(body.platforms);
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
    company_domain: companyDomain(email),
    platforms,
    tools,
    areas,
    offer,
    attribution,
    submitted_at: new Date().toISOString(),
  };

  const text =
    `New quote request from ${email}\n` +
    (platforms.length ? `Platforms: ${platforms.join(', ')}\n` : '') +
    `Tools: ${tools.join(', ') || 'none picked'}\n` +
    `Needs help with: ${areas.join(', ') || 'none picked'}` +
    (offer ? `\nOffer: ${OFFERS[offer]}` : '') +
    // The service page the form was sent from, which is the ad group for a
    // lead from Google Ads. Left off for the homepage.
    (attribution.page && attribution.page !== '/' ? `\nPage: ${attribution.page}` : '') +
    (attribution.utm_source || attribution.gclid
      ? `\nSource: ${[attribution.utm_source, attribution.utm_campaign, attribution.gclid ? 'gclid' : '']
          .filter(Boolean)
          .join(' / ')}`
      : '');

  const webhook = process.env.QUOTE_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const attioKey = process.env.ATTIO_API_KEY;
  const twentyKey = process.env.TWENTY_API_KEY;

  if (!webhook && !(resendKey && to) && !attioKey && !twentyKey) {
    console.log('[quote] no destination set, lead logged only:', JSON.stringify(lead));
    return NextResponse.json({ ok: true });
  }

  const sends: Promise<void>[] = [];
  if (resendKey && to) sends.push(sendEmail(resendKey, to, lead, text));
  if (webhook) sends.push(postWebhook(webhook, { text, ...lead }));
  if (attioKey) sends.push(sendToAttio(attioKey, lead, text));
  if (twentyKey) sends.push(sendToTwenty(twentyKey, lead, text));

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
  /** Blank for a personal mailbox. */
  company_domain: string;
  platforms: string[];
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

/** What a lead is called in subjects and deal names: the company, else the email. */
function leadName(lead: Lead): string {
  return lead.company_domain || lead.email;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

async function sendEmail(apiKey: string, to: string, lead: Lead, text: string) {
  const from = process.env.QUOTE_FROM_EMAIL || 'martechdevs leads <leads@quote.martechdevs.com>';
  const subject = `${lead.offer ? '[Startup 50%] ' : ''}New quote request: ${leadName(lead)}`;

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
    row('Company', lead.company_domain || 'Personal email') +
    row('Platforms', lead.platforms.join(', ')) +
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

function sourceLine(lead: Lead) {
  return [lead.attribution.utm_source, lead.attribution.utm_campaign, lead.attribution.gclid ? 'gclid' : '']
    .filter(Boolean)
    .join(' / ');
}

async function twenty(apiKey: string, method: string, path: string, body?: Record<string, unknown>) {
  const base = process.env.TWENTY_API_URL || 'https://api.twenty.com';
  const res = await fetch(`${base}/rest${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`twenty ${method} ${path} answered ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).data as Record<string, unknown>;
}

type TwentyRecord = { id: string };

/** The first record matching `filter`, in Twenty's REST filter syntax. */
async function twentyFind(apiKey: string, plural: string, filter: string): Promise<TwentyRecord | undefined> {
  const data = await twenty(apiKey, 'GET', `/${plural}?limit=1&filter=${encodeURIComponent(filter)}`);
  return (data[plural] as TwentyRecord[])[0];
}

/**
 * Company and person are found before they are created, so a repeat lead
 * updates the same records. The company goes in first: Twenty's built-in
 * "Create company when adding a new person" workflow then finds it rather than
 * making a second one. Each request gets its own opportunity.
 */
async function sendToTwenty(apiKey: string, lead: Lead, text: string) {
  const domain = lead.company_domain.replace(/"/g, '');
  const company = domain
    ? ((await twentyFind(apiKey, 'companies', `domainName.primaryLinkUrl[ilike]:"%${domain}"`)) ??
      ((await twenty(apiKey, 'POST', '/companies', {
        name: domain,
        domainName: { primaryLinkUrl: `https://${domain}`, primaryLinkLabel: domain },
      })).createCompany as TwentyRecord))
    : undefined;

  const fields = {
    ...(company ? { companyId: company.id } : {}),
    quoteTools: lead.tools.join(', '),
    quoteAreas: lead.areas.join(', '),
    quoteOffer: lead.offer ? OFFERS[lead.offer] : '',
    quoteSource: sourceLine(lead) || 'direct',
    quoteSubmittedAt: lead.submitted_at,
  };
  const existing = await twentyFind(apiKey, 'people', `emails.primaryEmail[eq]:"${lead.email.replace(/"/g, '')}"`);
  const person = existing
    ? ((await twenty(apiKey, 'PATCH', `/people/${existing.id}`, fields)).updatePerson as TwentyRecord)
    : ((await twenty(apiKey, 'POST', '/people', { emails: { primaryEmail: lead.email }, ...fields }))
        .createPerson as TwentyRecord);

  // Faiz's workspace member in Twenty.
  const ownerId = process.env.TWENTY_OWNER_MEMBER_ID || 'f8152b5b-263d-4c59-ae70-d6fbb45fda64';
  const opportunity = (await twenty(apiKey, 'POST', '/opportunities', {
    name: `${lead.offer ? '[Startup 50%] ' : ''}Quote: ${leadName(lead)}`,
    stage: 'NEW',
    ...(company ? { companyId: company.id } : {}),
    pointOfContactId: person.id,
    ownerId,
  })).createOpportunity as TwentyRecord;

  const note = (await twenty(apiKey, 'POST', '/notes', {
    title: 'Website quote request',
    bodyV2: { markdown: text.replace(/\n/g, '\n\n') },
  })).createNote as TwentyRecord;
  await twenty(apiKey, 'POST', '/noteTargets', { noteId: note.id, targetOpportunityId: opportunity.id });
}

async function attio(apiKey: string, method: string, path: string, data: Record<string, unknown>) {
  const res = await fetch(`https://api.attio.com/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`attio ${method} ${path} answered ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).data as { id: { record_id: string } };
}

/**
 * Company and person are asserted, so a repeat lead updates the same records.
 * The list entry is asserted too, so someone who asks twice is listed once.
 * Each request still gets its own deal.
 */
async function sendToAttio(apiKey: string, lead: Lead, text: string) {
  const company = lead.company_domain
    ? await attio(apiKey, 'PUT', '/objects/companies/records?matching_attribute=domains', {
        values: { domains: [lead.company_domain] },
      })
    : undefined;
  const companyRefs = company ? [{ target_object: 'companies', target_record_id: company.id.record_id }] : [];

  const source = sourceLine(lead);
  const person = await attio(apiKey, 'PUT', '/objects/people/records?matching_attribute=email_addresses', {
    values: {
      email_addresses: [lead.email],
      company: companyRefs,
      quote_tools: lead.tools.join(', '),
      quote_areas: lead.areas.join(', '),
      quote_offer: lead.offer ? OFFERS[lead.offer] : '',
      quote_source: source || 'direct',
      quote_submitted_at: lead.submitted_at,
    },
  });
  const personId = person.id.record_id;

  const deal = await attio(apiKey, 'POST', '/objects/deals/records', {
    values: {
      name: `${lead.offer ? '[Startup 50%] ' : ''}Quote: ${leadName(lead)}`,
      stage: 'Lead',
      owner: [{ workspace_member_email_address: process.env.ATTIO_DEAL_OWNER || 'faiz@martechdevs.com' }],
      associated_people: [{ target_object: 'people', target_record_id: personId }],
      associated_company: companyRefs,
    },
  });

  await Promise.all([
    attio(apiKey, 'POST', '/notes', {
      parent_object: 'deals',
      parent_record_id: deal.id.record_id,
      title: 'Website quote request',
      format: 'plaintext',
      content: text,
    }),
    attio(apiKey, 'PUT', '/lists/quote_requests/entries', {
      parent_object: 'people',
      parent_record_id: personId,
      entry_values: {},
    }),
  ]);
}
