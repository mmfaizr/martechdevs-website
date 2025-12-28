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

  async generateQuoteStep(previousAnswer, collectedData = {}) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: QUOTE_RESPONSE_SCHEMA,
          temperature: 0.85,
          maxOutputTokens: 800,
        }
      });

      const missingRequired = REQUIRED_FIELDS.filter(f => !collectedData[f]);
      const missingOptional = Object.keys(QUOTE_SCHEMA).filter(f => !REQUIRED_FIELDS.includes(f) && !collectedData[f]);
      
      const nextField = missingRequired[0] || missingOptional[0];
      const nextFieldConfig = nextField ? QUOTE_SCHEMA[nextField] : null;

      const schemaDescription = Object.entries(QUOTE_SCHEMA).map(([key, config]) => {
        let line = `- ${key}: ${config.description}`;
        if (REQUIRED_FIELDS.includes(key)) line += ' (REQUIRED)';
        if (config.options) line += `\n  OPTIONS: ${config.options.join(', ')}`;
        if (config.multiSelect) line += '\n  (user can select multiple)';
        if (config.inputType === 'email') line += '\n  (free text email input)';
        return line;
      }).join('\n');

      const prompt = `You are a friendly, conversational sales assistant for MartechDevs, a martech integration company. You're gathering information to generate a quote.

DATA SCHEMA (what we need to collect):
${schemaDescription}

ALREADY COLLECTED:
${Object.keys(collectedData).length > 0 ? Object.entries(collectedData).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join('\n') : 'Nothing yet'}

STILL NEEDED (required): ${missingRequired.length > 0 ? missingRequired.join(', ') : 'None - all required fields collected!'}
STILL NEEDED (optional): ${missingOptional.join(', ')}

NEXT FIELD TO ASK ABOUT: ${nextField || 'None - complete!'}
${nextFieldConfig?.options ? `USE THESE OPTIONS: ${JSON.stringify(nextFieldConfig.options.map(o => ({ value: o.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label: o })))}` : ''}
${nextFieldConfig?.multiSelect ? 'SET multi_select: true' : ''}
${nextFieldConfig?.inputType === 'email' ? 'SET input_type: "email" and options: []' : ''}

${previousAnswer ? `USER'S LAST ANSWER: "${previousAnswer}"` : 'This is the start of the conversation.'}

INSTRUCTIONS:
1. ${previousAnswer ? 'First, extract any data from their answer and put it in "collected" - match their answer to the closest option values' : 'Start with a warm, brief intro (1 sentence max) then ask your first question'}
2. Ask ONE question about "${nextField}" - use the OPTIONS provided above
3. Be conversational and natural - vary your phrasing, briefly acknowledge their previous answer (2-5 words max)
4. Return the exact options from the list above (use value/label format)
5. Keep your question under 40 words
6. If ALL required fields are collected, set is_complete: true

Generate your response:`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      const newCollected = { ...collectedData };
      if (parsed.collected) {
        Object.assign(newCollected, parsed.collected);
      }

      const stillMissing = REQUIRED_FIELDS.filter(f => !newCollected[f]);
      const isComplete = stillMissing.length === 0 && newCollected.email;

      return {
        question: parsed.question,
        options: parsed.options || [],
        multi_select: parsed.multi_select || false,
        input_type: parsed.input_type || null,
        collected_data: newCollected,
        is_complete: isComplete
      };
    } catch (error) {
      console.error('Gemini Quote Step error:', error);
      
      const missingRequired = REQUIRED_FIELDS.filter(f => !collectedData[f]);
      const nextField = missingRequired[0] || 'email';
      
      return {
        question: `Could you tell me about your ${QUOTE_SCHEMA[nextField].toLowerCase()}?`,
        options: [],
        multi_select: false,
        input_type: nextField === 'email' ? 'email' : null,
        collected_data: collectedData,
        is_complete: false
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
