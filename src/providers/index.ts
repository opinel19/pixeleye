import { ProviderError } from "./errors";
import { analyzeImages as analyzeGemini } from "./gemini";
import { analyzeImages as analyzeOpenAI } from "./openai";
import type { AnalyzeImagesInput, AnalyzeImagesResult } from "./types";

export type ProviderName = "Gemini" | "ChatGPT";

const providers: Record<ProviderName, (input: AnalyzeImagesInput) => Promise<AnalyzeImagesResult>> =
  {
    Gemini: analyzeGemini,
    ChatGPT: analyzeOpenAI,
  };

export const analyzeWithProvider = async (
  provider: ProviderName,
  input: AnalyzeImagesInput,
): Promise<AnalyzeImagesResult> => {
  const handler = providers[provider];
  return handler(input);
};

export const formatProviderError = (error: unknown): string => {
  if (error instanceof ProviderError) {
    return error.message;
  }
  return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
};
