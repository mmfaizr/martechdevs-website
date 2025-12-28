export const QUOTE_FLOW_STEPS = [
  {
    id: 'company_type',
    question: "What type of company are you? This helps us tailor our approach to your needs.",
    multiSelect: false,
    options: [
      { value: 'b2b_saas', label: 'B2B SaaS', icon: '🏢' },
      { value: 'b2c_saas', label: 'B2C SaaS', icon: '🏬' },
      { value: 'ed_tech', label: 'Ed tech', icon: '🎓' },
      { value: 'fintech', label: 'Fintech', icon: '🏦' },
      { value: 'marketplace', label: 'Marketplace', icon: '🛒' },
      { value: 'other', label: 'Others', icon: '💼' }
    ]
  },
  {
    id: 'company_stage',
    question: "What stage is your company at?",
    multiSelect: false,
    options: [
      { value: 'early_stage', label: 'Early stage', icon: '🌱' },
      { value: 'growth_stage', label: 'Growth stage', icon: '📈' },
      { value: 'enterprise', label: 'Enterprise', icon: '🏛️' }
    ]
  },
  {
    id: 'platforms',
    question: "Which platforms do you need integration for? Select all that apply.",
    multiSelect: true,
    options: [
      { value: 'website', label: 'Website', icon: '🖥️' },
      { value: 'web_app', label: 'Web app', icon: '📱' },
      { value: 'ios', label: 'iOS', icon: '🍎' },
      { value: 'android', label: 'Android', icon: '🤖' }
    ]
  },
  {
    id: 'traffic',
    question: "What's your approximate monthly website (+app) traffic?",
    multiSelect: false,
    options: [
      { value: 'under_5k', label: '< 5,000', icon: '📊' },
      { value: '5k_50k', label: '5k - 50k', icon: '📊' },
      { value: '50k_100k', label: '50k - 100k', icon: '📊' },
      { value: '100k_1m', label: '100k - 1M', icon: '📊' },
      { value: 'over_1m', label: '1M+', icon: '📊' }
    ]
  },
  {
    id: 'dev_model',
    question: "How would you like us to work with you?",
    multiSelect: false,
    options: [
      { value: 'full_implementation', label: 'We implement fully', icon: '🔧' },
      { value: 'copilot', label: 'We become copilot of your dev team', icon: '⚡' }
    ]
  },
  {
    id: 'urgency',
    question: "When do you need this implemented?",
    multiSelect: false,
    options: [
      { value: 'asap', label: 'Yesterday', icon: '🔥' },
      { value: 'two_weeks', label: 'In two weeks', icon: '⏰' },
      { value: 'month', label: 'In a month', icon: '📅' },
      { value: 'quarter', label: 'In this quarter', icon: '📆' }
    ]
  },
  {
    id: 'customer_location',
    question: "Where are your customers located? Select all that apply.",
    multiSelect: true,
    options: [
      { value: 'worldwide', label: 'Worldwide', icon: '🌍' },
      { value: 'eu', label: 'European Union', icon: '🇪🇺' },
      { value: 'middle_east', label: 'Middle East', icon: '🌙' },
      { value: 'australia', label: 'Australia', icon: '🇦🇺' },
      { value: 'north_america', label: 'North America', icon: '🇺🇸' },
      { value: 'asia', label: 'Asia', icon: '🌏' }
    ]
  },
  {
    id: 'compliance',
    question: "Any specific compliance requirements?",
    multiSelect: true,
    options: [
      { value: 'gdpr', label: 'GDPR', icon: '🔒' },
      { value: 'ccpa', label: 'CCPA', icon: '🔐' },
      { value: 'other', label: 'Others', icon: '📋' },
      { value: 'none', label: 'Not sure / None', icon: '❓' }
    ]
  },
  {
    id: 'goals',
    question: "What are your main goals? Select all that apply.",
    multiSelect: true,
    options: [
      { value: 'reverse_etl', label: 'Activate Datawarehouse data (Reverse ETL)', icon: '🔄' },
      { value: 'server_tracking', label: 'Server-side tracking and conversion tracking setup', icon: '📡' },
      { value: 'messaging', label: 'Event based personalised email, in-app, push notifications journey', icon: '✉️' },
      { value: 'crm_helpdesk', label: 'CRM, Customer Support and Helpdesk Setup', icon: '🎧' },
      { value: 'analytics', label: 'Marketing performance, product usage and revenue analytics', icon: '📊' },
      { value: 'data_centralization', label: 'Data Centralisation and Automation', icon: '🗄️' }
    ]
  },
  {
    id: 'tools',
    question: "Which tools are you using or planning to use? Select all that apply.",
    multiSelect: true,
    options: [
      { value: 'mixpanel', label: 'Mixpanel', icon: '📈' },
      { value: 'segment', label: 'Segment', icon: '🔗' },
      { value: 'hubspot', label: 'HubSpot', icon: '🧲' },
      { value: 'census', label: 'Census', icon: '📊' },
      { value: 'airbyte', label: 'Airbyte', icon: '🔄' },
      { value: 'fivetran', label: 'Fivetran', icon: '📥' },
      { value: 'snowflake', label: 'Snowflake', icon: '❄️' },
      { value: 'bigquery', label: 'BigQuery', icon: '🔍' },
      { value: 'adjust', label: 'Adjust', icon: '📱' },
      { value: 'appsflyer', label: 'AppsFlyer', icon: '🚀' },
      { value: 'braze', label: 'Braze', icon: '🔥' },
      { value: 'intercom', label: 'Intercom', icon: '💬' },
      { value: 'gtm', label: 'Google Tag Manager', icon: '🏷️' },
      { value: 'clevertap', label: 'CleverTap', icon: '🎯' },
      { value: 'ga4', label: 'Google Analytics', icon: '📉' },
      { value: 'customerio', label: 'Customer.io', icon: '📧' },
      { value: 'not_sure', label: 'Not sure', icon: '❓' }
    ]
  },
  {
    id: 'documentation',
    question: "What type of documentation would you like?",
    multiSelect: true,
    options: [
      { value: 'docs', label: 'Comprehensive docs', icon: '📄' },
      { value: 'videos', label: 'Video tutorials', icon: '🎬' },
      { value: 'none', label: 'None needed', icon: '❌' }
    ]
  },
  {
    id: 'training_hours',
    question: "How many hours of training would your team need?",
    multiSelect: false,
    options: [
      { value: 'none', label: 'None', icon: '0️⃣' },
      { value: '5_hours', label: '5 hours', icon: '⏱️' },
      { value: '20_hours', label: '20 hours', icon: '⏰' },
      { value: '50_hours', label: '50 hours', icon: '🕐' }
    ]
  },
  {
    id: 'support_duration',
    question: "How long would you need ongoing support?",
    multiSelect: false,
    options: [
      { value: 'none', label: 'None', icon: '❌' },
      { value: '3_months', label: '3 months', icon: '📅' },
      { value: '6_months', label: '6 months', icon: '📆' },
      { value: '12_months', label: '12 months', icon: '🗓️' }
    ]
  },
  {
    id: 'support_hours',
    question: "How many support hours per month would you need?",
    multiSelect: false,
    options: [
      { value: '5_hours', label: '5 hours', icon: '⏱️' },
      { value: '20_hours', label: '20 hours', icon: '⏰' },
      { value: '50_hours', label: '50 hours', icon: '🕐' },
      { value: '100_hours', label: '100 hours', icon: '⚡' }
    ]
  },
  {
    id: 'email',
    question: "Great! Last step — what's your work email so we can send you the detailed quote?",
    multiSelect: false,
    inputType: 'email',
    options: []
  }
];

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
    `📋 **Your Instant Quote**\n`,
    `Based on your requirements, here's your estimated investment:\n`
  ];

  lines.push(`**One-time Implementation:** $${quote.oneTime.toLocaleString()}`);
  
  if (quote.monthly > 0) {
    lines.push(`**Monthly Support:** $${quote.monthly.toLocaleString()}/month`);
  }

  lines.push(`\n**Breakdown:**`);
  quote.breakdown.forEach(item => {
    const suffix = item.recurring ? '/mo' : '';
    lines.push(`• ${item.item}: $${item.amount.toLocaleString()}${suffix}`);
  });

  if (quote.devMultiplier !== 1) {
    const label = quote.devMultiplier < 1 ? 'Copilot discount' : 'Full implementation';
    lines.push(`• ${label}: ${Math.round((1 - quote.devMultiplier) * 100)}% adjustment`);
  }

  if (quote.urgencyMultiplier !== 1) {
    const label = quote.urgencyMultiplier > 1 ? 'Rush delivery' : 'Flexible timeline discount';
    lines.push(`• ${label}: ${Math.round((quote.urgencyMultiplier - 1) * 100)}% adjustment`);
  }

  lines.push(`\n✉️ We'll send a detailed proposal to **${answers.email?.[0] || 'your email'}** shortly.`);
  lines.push(`\nA team member will reach out within 24 hours to discuss your project in detail.`);

  return lines.join('\n');
}

