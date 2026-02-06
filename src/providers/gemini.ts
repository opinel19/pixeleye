import { ProviderError } from "./errors";
import type { AnalyzeImagesFn } from "./types";
import { buildGeminiImagePart } from "../utils/paths";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

export const analyzeImages: AnalyzeImagesFn = async ({
  apiKey,
  prompt,
  imagePaths,
}) => {
  try {
    const imageParts = await Promise.all(
      imagePaths.map(buildGeminiImagePart),
    );
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, ...imageParts] }],
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new ProviderError(
          "Gemini API anahtarınız geçersiz veya erişim izniniz yok.",
          "auth",
          { status: response.status, provider: "Gemini" },
        );
      }
      if (response.status === 429) {
        throw new ProviderError(
          "Gemini API rate limit aşıldı. Lütfen biraz sonra tekrar deneyin.",
          "rate_limit",
          { status: response.status, provider: "Gemini" },
        );
      }
      throw new ProviderError(
        `Gemini API hatası (${response.status}): ${message}`,
        "unknown",
        { status: response.status, provider: "Gemini" },
      );
    }

    const data = await response.json();
    const analysis =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Gemini yanıtı alınamadı.";

    return { provider: "Gemini", analysis, raw: data };
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new ProviderError(
      "Gemini ağına ulaşılamadı. İnternet bağlantınızı kontrol edin.",
      "network",
      { provider: "Gemini" },
    );
  }
};
