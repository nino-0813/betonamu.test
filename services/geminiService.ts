
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export const getGeminiApiKey = () => {
  const key = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  return key;
};

export const hasGeminiApiKey = () => getGeminiApiKey().length > 0;

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

export const startChat = (contextString: string) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\n【現在見ている商品の情報】\n${contextString}`,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    },
  });
};
