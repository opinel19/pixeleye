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

    console.log(chalk.green("\nAnalysis Result:\n"));
    console.log(result.trim());
  } catch (error) {
    console.error(chalk.red("Analysis failed:"), error.message);
    process.exit(1);
  }
};

main();
