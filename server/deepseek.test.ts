import { describe, it, expect, beforeAll, vi } from 'vitest';
import axios from 'axios';

describe('DeepSeek API Integration', { timeout: 30000 }, () => {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

  beforeAll(() => {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable is not set');
    }
  });

  it('should authenticate with DeepSeek API', { timeout: 15000 }, async () => {
    const client = axios.create({
      baseURL: DEEPSEEK_BASE_URL,
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      // Make a simple test request to verify authentication
      const response = await client.post('/chat/completions', {
        model: 'deepseek-v4-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: 'Say "API connection successful" and nothing else.',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('choices');
      expect(response.data.choices).toHaveLength(1);
      expect(response.data.choices[0]).toHaveProperty('message');
      expect(response.data.choices[0].message).toHaveProperty('content');
      
      const content = response.data.choices[0].message.content;
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');

      console.log('✓ DeepSeek API authentication successful');
      console.log('✓ Response:', content.substring(0, 100));
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid DeepSeek API key. Please check your credentials.');
      }
      throw error;
    }
  });

  it('should handle bill analysis prompt', { timeout: 30000 }, async () => {
    const client = axios.create({
      baseURL: DEEPSEEK_BASE_URL,
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      const response = await client.post('/chat/completions', {
        model: 'deepseek-v4-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst. Respond with a brief HTML snippet for a bill analysis.',
          },
          {
            role: 'user',
            content: 'Create a sample bill analysis HTML report with 2 sections.',
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      expect(response.status).toBe(200);
      expect(response.data.choices[0].message.content).toContain('<');
      
      console.log('✓ Bill analysis prompt handled successfully');
    } catch (error) {
      throw error;
    }
  });
});
