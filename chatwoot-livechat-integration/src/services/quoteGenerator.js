import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

const QUOTE_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    greeting: {
      type: "string",
      description: "A brief, warm thank you for sharing details (1 sentence)"
    },
    problem_understanding: {
      type: "string", 
      description: "1-2 conversational sentences showing you understand what they're trying to achieve"
    },
    solution_teaser: {
      type: "string",
      description: "1-2 sentences about how you'll help, mentioning their specific tools"
    },
    timeline: {
      type: "string",
      description: "One sentence about realistic delivery timeline"
    },
    investment: {
      type: "object",
      properties: {
        one_time: { type: "string", description: "One-time implementation cost with currency symbol (e.g. $5,000)" },
        monthly: { type: "string", description: "Monthly support cost if applicable (e.g. $500/month)" },
        justification: { type: "string", description: "One sentence on ROI or value"
        }
      },
      required: ["one_time", "justification"]
    },
    urgency_note: {
      type: "string",
      description: "If urgent timeline, one sentence confirming you can deliver. Empty string if not urgent."
    },
    next_steps: {
      type: "string",
      description: "One friendly sentence inviting them to a discovery call"
    }
  },
  required: ["greeting", "problem_understanding", "solution_teaser", "timeline", "investment", "next_steps"]
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
    const getVal = (val) => Array.isArray(val) ? val[0] : val;
    const getList = (val) => Array.isArray(val) ? val.join(', ') : val;
    
    const companyType = getVal(answers.company_type) || 'company';
    const stage = getVal(answers.company_stage) || 'growth stage';
    const platforms = getList(answers.platforms) || 'web';
    const traffic = getVal(answers.traffic) || 'moderate';
    const devModel = (getVal(answers.dev_model) || '').toLowerCase().includes('copilot') ? 'working alongside their dev team' : 'full implementation';
    const urgency = getVal(answers.urgency) || 'standard';
    const locations = getList(answers.customer_locations) || 'worldwide';
    const compliance = getList(answers.compliance) || 'standard';
    const goals = getList(answers.goals) || 'data integration';
    const tools = getList(answers.tools) || 'various martech tools';
    const training = getVal(answers.training_hours) || 'minimal';
    const support = getVal(answers.support_hours) || 'standard';

    return `You are a friendly martech consultant at MartechDevs. Write a CONVERSATIONAL quote message like you're chatting with a potential client. No headers, no bullet points, no structured format - just natural flowing paragraphs like a real conversation.

CLIENT INFO:
Company: ${companyType} (${stage})
Platforms: ${platforms}
Traffic: ${traffic}
Working style: ${devModel}
Timeline: ${urgency}
Goals: ${goals}
Tools: ${tools}

PRICING (use these exact numbers):
One-time: $${quote.oneTime.toLocaleString()}
Monthly: $${quote.monthly.toLocaleString()}/month

RULES:
- Write like you're texting a colleague, not writing a formal proposal
- NO emojis, NO headers, NO bullet points, NO bold text
- Keep each section to 1-2 sentences max
- Be warm but professional
- Use contractions (we'll, you're, that's)
- Mention their specific tools (${tools}) naturally
- The investment.one_time must be exactly "$${quote.oneTime.toLocaleString()}"
- End with a casual invite to chat more

Example tone: "Thanks for sharing all that! Sounds like you're trying to get Segment and HubSpot talking to each other properly..."`;
  }

  formatQuoteMessage(data, quote) {
    const parts = [];

    parts.push(data.greeting);
    parts.push(data.problem_understanding);
    parts.push(data.solution_teaser);
    
    parts.push(`For your project, we're looking at a **one-time investment of ${data.investment.one_time}**${quote.monthly > 0 ? ` with ongoing support at ${data.investment.monthly || `$${quote.monthly.toLocaleString()}/month`}` : ''}.`);
    
    parts.push(data.investment.justification);
    
    if (data.urgency_note) {
      parts.push(data.urgency_note);
    }
    
    parts.push(`${data.timeline}`);
    parts.push(data.next_steps);
    parts.push(`[SHOW_BOOK_CALL_BUTTON]`);

    return parts.join('\n\n');
  }

  getFallbackQuote(answers, quote) {
    const companyType = (Array.isArray(answers.company_type) ? answers.company_type[0] : answers.company_type)?.replace(/_/g, ' ') || 'your company';
    const toolsRaw = Array.isArray(answers.tools) ? answers.tools : [answers.tools];
    const tools = toolsRaw.filter(t => t && t !== 'not_sure').slice(0, 3).join(', ') || 'your martech stack';
    
    return `Thanks for sharing all that! Based on what you've told me about ${companyType}, it sounds like you're looking to get more value from tools like ${tools} while building a solid data foundation.

We'll create a clean integration that connects your systems and gives you a single source of truth for confident decision-making.

For your project, we're looking at a **one-time investment of $${quote.oneTime.toLocaleString()}**${quote.monthly > 0 ? ` with ongoing support at $${quote.monthly.toLocaleString()}/month` : ''}.

This typically pays for itself within 3-6 months through better efficiency and data accuracy.

We can have the core implementation live in 2-4 weeks, with ongoing optimization based on your needs.

I'd love to hop on a quick call to dig into the specifics and make sure we're the right fit. Sound good?

[SHOW_BOOK_CALL_BUTTON]`;
  }
}

export default new QuoteGenerator();

