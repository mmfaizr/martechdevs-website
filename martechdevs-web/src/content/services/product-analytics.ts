import type { ServicePageContent } from './types';

const page: ServicePageContent = {
  slug: 'product-analytics',
  area: 'Analytics & attribution',
  source: 'lp_product_analytics',
  meta: {
    title: 'Mixpanel & Amplitude Implementation Experts | martechdevs',
    description:
      'Mixpanel and Amplitude implementation: tracking plans, validated events, funnels, retention and campaign ROI, plus AppsFlyer and Adjust. Fixed price.',
  },
  hero: {
    eyebrow: 'Product analytics',
    h1: 'Mixpanel and Amplitude implementation that shows where users drop off',
    intro:
      "The same action is tracked under three names, funnels don't match the database, and the product team has stopped trusting the dashboards. We implement Mixpanel or Amplitude from a tracking plan, add backend events and AppsFlyer or Adjust data, and validate every event end to end, so funnels, retention and campaign ROI hold up.",
  },
  auditName: 'analytics audit',
  tools: [
    { name: 'Mixpanel', icon: 'mixpanel' },
    { name: 'Amplitude', icon: 'amplitude' },
    { name: 'Segment', icon: 'segment' },
    { name: 'AppsFlyer', icon: 'appsflyer' },
    { name: 'Adjust', icon: 'adjust' },
    { name: 'iOS', icon: 'ios' },
    { name: 'Android', icon: 'android' },
  ],
  setup: {
    h2: 'Product analytics implementation, from tracking plan to dashboards',
    lead: 'Product analytics consultants who write the plan, ship the events and check them, so your product and growth teams get data they can rely on.',
    problems: [
      'The same action is tracked under three different event names.',
      "Funnel numbers don't match the database, so nobody acts on them.",
      'App installs and web signups never connect to the same user.',
      'You can see traffic by campaign, but not which campaigns bring users who stay and pay.',
    ],
    items: [
      {
        title: 'Tracking plan',
        body: 'Every event and property defined once, with names, triggers and sources, before anyone writes code.',
        icon: 'Enforce Data Schemas & Governance-  .svg',
      },
      {
        title: 'Mixpanel or Amplitude setup',
        body: 'Web and app SDKs and identity set up so each person is one user across devices, with account-level reporting for B2B.',
        icon: 'Unified Analytics Platform-  .svg',
      },
      {
        title: 'Backend events',
        body: "Signups, purchases, renewals and refunds sent from your server, where ad blockers and closed tabs can't drop them.",
        icon: 'Augment with Backend Data-  .svg',
      },
      {
        title: 'AppsFlyer and Adjust',
        body: 'Mobile attribution joined to user profiles, so you see which campaigns bring users who stay.',
        icon: 'Integrate Mobile Attribution-   .svg',
      },
      {
        title: 'Funnels, retention and ROI',
        body: 'Funnel, retention, cohort and campaign ROI reports, with ad cost imported so spend sits next to revenue.',
        icon: 'True Campaign ROI-  .svg',
      },
      {
        title: 'Event validation',
        body: 'Every event tested against the plan before release, and counts checked against your backend after.',
        icon: 'Validate Tracking End-to-End-  .svg',
      },
    ],
  },
  steps: {
    h2: 'How a Mixpanel or Amplitude setup runs',
    items: [
      { title: 'Free analytics audit', body: 'We review your current events, reports and where the numbers stop adding up.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Tracking plan', body: 'Events, properties and identity rules agreed with your product team.' },
      { title: 'Build', body: 'SDKs, backend events and attribution set up across web, app and server.' },
      { title: 'Validate', body: 'Events checked in debuggers and live views, then against your backend.' },
      { title: 'Hand over', body: 'Dashboards, docs and a walkthrough so your team can answer its own questions.' },
    ],
  },
  offer: { h2: 'Product analytics setup at a fixed price' },
  faq: {
    h2: 'Mixpanel and Amplitude FAQs',
    items: [
      {
        q: 'Mixpanel or Amplitude?',
        a: 'Both cover funnels, retention, cohorts and user paths well. Mixpanel prices by events and is quick for teams to pick up. Amplitude prices by tracked users and adds products like Experiment for A/B tests, which suits larger product teams. Your data volume and the plan you qualify for often decide it. We implement both.',
      },
      {
        q: 'What is a tracking plan, and why do we need one?',
        a: "A tracking plan lists every event and property you collect, what each one means, when it fires and where it comes from. It keeps names consistent across web, app and backend, so reports don't break when someone ships a feature. We write it with you before any code changes, and it becomes the spec for your developers and ours.",
      },
      {
        q: 'Should we track events in the backend?',
        a: "For anything tied to revenue, yes. Signups, purchases, subscription changes and refunds are more reliable from your server, where ad blockers and closed tabs can't drop them. Clicks and screen views still come from the browser or app SDK, and both land on the same user.",
      },
      {
        q: 'Can you integrate AppsFlyer or Adjust?',
        a: 'Yes. We connect your mobile attribution tool so install and campaign data lands on the same user profiles in Mixpanel or Amplitude. Then you can see which campaigns bring users who stay and pay.',
      },
      {
        q: "Why don't our analytics numbers match the warehouse?",
        a: 'Usually because they count different things or lose different data. Browser events are lost to ad blockers and closed tabs, time zones and deduplication rules differ, bots are filtered in one place and not the other, and identity merges change counts. We trace each metric back to its source, fix what is broken and document what is expected to differ.',
      },
      {
        q: 'How do you validate events?',
        a: "Every event is checked against the tracking plan before release, in the browser and app debuggers, in Mixpanel's or Amplitude's live event views, and with test users who run through the key funnels. After launch we compare counts with your backend, so drift is caught early.",
      },
      {
        q: 'Can you show true campaign ROI?',
        a: 'Yes. We import ad cost from Google Ads, Meta and other platforms and tie it to the users each campaign brought in, so you can compare spend with activation, retention and revenue by campaign.',
      },
      {
        q: 'What does the free analytics audit cover?',
        a: "It's a 30-minute call on your events, your reports and the questions you can't answer yet: where it hurts, the quick wins, and what to fix first, with a timeline and next steps. There's no obligation.",
      },
    ],
  },
  cta: { h2: 'Get a fixed-price quote for your Mixpanel or Amplitude setup' },
};

export default page;
