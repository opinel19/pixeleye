#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import inquirer from "inquirer";
import chalk from "chalk";
import { buildPrompt } from "./prompt.js";
import { analyzeWithGemini } from "./providers/gemini.js";
import { analyzeWithOpenAI } from "./providers/openai.js";
import { normalizeImagePaths, toDataUrls } from "./utils/images.js";

const PROVIDERS = {
  Gemini: "gemini",
  ChatGPT: "openai"
};

const LINE_REGEX = /^(.+?)\s+(True|False)\s*[-:–]\s*(.+)$/i;
const NO_ISSUE_HINTS = [
  "no issue",
  "no issues",
  "no visual defect",
  "clean layout",
  "all text properly",
  "sorun yok",
  "bulgu yok"
];

const normalizeLeadingDecorators = (line) =>
  line
    .replace(/^[-*•\d.)\s`\[\]]+/, "")
    .replace(/^\*\*(.+?)\*\*$/, "$1")
    .trim();

const inferVerdictFromReason = (reason) => {
  const normalized = reason.toLowerCase();
  return NO_ISSUE_HINTS.some((hint) => normalized.includes(hint));
};

const findFallbackLineForFilename = (filename, rawLines) => {
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filenameRegex = new RegExp(escaped, "i");
  return rawLines.find((line) => filenameRegex.test(line)) ?? null;
};

const parseAnalysisLines = (resultText, imagePaths) => {
  const expectedFiles = imagePaths.map((p) => path.basename(p));
  const rawLines = resultText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedMap = new Map();
  for (const rawLine of rawLines) {
    const line = normalizeLeadingDecorators(rawLine);
    const match = line.match(LINE_REGEX);
    if (!match) {
      continue;
    }

    const [, filenameRaw, verdictRaw, reasonRaw] = match;
    const filename = filenameRaw.trim();
    const verdict = verdictRaw.toLowerCase() === "true";
    const reason = reasonRaw.trim();
    parsedMap.set(filename.toLowerCase(), {
      filename,
      verdict,
      reason,
      rawLine: line
    });
  }

  return expectedFiles.map((filename) => {
    const found = parsedMap.get(filename.toLowerCase());
    if (found) {
      return found;
    }

    const fallbackLine = findFallbackLineForFilename(filename, rawLines);
    if (fallbackLine) {
      const reason = fallbackLine
        .replace(new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "")
        .replace(/^[\s:–-]+/, "")
        .trim();

      if (reason) {
        const verdict = inferVerdictFromReason(reason);
        return {
          filename,
          verdict,
          reason,
          rawLine: fallbackLine
        };
      }
    }

    return {
      filename,
      verdict: false,
      reason:
        "Model yanıtı tam formatta değildi; bu görsel için net sorun açıklaması alınamadı.",
      rawLine: `${filename} False - Model yanıtı tam formatta değildi; bu görsel için net sorun açıklaması alınamadı.`
    };
  });
};

const inferLanguageFromFilename = (filename) => {
  const name = filename.replace(/\.[^.]+$/, "");
  const parts = name.split(/[_-]/).filter(Boolean);
  if (parts.length === 0) {
    return "UNKNOWN";
  }
  return parts[parts.length - 1].toUpperCase();
};

const renderDetailedReport = (rows) => {
  const total = rows.length;
  const healthy = rows.filter((row) => row.verdict).length;
  const problematic = total - healthy;
  const healthyPct = total ? ((healthy / total) * 100).toFixed(1) : "0.0";
  const problematicPct = total ? ((problematic / total) * 100).toFixed(1) : "0.0";

  console.log(chalk.cyan("\n📊 Gemini/OpenAI Analiz Sonuçları:\n"));
  rows.forEach((row) => {
    const verdictWord = row.verdict ? "True" : "False";
    const line = `${row.filename} ${verdictWord} - ${row.reason}`;
    console.log(row.verdict ? chalk.green(line) : chalk.yellow(line));
  });

  console.log(chalk.gray("\n" + "═".repeat(90)));
  console.log(chalk.cyan.bold("                     📋 DETAYLI ANALİZ SONUÇLARI"));
  console.log(chalk.gray("═".repeat(90)));

  rows.forEach((row) => {
    if (row.verdict) {
      console.log(chalk.green(`✅ ${row.filename.padEnd(36)} │ SORUN YOK`));
      console.log(chalk.green(`   └─ ${row.reason}`));
    } else {
      console.log(chalk.yellow(`⚠️  ${row.filename.padEnd(36)} │ MANUEL İNCELE`));
      console.log(chalk.yellow(`   └─ SORUN: ${row.reason}`));
    }
    console.log();
  });

  console.log(chalk.gray("═".repeat(90)));
  console.log(chalk.cyan.bold("                           📈 GENEL ÖZET"));
  console.log(chalk.gray("═".repeat(90)));
  console.log(`📊 Toplam Analiz Edilen: ${total} görsel`);
  console.log(chalk.green(`✅ Sorunsuz: ${healthy} görsel (${healthyPct}%)`));
  console.log(chalk.yellow(`⚠️  Sorunlu: ${problematic} görsel (${problematicPct}%)`));

  const grouped = rows
    .filter((row) => !row.verdict)
    .reduce((acc, row) => {
      const lang = inferLanguageFromFilename(row.filename);
      if (!acc.has(lang)) {
        acc.set(lang, []);
      }
      acc.get(lang).push(row);
      return acc;
    }, new Map());

  if (grouped.size > 0) {
    console.log(chalk.gray("\n" + "═".repeat(90)));
    console.log(chalk.cyan.bold("               ⚠️  MANUEL İNCELEME GEREKTİREN GÖRSELLER"));
    console.log(chalk.gray("═".repeat(90)));

    for (const [lang, entries] of grouped.entries()) {
      console.log(chalk.yellow(`🌍 ${lang} (${entries.length} sorun):`));
      entries.forEach((entry) => {
        const name = entry.filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
        console.log(`  • ${name}`);
        console.log(`    └─ ${entry.reason}`);
      });
      console.log();
    }
  }
};

const main = async () => {
  console.log(chalk.cyan.bold("PixelEye - Visual QA CLI"));

  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Which AI provider do you want to use?",
      choices: ["Gemini", "ChatGPT"]
    }
  ]);

  const { apiKey } = await inquirer.prompt([
    {
      type: "password",
      name: "apiKey",
      message: "Enter your API key",
      mask: "*",
      validate: (value) => (value ? true : "API key is required.")
    }
  ]);

  const { imageInput } = await inquirer.prompt([
    {
      type: "input",
      name: "imageInput",
      message:
        "Enter image paths or a folder path (comma or newline separated)",
      validate: (value) => (value.trim() ? true : "Please provide at least one path.")
    }
  ]);

  const { languagesInput } = await inquirer.prompt([
    {
      type: "input",
      name: "languagesInput",
      message: "Enter languages to test (comma separated, e.g. en, de, tr)",
      validate: (value) => (value.trim() ? true : "Please provide at least one language.")
    }
  ]);

  const imagePaths = normalizeImagePaths(imageInput);
  if (imagePaths.length === 0) {
    console.error(chalk.red("No supported images found in the provided paths."));
    process.exit(1);
  }
  const invalidPaths = imagePaths.filter((p) => !fs.existsSync(p));
  if (invalidPaths.length > 0) {
    console.error(chalk.red("Some paths are invalid:"));
    invalidPaths.forEach((p) => console.error(chalk.red(`- ${p}`)));
    process.exit(1);
  }

  const languages = languagesInput
    .split(",")
    .map((lang) => lang.trim())
    .filter(Boolean);

  const idList = imagePaths.map((p) => path.basename(p)).join("\n  • ");
  const prompt = buildPrompt({
    imageCount: imagePaths.length,
    idList,
    languages
  });

  console.log(chalk.yellow("Preparing images..."));
  const imageDataUrls = await toDataUrls(imagePaths);

  console.log(chalk.yellow("Sending request..."));
  try {
    let result;
    if (PROVIDERS[provider] === "gemini") {
      result = await analyzeWithGemini({
        apiKey,
        prompt,
        imageDataUrls
      });
    } else {
      result = await analyzeWithOpenAI({
        apiKey,
        prompt,
        imageDataUrls
      });
    }

    const parsed = parseAnalysisLines(result, imagePaths);
    renderDetailedReport(parsed);
  } catch (error) {
    console.error(chalk.red("Analysis failed:"), error.message);
    process.exit(1);
  }
};

main();
