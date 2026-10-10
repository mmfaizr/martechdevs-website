import type { ServicePageContent } from './types';

const page: ServicePageContent = {
  slug: 'data-warehouse-cdp',
  area: 'CDP & data warehouse',
  source: 'lp_data_warehouse_cdp',
  meta: {
    title: 'Snowflake, BigQuery & Segment CDP Implementation | martechdevs',
    description:
      'Snowflake and Google BigQuery setup, Segment CDP implementation, Fivetran and Airbyte pipelines, dbt models and reverse ETL to HubSpot and Braze. Fixed price.',
  },
  hero: {
    h1: '**Data warehouse and CDP implementation** for one trusted customer view',
    solution:
      'We set up **Snowflake or Google BigQuery**, Segment or RudderStack, Fivetran or Airbyte pipelines, dbt models and reverse ETL with Hightouch, so **one trusted customer view feeds every tool**.',
  },
  auditName: 'stack audit',
  tools: [
    { name: 'Snowflake', icon: 'snowflake' },
    { name: 'BigQuery', icon: 'bigquery' },
    { name: 'Segment', icon: 'segment' },
    { name: 'RudderStack', icon: 'rudderstuck' },
    { name: 'Fivetran', icon: 'fivetran' },
    { name: 'Airbyte', icon: 'airbyte' },
    { name: 'dbt', icon: 'dbt' },
    { name: 'Hightouch', icon: 'hightouch' },
    { name: 'Census', icon: 'census' },
  ],
  heroBadges: [
    { name: 'Snowflake', icon: 'snowflake' },
    { name: 'Fivetran', icon: 'fivetran' },
    { name: 'Segment', icon: 'segment' },
    { name: 'BigQuery', icon: 'bigquery' },
    { name: 'Hightouch', icon: 'hightouch' },
    { name: 'Airbyte', icon: 'airbyte' },
  ],
  setup: {
    h2: '**Snowflake, BigQuery and Segment** implementation',
    lead: 'Data warehouse consulting from the people who build it. **We design the warehouse, collect the data, model it** and send it back out to your tools.',
    problems: [
      { title: 'Three teams, three revenue numbers.', detail: 'Every metric is rebuilt in a different spreadsheet.' },
      { title: 'Your CDP bill grows faster than its value.', detail: 'Events flow everywhere, and nobody trusts them.' },
      { title: "The warehouse knows what your tools can't see.", detail: 'LTV and churn risk never reach HubSpot or Braze.' },
      { title: 'Pipelines fail quietly and nobody owns them.', detail: 'You find out from a wrong dashboard, days later.' },
    ],
    fix:
      'We build the warehouse as **the single source of truth**: modeled with dbt, fed by pipelines you can trust and **synced back into every tool** with reverse ETL, so every team works from the same customer.',
    items: [
      {
        title: 'Snowflake or BigQuery setup',
        body: 'A marketing data warehouse with access controls, cost limits and a clear path from raw data to modeled tables.',
        icon: 'Construct Snowflake:BigQuery Warehouse-  .svg',
      },
      {
        title: 'Segment or RudderStack CDP',
        body: 'Events from web, app and server collected in one format, with identity rules that merge each person into one profile.',
        icon: 'Deploy CDP (Segment:Rudderstack)-  .svg',
      },
      {
        title: 'Fivetran and Airbyte pipelines',
        body: 'Your CRM, ad platforms, billing, database and support tools loaded on a schedule, with alerts when a sync fails.',
        icon: 'Set Up Fivetran (or similar) Pipelines-  .svg',
      },
      {
        title: 'Data modeling with dbt',
        body: 'Raw data cleaned and joined into tables people can use: customers, accounts, subscriptions, campaigns and revenue.',
        icon: 'Use dbt (or similar) to Model Data-  .svg',
      },
      {
        title: 'Reverse ETL',
        body: 'Hightouch or Census syncs that send audiences and traits like lifetime value or churn risk to HubSpot, Salesforce, Braze and your ad platforms.',
        icon: 'Sync Warehouse Segments to Tools-  .svg',
      },
      {
        title: 'Data quality and governance',
        body: 'A tracking plan, schema checks and tests for freshness and duplicates, so the warehouse stays trusted.',
        icon: 'Enforce Data Schemas & Governance-  .svg',
      },
    ],
  },
  steps: {
    h2: '**Data warehouse implementation**, step by step',
    items: [
      { title: 'Free stack audit', body: 'We map your sources, your tools and the questions the data has to answer.' },
      { title: 'Fixed quote', body: 'Price, scope and timeline by email, usually within one business day.' },
      { title: 'Design', body: 'Warehouse layout, tracking plan and identity rules agreed before we build.' },
      { title: 'Build', body: 'Warehouse, CDP, pipelines and models set up in your own accounts.' },
      { title: 'Activate and test', body: 'Reverse ETL syncs switched on, with every number checked against its source.' },
      { title: 'Hand over', body: 'Docs and a training session for your team, plus ongoing support if you want it.' },
    ],
  },
  offer: { h2: '**Data warehouse consulting** at a fixed price' },
  faq: {
    h2: '**Data warehouse and CDP** questions, answered',
    items: [
      {
        q: 'Snowflake or BigQuery?',
        a: "**Both work well for marketing data.** BigQuery is a natural fit if you're on Google Cloud or rely on GA4, which exports straight into it. Snowflake suits teams on AWS or Azure, or anyone who wants to stay cloud-neutral and share data with partners. Cost depends mostly on how you query. We recommend one after looking at your sources, team and budget.",
      },
      {
        q: 'Do we need Segment if we already have a warehouse?',
        a: '**Not always.** Segment or RudderStack collects events from your website, app and servers in one format and sends them to your tools in real time. If you only need data in the warehouse for reporting, Fivetran or Airbyte plus native exports may be enough. If you also want live events in Braze, HubSpot or your ad platforms, a CDP saves a lot of custom work. Some teams use the warehouse itself as the hub with reverse ETL, often called a composable CDP.',
      },
      {
        q: 'What is reverse ETL, and when do we need it?',
        a: "**Reverse ETL copies data from your warehouse back into the tools your teams use**, like HubSpot, Salesforce, Braze or your ad platforms. You need it when the useful data, such as lifetime value, product usage or churn risk, lives in the warehouse and those tools can't see it. We set it up with Hightouch or Census, on Snowflake or BigQuery.",
      },
      {
        q: 'Fivetran or Airbyte?',
        a: '**Fivetran is fully managed**, has a large set of maintained connectors and charges by monthly active rows. **Airbyte is open source**, runs on your own servers or as a cloud service, and is often cheaper at high volume, with more upkeep. We pick based on your sources, data volume and who will look after the pipelines.',
      },
      {
        q: 'How do you keep the data clean?',
        a: "**We agree a tracking plan and naming rules before anything is built**, then transform the raw data with dbt into clean, modeled tables. Checks for freshness, duplicates and missing values catch problems early, and in Segment or RudderStack the tracking plan blocks or flags events that don't match it.",
      },
      {
        q: 'How long does a data warehouse implementation take?',
        a: '**Most projects are live within a few weeks.** A first version with your main sources loaded and modeled comes first, then more sources and the reverse ETL syncs. Your fixed quote gives the timeline.',
      },
      {
        q: 'Can you build a single customer view?',
        a: '**Yes.** We join web, app, CRM, billing and support data on shared IDs such as email, user ID and device ID into one profile per customer, in the warehouse and in your CDP if you use one. That profile then drives audiences, scoring and reporting.',
      },
      {
        q: 'What does the free stack audit cover?',
        a: "**It's a 30-minute call** on your data sources, tools and reporting: where it hurts, the quick wins, and what to build first, with a timeline and next steps. There's no obligation.",
      },
    ],
  },
  cta: { h2: '**Get a fixed-price quote** for your warehouse and CDP' },
};

export default page;
