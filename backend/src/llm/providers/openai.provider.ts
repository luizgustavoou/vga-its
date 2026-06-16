import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMProvider, Message } from '../llm-provider.interface';

/**
 * Provider OpenAI — implementação futura.
 * Para usar, defina LLM_PROVIDER=openai e OPENAI_API_KEY no .env
 */
@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo');
  }

  async chat(messages: Message[], format?: 'json'): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          ...(format === 'json' ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      this.logger.error(`OpenAI chat failed: ${error.message}`);
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
