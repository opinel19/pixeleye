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

const formatExampleOutput = (imagePaths: string[]): string => {
  if (imagePaths.length === 0) {
    return "1) <image-path>: <bulgu>";
  }
  return imagePaths
    .map((path, index) => `${index + 1}) ${path}: <bulgu>`)
    .join("\n");
};

const buildShortPrompt = ({
  basePrompt,
  languages,
  imagePaths,
}: BuildPromptOptions): string => {
  const example = formatExampleOutput(imagePaths);
  return [
    basePrompt,
    "",
    `Görseller (${imagePaths.length}):`,
    formatImageList(imagePaths),
    "",
    `Yanıtı şu dillerde ver: ${languages.join(", ")}.`,
    "Her ekran görüntüsü için tek satır olacak şekilde yanıt ver.",
    "Örnek çıktı:",
    example,
  ].join("\n");
};

const buildLongPrompt = ({
  basePrompt,
  languages,
  imagePaths,
}: BuildPromptOptions): string => {
  const example = formatExampleOutput(imagePaths);
  return [
    basePrompt,
    "",
    "Aşağıdaki görselleri sırayla değerlendir:",
    formatImageList(imagePaths),
    "",
    "Çıktı formatı:",
    "- Her ekran görüntüsü için tek satır.",
    "- Satırlar, görsel yolu ile başlamalı.",
    "- Her satır kısa, net ve bulguyu içermeli.",
    "",
    "Örnek çıktı (one line per screenshot):",
    example,
    "",
    `Yanıtı şu dillerde ver: ${languages.join(", ")}.`,
  ].join("\n");
};

export const buildPrompt = (options: BuildPromptOptions): string => {
  const version = options.version ?? "long";
  if (version === "short") {
    return buildShortPrompt(options);
  }
  return buildLongPrompt(options);
};
