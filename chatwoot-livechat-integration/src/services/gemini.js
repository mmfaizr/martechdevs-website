import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadQuotePrompt = () => {
  try {
    return readFileSync(join(__dirname, '../config/system-prompts/quote-flow.txt'), 'utf-8');
  } catch (error) {
    console.warn('Could not load quote flow prompt');
    return '';
  }
};

const QUOTE_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    question: {
      type: "string",
      description: "A friendly, conversational question to ask the user about the topic. Should be natural and varied, not robotic."
    },
    options: {
      type: "array",
      description: "List of options for the user to choose from",
      items: {
        type: "object",
        properties: {
          value: {
            type: "string",
            description: "A short snake_case identifier for this option"
          },
          label: {
            type: "string",
            description: "Human-readable label to display"
          }
        },
        required: ["value", "label"]
      }
    },
    multiSelect: {
      type: "boolean",
      description: "Whether the user can select multiple options"
    },
    inputType: {
      type: ["string", "null"],
      description: "If set to 'email', show a text input instead of options"
    }
  },
  required: ["question", "options", "multiSelect"]
};

class GeminiService {
  constructor() {
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = config.gemini.model;
    this.quotePrompt = loadQuotePrompt();
  }

  async generateQuoteQuestion({ topic, topicId, defaultOptions, coveredTopics, previousAnswer, isFirst, isEmailStep, multiSelect }) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: QUOTE_QUESTION_SCHEMA,
          temperature: 0.9,
          maxOutputTokens: 500,
        }
      });

      let prompt;
      if (isEmailStep) {
        prompt = `You are a friendly sales assistant for MartechDevs wrapping up a quote conversation.

The customer has answered all the questions. Now ask for their work email to send the quote.

Generate a warm, natural closing question asking for their email. Be appreciative of their time.

Return JSON with:
- question: Your friendly message asking for email
- options: [] (empty array since this is a text input)
- multiSelect: false
- inputType: "email"`;
      } else if (isFirst) {
        prompt = `You are a friendly sales assistant for MartechDevs helping gather requirements for a quote.

Generate a warm, conversational opening message that:
1. Briefly introduces yourself (1 sentence max)
2. Asks about their ${topic}

The available options for this question are:
${defaultOptions.map(o => `- ${o.label}`).join('\n')}

Return JSON with:
- question: Your friendly opening message and question (under 50 words total)
- options: Use these exact options: ${JSON.stringify(defaultOptions)}
- multiSelect: ${multiSelect}
- inputType: null`;
      } else {
        prompt = `You are a friendly sales assistant for MartechDevs helping gather requirements for a quote.

The customer just told you: "${previousAnswer}"
Topics already covered: ${coveredTopics || 'none yet'}

Now ask about their ${topic}.

The available options for this question are:
${defaultOptions.map(o => `- ${o.label}`).join('\n')}

Generate JSON with:
- question: Start with a brief, natural acknowledgment (2-5 words), then ask about ${topic} conversationally. Keep under 40 words total.
- options: Use these exact options: ${JSON.stringify(defaultOptions)}
- multiSelect: ${multiSelect}
- inputType: null`;
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      
      if (!parsed.options || parsed.options.length === 0) {
        parsed.options = defaultOptions;
      }
      
      parsed.multiSelect = multiSelect;

      return parsed;
    } catch (error) {
      console.error('Gemini Quote Question error:', error);
      return {
        question: isFirst 
          ? `Hey there! Let's get you a quick quote. First, what type of company are you?`
          : `Got it! Now, tell me about your ${topic}?`,
        options: defaultOptions || [],
        multiSelect: multiSelect || false,
        inputType: isEmailStep ? 'email' : null
      };
    }
  }

  async generateQuoteResponse(conversationHistory, customerMessage) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        systemInstruction: this.quotePrompt
      });

      const contents = this.buildContents(conversationHistory, customerMessage);

      const result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
          topP: 0.95,
        }
      });

      const response = result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      let quoteData = null;
      let displayText = text;
      
      if (jsonMatch) {
        try {
          quoteData = JSON.parse(jsonMatch[1]);
          displayText = text.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
        } catch (e) {
          console.warn('Failed to parse quote JSON:', e.message);
        }
      }

      return { 
        text: displayText, 
        quoteData,
        isComplete: quoteData?.complete || false
      };
    } catch (error) {
      console.error('Gemini Quote API error:', error);
      throw new Error(`Failed to generate quote response: ${error.message}`);
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
