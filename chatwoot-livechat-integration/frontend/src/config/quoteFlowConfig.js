export const QUOTE_TOPICS = [
  {
    id: 'company_type',
    topic: 'type of company',
    options: [
      { value: 'b2b_saas', label: 'B2B SaaS' },
      { value: 'b2c_saas', label: 'B2C SaaS' },
      { value: 'ed_tech', label: 'Ed tech' },
      { value: 'fintech', label: 'Fintech' },
      { value: 'marketplace', label: 'Marketplace' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 'company_stage',
    topic: 'company stage',
    options: [
      { value: 'early_stage', label: 'Early stage' },
      { value: 'growth_stage', label: 'Growth stage' },
      { value: 'enterprise', label: 'Enterprise' }
    ]
  },
  {
    id: 'platforms',
    topic: 'platforms needing integration',
    multiSelect: true,
    options: [
      { value: 'website', label: 'Website' },
      { value: 'web_app', label: 'Web app' },
      { value: 'ios', label: 'iOS' },
      { value: 'android', label: 'Android' }
    ]
  },
  {
    id: 'traffic',
    topic: 'monthly traffic volume',
    options: [
      { value: 'under_5k', label: '< 5,000' },
      { value: '5k_50k', label: '5k - 50k' },
      { value: '50k_100k', label: '50k - 100k' },
      { value: '100k_1m', label: '100k - 1M' },
      { value: 'over_1m', label: '1M+' }
    ]
  },
  {
    id: 'dev_model',
    topic: 'preferred working model',
    options: [
      { value: 'full_implementation', label: 'Full implementation by us' },
      { value: 'copilot', label: 'Copilot for your dev team' }
    ]
  },
  {
    id: 'urgency',
    topic: 'project timeline',
    options: [
      { value: 'asap', label: 'ASAP / Yesterday' },
      { value: 'two_weeks', label: 'In two weeks' },
      { value: 'month', label: 'In a month' },
      { value: 'quarter', label: 'This quarter' }
    ]
  },
  {
    id: 'customer_location',
    topic: 'customer locations',
    multiSelect: true,
    options: [
      { value: 'worldwide', label: 'Worldwide' },
      { value: 'eu', label: 'European Union' },
      { value: 'middle_east', label: 'Middle East' },
      { value: 'australia', label: 'Australia' },
      { value: 'north_america', label: 'North America' },
      { value: 'asia', label: 'Asia' }
    ]
  },
  {
    id: 'compliance',
    topic: 'compliance requirements',
    multiSelect: true,
    options: [
      { value: 'gdpr', label: 'GDPR' },
      { value: 'ccpa', label: 'CCPA' },
      { value: 'other', label: 'Other' },
      { value: 'none', label: 'None / Not sure' }
    ]
  },
  {
    id: 'goals',
    topic: 'main goals',
    multiSelect: true,
    options: [
      { value: 'reverse_etl', label: 'Activate Datawarehouse data (Reverse ETL)' },
      { value: 'server_tracking', label: 'Server-side tracking & conversion tracking' },
      { value: 'messaging', label: 'Personalised email, in-app, push notifications' },
      { value: 'crm_helpdesk', label: 'CRM & Helpdesk Setup' },
      { value: 'analytics', label: 'Marketing & revenue analytics' },
      { value: 'data_centralization', label: 'Data Centralisation & Automation' }
    ]
  },
  {
    id: 'tools',
    topic: 'martech tools in use or planned',
    multiSelect: true,
    options: [
      { value: 'mixpanel', label: 'Mixpanel' },
      { value: 'segment', label: 'Segment' },
      { value: 'hubspot', label: 'HubSpot' },
      { value: 'census', label: 'Census' },
      { value: 'airbyte', label: 'Airbyte' },
      { value: 'fivetran', label: 'Fivetran' },
      { value: 'snowflake', label: 'Snowflake' },
      { value: 'bigquery', label: 'BigQuery' },
      { value: 'braze', label: 'Braze' },
      { value: 'intercom', label: 'Intercom' },
      { value: 'gtm', label: 'Google Tag Manager' },
      { value: 'clevertap', label: 'CleverTap' },
      { value: 'ga4', label: 'Google Analytics' },
      { value: 'customerio', label: 'Customer.io' },
      { value: 'not_sure', label: 'Not sure yet' }
    ]
  },
  {
    id: 'documentation',
    topic: 'documentation needs',
    multiSelect: true,
    options: [
      { value: 'docs', label: 'Comprehensive docs' },
      { value: 'videos', label: 'Video tutorials' },
      { value: 'none', label: 'None needed' }
    ]
  },
  {
    id: 'training_hours',
    topic: 'training hours needed',
    options: [
      { value: 'none', label: 'None' },
      { value: '5_hours', label: '5 hours' },
      { value: '20_hours', label: '20 hours' },
      { value: '50_hours', label: '50 hours' }
    ]
  },
  {
    id: 'support_duration',
    topic: 'ongoing support duration',
    options: [
      { value: 'none', label: 'None' },
      { value: '3_months', label: '3 months' },
      { value: '6_months', label: '6 months' },
      { value: '12_months', label: '12 months' }
    ]
  },
  {
    id: 'support_hours',
    topic: 'monthly support hours',
    options: [
      { value: '5_hours', label: '5 hours/month' },
      { value: '20_hours', label: '20 hours/month' },
      { value: '50_hours', label: '50 hours/month' },
      { value: '100_hours', label: '100 hours/month' }
    ]
  },
  {
    id: 'email',
    topic: 'work email',
    inputType: 'email',
    options: []
  }
];

export const QUOTE_SYSTEM_PROMPT = `You are a friendly sales assistant for MartechDevs, helping gather requirements to generate a quote for martech integration services.

Your job is to ask ONE question at a time in a natural, conversational way. Vary your phrasing - don't be robotic.

RULES:
1. Ask only ONE question per response
2. Be conversational and friendly, not formal
3. Vary your question phrasing each time
4. Keep responses under 50 words
5. Acknowledge their previous answer briefly before asking the next question
6. For the first question, give a brief friendly intro

CURRENT TOPIC TO ASK ABOUT: {topic}
TOPICS ALREADY COVERED: {covered_topics}
PREVIOUS ANSWER: {previous_answer}

Respond with ONLY the question, no options list.`;

export const QUOTE_PRICING = {
  base: {
    early_stage: 3000,
    growth_stage: 6000,
    enterprise: 12000
  },
  platforms: {
    website: 500,
    web_app: 1000,
    ios: 2000,
    android: 2000
  },
  traffic: {
    under_5k: 0,
    '5k_50k': 500,
    '50k_100k': 1000,
    '100k_1m': 2000,
    over_1m: 4000
  },
  dev_model: {
    full_implementation: 1,
    copilot: 0.7
  },
  urgency: {
    asap: 1.5,
    two_weeks: 1.25,
    month: 1,
    quarter: 0.9
  },
  goals_per_item: 1500,
  tools_per_item: 300,
  documentation: {
    docs: 800,
    videos: 1500,
    none: 0
  },
  training_hours: {
    none: 0,
    '5_hours': 750,
    '20_hours': 2500,
    '50_hours': 5000
  },
  support_monthly: {
    '5_hours': 500,
    '20_hours': 1800,
    '50_hours': 4000,
    '100_hours': 7500
  }
};

export function calculateQuote(answers) {
  let total = 0;
  let breakdown = [];

  const stage = answers.company_stage?.[0] || 'growth_stage';
  const basePrice = QUOTE_PRICING.base[stage] || QUOTE_PRICING.base.growth_stage;
  total += basePrice;
  breakdown.push({ item: 'Base implementation', amount: basePrice });

  if (answers.platforms?.length) {
    const platformCost = answers.platforms.reduce((sum, p) => sum + (QUOTE_PRICING.platforms[p] || 0), 0);
    total += platformCost;
    breakdown.push({ item: `Platforms (${answers.platforms.length})`, amount: platformCost });
  }

  const traffic = answers.traffic?.[0];
  if (traffic && QUOTE_PRICING.traffic[traffic]) {
    const trafficCost = QUOTE_PRICING.traffic[traffic];
    total += trafficCost;
    if (trafficCost > 0) breakdown.push({ item: 'Traffic complexity', amount: trafficCost });
  }

  if (answers.goals?.length) {
    const goalsCost = answers.goals.length * QUOTE_PRICING.goals_per_item;
    total += goalsCost;
    breakdown.push({ item: `Goals (${answers.goals.length})`, amount: goalsCost });
  }

  if (answers.tools?.length) {
    const toolsCount = answers.tools.filter(t => t !== 'not_sure').length;
    const toolsCost = toolsCount * QUOTE_PRICING.tools_per_item;
    total += toolsCost;
    if (toolsCost > 0) breakdown.push({ item: `Tool integrations (${toolsCount})`, amount: toolsCost });
  }

  if (answers.documentation?.length) {
    const docCost = answers.documentation.reduce((sum, d) => sum + (QUOTE_PRICING.documentation[d] || 0), 0);
    total += docCost;
    if (docCost > 0) breakdown.push({ item: 'Documentation', amount: docCost });
  }

  const training = answers.training_hours?.[0];
  if (training && QUOTE_PRICING.training_hours[training]) {
    const trainingCost = QUOTE_PRICING.training_hours[training];
    total += trainingCost;
    if (trainingCost > 0) breakdown.push({ item: 'Training', amount: trainingCost });
  }

  const devModel = answers.dev_model?.[0] || 'full_implementation';
  const devMultiplier = QUOTE_PRICING.dev_model[devModel] || 1;
  total = total * devMultiplier;

  const urgency = answers.urgency?.[0] || 'month';
  const urgencyMultiplier = QUOTE_PRICING.urgency[urgency] || 1;
  total = total * urgencyMultiplier;

  let monthlySupport = 0;
  const supportHours = answers.support_hours?.[0];
  const supportDuration = answers.support_duration?.[0];
  if (supportHours && supportDuration && supportDuration !== 'none') {
    monthlySupport = QUOTE_PRICING.support_monthly[supportHours] || 0;
    const months = parseInt(supportDuration) || 0;
    if (months > 0 && monthlySupport > 0) {
      breakdown.push({ item: `Monthly support (${supportHours.replace('_', ' ')})`, amount: monthlySupport, recurring: true });
    }
  }

  return {
    oneTime: Math.round(total),
    monthly: monthlySupport,
    breakdown,
    devMultiplier,
    urgencyMultiplier
  };
}

export function formatQuoteMessage(answers, quote) {
  const lines = [
    `Here's your personalized quote based on what we discussed:\n`
  ];

  lines.push(`**One-time Implementation:** $${quote.oneTime.toLocaleString()}`);
  
  if (quote.monthly > 0) {
    lines.push(`**Monthly Support:** $${quote.monthly.toLocaleString()}/month`);
  }

  lines.push(`\n**What's included:**`);
  quote.breakdown.forEach(item => {
    const suffix = item.recurring ? '/mo' : '';
    lines.push(`• ${item.item}: $${item.amount.toLocaleString()}${suffix}`);
  });

  if (quote.devMultiplier !== 1 && quote.devMultiplier < 1) {
    lines.push(`• Copilot model discount applied`);
  }

  if (quote.urgencyMultiplier > 1) {
    lines.push(`• Rush delivery premium included`);
  } else if (quote.urgencyMultiplier < 1) {
    lines.push(`• Flexible timeline discount applied`);
  }

  lines.push(`\nI'll send a detailed proposal to **${answers.email?.[0] || 'your email'}** shortly. Our team will reach out within 24 hours to discuss next steps!`);

  return lines.join('\n');
}
