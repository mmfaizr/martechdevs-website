import type { ServicePageContent } from './types';

/**
 * Go-to-market work, spelled out so nobody reads GTM as Google Tag Manager.
 *
 * Flito is named only as our own CRM, and the copy covers building the
 * outbound systems without saying who sends the campaigns. Neither is
 * described further without sign-off.
 */
const page: ServicePageContent = {
  slug: 'gtm-engineering',
  area: 'GTM engineering & outbound',
  source: 'lp_gtm_engineering',
  meta: {
    title: 'GTM Engineering Agency for Clay and Outbound | martechdevs',
    description:
      'Go-to-market (GTM) engineering: Clay, Apollo and ZoomInfo enrichment, personalized ABM, cold email infrastructure with warmup, and custom CRM workflows.',
  },
  hero: {
    eyebrow: 'GTM engineering & outbound',
    h1: 'Go-to-market (GTM) engineering for personalized outbound at scale',
    intro:
      'Lead lists from one database, the same template sent to everyone, and a main domain flagged after one big send. Outbound breaks when the data and infrastructure behind it are weak. We build the go-to-market engine: Clay, Apollo and ZoomInfo enrichment, research-based personalization, cold email infrastructure with warmup, and CRM workflows that capture every reply.',
    aside: { text: 'Here GTM means go-to-market. For Google Tag Manager,', link: 'see analytics and tracking', href: '/analytics-tracking' },
  },
  auditName: 'audit',
  tools: [
    { name: 'Clay' },
    { name: 'Apollo' },
    { name: 'ZoomInfo' },
    { name: 'HubSpot', icon: 'hubspot' },
    { name: 'Salesforce', icon: 'salesforce' },
    { name: 'Flito' },
  ],
  setup: {
    h2: 'GTM engineering services for outbound and ABM',
    lead: 'GTM engineers on demand. We build the lead data, personalization, sending infrastructure and CRM workflows behind your outbound.',
    problems: [
      'Lead lists come from one database, and too many emails bounce.',
      'Every prospect gets the same template with their first name swapped in.',
      'One big send got your main domain flagged as spam.',
      'Replies and meetings live in inboxes instead of the CRM.',
    ],
    items: [
      {
        title: 'Clay tables and lead enrichment',
        body: 'Account and contact lists built in Clay and enriched from several providers in turn, so you find more verified emails and leave fewer gaps.',
        icon: 'Enrich Tool Profiles with Warehouse Data-  .svg',
      },
      {
        title: 'Apollo and ZoomInfo setup',
        body: 'Your data provider connected to Clay and your CRM, with filters that match your ideal customer profile.',
        icon: 'Use APIs, Connectors, Direct Loads-  .svg',
      },
      {
        title: 'Deep lead personalization',
        body: 'Research on each account, such as hiring, funding, tech stack and news, turned into a first line and an offer that fit.',
        icon: 'Enhance Personalization Beyond Demographics-  .svg',
      },
      {
        title: 'Personalized ABM',
        body: 'Named account lists with the buying committee mapped at each one, ready for email, LinkedIn and ad audiences.',
        icon: 'Hot Lead Identification-  .svg',
      },
      {
        title: 'Cold email infrastructure',
        body: 'Separate sending domains and mailboxes, SPF, DKIM and DMARC, warmup, and daily limits that protect your main domain and sender reputation.',
        icon: 'Expert Sending Config  .svg',
      },
      {
        title: 'Custom CRM workflows',
        body: 'Replies, meetings and enrichment synced to HubSpot or Salesforce, or custom workflows built on Flito, our own CRM.',
        icon: 'Integrate CRM Bidirectionally-  .svg',
      },
    ],
  },
  steps: {
    h2: 'How a GTM engineering project runs',
    items: [
      { title: 'Free audit', body: 'We look at your ideal customer profile, data sources, sending setup and CRM.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Build the data', body: 'ICP filters, Clay tables, enrichment and personalization, tested on real accounts.' },
      { title: 'Build the infrastructure', body: 'Domains, mailboxes, authentication and warmup, ready before the first send.' },
      { title: 'Connect the CRM', body: 'Every reply, meeting and data point flowing into HubSpot, Salesforce or Flito.' },
      { title: 'Hand over', body: 'Docs and training for your team, plus ongoing support if you want it.' },
    ],
  },
  offer: { h2: 'GTM engineering at a fixed price' },
  faq: {
    h2: 'GTM engineering FAQs',
    items: [
      {
        q: 'What is go-to-market (GTM) engineering?',
        a: "It's the technical side of sales and marketing: the data, tools and automation behind outbound and pipeline. A GTM engineer builds the lead lists, enrichment, personalization, sending infrastructure and CRM workflows that let a small team run outbound like a large one. On this page GTM stands for go-to-market. Google Tag Manager work is on our analytics and tracking page.",
      },
      {
        q: 'What can you build in Clay?',
        a: 'Clay tables that find and qualify accounts, find the right contacts and enrich them from several data providers in turn (waterfall enrichment), plus AI columns that research each account and draft a first line. The results go straight to your sequencer and CRM.',
      },
      {
        q: 'Apollo or ZoomInfo?',
        a: 'ZoomInfo has deeper company data and intent signals and is priced for larger sales teams. Apollo pairs a contact database with sequencing at a lower price and suits smaller teams. Many teams use either one as a source inside Clay, next to other providers. We set up whichever you use and connect it to your CRM.',
      },
      {
        q: 'How do you send cold email at volume without hurting deliverability?',
        a: 'By keeping cold email off your main domain. We set up separate sending domains and mailboxes, authenticate them with SPF, DKIM and DMARC, warm them up, cap daily sends per mailbox and spread volume across them. Lists are verified first, so bounce rates stay low.',
      },
      {
        q: 'How long does domain warmup take, and how do you manage sender reputation?',
        a: 'New mailboxes usually need two to four weeks of warmup before they send campaigns. After that we watch bounce rates, spam complaints, blacklists and inbox placement, and rest or replace mailboxes that slip.',
      },
      {
        q: 'Do you connect it to our CRM?',
        a: 'Yes. Replies, meetings and enriched data flow back into HubSpot or Salesforce, so each account has its full history in one place. For custom workflows we also build on Flito, our own CRM.',
      },
      {
        q: 'What does personalized ABM look like?',
        a: 'Account-based marketing starts from a named list of target accounts. We build the list from your ideal customer profile, map the buying committee at each account, and personalize outreach with what that account is doing, like hiring, funding or a new tool. The same list can feed LinkedIn and ad audiences.',
      },
      {
        q: 'Can we hire a GTM engineer on demand?',
        a: 'Yes. Start with a fixed-price project, then keep us on for ongoing support as you add new segments, sources and workflows.',
      },
      {
        q: 'What does the free audit cover?',
        a: "It's a 30-minute call on your ideal customer profile, data sources, sending setup and CRM: where it hurts, the quick wins, and what to build first, with a timeline and next steps. There's no obligation.",
      },
    ],
  },
  cta: { h2: 'Get a fixed-price quote for your outbound engine' },
};

export default page;
