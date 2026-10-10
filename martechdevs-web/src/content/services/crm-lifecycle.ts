import type { ServicePageContent } from './types';

/** No partner-program claims (HubSpot, Braze, Intercom) without confirmed partner status. */
const page: ServicePageContent = {
  slug: 'crm-lifecycle',
  area: 'CRM & lifecycle messaging',
  source: 'lp_crm_lifecycle',
  meta: {
    title: 'HubSpot, Braze & Intercom Implementation | martechdevs',
    description:
      'HubSpot implementation, Salesforce integration and lead routing, plus Braze, Customer.io and Intercom journeys triggered by real customer data. Fixed price.',
  },
  hero: {
    eyebrow: 'CRM & lifecycle',
    h1: '**HubSpot implementation** and lifecycle messaging, built on real customer data',
    problem:
      'New leads wait for an owner, half the CRM is out of date, and **messages go out on a timer instead of when customers act**.',
    solution:
      'We set up **HubSpot CRM or Salesforce** around your sales process, then build **Braze, Customer.io, Intercom or CleverTap** journeys triggered by what customers actually do.',
  },
  auditName: 'CRM audit',
  tools: [
    { name: 'HubSpot', icon: 'hubspot' },
    { name: 'Salesforce', icon: 'salesforce' },
    { name: 'Braze', icon: 'braze' },
    { name: 'Customer.io', icon: 'customerio' },
    { name: 'Intercom', icon: 'intercom' },
    { name: 'CleverTap', icon: 'clevertap' },
  ],
  setup: {
    h2: '**HubSpot, Braze and marketing automation** services',
    lead: 'HubSpot consultants and lifecycle specialists who do the setup themselves. **Your CRM matches how you sell**, and every message is triggered by real customer data.',
    problems: [
      'New leads wait hours for an owner, **or never get one**.',
      'Half the CRM fields are **empty or out of date**.',
      'Every customer gets **the same email sequence**, whatever they did in your product.',
      'Marketing, sales and support each see **a different version of the customer**.',
    ],
    items: [
      {
        title: 'HubSpot CRM implementation',
        body: 'Objects, properties, pipelines and deal stages that match how you sell, with clean data migrated in from your old CRM or spreadsheets.',
        icon: 'Configure CRM Objects, Stages, Properties-  .svg',
      },
      {
        title: 'Salesforce integration',
        body: 'HubSpot and Salesforce synced both ways with clear rules for each field, or Salesforce connected to your product and warehouse.',
        icon: 'Integrate CRM Bidirectionally-  .svg',
      },
      {
        title: 'Lead scoring and routing',
        body: 'Scores built on web activity, form fills and product signals, with leads routed to the right rep and handed from marketing to sales automatically.',
        icon: 'Build Lead Scoring Models-  .svg',
      },
      {
        title: 'Braze and Customer.io journeys',
        body: 'Onboarding, cart recovery, trial conversion and win-back journeys across email, push, in-app and SMS, triggered by real events.',
        icon: 'Automated Dialogue Flows  .svg',
      },
      {
        title: 'Intercom setup',
        body: 'Intercom connected to your product data, with proactive messages, product tours, help articles and Fin.',
        icon: 'Integrate Intercom:Zendesk with Backends-  .svg',
      },
      {
        title: 'Sending setup',
        body: 'Authenticated sending domains, preference centers and unsubscribe handling, so messages reach the inbox and stay compliant.',
        icon: 'Expert Sending Config  .svg',
      },
    ],
  },
  steps: {
    h2: '**HubSpot and lifecycle setup**, step by step',
    items: [
      { title: 'Free CRM audit', body: 'We look at your CRM, your messaging tools and the journeys you run today.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Map', body: 'Sales process, lifecycle stages and the events each journey needs, agreed before we build.' },
      { title: 'Build', body: 'CRM setup, integrations and journeys built in your accounts, with your data flowing in.' },
      { title: 'Test', body: 'Every trigger, sync and message tested on real records before launch.' },
      { title: 'Hand over', body: 'Docs and a training session, so your team can edit journeys without us.' },
    ],
  },
  offer: { h2: '**CRM and lifecycle setup** at a fixed price' },
  faq: {
    h2: '**HubSpot and lifecycle** questions, answered',
    items: [
      {
        q: 'Can you migrate us into HubSpot?',
        a: '**Yes.** We map your objects, properties and pipelines from the old CRM or spreadsheets, clean and dedupe the data, move contacts, companies, deals and their history, and check the counts before you switch over.',
      },
      {
        q: 'How does the HubSpot and Salesforce sync work?',
        a: "**HubSpot's Salesforce integration syncs contacts, leads, companies and deals both ways.** The work is in the setup: which records sync, which system wins on each field, and how lead status and ownership move, so sales and marketing don't overwrite each other. We configure the field mappings and sync rules and test them on real records.",
      },
      {
        q: 'Braze or Customer.io?',
        a: '**Braze is built for large consumer apps**, with mobile push, in-app messages and real-time segments, and is priced for bigger teams. **Customer.io is quicker to start**, flexible with data, and fits SaaS and smaller teams well. We recommend one based on your channels, volume and budget, and we set up either.',
      },
      {
        q: 'Which lifecycle journeys do you set up?',
        a: '**Usually onboarding**, abandoned cart or checkout recovery, trial conversion, win-back for inactive users and renewal reminders. Each one is triggered by real product or purchase events.',
      },
      {
        q: 'Can you set up lead scoring and routing in HubSpot?',
        a: '**Yes.** We score leads on form fills, web activity and product signals, route them to the right owner by territory, segment or round robin, and alert reps with the context they need. The MQL to SQL handoff is written down and automated.',
      },
      {
        q: 'Do you set up Intercom?',
        a: '**Yes.** We connect Intercom to your product data, so each conversation shows who the customer is and what they use, and set up proactive messages, product tours, help articles and Fin.',
      },
      {
        q: 'Will our emails reach the inbox?',
        a: '**We set up the sending side properly:** authenticated domains with SPF, DKIM and DMARC, a dedicated sending subdomain where it helps, preference and unsubscribe handling, and IP warmup where you need it. That covers the technical side of inbox placement. Content and list quality do the rest.',
      },
      {
        q: 'What does the free CRM audit cover?',
        a: "**It's a 30-minute call** on your CRM, your messaging tools and your current journeys: where it hurts, the quick wins, and what to fix first, with a timeline and next steps. There's no obligation.",
      },
    ],
  },
  cta: { h2: '**Get a fixed-price quote** for your CRM and lifecycle setup' },
};

export default page;
