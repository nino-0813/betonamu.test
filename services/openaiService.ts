
import OpenAI from 'openai';
import { SYSTEM_INSTRUCTION } from '../constants';

export const getOpenAIApiKey = () => {
  // Viteでは import.meta.env を使用（VITE_ プレフィックスが必要）
  const key = (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
  return key;
};

export const hasOpenAIApiKey = () => getOpenAIApiKey().length > 0;

let openaiClient: OpenAI | null = null;

const getClient = () => {
  if (!openaiClient && hasOpenAIApiKey()) {
    openaiClient = new OpenAI({
      apiKey: getOpenAIApiKey(),
      dangerouslyAllowBrowser: true, // ブラウザから直接呼ぶ場合
    });
  }
  return openaiClient;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatStream {
  sendMessageStream: (message: string) => AsyncGenerator<string, void, unknown>;
}

export const startChat = (contextString: string): ChatStream | null => {
  const client = getClient();
  if (!client) return null;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `${SYSTEM_INSTRUCTION}\n\n【現在見ている商品の情報】\n${contextString}`,
  };

  const messages: ChatMessage[] = [systemMessage];

  return {
    async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
      if (!client) return;

      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
      };

      messages.push(userMessage);

      try {
        const stream = await client.chat.completions.create({
          model: 'gpt-4o-mini', // コスト効率の良いモデル。gpt-4oやgpt-3.5-turboも可
          messages: messages as any,
          temperature: 0.7,
          stream: true,
        });

        let assistantResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            assistantResponse += content;
            yield content;
          }
        }

        // アシスタントの応答を履歴に追加
        messages.push({
          role: 'assistant',
          content: assistantResponse,
        });
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    },
  };
};

