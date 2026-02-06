import path from "node:path";

export type FormatOutputResult = {
  lines: string[];
  warnings: string[];
  isValid: boolean;
};

const NEGATIVE_KEYWORDS = [
  "bulgu yok",
  "sorun yok",
  "issue yok",
  "no issue",
  "not found",
  "not detected",
  "none",
  "yok",
];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

const extractReasonFromLine = (
  line: string,
  filename: string,
): string | null => {
  const normalizedLine = line.trim();
  if (!normalizedLine) {
    return null;
  }

  const filenamePattern = new RegExp(
    `${escapeRegExp(filename)}\\s*[:\\-]\\s*(.+)$`,
    "i",
  );
  const match = normalizedLine.match(filenamePattern);
  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
};

const parseLines = (analysis: string): string[] =>
  analysis
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const hasNegativeSignal = (reason: string): boolean => {
  const normalized = reason.toLowerCase();
  return NEGATIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const formatOutput = (
  analysis: string,
  imagePaths: string[],
): FormatOutputResult => {
  const warnings: string[] = [];
  const lines = parseLines(analysis);

  if (lines.length === 0) {
    warnings.push(
      "API yanıtı boş geldi veya satırlara ayrılamadı. Lütfen yanıt formatını kontrol edin.",
    );
  }

  const formattedLines = imagePaths.map((imagePath) => {
    const filename = path.basename(imagePath);
    const matchLine = lines.find((line) =>
      line.toLowerCase().includes(filename.toLowerCase()),
    );

    if (!matchLine) {
      warnings.push(
        `${filename} için yanıt bulunamadı. Satır, dosya adı ile başlamalıdır.`,
      );
      return `${filename} False - Yanıt bulunamadı.`;
    }

    const reason = extractReasonFromLine(matchLine, filename);
    if (!reason) {
      warnings.push(
        `${filename} için yanıt formatı eksik. ':' veya '-' sonrası açıklama bekleniyor.`,
      );
      return `${filename} False - Format eksik.`;
    }

    const verdict = hasNegativeSignal(reason) ? "False" : "True";
    return `${filename} ${verdict} - ${reason}`;
  });

  return {
    lines: formattedLines,
    warnings,
    isValid: warnings.length === 0,
  };
};
