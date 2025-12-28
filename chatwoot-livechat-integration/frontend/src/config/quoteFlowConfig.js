export const QUOTE_DATA_SCHEMA = {
  company_type: { required: true, description: 'Type of company (B2B SaaS, B2C, E-commerce, Fintech, etc.)' },
  company_stage: { required: true, description: 'Company stage (Early-stage, Growth, Enterprise)' },
  platforms: { required: true, multiple: true, description: 'Platforms needing integration (Website, Web App, iOS, Android)' },
  traffic: { required: true, description: 'Monthly traffic volume' },
  dev_model: { required: true, description: 'Working model preference (Full implementation vs Copilot)' },
  urgency: { required: true, description: 'Project timeline/urgency' },
  customer_locations: { required: false, multiple: true, description: 'Where customers are located' },
  compliance: { required: false, multiple: true, description: 'Compliance needs (GDPR, CCPA, etc.)' },
  goals: { required: true, multiple: true, description: 'Main goals (analytics, automation, personalization, etc.)' },
  tools: { required: true, multiple: true, description: 'Martech tools in use or planned' },
  documentation: { required: false, description: 'Documentation needs' },
  training_hours: { required: false, description: 'Training hours needed' },
  support_duration: { required: false, description: 'Ongoing support duration' },
  support_hours: { required: false, description: 'Monthly support hours' },
  email: { required: true, description: 'Work email for quote delivery' }
};

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
    low: 0,
    medium: 500,
    high: 1500,
    very_high: 3000
  },
  dev_model: {
    full: 1,
    copilot: 0.7
  },
  urgency: {
    asap: 1.5,
    soon: 1.25,
    normal: 1,
    flexible: 0.9
  },
  goals_per_item: 1500,
  tools_per_item: 300,
  documentation: 800,
  training_per_hour: 150,
  support_monthly: {
    light: 500,
    standard: 1800,
    premium: 4000
  }
};

export function calculateQuote(data) {
  let total = 0;
  const breakdown = [];

  const stage = normalizeStage(data.company_stage);
  const basePrice = QUOTE_PRICING.base[stage] || QUOTE_PRICING.base.growth_stage;
  total += basePrice;
  breakdown.push({ item: 'Base implementation', amount: basePrice });

  if (data.platforms) {
    const platforms = Array.isArray(data.platforms) ? data.platforms : [data.platforms];
    let platformCost = 0;
    platforms.forEach(p => {
      const key = p.toLowerCase().replace(/\s+/g, '_');
      platformCost += QUOTE_PRICING.platforms[key] || 500;
    });
    total += platformCost;
    breakdown.push({ item: `Platforms (${platforms.length})`, amount: platformCost });
  }

  const trafficLevel = normalizeTraffic(data.traffic);
  const trafficCost = QUOTE_PRICING.traffic[trafficLevel] || 0;
  if (trafficCost > 0) {
    total += trafficCost;
    breakdown.push({ item: 'Traffic complexity', amount: trafficCost });
  }

  if (data.goals) {
    const goals = Array.isArray(data.goals) ? data.goals : [data.goals];
    const goalsCost = goals.length * QUOTE_PRICING.goals_per_item;
    total += goalsCost;
    breakdown.push({ item: `Goals (${goals.length})`, amount: goalsCost });
  }

  if (data.tools) {
    const tools = Array.isArray(data.tools) ? data.tools : [data.tools];
    const toolsCost = tools.length * QUOTE_PRICING.tools_per_item;
    total += toolsCost;
    breakdown.push({ item: `Tool integrations (${tools.length})`, amount: toolsCost });
  }

  if (data.documentation && data.documentation !== 'none') {
    total += QUOTE_PRICING.documentation;
    breakdown.push({ item: 'Documentation', amount: QUOTE_PRICING.documentation });
  }

  if (data.training_hours) {
    const hours = parseInt(data.training_hours) || 0;
    if (hours > 0) {
      const trainingCost = hours * QUOTE_PRICING.training_per_hour;
      total += trainingCost;
      breakdown.push({ item: `Training (${hours}h)`, amount: trainingCost });
    }
  }

  const devMultiplier = data.dev_model?.toLowerCase().includes('copilot') ? 0.7 : 1;
  total = total * devMultiplier;

  const urgencyMultiplier = normalizeUrgency(data.urgency);
  total = total * urgencyMultiplier;

  let monthlySupport = 0;
  if (data.support_hours) {
    const hours = parseInt(data.support_hours) || 0;
    if (hours <= 10) monthlySupport = QUOTE_PRICING.support_monthly.light;
    else if (hours <= 30) monthlySupport = QUOTE_PRICING.support_monthly.standard;
    else monthlySupport = QUOTE_PRICING.support_monthly.premium;
    
    if (monthlySupport > 0) {
      breakdown.push({ item: 'Monthly support', amount: monthlySupport, recurring: true });
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

function normalizeStage(stage) {
  if (!stage) return 'growth_stage';
  const s = stage.toLowerCase();
  if (s.includes('early') || s.includes('startup') || s.includes('seed')) return 'early_stage';
  if (s.includes('enterprise') || s.includes('large')) return 'enterprise';
  return 'growth_stage';
}

function normalizeTraffic(traffic) {
  if (!traffic) return 'medium';
  const t = traffic.toLowerCase();
  if (t.includes('1m') || t.includes('million') || t.includes('1,000,000')) return 'very_high';
  if (t.includes('100k') || t.includes('100,000')) return 'high';
  if (t.includes('50k') || t.includes('10k') || t.includes('50,000')) return 'medium';
  return 'low';
}

function normalizeUrgency(urgency) {
  if (!urgency) return 1;
  const u = urgency.toLowerCase();
  if (u.includes('asap') || u.includes('urgent') || u.includes('yesterday')) return 1.5;
  if (u.includes('week') || u.includes('soon')) return 1.25;
  if (u.includes('quarter') || u.includes('flexible') || u.includes('no rush')) return 0.9;
  return 1;
}
