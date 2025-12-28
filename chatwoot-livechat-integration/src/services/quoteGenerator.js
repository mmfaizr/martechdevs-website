import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

const QUOTE_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    greeting: {
      type: "string",
      description: "A warm, personalized greeting acknowledging their specific situation"
    },
    problem_understanding: {
      type: "string", 
      description: "2-3 sentences showing you understand their core challenges based on their answers"
    },
    solution_teaser: {
      type: "string",
      description: "Brief hints about how you'll solve their problems, mentioning relevant tools they selected"
    },
    scope_summary: {
      type: "string",
      description: "Clear summary of what's included in the engagement"
    },
    timeline: {
      type: "string",
      description: "Realistic project timeline with phases"
    },
    investment: {
      type: "object",
      properties: {
        one_time: { type: "string", description: "One-time implementation cost with currency symbol" },
        monthly: { type: "string", description: "Monthly support cost if applicable" },
        justification: { type: "string", description: "Brief justification of value - ROI, efficiency gains, etc." }
      },
      required: ["one_time", "justification"]
    },
    urgency_note: {
      type: "string",
      description: "If they indicated urgency, acknowledge it and confirm you can meet their timeline"
    },
    next_steps: {
      type: "string",
      description: "Clear call to action - schedule a discovery call, no commitment"
    },
    closing: {
      type: "string",
      description: "Confident, friendly closing that creates excitement about working together"
    }
  },
  required: ["greeting", "problem_understanding", "solution_teaser", "scope_summary", "timeline", "investment", "next_steps", "closing"]
};

class QuoteGenerator {
  constructor() {
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = config.gemini.model;
  }

  async generateSalesQuote(answers, calculatedQuote) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: QUOTE_GENERATION_SCHEMA,
          temperature: 0.85,
          maxOutputTokens: 1500,
        }
      });

      const prompt = this.buildPrompt(answers, calculatedQuote);

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = result.response.text();
      const quoteData = JSON.parse(responseText);
      
      return this.formatQuoteMessage(quoteData, calculatedQuote);
    } catch (error) {
      console.error('Error generating sales quote:', error);
      return this.getFallbackQuote(answers, calculatedQuote);
    }
  }

  buildPrompt(answers, quote) {
    const companyType = answers.company_type?.[0] || 'company';
    const stage = answers.company_stage?.[0] || 'growth stage';
    const platforms = answers.platforms?.join(', ') || 'web';
    const traffic = answers.traffic?.[0] || 'moderate';
    const devModel = answers.dev_model?.[0] === 'copilot' ? 'working alongside their dev team' : 'full implementation';
    const urgency = answers.urgency?.[0] || 'standard';
    const locations = answers.customer_location?.join(', ') || 'worldwide';
    const compliance = answers.compliance?.filter(c => c !== 'none').join(', ') || 'standard';
    const goals = answers.goals?.join(', ') || 'data integration';
    const tools = answers.tools?.filter(t => t !== 'not_sure').join(', ') || 'various martech tools';
    const training = answers.training_hours?.[0] || 'minimal';
    const support = answers.support_hours?.[0] || 'standard';

    return `You are an expert sales consultant for MartechDevs, a premier martech integration agency. Generate a compelling, personalized quote response that sounds like a seasoned sales professional closing a deal.

CLIENT PROFILE:
- Company Type: ${companyType}
- Stage: ${stage}
- Platforms: ${platforms}
- Monthly Traffic: ${traffic}
- Engagement Model: ${devModel}
- Timeline/Urgency: ${urgency}
- Customer Locations: ${locations}
- Compliance Needs: ${compliance}
- Goals: ${goals}
- Tools: ${tools}
- Training Needed: ${training}
- Ongoing Support: ${support}

CALCULATED INVESTMENT:
- One-time: $${quote.oneTime.toLocaleString()}
- Monthly Support: $${quote.monthly.toLocaleString()}/month

BREAKDOWN:
${quote.breakdown.map(b => `- ${b.item}: $${b.amount.toLocaleString()}`).join('\n')}

INSTRUCTIONS:
1. Be confident, warm, and consultative - like a trusted advisor, not a pushy salesperson
2. Show you understand their SPECIFIC pain points based on their ${companyType} type and ${goals}
3. Tease solutions using the tools they mentioned (${tools})
4. Justify the investment with concrete value (efficiency, accuracy, ROI potential)
5. If urgency is high (${urgency}), acknowledge it and confirm you can deliver
6. Timeline should be realistic based on complexity
7. End with a clear CTA: schedule a no-commitment discovery call
8. Sound human, not robotic - use contractions, be personable

Generate a quote response that would make the client excited to work with you.`;
  }

  formatQuoteMessage(data, quote) {
    const parts = [];

    parts.push(`## ${data.greeting}\n`);
    parts.push(`${data.problem_understanding}\n`);
    parts.push(`### 💡 How We'll Help\n${data.solution_teaser}\n`);
    parts.push(`### 📋 What's Included\n${data.scope_summary}\n`);
    parts.push(`### ⏱️ Timeline\n${data.timeline}\n`);
    
    parts.push(`### 💰 Your Investment\n`);
    parts.push(`**One-time Implementation:** ${data.investment.one_time}\n`);
    if (quote.monthly > 0) {
      parts.push(`**Monthly Support:** ${data.investment.monthly || `$${quote.monthly.toLocaleString()}/month`}\n`);
    }
    parts.push(`\n*${data.investment.justification}*\n`);

    if (data.urgency_note) {
      parts.push(`### ⚡ Timeline Note\n${data.urgency_note}\n`);
    }

    parts.push(`### 🚀 Next Steps\n${data.next_steps}\n`);
    parts.push(`---\n${data.closing}`);

    return parts.join('\n');
  }

  getFallbackQuote(answers, quote) {
    const companyType = answers.company_type?.[0]?.replace(/_/g, ' ') || 'your company';
    const tools = answers.tools?.filter(t => t !== 'not_sure').slice(0, 3).join(', ') || 'your martech stack';
    
    return `## Thanks for sharing those details!

Based on what you've told me about ${companyType}, I can see you're looking to streamline your data infrastructure and get more value from tools like ${tools}.

### 💡 How We'll Help
We'll build a robust, scalable integration that connects your systems seamlessly - giving you the single source of truth you need to make confident decisions.

### 📋 What's Included
${quote.breakdown.map(b => `- ${b.item}`).join('\n')}

### ⏱️ Timeline
Typically 2-4 weeks for core implementation, with ongoing optimization based on your needs.

### 💰 Your Investment
**One-time Implementation:** $${quote.oneTime.toLocaleString()}
${quote.monthly > 0 ? `**Monthly Support:** $${quote.monthly.toLocaleString()}/month` : ''}

*This investment typically pays for itself within 3-6 months through improved efficiency and data accuracy.*

### 🚀 Next Steps
I'd love to hop on a quick 30-minute discovery call to dive deeper into your specific needs. No commitment - just a conversation to see if we're a good fit.

---
Looking forward to potentially working together! 🙌`;
  }
}

export default new QuoteGenerator();

