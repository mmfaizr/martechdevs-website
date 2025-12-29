import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

const QUOTE_SCHEMA = {
  company_type: {
    description: 'Type of company',
    options: ['B2B SaaS', 'B2C SaaS', 'E-commerce', 'Ed-tech', 'Fintech', 'Marketplace', 'Agency', 'Other']
  },
  company_stage: {
    description: 'Company stage',
    options: ['Early stage / Startup', 'Growth stage', 'Enterprise / Large company']
  },
  platforms: {
    description: 'Platforms needing integration',
    options: ['Website', 'Web App', 'iOS App', 'Android App'],
    multiSelect: true
  },
  traffic: {
    description: 'Monthly traffic volume',
    options: ['Under 5,000', '5k - 50k', '50k - 100k', '100k - 1M', 'Over 1M']
  },
  dev_model: {
    description: 'Preferred working model',
    options: ['Full implementation by MartechDevs', 'Copilot / Work alongside your dev team']
  },
  urgency: {
    description: 'Project timeline',
    options: ['ASAP / Urgent', 'Within 2 weeks', 'Within a month', 'This quarter / Flexible']
  },
  customer_locations: {
    description: 'Where your customers are located',
    options: ['Worldwide', 'North America', 'Europe / EU', 'Asia', 'Middle East', 'Australia'],
    multiSelect: true
  },
  compliance: {
    description: 'Compliance requirements',
    options: ['GDPR', 'CCPA', 'HIPAA', 'SOC2', 'Other', 'None / Not sure'],
    multiSelect: true
  },
  goals: {
    description: 'Main goals to achieve',
    options: [
      'Activate Data Warehouse (Reverse ETL)',
      'Server-side tracking & conversion tracking',
      'Personalised messaging (email, push, in-app)',
      'CRM & Helpdesk setup',
      'Marketing & revenue analytics',
      'Data centralisation & automation'
    ],
    multiSelect: true
  },
  tools: {
    description: 'Martech tools you use or plan to use',
    options: [
      'Segment', 'Mixpanel', 'Amplitude', 'HubSpot', 'Salesforce',
      'Braze', 'Customer.io', 'CleverTap', 'Intercom', 'Zendesk',
      'Snowflake', 'BigQuery', 'Census', 'Hightouch', 'Fivetran', 'Airbyte',
      'Google Tag Manager', 'Google Analytics', 'Meta Ads', 'Google Ads',
      'Not sure yet'
    ],
    multiSelect: true
  },
  documentation: {
    description: 'Documentation needs',
    options: ['Comprehensive documentation', 'Video tutorials', 'None needed']
  },
  training_hours: {
    description: 'Training hours for your team',
    options: ['None', '5 hours', '10 hours', '20 hours', '50+ hours']
  },
  support_duration: {
    description: 'Ongoing support duration',
    options: ['None', '3 months', '6 months', '12 months']
  },
  support_hours: {
    description: 'Monthly support hours',
    options: ['5 hours/month', '10 hours/month', '20 hours/month', '50 hours/month', '100+ hours/month']
  },
  email: {
    description: 'Work email to send the quote',
    inputType: 'email'
  }
};

const REQUIRED_FIELDS = ['company_type', 'company_stage', 'platforms', 'traffic', 'dev_model', 'urgency', 'goals', 'tools', 'email'];

const QUOTE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    question: {
      type: "string",
      description: "Your conversational question to the user"
    },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "string" },
          label: { type: "string" }
        },
        required: ["value", "label"]
      },
      description: "Suggested options for the user (can be empty for free-text questions)"
    },
    multi_select: {
      type: "boolean",
      description: "Whether user can select multiple options"
    },
    input_type: {
      type: ["string", "null"],
      description: "Set to 'email' for email input, null otherwise"
    },
    collected: {
      type: "object",
      description: "Data extracted from user's previous answer"
    },
    is_complete: {
      type: "boolean",
      description: "True if all required data has been collected"
    }
  },
  required: ["question", "options", "multi_select", "is_complete"]
};

class GeminiService {
  constructor() {
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = config.gemini.model;
  }

