import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, Message } from '../llm-provider.interface';

/**
 * Provider Gemini — implementação futura.
 * Para usar, defina LLM_PROVIDER=gemini e GEMINI_API_KEY no .env
 */
@Injectable()
export class GeminiProvider implements LLMProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-pro');
  }

  async chat(messages: Message[], format?: 'json'): Promise<string> {
    try {
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find(m => m.role === 'system');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            ...(systemInstruction ? {
              systemInstruction: { parts: [{ text: systemInstruction.content }] },
            } : {}),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              ...(format === 'json' ? { responseMimeType: 'application/json' } : {}),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      this.logger.error(`Gemini chat failed: ${error.message}`);
      throw error;
    }
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const messages: Message[] = [];
    if (context) {
      messages.push({ role: 'system', content: context });
    }
    messages.push({ role: 'user', content: prompt });
    return this.chat(messages);
  }
}
