export const languageOptions = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

export type LanguageCode = (typeof languageOptions)[number]["code"];

export const formatLanguageList = (): string =>
  languageOptions.map((lang) => `${lang.code} (${lang.label})`).join(", ");

export const parseLanguages = (input: string): LanguageCode[] => {
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
