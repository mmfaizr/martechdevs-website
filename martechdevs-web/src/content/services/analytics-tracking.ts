import type { ServicePageContent } from './types';

/** GTM on this page is Google Tag Manager. The go-to-market page spells its own out. */
const page: ServicePageContent = {
  slug: 'analytics-tracking',
  area: 'Tracking & ad conversions',
  source: 'lp_analytics_tracking',
  meta: {
    title: 'GA4, Tag Manager & Server-Side Tracking Setup | martechdevs',
    description:
      'GA4 and Google Tag Manager setup, server-side GTM, Google Ads and Meta CAPI conversion tracking, and Consent Mode v2. Fixed price, tested end to end.',
  },
  hero: {
    h1: '**GA4 and Google Tag Manager setup**, with conversion tracking you can trust',
    solution:
      'We set up **Google Analytics 4, Google Tag Manager (GTM) and server-side tracking**, with Google Ads and Meta conversion tracking and Consent Mode v2, then **test every event end to end**.',
  },
  auditName: 'tracking audit',
  tools: [
    { name: 'GA4', icon: 'ga4' },
    { name: 'Google Tag Manager', icon: 'gtm' },
    { name: 'Server-side GTM', icon: 'server' },
    { name: 'Google Ads', icon: 'google ads' },
    { name: 'Meta Ads', icon: 'meta ads' },
    { name: 'Looker Studio', icon: 'looker studio' },
    { name: 'Consent Mode v2', icon: 'google' },
  ],
  heroBadges: [
    { name: 'GA4', icon: 'ga4' },
    { name: 'Google Tag Manager', icon: 'gtm' },
    { name: 'Google Ads', icon: 'google ads' },
    { name: 'Meta Ads', icon: 'meta ads' },
    { name: 'Server-side GTM', icon: 'server' },
    { name: 'BigQuery', icon: 'bigquery' },
  ],
  setup: {
    h2: '**Google Analytics and Tag Manager setup**, done properly',
    lead: 'A marketing analytics agency that does the technical work. **Every tag, event and conversion is planned, built and tested**, so GA4, Google Ads and Meta report numbers you can act on.',
    problems: [
      'Ads, Meta and GA4 **report different conversions**.',
      'Conversions **dropped with the cookie banner**.',
      'A GTM container full of **tags nobody dares delete**.',
      'Ad blockers **hide part of your traffic**.',
    ],
    items: [
      {
        title: 'GA4 setup and audit',
        body: 'A clean Google Analytics 4 property: events and key events named to a plan, cross-domain tracking, internal traffic filtered out, and BigQuery export if you want the raw data.',
        icon: 'Unified Analytics Platform-  .svg',
      },
      {
        title: 'Google Tag Manager setup',
        body: 'A tidy GTM container built on a data layer your developers can maintain, with tags, triggers and variables named so anyone can follow them.',
        icon: 'Configure Key Reports & Models-  .svg',
      },
      {
        title: 'Server-side tracking',
        body: 'A server-side GTM container on your own subdomain that sends events to GA4, Google Ads and Meta, and controls what each one receives.',
        icon: 'Implement Server-Side GTM-   .svg',
      },
      {
        title: 'Google Ads and Meta conversion tracking',
        body: 'Conversion actions with real values, enhanced conversions for Google Ads, and the Meta Conversions API next to the pixel, deduplicated so each conversion counts once.',
        icon: 'Accurate Ad Conversion Tracking-  .svg',
      },
      {
        title: 'Consent Mode v2',
        body: 'Google Consent Mode v2 wired to your consent banner and tested on both the accept and the decline path.',
        icon: 'Integrate Google Consent Mode v2-  .svg',
      },
      {
        title: 'Looker Studio dashboards',
        body: 'Marketing analytics dashboards on GA4 and ad platform data, so the whole team reads one set of numbers.',
        icon: 'Deploy Dashboards Tracking Pipeline-  .svg',
      },
    ],
  },
  steps: {
    h2: '**Conversion tracking setup**, step by step',
    items: [
      { title: 'Free tracking audit', body: 'We review your GA4 property, GTM container, consent setup and the conversions you report today.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Tracking plan', body: 'Every event, parameter and conversion written down and agreed before we build.' },
      { title: 'Build', body: 'GA4, Tag Manager, server-side tagging and ad platform setup, in your accounts.' },
      { title: 'Test end to end', body: 'GTM preview, GA4 DebugView, Meta test events and real test conversions, with consent accepted and declined.' },
      { title: 'Hand over', body: 'Docs, a walkthrough for your team, and dashboards on the new data.' },
    ],
  },
  offer: { h2: '**Tracking setup** at a fixed price' },
  faq: {
    h2: '**GA4 and tracking** questions, answered',
    items: [
      {
        q: 'Should we use server-side GTM or browser tracking?',
        a: "**Usually both.** Browser tags still collect most events, and a server-side GTM container on your own subdomain forwards them to GA4, Google Ads and Meta. It holds up better against ad blockers and browser cookie limits, controls exactly what each vendor receives, and can add data from your backend before sending. For a small site with simple goals, a clean browser setup can be enough. We'll tell you which you need.",
      },
      {
        q: 'What is Consent Mode v2, and will it cost us conversions?',
        a: "**Consent Mode v2 tells Google's tags what each visitor agreed to**, including the two newer signals, ad_user_data and ad_personalization. Google needs these signals for visitors in Europe to keep remarketing and conversion measurement working there. In advanced mode, visitors who decline still send cookieless pings, and Google models the conversions you would otherwise lose. We connect it to your consent banner and test both paths.",
      },
      {
        q: "Why don't our Google Ads conversions match GA4 or our CRM?",
        a: '**They count different things.** Google Ads credits conversions to the date of the ad click, GA4 uses its own attribution and the date of the event, and your CRM counts the leads it actually received. Missing or duplicate tags, consent and ad blockers widen the gap. We fix the tracking first, then line up the definitions so you know why each number differs.',
      },
      {
        q: 'Can you fix our Google Ads and Meta conversion tracking?',
        a: '**Yes.** We audit what fires today, fix or rebuild the tags in Google Tag Manager, set up enhanced conversions for Google Ads and the Meta Conversions API, and pass the right values and event IDs so each conversion is counted once.',
      },
      {
        q: 'What is the Meta (Facebook) Conversions API, and do we need it?',
        a: '**The Conversions API (CAPI) sends conversion events to Meta from a server** as well as from the browser pixel. The pixel alone loses events to ad blockers and browser limits, and CAPI fills those gaps. We set it up through server-side GTM or your backend, deduplicated against the pixel so nothing is counted twice.',
      },
      {
        q: 'How do you check the tracking is accurate?',
        a: "**We test every event before go-live:** in GTM preview and Tag Assistant, in GA4 DebugView, with Meta's test events, and with real test conversions in Google Ads. We check values, parameters and consent behavior, then compare the numbers across tools after launch.",
      },
      {
        q: 'Do you build Looker Studio dashboards?',
        a: '**Yes.** Once the data is right, we build Looker Studio dashboards on GA4, Google Ads and your other sources, so your team works from one set of numbers.',
      },
      {
        q: 'What does the free tracking audit cover?',
        a: "**It's a 30-minute call.** We look at your GA4 property, your GTM container, which conversions fire and which don't, and your consent setup, then agree what to fix first, with a timeline and next steps. There's no obligation.",
      },
    ],
  },
  cta: { h2: '**Get a fixed-price quote** for your GA4 and tracking setup' },
};

export default page;
