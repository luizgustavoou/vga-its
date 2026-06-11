import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('OLLAMA_MODEL', 'llama3');
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaResponse;
      return data.response;
    } catch (error) {
      this.logger.error(`LLM generation failed: ${error.message}`);

      // Fallback: return a helpful message if Ollama is not available
      return this.getFallbackResponse(prompt);
    }
  }

  async chat(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      this.logger.error(`LLM chat failed: ${error.message}`);
      return this.getFallbackResponse(
        messages[messages.length - 1]?.content || '',
      );
    }
  }

  private getFallbackResponse(prompt: string): string {
    return (
      '🤖 *O serviço de IA está temporariamente indisponível.* ' +
      'Verifique se o Ollama está rodando e o modelo está carregado.\n\n' +
      'Para iniciar o Ollama:\n' +
      '```\ndocker compose up ollama\ndocker compose exec ollama ollama pull llama3\n```\n\n' +
      'Enquanto isso, posso te ajudar com o conceito que você está estudando. ' +
      'Tente reformular sua pergunta quando o serviço estiver disponível.'
    );
  }
}
