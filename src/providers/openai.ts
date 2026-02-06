import fs from "node:fs/promises";

import { ProviderError } from "./errors";
import type { AnalyzeImagesFn } from "./types";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const buildImagePart = async (imagePath: string) => {
  const buffer = await fs.readFile(imagePath);
  return {
    type: "image_url",
    image_url: {
      url: `data:image/png;base64,${buffer.toString("base64")}`,
    },
  };
};

export const analyzeImages: AnalyzeImagesFn = async ({
  apiKey,
  prompt,
  imagePaths,
}) => {
  try {
    const imageParts = await Promise.all(imagePaths.map(buildImagePart));
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }, ...imageParts],
          },
        ],
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new ProviderError(
          "OpenAI API anahtarınız geçersiz veya erişim izniniz yok.",
          "auth",
          { status: response.status, provider: "ChatGPT" },
        );
      }
      if (response.status === 429) {
        throw new ProviderError(
          "OpenAI API rate limit aşıldı. Lütfen biraz sonra tekrar deneyin.",
          "rate_limit",
          { status: response.status, provider: "ChatGPT" },
        );
      }
      throw new ProviderError(
        `OpenAI API hatası (${response.status}): ${message}`,
        "unknown",
        { status: response.status, provider: "ChatGPT" },
      );
    }

    const data = await response.json();
    const analysis =
      data?.choices?.[0]?.message?.content ?? "OpenAI yanıtı alınamadı.";

    return { provider: "ChatGPT", analysis, raw: data };
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new ProviderError(
      "OpenAI ağına ulaşılamadı. İnternet bağlantınızı kontrol edin.",
      "network",
      { provider: "ChatGPT" },
    );
  }
};
