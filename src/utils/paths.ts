import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

const SUPPORTED_IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const getMimeType = (filePath: string): string | null => {
  const extension = path.extname(filePath).toLowerCase();
  return SUPPORTED_IMAGE_TYPES[extension] ?? null;
};

export const resolveImagePath = (input: string): string => {
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

  try {
    fs.accessSync(resolvedPath, fs.constants.R_OK);
  } catch {
    throw new Error("Belirtilen dosyaya erişim izniniz yok.");
  }

  if (!getMimeType(resolvedPath)) {
    throw new Error(
      "Desteklenmeyen dosya türü. Yalnızca png, jpg, jpeg veya webp kabul edilir.",
    );
  }

  return resolvedPath;
};

type Base64ImagePayload = {
  base64: string;
  mimeType: string;
  resolvedPath: string;
};

export const readImageAsBase64 = async (
  imagePath: string,
): Promise<Base64ImagePayload> => {
  const resolvedPath = resolveImagePath(imagePath);
  const mimeType = getMimeType(resolvedPath);

  if (!mimeType) {
    throw new Error(
      "Desteklenmeyen dosya türü. Yalnızca png, jpg, jpeg veya webp kabul edilir.",
    );
  }

  const buffer = await fsPromises.readFile(resolvedPath);

  return {
    base64: buffer.toString("base64"),
    mimeType,
    resolvedPath,
  };
};

export const buildOpenAIImagePart = async (imagePath: string) => {
  const { base64, mimeType } = await readImageAsBase64(imagePath);
  return {
    type: "image_url",
    image_url: {
      url: `data:${mimeType};base64,${base64}`,
    },
  };
};

export const buildGeminiImagePart = async (imagePath: string) => {
  const { base64, mimeType } = await readImageAsBase64(imagePath);
  return {
    inlineData: {
      mimeType,
      data: base64,
    },
  };
};
