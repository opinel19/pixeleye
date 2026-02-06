import fs from "node:fs/promises";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export const normalizeImagePaths = (input) =>
  input
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
};

export const toDataUrls = async (paths) => {
  const dataUrls = [];
  for (const filePath of paths) {
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      throw new Error(
        `Unsupported file extension for ${filePath}. Supported: ${[
          ...SUPPORTED_EXTENSIONS
        ].join(", ")}`
      );
    }
    const buffer = await fs.readFile(filePath);
    const base64 = buffer.toString("base64");
    const mimeType = getMimeType(filePath);
    dataUrls.push(`data:${mimeType};base64,${base64}`);
  }
  return dataUrls;
};
