import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

const QUOTE_SCHEMA = {
  company_type: 'Type of company',
  company_stage: 'Company stage (early/growth/enterprise)',
  platforms: 'Platforms needing integration',
  traffic: 'Monthly traffic volume',
  dev_model: 'Full implementation or copilot',
  urgency: 'Project timeline',
  customer_locations: 'Customer locations',
  compliance: 'Compliance requirements',
  goals: 'Main goals',
  tools: 'Martech tools',
  documentation: 'Documentation needs',
  training_hours: 'Training hours',
  support_duration: 'Support duration',
  support_hours: 'Monthly support hours',
  email: 'Work email'
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

      const prompt = `You are a friendly, conversational sales assistant for MartechDevs, a martech integration company. You're gathering information to generate a quote.

DATA SCHEMA (what we need to collect):
${Object.entries(QUOTE_SCHEMA).map(([k, v]) => `- ${k}: ${v}${REQUIRED_FIELDS.includes(k) ? ' (REQUIRED)' : ''}`).join('\n')}

ALREADY COLLECTED:
${Object.keys(collectedData).length > 0 ? Object.entries(collectedData).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join('\n') : 'Nothing yet'}

STILL NEEDED (required): ${missingRequired.length > 0 ? missingRequired.join(', ') : 'None - all required fields collected!'}
STILL NEEDED (optional): ${missingOptional.join(', ')}

${previousAnswer ? `USER'S LAST ANSWER: "${previousAnswer}"` : 'This is the start of the conversation.'}

INSTRUCTIONS:
1. ${previousAnswer ? 'First, extract any data from their answer and put it in "collected"' : 'Start with a warm, brief intro (1 sentence) then ask your first question'}
2. Ask ONE question about the next missing field - prioritize required fields
3. Be conversational and natural - vary your phrasing, acknowledge their answers briefly
4. Provide helpful options when appropriate (but keep them concise)
5. For multi-choice questions (platforms, tools, goals), set multi_select: true
6. When asking for email, set input_type: "email" and options: []
7. If ALL required fields are collected, set is_complete: true

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
      const cleanText = text.replace('[HANDOFF_REQUESTED]', '').trim();

      return { 
        text: cleanText, 
        needsHandoff,
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
