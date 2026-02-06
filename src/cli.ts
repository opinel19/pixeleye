import readline from "node:readline";

import {
  formatLanguageList,
  parseLanguages,
} from "./i18n/languages";
import { analyzeWithProvider, formatProviderError } from "./providers";
import { buildPrompt } from "./prompts/qaPrompt";
import { resolveImagePath } from "./utils/paths";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

const providers = ["Gemini", "ChatGPT"] as const;
type PromptVersion = "short" | "long";

const validateProvider = (input: string): (typeof providers)[number] => {
  const normalized = input.toLowerCase();
  if (normalized === "1" || normalized === providers[0].toLowerCase()) {
    return providers[0];
  }
  if (normalized === "2" || normalized === providers[1].toLowerCase()) {
    return providers[1];
  }
  throw new Error("Geçersiz seçim. 1 veya 2 girin.");
};

const validateApiKey = (input: string): string => {
  if (!input) {
    throw new Error("API anahtarı boş olamaz.");
  }
  return input;
};

const validateImagePath = (input: string): string => {
  return resolveImagePath(input);
};

const validatePrompt = (input: string): string => {
  if (!input) {
    throw new Error("Prompt boş olamaz.");
  }
  return input;
};

const validatePromptVersion = (input: string): PromptVersion => {
  const normalized = input.trim().toLowerCase();
  if (normalized === "kisa" || normalized === "short" || normalized === "1") {
    return "short";
  }
  if (normalized === "uzun" || normalized === "long" || normalized === "2") {
    return "long";
  }
  throw new Error("Geçersiz seçim. 1 (kısa) veya 2 (uzun) girin.");
};

const promptUntilValid = async <T>(
  question: string,
  validator: (input: string) => T,
): Promise<T> => {
  while (true) {
    const answer = await ask(question);
    try {
      return validator(answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Geçersiz giriş.";
      console.log(`\nHata: ${message}\n`);
    }
  }
};

const run = async () => {
  console.log("PixelEye CLI hoş geldiniz!\n");
  console.log("1) Gemini");
  console.log("2) ChatGPT\n");

  const provider = await promptUntilValid(
    "Sağlayıcı seçin (1/2): ",
    validateProvider,
  );

  const apiKey = await promptUntilValid(
    "API anahtarınızı girin: ",
    validateApiKey,
  );

  const imagePath = await promptUntilValid(
    "Görsel dosya yolunu girin: ",
    validateImagePath,
  );

  const prompt = await promptUntilValid(
    "Analiz promptunu girin: ",
    validatePrompt,
  );

  console.log(`\nDesteklenen diller: ${formatLanguageList()}\n`);

  const languages = await promptUntilValid(
    "Dil(ler)i virgülle ayırarak girin (örn. tr,en): ",
    parseLanguages,
  );

  const promptVersion = await promptUntilValid(
    "Prompt uzunluğu seçin (1=kısa, 2=uzun): ",
    validatePromptVersion,
  );

  console.log("\n--- Sonuç ---");
  console.log(`Sağlayıcı: ${provider}`);
  console.log(`API Key: ${"*".repeat(Math.min(apiKey.length, 8))}`);
  console.log(`Görsel: ${imagePath}`);
  console.log(`Diller: ${languages.join(", ")}`);
  console.log(`Prompt sürümü: ${promptVersion}`);

  try {
    const response = await analyzeWithProvider(provider, {
      apiKey,
      prompt: buildPrompt({
        basePrompt: prompt,
        languages,
        imagePaths: [imagePath],
        version: promptVersion,
      }),
      imagePaths: [imagePath],
    });
    console.log("\n--- Analiz ---");
    console.log(response.analysis);
  } catch (error) {
    console.error(`\nHata: ${formatProviderError(error)}`);
  }

  console.log("\nİşlem tamamlandı.");

  rl.close();
};

run().catch((error) => {
  console.error("Beklenmeyen bir hata oluştu:", error);
  rl.close();
  process.exitCode = 1;
});
