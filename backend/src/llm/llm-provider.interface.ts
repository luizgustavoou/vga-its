/**
 * Interface de abstração para provedores de LLM.
 * Permite trocar o provedor (Ollama, OpenAI, Gemini) sem alterar regras de negócio.
 */
export interface Message {
  role: string;
  content: string;
}

export interface LLMProvider {
  /**
   * Envia uma lista de mensagens para o LLM e retorna a resposta.
   * @param messages - Histórico de mensagens (system, user, assistant)
   * @param format - Formato de saída opcional (ex: 'json')
   */
  chat(messages: Message[], format?: 'json'): Promise<string>;

  /**
   * Gera uma resposta a partir de um prompt simples.
   * @param prompt - Texto do prompt
   * @param context - Contexto adicional opcional
   */
  generate(prompt: string, context?: string): Promise<string>;
}

export const LLM_PROVIDER = 'LLM_PROVIDER';
