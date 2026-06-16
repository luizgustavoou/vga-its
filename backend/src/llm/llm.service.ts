import { Injectable, Inject } from '@nestjs/common';
import type { LLMProvider } from './llm-provider.interface';
import { LLM_PROVIDER } from './llm-provider.interface';

/**
 * Serviço de LLM que delega para o provider configurado.
 * O provider é injetado via DI, permitindo trocar entre
 * Ollama, OpenAI, Gemini sem alterar regras de negócio.
 */
@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly provider: LLMProvider,
  ) {}

  async chat(
    messages: { role: string; content: string }[],
    format?: 'json',
  ): Promise<string> {
    return this.provider.chat(messages, format);
  }

  async generate(prompt: string, context?: string): Promise<string> {
    return this.provider.generate(prompt, context);
  }
}
