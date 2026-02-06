import path from "node:path";
import type { LanguageCode } from "../i18n/languages";

type PromptVersion = "short" | "long";

type BuildPromptOptions = {
  basePrompt: string;
  languages: LanguageCode[];
  imagePaths: string[];
  version?: PromptVersion;
};

const formatImageList = (imagePaths: string[]): string =>
  imagePaths.map((path, index) => `${index + 1}) ${path}`).join("\n");

const MAX_FULL_IMAGE_LIST = 12;

const formatImageSummary = (imagePaths: string[]): string => {
  const idList = imagePaths.map((_, index) => `${index + 1}`).join(", ");
  const fileNames = imagePaths.map((imagePath) => path.basename(imagePath));
  return [`idList: ${idList}`, `dosya adları: ${fileNames.join(", ")}`].join(
    "\n",
  );
};

const formatImages = (imagePaths: string[]): string => {
  if (imagePaths.length > MAX_FULL_IMAGE_LIST) {
    return formatImageSummary(imagePaths);
  }
  return formatImageList(imagePaths);
};

const normalizeCriticalDefects = (basePrompt: string): string => {
  const lines = basePrompt.split("\n");
  const output: string[] = [];
  let inCriticalList = false;
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeader = /^kritik defekt listesi\b/i.test(trimmed);
    if (isHeader) {
      inCriticalList = true;
      seen.clear();
      output.push(line);
      continue;
    }

    const isBullet = /^[-*•]\s+/.test(trimmed);
    if (inCriticalList && isBullet) {
      const item = trimmed.replace(/^[-*•]\s+/, "").trim();
      if (!seen.has(item)) {
        seen.add(item);
        output.push(`- ${item}`);
      }
      continue;
    }

    if (inCriticalList && trimmed === "") {
      inCriticalList = false;
    }

    output.push(line);
  }

  return output.join("\n").trim();
};

const formatExampleOutput = (imagePaths: string[]): string => {
  const examples = imagePaths.length === 0 ? ["<image-path>"] : imagePaths;
  return examples
    .slice(0, 2)
    .map((path, index) => `${index + 1}) ${path}: <bulgu>`)
    .join("\n");
};

const buildShortPrompt = ({
  basePrompt,
  languages,
  imagePaths,
}: BuildPromptOptions): string => {
  const normalizedPrompt = normalizeCriticalDefects(basePrompt);
  const example = formatExampleOutput(imagePaths);
  return [
    "Başlık: Görsel QA analizi",
    `Görev: ${normalizedPrompt}`,
    "Çıktı formatı:",
    "- Her görsel için tek satır: <görsel-id> <bulgu>",
    "Örnek çıktı (1-2 satır):",
    example,
    "",
    `Görseller (${imagePaths.length}):`,
    formatImages(imagePaths),
    "",
    `Yanıt dili: ${languages.join(", ")}.`,
  ].join("\n");
};

const buildLongPrompt = ({
  basePrompt,
  languages,
  imagePaths,
}: BuildPromptOptions): string => {
  const normalizedPrompt = normalizeCriticalDefects(basePrompt);
  const example = formatExampleOutput(imagePaths);
  return [
    "Başlık: Görsel QA analizi",
    `Görev: ${normalizedPrompt}`,
    "Çıktı formatı:",
    "- Her görsel için tek satır: <görsel-id> <bulgu>",
    "- Satırlar kısa ve net olmalı.",
    "",
    "Örnek çıktı (1-2 satır):",
    example,
    "",
    `Görseller (${imagePaths.length}):`,
    formatImages(imagePaths),
    "",
    `Yanıt dili: ${languages.join(", ")}.`,
  ].join("\n");
};

export const buildPrompt = (options: BuildPromptOptions): string => {
  const version = options.version ?? "long";
  if (version === "short") {
    return buildShortPrompt(options);
  }
  return buildLongPrompt(options);
};
