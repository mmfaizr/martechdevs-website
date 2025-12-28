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

class GeminiService {
  constructor() {
    this.client = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = config.gemini.model;
    this.quotePrompt = loadQuotePrompt();
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

  async generateQuoteQuestion({ topic, coveredTopics, previousAnswer, isFirst }) {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model
      });

      let prompt;
      if (isFirst) {
        prompt = `You are a friendly sales assistant for MartechDevs helping gather requirements for a quote.

Generate a warm, conversational opening message that:
1. Briefly introduces yourself
2. Asks about their ${topic}

Keep it under 40 words. Be friendly and natural, not robotic. Vary your phrasing.
Just respond with the message, nothing else.`;
      } else {
        prompt = `You are a friendly sales assistant for MartechDevs helping gather requirements for a quote.

The customer just told you: "${previousAnswer}"
Topics already covered: ${coveredTopics || 'none yet'}

Now ask about their ${topic}.

Rules:
1. Start with a brief, natural acknowledgment of their answer (2-5 words max)
2. Then ask about ${topic} in a conversational way
3. Keep the total response under 40 words
4. Be warm and friendly, not formal
5. Vary your phrasing - don't be predictable

Just respond with the message, nothing else.`;
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 100,
          topP: 0.95,
        }
      });

      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini Quote Question error:', error);
      throw new Error(`Failed to generate quote question: ${error.message}`);
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




