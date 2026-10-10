import type { ServicePageContent } from './types';

/**
 * No area is ticked on the quote form here. The page covers the whole stack,
 * so any single need would be a guess the lead then carries into the CRM.
 */
const page: ServicePageContent = {
  slug: 'martech-integration',
  source: 'lp_martech_integration',
  meta: {
    title: 'Martech Integration & Implementation Services | martechdevs',
    description:
      'Hands-on martech consultants. We integrate HubSpot, Segment, GA4, Mixpanel, Braze and Snowflake into one working stack. Fixed price, live in weeks.',
  },
  hero: {
    h1: '**Martech stack integration** that makes your tools agree',
    solution:
      'We connect **HubSpot, Segment, GA4, Mixpanel, Braze and Snowflake** with the rest of your stack, so data is collected once and **every tool reports the same numbers**.',
  },
  auditName: 'stack audit',
  tools: [
    { name: 'HubSpot', icon: 'hubspot' },
    { name: 'Segment', icon: 'segment' },
    { name: 'GA4', icon: 'ga4' },
    { name: 'Google Tag Manager', icon: 'gtm' },
    { name: 'Mixpanel', icon: 'mixpanel' },
    { name: 'Braze', icon: 'braze' },
    { name: 'Snowflake', icon: 'snowflake' },
    { name: 'Intercom', icon: 'intercom' },
  ],
  heroBadges: [
    { name: 'HubSpot', icon: 'hubspot' },
    { name: 'Segment', icon: 'segment' },
    { name: 'GA4', icon: 'ga4' },
    { name: 'Mixpanel', icon: 'mixpanel' },
    { name: 'Snowflake', icon: 'snowflake' },
    { name: 'Braze', icon: 'braze' },
  ],
  setup: {
    h2: '**Martech implementation**, done hands-on',
    lead: 'Big agencies hand you a strategy deck. **We do the marketing stack integration itself**: the audit, the setup and the testing, in your own accounts.',
    problems: [
      'Every tool shows **different numbers** for one customer.',
      '**Nobody owns** how your tools connect.',
      'Integration tickets **sit behind product work**.',
      'You pay for features **the data never reaches**.',
    ],
    items: [
      {
        title: 'Martech stack audit',
        body: 'Every tool mapped: what it collects, where it sends it, and what is broken or duplicated. You get the fixes in priority order.',
        icon: 'Ensure Auditable Data Flows-  .svg',
      },
      {
        title: 'Tracking and data collection',
        body: 'One tracking plan for web, app and server, collected once with Segment, RudderStack or Google Tag Manager and sent to every tool.',
        icon: 'Full Event Streaming.svg',
      },
      {
        title: 'CRM and marketing automation',
        body: 'HubSpot or Salesforce set up around how you sell, with lifecycle messages in Braze, Customer.io or Intercom.',
        icon: 'Configure CRM Objects, Stages, Properties-  .svg',
      },
      {
        title: 'Analytics and attribution',
        body: 'GA4, Mixpanel or Amplitude reports your team trusts, with conversions sent back to Google Ads and Meta.',
        icon: 'Unified Analytics Platform-  .svg',
      },
      {
        title: 'Warehouse and activation',
        body: 'Snowflake or BigQuery as the single source of truth, loaded with Fivetran and synced back to your tools with Hightouch.',
        icon: 'Construct Snowflake:BigQuery Warehouse-  .svg',
      },
      {
        title: 'Docs, training and handover',
        body: 'Everything we build is documented and walked through with your team, so you can run it without us.',
        icon: 'Validated System Launch  .svg',
      },
    ],
  },
  steps: {
    h2: '**Martech consulting**, step by step',
    items: [
      { title: 'Free stack audit', body: 'A 30-minute call on your tools, where they break and what to fix first.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Plan', body: 'Tracking plan, data flows and tool choices agreed before anything is built.' },
      { title: 'Build', body: 'Hands-on setup in your accounts: tracking, pipelines, CRM and messaging.' },
      { title: 'Test end to end', body: 'Every event and sync checked from source to report before go-live.' },
      { title: 'Hand over', body: 'Docs and a training session for your team, plus ongoing support if you want it.' },
    ],
  },
  offer: { h2: '**Martech services** at a fixed price' },
  faq: {
    h2: '**Martech integration** questions, answered',
    items: [
      {
        q: 'Which tools do you integrate?',
        a: '**Most of the modern martech stack:** HubSpot, Salesforce, Segment, RudderStack, GA4, Google Tag Manager, Mixpanel, Amplitude, Braze, Customer.io, Intercom, Snowflake, BigQuery, Fivetran and Hightouch, among others. If a tool has an API or webhooks, we can usually connect it.',
      },
      {
        q: 'Do we have to switch tools?',
        a: "**No.** We're vendor-neutral and we don't sell software. Most of the time the tools you already pay for are fine, and the wiring between them is what needs fixing. If a tool really is the wrong fit, we'll say why and what we'd use instead.",
      },
      {
        q: 'How long does a martech integration take?',
        a: '**Most projects are live within a few weeks.** A single integration takes less, a full stack setup takes more. Your fixed quote gives the timeline before you commit.',
      },
      {
        q: 'How is the fixed price worked out?',
        a: '**From the scope:** which tools, which data, which platforms (web, app or both) and what has to be built or migrated. You get one price for the agreed scope, with no hourly billing.',
      },
      {
        q: 'What does the free stack audit cover?',
        a: "**It's a 30-minute video call.** We go through your current stack and where it hurts, the quick wins we can ship first, an integration roadmap, and the timeline, scope and next steps. There's no obligation.",
      },
      {
        q: 'Do you document the work and train our team?',
        a: '**Yes.** Every project ends with documentation of what we built and how it fits together, and a training session so your team can run it and build on it.',
      },
      {
        q: 'Can you work alongside our developers?',
        a: "**Yes.** We can do the whole build, or split it with your engineers. If they'd rather own the code inside your product, we write the specs, check their work and handle the setup inside each tool.",
      },
      {
        q: 'What does a martech consultant from martechdevs actually do?',
        a: '**The hands-on part of marketing technology consulting.** We audit, plan and build the integration ourselves, from tracking and pipelines to CRM and messaging, in your accounts.',
      },
      {
        q: 'Do you offer ongoing support?',
        a: '**Yes.** After launch we can stay on to fix what breaks when tools change and to add what you need next.',
      },
    ],
  },
  cta: { h2: '**Clear your martech backlog** at a fixed price' },
};

export default page;
