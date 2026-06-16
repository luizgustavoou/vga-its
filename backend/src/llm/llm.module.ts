import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

/**
 * Módulo LLM com factory provider.
 * Define qual provider usar com base na variável LLM_PROVIDER (padrão: ollama).
 *
 * Valores aceitos: 'ollama' | 'openai' | 'gemini'
 */
@Module({
  providers: [
    {
      provide: LLM_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const providerName = configService.get<string>('LLM_PROVIDER', 'ollama');

        switch (providerName) {
          case 'openai':
            return new OpenAIProvider(configService);
          case 'gemini':
            return new GeminiProvider(configService);
          case 'ollama':
          default:
            return new OllamaProvider(configService);
        }
      },
      inject: [ConfigService],
    },
    LlmService,
  ],
  exports: [LlmService],
})
export class LlmModule {}
