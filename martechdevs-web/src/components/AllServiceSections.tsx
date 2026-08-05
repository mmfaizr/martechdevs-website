'use client';

import { useState, useEffect, useRef, memo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import Image from 'next/image';
import ServiceSection from './ServiceSection';

const services = [
  {
    id: 'cdp-data',
    navTitle: 'Data Collection',
    toolLogos: [
      { icon: 'segment logo icon.svg', name: 'Segment' },
      { icon: 'server logo icon.svg', name: 'ssGTM' },
      { icon: 'fivetran logo icon.svg', name: 'FiveTran' },
      { icon: 'airbyte logo icon.svg', name: 'Airbyte' },
    ],
    title: 'Finally get a single, trustworthy view',
    titleGray: 'of your customer',
    description: 'No more data chaos. We build a single, reliable hub for all customer data: web, app, sales, support, payments. Creating accurate, unified profiles you can trust.',
    illustration: 'cdp',
    bgColor: 'bg-emerald-50',
    textColor: 'text-gray-900',
    accentColor: 'text-emerald-600',
    whatWeDo: [
      { iconFile: 'Deploy CDP (Segment:Rudderstack)-  .svg', title: 'Deploy CDP (Segment/Rudderstack):', description: 'Collect all customer data via SDKs, server libs/APIs, webhooks, and databases.' },
      { iconFile: 'Implement Server-Side GTM-  .svg', title: 'Implement Server-Side GTM:', description: 'For robust client tracking, data enrichment, and complete control over flows.' },
      { iconFile: 'Implement Identity Resolution Rules-  .svg', title: 'Implement Identity Resolution Rules:', description: 'To merge data from multiple sources into unified user profiles.' },
      { iconFile: 'Set Up Fivetran (or similar) Pipelines-  .svg', title: 'Set Up Fivetran (or similar) Pipelines:', description: 'Syncing data reliably to your warehouse or downstream tools.' },
      { iconFile: 'Enforce Data Schemas & Governance-  .svg', title: 'Enforce Data Schemas & Governance:', description: 'Across all ingestion points to ensure data quality and trust.' },
      { iconFile: 'Ensure Auditable Data Flows-  .svg', title: 'Ensure Auditable Data Flows:', description: 'For quality, compliance, and clear data lineage.' },
    ],
    whatYouGet: [
      { iconFile: 'Complete Customer History-   .svg', title: 'Complete Customer History:', description: 'Ad click, feature use, support, purchase, all in one profile.' },
      { iconFile: 'Powerful Audience Building-   .svg', title: 'Powerful Audience Building:', description: '"High LTV, unused Feature X" lists for all tools.' },
      { iconFile: 'Cross-Team Alignment-  .svg', title: 'Cross-Team Alignment:', description: 'Stop conflicting messages; ensure unified, informed action.' },
      { iconFile: 'Trusted Core Metrics-   .svg', title: 'Trusted Core Metrics:', description: 'LTV, churn, funnels based on complete, unified data.' },
      { iconFile: 'Strategic Decision Power-   .svg', title: 'Strategic Decision Power:', description: 'Holistic customer understanding drives product & marketing.' },
      { iconFile: 'Foundation for Personalization-   .svg', title: 'Foundation for Personalization:', description: 'Reliable data fuels truly individualized experiences.' },
    ],
  },
  {
    id: 'messaging',
    navTitle: 'Smart Messaging',
    toolLogos: [
      { icon: 'braze logo icon.svg', name: 'Braze' },
      { icon: 'customerio logo icon.svg', name: 'Customer.io' },
      { icon: 'clevertap logo icon.svg', name: 'CleverTap' },
      { icon: 'intercom logo icon.svg', name: 'Intercom' },
    ],
    title: 'Send Smarter Messages',
    titleGray: 'Customers Love, Automatically',
    description: 'We connect your systems to deliver hyper-personalized messages automatically, based on real customer behavior. This means timely, relevant communication that drives action, not annoyance.',
    illustration: 'messaging',
    bgColor: 'bg-purple-50',
    textColor: 'text-gray-900',
    accentColor: 'text-purple-600',
    whatWeDo: [
      { iconFile: 'Full Event Streaming.svg', title: 'Full Event Streaming:', description: 'SDKs, APIs/Webhooks. Key user interactions captured live.' },
      { iconFile: 'Dynamic Profile Unity  .svg', title: 'Dynamic Profile Unity:', description: 'Warehouse/CRM sync. Holistic, always-current customer views.' },
      { iconFile: 'Expert Sending Config  .svg', title: 'Expert Sending Config:', description: 'Domains, IPs, preferences. Top delivery, fully compliant.' },
      { iconFile: 'Automated Dialogue Flows  .svg', title: 'Automated Dialogue Flows:', description: 'User-led Email, Push, In-App, SMS sequences triggered.' },
      { iconFile: 'Tailored Content Delivery  .svg', title: 'Tailored Content Delivery:', description: 'APIs (product recs). Individually relevant, dynamic messaging.' },
      { iconFile: 'Validated System Launch  .svg', title: 'Validated System Launch:', description: 'Verified event paths & comms. Rigorously checked, ready.' },
    ],
    whatYouGet: [
      { iconFile: 'Smart Cart Recovery-  .svg', title: 'Smart Cart Recovery:', description: 'Auto-email/push exact cart items; timed incentives.' },
      { iconFile: 'Guided User Onboarding-  .svg', title: 'Guided User Onboarding:', description: 'Timely tips via in-app/email, based on actual progress.' },
      { iconFile: 'Re-engage Inactive Users-   .svg', title: 'Re-engage Inactive Users:', description: 'Personalized offers/content reflecting past behaviors.' },
      { iconFile: 'Subscription Savers-   .svg', title: 'Subscription Savers:', description: 'Auto-reminders & offers pre-expiry from backend data.' },
      { iconFile: 'Dynamic Content Emails-   .svg', title: 'Dynamic Content Emails:', description: 'Products/content featured via browsing history.' },
      { iconFile: 'Boosted Engagement-   .svg', title: 'Boosted Engagement:', description: 'Higher open, click-through, and conversion rates.' },
    ],
  },
  {
    id: 'analytics',
    navTitle: 'Growth Analytics',
    toolLogos: [
      { icon: 'mixpanel logo icon.svg', name: 'Mixpanel' },
      { icon: 'amplitude logo icon.svg', name: 'Amplitude' },
      { icon: 'appsflyer logo icon.svg', name: 'AppsFlyer' },
      { icon: 'adjust logo icon.svg', name: 'Adjust' },
    ],
    title: 'Understand What Really Drives',
    titleGray: 'Growth & Marketing ROI',
    description: 'Go beyond surface metrics to understand why users act, what drives value, and which marketing efforts truly pay off. We unify your data for full-funnel clarity and true ROI calculation.',
    illustration: 'analytics',
    bgColor: 'bg-blue-50',
    textColor: 'text-gray-900',
    accentColor: 'text-blue-600',
    whatWeDo: [
      { iconFile: 'Unified Analytics Platform-  .svg', title: 'Unified Analytics Platform:', description: 'Web, app (Mixpanel/Amplitude), backend events consolidated.' },
      { iconFile: 'Augment with Backend Data-  .svg', title: 'Augment with Backend Data:', description: 'Import purchases, subs via server SDKs, APIs, or syncs.' },
      { iconFile: 'Integrate Mobile Attribution-   .svg', title: 'Integrate Mobile Attribution:', description: 'Appsflyer/Adjust data enriching user profiles.' },
      { iconFile: ' Import Ad Cost Data-  .svg', title: 'Import Ad Cost Data:', description: 'API/connectors enable full ROI calculation in analytics.' },
      { iconFile: 'Configure Key Reports & Models-  .svg', title: 'Configure Key Reports & Models:', description: 'Funnels, retention, segmentation, multi-touch attribution.' },
      { iconFile: 'Validate Tracking End-to-End-  .svg', title: 'Validate Tracking End-to-End:', description: 'Ensure data accuracy from source to report.' },
    ],
    whatYouGet: [
      { iconFile: 'Identify User Drop-offs-   .svg', title: 'Identify User Drop-offs:', description: 'Pinpoint signup, onboarding, or purchase flow friction.' },
      { iconFile: 'Discover "Aha!" Moments-   .svg', title: 'Discover "Aha!" Moments:', description: 'Correlate actions with users becoming loyal customers.' },
      { iconFile: 'True Campaign ROI-  .svg', title: 'True Campaign ROI:', description: 'Connect ad spend (Google/FB) directly to LTV in analytics.' },
      { iconFile: 'Channel Value Analysis-   .svg', title: 'Channel Value Analysis:', description: 'Understand if users from channels behave differently/are more valuable.' },
      { iconFile: 'Data-Driven Product Roadmap-   .svg', title: 'Data-Driven Product Roadmap:', description: 'Guide feature development using adoption/flow insights.' },
      { iconFile: 'Optimize Marketing Spend-   .svg', title: 'Optimize Marketing Spend:', description: 'Focus budget on highest-performing channels & tactics.' },
    ],
  },
  {
    id: 'support',
    navTitle: 'Support & CX',
    toolLogos: [
      { icon: 'intercom logo icon.svg', name: 'Intercom' },
      { icon: 'zendesk logo icon.svg', name: 'Zendesk' },
    ],
    title: 'Streamline Support:',
    titleGray: 'Data-Driven CX & AI Automation',
    description: 'Empower your support team with instant access to complete customer context, enabling faster, personalized resolutions. We integrate your tools and leverage AI for peak efficiency.',
    illustration: 'support',
    bgColor: 'bg-cyan-50',
    textColor: 'text-gray-900',
    accentColor: 'text-cyan-600',
    whatWeDo: [
      { iconFile: 'Integrate Intercom:Zendesk with Backends-  .svg', title: 'Integrate Intercom/Zendesk with Backends:', description: 'Pipe history, orders, status, usage flags.' },
      { iconFile: 'Configure Agent Views for Rich Context-  .svg', title: 'Configure Agent Views for Rich Context:', description: 'For immediate, comprehensive understanding.' },
      { iconFile: 'Automate Ticket Routing, Prioritization & SLAs-  .svg', title: 'Automate Ticket Routing, Prioritization & SLAs:', description: 'Using this comprehensive user data.' },
      { iconFile: 'Implement AI Chatbots (Native:Fin)-  .svg', title: 'Implement AI Chatbots (Native/Fin):', description: 'Trained on KB, informed by API-passed context.' },
      { iconFile: 'Ensure Cross-Channel Interaction Logging-  .svg', title: 'Ensure Cross-Channel Interaction Logging:', description: 'Back to your central data store.' },
      { iconFile: 'Reduce Agent Handle Times & Effort-  .svg', title: 'Reduce Agent Handle Times & Effort:', description: 'Via enhanced context and automation.' },
    ],
    whatYouGet: [
      { iconFile: 'Frictionless Agent Experience-   .svg', title: 'Frictionless Agent Experience:', description: 'No more asking "Order number?"; info is readily available.' },
      { iconFile: 'Quicker Problem Solving-   .svg', title: 'Quicker Problem Solving:', description: 'Full context upfront leads to faster, accurate resolutions.' },
      { iconFile: 'Personalized Agent Responses-   .svg', title: 'Personalized Agent Responses:', description: 'Tailor help based on customer history, value, and status.' },
      { iconFile: '24:7 AI Support-   .svg', title: '24/7 AI Support:', description: 'Chatbots (Intercom\'s Fin) handle common queries instantly, anytime.' },
      { iconFile: 'Efficient Ticket Routing-   .svg', title: 'Efficient Ticket Routing:', description: 'Auto-send to specialists by issue or customer type (VIP).' },
      { iconFile: 'Increased Customer Satisfaction-   .svg', title: 'Increased Customer Satisfaction:', description: 'Faster, more relevant support builds loyalty.' },
    ],
  },
  {
    id: 'conversion',
    navTitle: 'Ad Tracking',
    toolLogos: [
      { icon: 'google ads logo icon.svg', name: 'Google Ads' },
      { icon: 'meta ads logo icon.svg', name: 'Meta Ads' },
      { icon: 'gtm logo icon.svg', name: 'GTM' },
    ],
    title: 'Reliable Conversion Tracking &',
    titleGray: 'Compliant, Data-Rich Audiences',
    description: 'Get accurate ad performance data despite privacy shifts, and use your rich customer insights for precise, compliant audience targeting. We build robust, server-side tracking for reliable results.',
    illustration: 'conversion',
    bgColor: 'bg-orange-50',
    textColor: 'text-gray-900',
    accentColor: 'text-orange-600',
    whatWeDo: [
      { iconFile: 'Implement Server-Side GTM-   .svg', title: 'Implement Server-Side GTM:', description: 'For durable tracking (confirmations, API-verified leads).' },
      { iconFile: 'Integrate Google Consent Mode v2-  .svg', title: 'Integrate Google Consent Mode v2:', description: 'With your CMP (e.g., Cookiebot) for privacy.' },
      { iconFile: 'Accurate Ad Conversion Tracking-  .svg', title: 'Accurate Ad Conversion Tracking:', description: 'In Google/Meta via server-APIs (CAPI, Offline).' },
      { iconFile: 'Securely Sync CRM:Warehouse Segments-  .svg', title: 'Securely Sync CRM/Warehouse Segments:', description: '(Hashed PII/IDs) to ad platforms.' },
      { iconFile: 'Target Campaigns Based on Warehouse Models-  .svg', title: 'Target Campaigns Based on Warehouse Models:', description: '(LTV, churn risk) for precision.' },
      { iconFile: 'Validate Data Flow End-to-End-  .svg', title: 'Validate Data Flow End-to-End:', description: 'For trustworthy, compliant optimization metrics.' },
    ],
    whatYouGet: [
      { iconFile: 'True Ad Performance Metrics-   .svg', title: 'True Ad Performance Metrics:', description: 'Accurate purchase/lead counts, overcoming browser limits.' },
      { iconFile: 'Smarter Ad Algorithms-   .svg', title: 'Smarter Ad Algorithms:', description: 'Better data for Google/Meta improves ad spend efficiency (ROAS).' },
      { iconFile: 'Custom Ad Audiences-   .svg', title: 'Custom Ad Audiences:', description: '"Bought X, not Y," "Likely to churn" lists synced securely.' },
      { iconFile: 'Compliant Tracking & Targeting-   .svg', title: 'Compliant Tracking & Targeting:', description: 'Works with consent tools, respects user choices.' },
      { iconFile: 'Relevant Retargeting Campaigns-   .svg', title: 'Relevant Retargeting Campaigns:', description: 'Existing customers see offers based on their history.' },
      { iconFile: 'Optimized Ad Budgets-   .svg', title: 'Optimized Ad Budgets:', description: 'Make confident spending decisions based on reliable data.' },
    ],
  },
  {
    id: 'warehouse',
    navTitle: 'Data Warehouse',
    toolLogos: [
      { icon: 'snowflake logo icon.svg', name: 'Snowflake' },
      { icon: 'bigquery logo icon.svg', name: 'BigQuery' },
      { icon: 'fivetran logo icon.svg', name: 'Fivetran' },
      { icon: 'airbyte logo icon.svg', name: 'Airbyte' },
    ],
    title: "Build Your Company's Single Source",
    titleGray: 'of Truth for All Data',
    description: 'Establish one trusted, central repository for all business data: marketing, sales, product, finance, support. We build and organize this hub for consistent, actionable intelligence.',
    illustration: 'warehouse',
    bgColor: 'bg-indigo-50',
    textColor: 'text-gray-900',
    accentColor: 'text-indigo-600',
    whatWeDo: [
      { iconFile: 'Construct Snowflake:BigQuery Warehouse-  .svg', title: 'Construct Snowflake/BigQuery Warehouse:', description: 'With analytics-optimized schemas serving as your Single Source of Truth.' },
      { iconFile: 'Automate Data Ingestion Pipelines-  .svg', title: 'Automate Data Ingestion Pipelines:', description: 'From CRMs, Ads, DBs, Logs, Payments, Support, ERPs.' },
      { iconFile: 'Use APIs, Connectors, Direct Loads-  .svg', title: 'Use APIs, Connectors, Direct Loads:', description: 'For comprehensive & varied data collection from all sources.' },
      { iconFile: 'Use dbt (or similar) to Model Data-  .svg', title: 'Use dbt (or similar) to Model Data:', description: 'Clean, unify raw data into actionable concepts.' },
      { iconFile: 'Optimize Warehouse for BI & Security-   .svg', title: 'Optimize Warehouse for BI & Security:', description: 'Implement access controls, performance tuning & cost management strategies.' },
      { iconFile: 'Centralize Modeled Data for Insights-  .svg', title: 'Centralize Modeled Data for Insights:', description: 'Making it accessible cross-departmentally for all teams.' },
    ],
    whatYouGet: [
      { iconFile: 'Unified Business View-   .svg', title: 'Unified Business View:', description: 'Marketing, Sales, Finance all use one reliable dataset.' },
      { iconFile: 'Answer Complex Questions-   .svg', title: 'Answer Complex Questions:', description: '"High LTV campaign with low support costs?" and more.' },
      { iconFile: 'Confident Key Metrics-   .svg', title: 'Confident Key Metrics:', description: 'True LTV, CAC by cohort, overall business ROI calculated.' },
      { iconFile: 'Understand Business Dynamics-   .svg', title: 'Understand Business Dynamics:', description: 'Product impact on sales; support interactions on churn.' },
      { iconFile: 'Scalable Data Foundation-   .svg', title: 'Scalable Data Foundation:', description: 'Supports better decisions & future AI/ML initiatives.' },
      { iconFile: 'Faster, Reliable Reporting-   .svg', title: 'Faster, Reliable Reporting:', description: 'Consistent answers across the organization.' },
    ],
  },
  {
    id: 'crm',
    navTitle: 'CRM Setup',
    toolLogos: [
      { icon: 'hubspot logo icon.svg', name: 'HubSpot' },
      { icon: 'salesforce logo icon.svg', name: 'Salesforce' },
    ],
    title: 'CRM Configured with',
    titleGray: 'Your Sales Workflow',
    description: 'We tailor your CRM to mirror and automate your sales process, enriching it with holistic customer data for smarter lead scoring, routing, and actionable pipeline insights.',
    illustration: 'crm',
    bgColor: 'bg-rose-50',
    textColor: 'text-gray-900',
    accentColor: 'text-rose-600',
    whatWeDo: [
      { iconFile: 'Configure CRM Objects, Stages, Properties-  .svg', title: 'Configure CRM Objects, Stages, Properties:', description: 'Reflecting your unique and specific sales process and workflow.' },
      { iconFile: 'Build Lead Scoring Models-  .svg', title: 'Build Lead Scoring Models:', description: 'Using web activity, forms, critical backend signals.' },
      { iconFile: 'Automate MQL:SQL Handoffs-   .svg', title: 'Automate MQL/SQL Handoffs:', description: 'Based on holistic, accurate lead scores and qualification criteria.' },
      { iconFile: ' Manage Data Migration:Cleansing-  .svg', title: 'Manage Data Migration/Cleansing:', description: 'Ensure clean, structured, reliable CRM data.' },
      { iconFile: 'Integrate CRM Bidirectionally-  .svg', title: 'Integrate CRM Bidirectionally:', description: 'With backends, ERPs, warehouse for unified views.' },
      { iconFile: 'Deploy Dashboards Tracking Pipeline-  .svg', title: 'Deploy Dashboards Tracking Pipeline:', description: 'Track velocity & conversions using complete and accurate data.' },
    ],
    whatYouGet: [
      { iconFile: 'Hot Lead Identification-  .svg', title: 'Hot Lead Identification:', description: 'Sales focuses on leads showing true buying intent.' },
      { iconFile: 'Holistic Lead Scoring-   .svg', title: 'Holistic Lead Scoring:', description: 'Beyond marketing clicks; includes product usage, support history.' },
      { iconFile: 'Instant Sales Alerts-   .svg', title: 'Instant Sales Alerts:', description: 'Right rep, right time, full context for MQL/SQL/PQL.' },
      { iconFile: 'More Relevant Sales Calls-   .svg', title: 'More Relevant Sales Calls:', description: 'Reps know lead history & context before dialing.' },
      { iconFile: 'Accurate Pipeline Health-   .svg', title: 'Accurate Pipeline Health:', description: 'Dashboards reflect true lead quality & sales velocity.' },
      { iconFile: 'Dashboards reflect true lead quality & sales velocity.  .svg', title: 'Clean, Enriched CRM:', description: 'Critical backend attributes enhance every contact record.' },
    ],
  },
  {
    id: 'activation',
    navTitle: 'Data Activation',
    toolLogos: [
      { icon: 'hightouch logo icon.svg', name: 'Hightouch' },
      { icon: 'census logo icon.svg', name: 'Census' },
      { icon: 'segment logo icon.svg', name: 'Segment' },
    ],
    title: 'Use Your Smartest Data Insights to',
    titleGray: 'Power Everyday Tools',
    description: "Don't let valuable warehouse insights stay siloed. We connect this intelligence to your everyday marketing, sales, and support tools, automating actions and personalizing experiences.",
    illustration: 'activation',
    bgColor: 'bg-teal-50',
    textColor: 'text-gray-900',
    accentColor: 'text-teal-600',
    whatWeDo: [
      { iconFile: 'Sync Warehouse Segments to Tools-  .svg', title: 'Sync Warehouse Segments to Tools:', description: '(e.g., "churn risk," "high LTV") to operational tools and platforms.' },
      { iconFile: 'Enrich Tool Profiles with Warehouse Data-  .svg', title: 'Enrich Tool Profiles with Warehouse Data:', description: '(LTV scores, product preferences, behavior patterns) for added depth.' },
      { iconFile: 'Trigger Automated Actions in Tools-  .svg', title: 'Trigger Automated Actions in Tools:', description: 'Based on signals from warehouse intelligence and analytics.' },
      { iconFile: 'Enhance Personalization Beyond Demographics-  .svg', title: 'Enhance Personalization Beyond Demographics:', description: 'Using deep behavioral data insights and customer intelligence.' },
      { iconFile: 'Ensure Data Consistency Across Platforms-  .svg', title: 'Ensure Data Consistency Across Platforms:', description: 'Via reliable warehouse synchronization and automated updates.' },
      { iconFile: 'Secure & Compliant Data Activation-  .svg', title: 'Secure & Compliant Data Activation:', description: 'Controlled and secure use of warehouse intelligence and insights.' },
    ],
    whatYouGet: [
      { iconFile: 'Subscription Savers-   .svg', title: 'Proactive Churn Prevention:', description: 'Auto-trigger offers in marketing tools for "at-risk" users.' },
      { iconFile: 'Hot Lead Identification-  .svg', title: 'Smarter Lead Nurturing:', description: 'Send "Product Qualified Leads" from warehouse to CRM.' },
      { iconFile: 'Target Campaigns Based on Warehouse Models-  .svg', title: 'Hyper-Personalized Campaigns:', description: 'Marketing messages informed by LTV, product affinity.' },
      { iconFile: 'Complete Customer History-   .svg', title: 'Contextual Support Flags:', description: 'High-value/at-risk customer alerts in support tools.' },
      { iconFile: 'Cross-Team Alignment-  .svg', title: 'Unified Customer Intelligence:', description: 'Marketing, sales, support act on same core insights.' },
      { iconFile: 'Faster, Reliable Reporting-   .svg', title: 'Faster, More Relevant Operations:', description: 'Everyday tools empowered by deep data.' },
    ],
  },
];

export default function AllServiceSections() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [showNav, setShowNav] = useState(false);

  // Equalise every card to the tallest one. A sticky card unpins when its
  // bottom reaches the container's end, so cards of different heights unpin at
  // slightly different scroll positions - and at the end of the stack the
  // taller cards' rounded tops poked out above the top card in staggered
  // strips, all sliding at once. That seam was the shake/flicker on the last
  // card. With equal heights every card unpins at the same instant and the
  // stack leaves as one clean edge.
  //
  // Done with direct DOM styles rather than state: nothing else needs to
  // re-render, and the per-card ResizeObservers already pick up the height
  // change and re-derive their scroll ranges.
  useEffect(() => {
    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>('#services div.sticky section'));
    let applied = 0;

    // Clear, read, reapply - all in one synchronous task, so the browser never
    // paints a frame with the natural (unequal) heights. Deferring the reapply
    // to a rAF left a one-frame window where the whole stack's geometry
    // reverted mid-scroll.
    const measure = () => {
      const els = sections();
      if (!els.length) return;
      els.forEach((s) => { s.style.minHeight = ''; });
      applied = Math.max(...els.map((s) => s.offsetHeight));
      els.forEach((s) => { s.style.minHeight = `${applied}px`; });
    };

    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);

    // Re-run if content later outgrows the applied height (tab switch, late
    // imagery). Guarded so applying the max itself doesn't loop.
    const ro = new ResizeObserver((entries) => {
      if (entries.some((e) => e.target instanceof HTMLElement && e.target.offsetHeight > applied)) {
        measure();
      }
    });
    sections().forEach((s) => ro.observe(s));

    return () => {
      window.removeEventListener('load', measure);
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, []);

  // Let go of cards that are buried under a later one.
  //
  // Equal heights (above) mean every card reaches its sticky limit on the exact
  // same frame at the bottom of the container, so Chrome un-sticks and repaints
  // all eight viewport-sized layers at once. Measured, that single frame costs
  // 40-124ms against an 8ms baseline, in both scroll directions - the stutter on
  // the last card. Dropping the covered cards to position:static leaves only the
  // top one still sticky when the stack releases, which measures clean.
  //
  // Static and sticky occupy the same space in normal flow, so nothing moves and
  // the page height is unchanged; the card just stops being a compositor layer
  // while it is invisible anyway. The swap happens well after the card above has
  // fully covered it, with a dead band so it cannot chatter at the boundary, and
  // it only ever runs on a card that actually crossed.
  useEffect(() => {
    // The card above covers the viewport the moment it pins, so these are pure
    // safety margin against measurement error. Keep them well under the run-out
    // below, or the last card would still be waiting to shed its neighbour when
    // the stack releases - which is the frame this whole effect exists to keep
    // cheap.
    const DETACH = 80; // px past the next card pinning before we drop this one
    const ATTACH = 40; // ...and back to sticky this far past it, coming up

    let cards: HTMLElement[] = [];
    let coveredAt: number[] = [];
    let detached: boolean[] = [];

    const measure = () => {
      cards = Array.from(document.querySelectorAll<HTMLElement>('#services > div.sticky'));
      cards.forEach((c) => { c.style.position = ''; });
      detached = cards.map(() => false);

      // Document position of each card's zero-height marker, which is the scroll
      // offset at which that card pins. Same walk the cards use themselves - the
      // card's own rect is useless once it is stuck.
      const pins = cards.map((c) => {
        let top = 0;
        let el: HTMLElement | null =
          document.querySelector<HTMLElement>(`[data-pin-marker="${c.id}"]`);
        while (el) { top += el.offsetTop; el = el.offsetParent as HTMLElement | null; }
        return top;
      });

      // Only hand a card off to one that will actually cover the whole viewport,
      // so a short card can never leave a strip of a detached one showing.
      coveredAt = cards.map((_, i) => {
        const next = cards[i + 1];
        if (!next || next.getBoundingClientRect().height < window.innerHeight) return Infinity;
        return pins[i + 1];
      });
    };

    const apply = () => {
      const y = window.scrollY;
      for (let i = 0; i < cards.length; i++) {
        const want = y > coveredAt[i] + (detached[i] ? ATTACH : DETACH);
        if (want !== detached[i]) {
          detached[i] = want;
          cards[i].style.position = want ? 'static' : '';
        }
      }
    };

    const remeasure = () => { measure(); apply(); };
    remeasure();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => { apply(); ticking = false; });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);

    // The equaliser rewrites every card's height, which moves every pin offset.
    // Watching the container picks that up whichever way it was triggered.
    const container = document.getElementById('services');
    const ro = new ResizeObserver(remeasure);
    if (container) ro.observe(container);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('load', remeasure);
      ro.disconnect();
      cards.forEach((c) => { c.style.position = ''; });
    };
  }, []);

  // Use scroll listener for more precise "sticky" state detection
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('services');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const headerHeight = 84; // Approximately the height of the fixed header

      // Hysteresis, not a single threshold. The show/hide line sits exactly at
      // the top of the first card and the bottom of the last one, so a bare
      // comparison lets the smallest scroll jitter flip it - and each flip
      // remounts the nav through a 0.3s AnimatePresence transition. The dead
      // band means it can only change once you have clearly crossed.
      const BAND = 90;
      setShowNav((wasShowing) =>
        wasShowing
          ? rect.top <= headerHeight + BAND && rect.bottom > headerHeight
          : rect.top <= headerHeight && rect.bottom > headerHeight + BAND
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Spy for active section
  useEffect(() => {
    const handleScroll = () => {
      // Offset for the sticky header + nav height + some buffer
      const triggerPoint = 200; 
      
      // Find the current section
      // We want the section that is currently crossing the trigger point
      // Or the last section that has passed the trigger point but hasn't finished
      
      let currentId = '';

      // The cards are a sticky stack, so every pinned card sits at top: 0 and
      // matches this test at once. Keep going rather than breaking on the first
      // hit: later cards are painted over earlier ones, so the last match in
      // DOM order is the one actually on screen.
      for (const service of services) {
        const element = document.getElementById(service.id);
        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            currentId = service.id;
          }
        }
      }
      
      if (currentId) {
        setActiveSection(currentId);
      } else {
        // Fallback: if we are above the first section, clear active
        // If we are way below, maybe keep last? 
        // The logic above handles "inside" the section.
        
        // Optional: Check if we are above the first section
        const firstEl = document.getElementById(services[0].id);
        if (firstEl && firstEl.getBoundingClientRect().top > triggerPoint) {
           setActiveSection('');
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // Never measure the card itself: it is position:sticky, so once pinned its
    // rect reads top 0 wherever the page actually is - measuring it made every
    // backward click scroll a fixed 150px and stop. The zero-height marker
    // before each card stays in normal flow, so its document position IS the
    // scroll offset at which that card sits pinned and full-bleed. No header
    // offset either: the stack pins at the very top of the viewport with the
    // card's tint running behind the floating bars, so any offset just leaves
    // a strip of the previous card showing under the header.
    const marker = document.querySelector<HTMLElement>(`[data-pin-marker="${id}"]`);
    if (!marker) return;
    const top = marker.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveSection(id);
  };

  return (
    <div className="relative min-h-screen" id="services">

      {/* Section navigation - overlays the stack, merged with the main header.
          Fixed rather than sticky on purpose: a sticky element still occupies
          its place in normal flow, so mounting this one added ~51px to the top
          of the stack and shoved every card down as it appeared - that was the
          shake, and its white panel was landing in that reserved strip above
          the first card. Fixed takes no layout space, so nothing moves. */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[84px] inset-x-0 z-30 w-full pointer-events-none flex justify-center"
          >
            <div className="pointer-events-auto w-[95%] md:w-[90%] max-w-[1150px] relative">
              <div className="bg-white/95 backdrop-blur-md border-x border-b border-gray-200 shadow-sm rounded-b-2xl px-2 py-1.5 md:px-4 md:py-2.5 mx-auto w-full origin-top">
                <div className="flex flex-wrap justify-center gap-0.5 md:gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => scrollToSection(service.id)}
                      className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all duration-200 border ${
                        activeSection === service.id
                          ? 'bg-white text-gray-900 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-white text-gray-600 border-transparent hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {/* Logo Icon */}
                      <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 relative flex-shrink-0`}>
                         <Image
                          src={`/assets/tool logos icons/${service.toolLogos[0].icon}`}
                          alt=""
                          fill
                          className={`object-contain transition-all duration-200 ${
                            activeSection === service.id ? 'grayscale-0 opacity-100' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                          }`}
                        />
                      </div>
                      <span className="truncate max-w-[70px] md:max-w-none">{service.navTitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {services.map((service, index) => (
        <StackedService
          key={service.id}
          service={service}
          index={index}
          isLast={index === services.length - 1}
        />
      ))}

      {/* Run-out for the last card.
          A sticky element can only travel as far as its containing block
          allows, and the last card's flow position already sits at the bottom
          of this container - so it had virtually no travel and scrolled
          straight past instead of pinning like the rest. This tail gives it a
          pinned stretch of its own; it is consumed by the card holding
          position, so it never shows as empty space.

          This length is exactly how long the last card sits frozen, and it is
          the only card with a hold at all - every other one has the next card
          climbing over it the whole time, so nothing is ever still. At 70vh
          that was 630px of screen where scrolling did nothing, and because you
          also cross it on the way back it made returning to the previous card
          cost 1.67x a normal card-to-card move. 20vh keeps a visible beat on
          the final card and brings that down to 1.16x. Shorten it further for
          less hold, but not to zero or the card stops pinning. */}
      <div aria-hidden className="h-[20vh]" />
    </div>
  );
}

/**
 * The stack pins flush with the top of the viewport so each card's tint runs
 * full-bleed behind the floating header (20-86) and the services nav (84-135) -
 * both of which stay above it on z-index. Pinning lower left a hard horizontal
 * seam across the page instead.
 */
const STACK_TOP = 0;

/** Clearance so pinned content clears those two floating bars. */
const CONTENT_INSET = 152;

/**
 * One card in the scroll stack.
 *
 * The cards are siblings inside a tall container and each is `sticky`, so a
 * card pins in place and the next one scrolls up over it - z-index ascends, so
 * later cards cover earlier ones. Nothing fades, which is what removes the
 * white flash: the outgoing card stays put until it is physically covered,
 * instead of the incoming one fading up from opacity 0 over the page.
 *
 * The recede range is measured rather than expressed with useScroll's `offset`
 * shorthand: the sticky element's own rect freezes once it pins, and the
 * shorthand collapsed to a constant here, leaving every card stuck at its fully
 * receded scale. The zero-height marker stays in normal flow, so its document
 * position gives an honest "scroll position at which this card pins", and the
 * card's own height is exactly how far the next one has to travel to cover it.
 */
const StackedService = memo(function StackedService({
  service,
  index,
  isLast,
}: {
  service: (typeof services)[number];
  index: number;
  isLast: boolean;
}) {
  const marker = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [recede, setRecede] = useState<[number, number]>([0, 1]);
  const [enter, setEnter] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const measure = () => {
      if (!marker.current || !card.current) return;
      let top = 0;
      let el: HTMLElement | null = marker.current;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      const pinsAt = top - STACK_TOP;                              // scrollY when this card pins
      const covered = card.current.getBoundingClientRect().height; // next card's run-up
      setEnter([pinsAt - window.innerHeight * 0.85, pinsAt]);
      setRecede([pinsAt, pinsAt + covered]);
    };
    measure();

    // Cards grow after mount as their imagery lands. Measuring only once left
    // the range ~160px short, so the recede finished while the card was still
    // a third visible - which is what looked like the overlay snapping on.
    const ro = new ResizeObserver(measure);
    if (card.current) ro.observe(card.current);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  const { scrollY } = useScroll();

  // Climbing in: starts well inset and grows to full bleed as it reaches the
  // top. This only works because the card behind is itself full bleed - the
  // inset edges reveal the previous card, not the page. The first card has
  // nothing but white behind it, so it arrives at full size.
  const scale = useTransform(scrollY, enter, [0.86, 1]);
  // Rounded while it is climbing - that is what makes it read as a card sliding
  // over the one below - then square by the time it lands. Stopping short of 0
  // left an 18px notch at each top corner of every pinned card, and since they
  // all pin in the same place the notches lined up into one hole punched
  // through the whole stack, showing whatever was furthest back. Landing at 0
  // means the top card covers the viewport edge to edge with nothing behind it
  // showing through.
  const radius = useTransform(scrollY, enter, [56, 0]);

  // The shadow rides the scaled element so it hugs the card's actual edges,
  // and fades out as the card reaches full bleed, where there is no longer an
  // edge to describe. It lives on its own layer with a FIXED box-shadow and an
  // animated opacity: animating the shadow colour itself re-rasterised the
  // whole wrapper every frame of the entry, while opacity composites for free.
  const shadowOpacity = useTransform(scrollY, enter, [1, 0]);

  // Receding: dims back as the next card climbs over. No scale here - shrinking
  // the pinned card pulls its edges in and exposes white down both sides.
  //
  // This is a plain overlay whose opacity animates, not filter: brightness().
  // Deep in the stack seven cards recede at once, and seven full-width filter
  // layers re-rasterising every frame is what made the tail flicker. Opacity on
  // a solid layer composites without a repaint.
  // Held off until the next card is genuinely overlapping, then eased in. If it
  // starts the moment this card pins, the card you are actually reading greys
  // out under you and the next one arrives clean, which reads as a jump.
  const dim = useTransform(
    scrollY,
    [recede[0] + (recede[1] - recede[0]) * 0.45, recede[1]],
    [0, 0.07]
  );

  // No visibility toggling here. Hiding covered cards saved nothing measurable
  // and, because it keyed off a height measured before the imagery settled, it
  // dropped the outgoing card while the incoming one was still ~120px short of
  // the top - the card simply vanished behind the subheader.

  const isFirst = index === 0;

  return (
    <>
      <div ref={marker} aria-hidden data-pin-marker={service.id} className="h-0" />
      <div
        id={service.id}
        ref={card}
        className="sticky"
        style={{ top: STACK_TOP, zIndex: index + 1 }}
      >
        <motion.div
          style={{
            position: 'relative',
            // No overflow:hidden and no will-change here. Either one turns each
            // card into a full-viewport compositor layer with a rounded mask,
            // and eight of those stacked tore the cards apart mid-scroll. The
            // radius lives on the section's own background instead, which
            // clips for free.
            // The last card remains an ordinary painted surface. It is fully
            // exposed while the next section enters, so transforming it forces
            // Chrome to composite a viewport-sized layer at the exact stack
            // exit. Earlier cards can keep the scale treatment because the next
            // opaque card covers their transition.
            ...(isFirst || isLast ? {} : { scale, transformOrigin: 'center top' }),
          }}
        >
          {/* Fixed shadow, animated opacity - zIndex -1 keeps it painted under
              the section while still above the cards behind this one. Its own
              radius matches the card's so the halo follows the rounded corners. */}
          {!isFirst && !isLast && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: -1,
                opacity: shadowOpacity,
                boxShadow: '0 -6px 48px -12px rgba(43,59,49,0.2)',
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
              }}
            />
          )}
          <ServiceSection
            {...service}
            topInset={CONTENT_INSET}
            style={
              // Both ends of the stack are square: the first card has nothing
              // behind it to slide over, and the last one is deliberately left
              // as a plain painted surface (see above), so it gets the landed
              // value directly rather than an animated one.
              isFirst || isLast
                ? undefined
                : { borderTopLeftRadius: radius, borderTopRightRadius: radius }
            }
          />
          {!isLast && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[#2B3B31]"
              style={{
                opacity: dim,
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
              }}
            />
          )}
        </motion.div>
      </div>
    </>
  );
});
