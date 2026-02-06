import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { analyzeWithProvider, formatProviderError } from "./providers";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });

const providers = ["Gemini", "ChatGPT"] as const;
const languageOptions = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

type LanguageCode = (typeof languageOptions)[number]["code"];

const formatLanguageList = () =>
  languageOptions.map((lang) => `${lang.code} (${lang.label})`).join(", ");

const parseLanguages = (input: string): LanguageCode[] => {
  const tokens = input
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const validCodes = new Set(languageOptions.map((lang) => lang.code));
  const invalid = tokens.filter((token) => !validCodes.has(token as LanguageCode));
  if (tokens.length === 0 || invalid.length > 0) {
    throw new Error(
      `Geçersiz dil seçimi. Mevcut seçenekler: ${formatLanguageList()}.`,
    );
  }
  return Array.from(new Set(tokens)) as LanguageCode[];
};

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
  if (!input) {
    throw new Error("Görsel yolu boş olamaz.");
  }
  const resolvedPath = path.resolve(input);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error("Belirtilen dosya bulunamadı.");
  }
  const stats = fs.statSync(resolvedPath);
  if (!stats.isFile()) {
    throw new Error("Belirtilen yol bir dosya olmalıdır.");
  }
  return resolvedPath;
};

const validatePrompt = (input: string): string => {
  if (!input) {
    throw new Error("Prompt boş olamaz.");
  }
  return input;
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

  console.log("\n--- Sonuç ---");
  console.log(`Sağlayıcı: ${provider}`);
  console.log(`API Key: ${"*".repeat(Math.min(apiKey.length, 8))}`);
  console.log(`Görsel: ${imagePath}`);
  console.log(`Diller: ${languages.join(", ")}`);

  try {
    const response = await analyzeWithProvider(provider, {
      apiKey,
      prompt: `${prompt}\nYanıtı şu dillerde ver: ${languages.join(", ")}.`,
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
