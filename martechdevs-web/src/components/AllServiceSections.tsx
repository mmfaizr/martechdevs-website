'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ServiceSection from './ServiceSection';

const services = [
  {
    id: 'cdp-data',
    navTitle: 'Single View',
    toolLogos: [
      { icon: 'segment logo icon.svg', name: 'Segment' },
      { icon: 'server logo icon.svg', name: 'ssGTM' },
      { icon: 'fivetran logo icon.svg', name: 'FiveTran' },
      { icon: 'airbyte logo icon.svg', name: 'Airbyte' },
    ],
    title: 'Finally get a single, trustworthy view',
    titleGray: 'of your customer',
    description: 'No more data chaos. We build a single, reliable hub for all customer data—web, app, sales, support, payments—creating accurate, unified profiles you can trust.',
    illustration: '/assets/Finally Get a Single, Trustworthy View of Your Customer.svg',
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
      { iconFile: 'Complete Customer History-   .svg', title: 'Complete Customer History:', description: 'Ad click, feature use, support, purchase—one profile.' },
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
    illustration: '/assets/Send Smarter Messages Customers Love, Automatically.svg',
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
    illustration: '/assets/Understand What Really Drives Growth & Marketing ROI.svg',
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
    illustration: '/assets/Streamline Support_ Data-Driven CX & AI Automation.svg',
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
    illustration: '/assets/Reliable Conversion Tracking & Compliant, Data-Rich Audiences.svg',
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
    description: 'Establish one trusted, central repository for all business data—marketing, sales, product, finance, support. We build and organize this hub for consistent, actionable intelligence.',
    illustration: '/assets/Build Your Company\'s Single Source of Truth for All Data.svg',
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
    illustration: '/assets/CRM Configured with Your Sales Workflow.svg',
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
    illustration: '/assets/Use Your Smartest Data Insights to Power Everyday Tools.svg',
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
      { iconFile: 'integrate icon.svg', title: 'Proactive Churn Prevention:', description: 'Auto-trigger offers in marketing tools for "at-risk" users.' },
      { iconFile: 'integrate icon.svg', title: 'Smarter Lead Nurturing:', description: 'Send "Product Qualified Leads" from warehouse to CRM.' },
      { iconFile: 'integrate icon.svg', title: 'Hyper-Personalized Campaigns:', description: 'Marketing messages informed by LTV, product affinity.' },
      { iconFile: 'integrate icon.svg', title: 'Contextual Support Flags:', description: 'High-value/at-risk customer alerts in support tools.' },
      { iconFile: 'integrate icon.svg', title: 'Unified Customer Intelligence:', description: 'Marketing, sales, support act on same core insights.' },
      { iconFile: 'integrate icon.svg', title: 'Faster, More Relevant Operations:', description: 'Everyday tools empowered by deep data.' },
    ],
  },
];

export default function AllServiceSections() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [showNav, setShowNav] = useState(false);

  // Use scroll listener for more precise "sticky" state detection
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('services-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const headerHeight = 84; // Approximately the height of the fixed header

      // Show if the top of the services container has reached (or passed) the header
      // AND the bottom of the container is still below the header (haven't scrolled past)
      const isSticky = rect.top <= headerHeight && rect.bottom > headerHeight;
      
      setShowNav(isSticky);
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
      
      // Iterate through services to find the active one
      for (const service of services) {
        const element = document.getElementById(service.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          // Check if the section is active (top is above trigger, bottom is below trigger)
          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            currentId = service.id;
            break; // Found the active section, stop looking
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
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed headers (84px main header + ~60px sub header + padding)
      const offset = 150; 
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="relative min-h-screen" id="services-container">
      
      {/* Sticky Navigation - Merged seamlessly with main header */}
      <AnimatePresence>
        {showNav && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="sticky top-[84px] z-30 w-full pointer-events-none flex justify-center"
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
        <motion.div
          id={service.id}
          key={index}
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ zIndex: services.length - index }}
          className="relative"
        >
          <ServiceSection {...service} />
        </motion.div>
      ))}
    </div>
  );
}