  async generateQuoteStep(previousAnswer, collectedData = {}, previousField = null) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: QUOTE_RESPONSE_SCHEMA,
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      });

      let updatedData = { ...collectedData };
      
      if (previousAnswer && previousField && QUOTE_SCHEMA[previousField]) {
        const fieldConfig = QUOTE_SCHEMA[previousField];
        if (fieldConfig.options) {
          const matchedOption = fieldConfig.options.find(
            opt => opt.toLowerCase() === previousAnswer.toLowerCase() ||
                   previousAnswer.toLowerCase().includes(opt.toLowerCase()) ||
                   opt.toLowerCase().includes(previousAnswer.toLowerCase())
          );
          if (matchedOption) {
            updatedData[previousField] = matchedOption;
          } else {
            updatedData[previousField] = previousAnswer;
          }
        } else {
          updatedData[previousField] = previousAnswer;
        }
        console.log(`[Gemini Quote] Extracted ${previousField}:`, updatedData[previousField]);
      }

      const missingRequired = REQUIRED_FIELDS.filter(f => !updatedData[f]);
      const missingOptional = Object.keys(QUOTE_SCHEMA).filter(f => !REQUIRED_FIELDS.includes(f) && !updatedData[f]);
      
      const nextField = missingRequired[0] || missingOptional[0];
      const nextFieldConfig = nextField ? QUOTE_SCHEMA[nextField] : null;

      if (!nextField) {
        return {
          question: null,
          options: [],
          multi_select: false,
          input_type: null,
          collected_data: updatedData,
          is_complete: true,
          next_field: null
        };
      }

      const collectedSummary = Object.entries(updatedData)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      const prompt = `You are a friendly, conversational sales consultant for MartechDevs (a martech integration agency). You're having a natural chat to understand a prospect's needs for a quote.

CONTEXT:
${collectedSummary ? `What we know so far: ${collectedSummary}` : 'This is the start of our conversation.'}
${previousAnswer ? `They just told us: "${previousAnswer}"` : ''}

YOUR TASK:
Ask about their ${nextFieldConfig.description.toLowerCase()} in a natural, conversational way.

GUIDELINES:
- Sound like a real person, not a form
- Keep it under 25 words
- ${previousAnswer ? 'Briefly acknowledge what they said (2-4 words max) before asking' : 'Start with a warm greeting since this is the first question'}
- Be curious and helpful, not robotic
- Vary your phrasing - don't use "What is your..." format

EXAMPLE STYLES (don't copy exactly, be creative):
- "Nice! And which platforms are you looking to integrate?"
- "Got it. Curious - what's driving the urgency here?"
- "Makes sense. What tools are already in your stack?"

Generate just the question text:`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = result.response.text();
      console.log('[Gemini Quote] Raw response:', responseText.substring(0, 300));
      
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[Gemini Quote] JSON parse error, using fallback');
        parsed = { question: `What is your ${nextFieldConfig.description.toLowerCase()}?` };
      }

      const options = nextFieldConfig?.options 
        ? nextFieldConfig.options.map(o => ({ 
            value: o.toLowerCase().replace(/[^a-z0-9]+/g, '_'), 
            label: o 
          }))
        : [];

      return {
        question: parsed.question || `What is your ${nextFieldConfig.description.toLowerCase()}?`,
        options: options,
        multi_select: nextFieldConfig?.multiSelect || false,
        input_type: nextFieldConfig?.inputType || null,
        collected_data: updatedData,
        is_complete: false,
        next_field: nextField
      };
    } catch (error) {
      console.error('Gemini Quote Step error:', error.message);
      
      let updatedData = { ...collectedData };
      if (previousAnswer && previousField) {
        updatedData[previousField] = previousAnswer;
      }
      
      const missingRequired = REQUIRED_FIELDS.filter(f => !updatedData[f]);
      const nextField = missingRequired[0] || 'company_type';
      const fieldConfig = QUOTE_SCHEMA[nextField];
      
      const fallbackOptions = fieldConfig?.options 
        ? fieldConfig.options.map(o => ({ 
            value: o.toLowerCase().replace(/[^a-z0-9]+/g, '_'), 
            label: o 
          }))
        : [];
      
      const fallbackQuestions = {
        company_type: "Hey there! Let's put together a quote for you. What kind of company are you?",
        company_stage: "Nice! And where are you at in your journey - startup, growth, or enterprise?",
        platforms: "Which platforms do you need to integrate?",
        traffic: "Roughly how much monthly traffic are we talking?",
        dev_model: "Would you prefer we handle everything, or work alongside your team?",
        urgency: "What's your timeline looking like?",
        goals: "What are you hoping to achieve with this project?",
        tools: "What martech tools are you using or planning to use?",
        email: "Last thing - where should we send your quote?"
      };
      
      return {
        question: fallbackQuestions[nextField] || `Tell me about your ${fieldConfig?.description?.toLowerCase() || 'requirements'}`,
        options: fallbackOptions,
        multi_select: fieldConfig?.multiSelect || false,
        input_type: fieldConfig?.inputType || null,
        collected_data: updatedData,
        is_complete: false,
        next_field: nextField
      };
    }
  }

  async generateResponse(conversationHistory, customerMessage) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        systemInstruction: config.systemPrompt
      });

      const contents = this.buildContents(conversationHistory, customerMessage);

      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
        }
      });

      const response = result.response;
      const text = response.text();
      
      const needsHandoff = text.includes('[HANDOFF_REQUESTED]');
      const startQuoteFlow = text.includes('[START_QUOTE_FLOW]');
      const cleanText = text
        .replace('[HANDOFF_REQUESTED]', '')
        .replace('[START_QUOTE_FLOW]', '')
        .trim();

      return { 
        text: cleanText, 
        needsHandoff,
        startQuoteFlow,
        finishReason: response.candidates[0]?.finishReason
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  buildContents(conversationHistory, customerMessage) {
    const contents = [];

    for (const msg of conversationHistory) {
      if (msg.sender_type === 'customer') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.sender_type === 'ai') {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    if (typeof customerMessage === 'string') {
      contents.push({
        role: 'user',
        parts: [{ text: customerMessage }]
      });
    }

    return contents;
  }
}

export default new GeminiService();
