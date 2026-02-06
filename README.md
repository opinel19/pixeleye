PixelEye is an intelligent command-line interface (CLI) designed to streamline the QA and localization process. By leveraging advanced Vision AI, it analyzes application screenshots to identify common UI friction points that traditional testing tools often miss.

Key Features:

Translation Integrity: Detects missing translations or placeholder strings.

Overflow Detection: Identifies text that breaks containers or gets clipped due to length.

Layout Quality: Flags poor readability, such as sub-optimal line wrapping (e.g., words split into 3+ lines).

Context-Aware Analysis: Understands the target language to ensure the UI adapts correctly to different script lengths.

## Quick Start

### Homebrew (macOS)

1. Install via Homebrew:
   ```bash
   brew install --formula https://raw.githubusercontent.com/opinel19/pixeleye/main/Formula/pixeleye.rb
   ```

2. Run the CLI:
   ```bash
   pixeleye
   ```

### npm (any platform)

1. Install globally from GitHub:
   ```bash
   npm install -g https://github.com/opinel19/pixeleye
   ```

2. Run the CLI:
   ```bash
   pixeleye
   ```

3. Follow the prompts to select provider, add API key, image paths, and languages.

> Windows note: if you see `EEXIST` for `pixeleye.ps1`, remove the existing file from
> `%APPDATA%\\npm\\pixeleye.ps1` or rerun the install with `npm install -g --force https://github.com/opinel19/pixeleye`.

### Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the CLI:
   ```bash
   npm start
   ```

## Notes

- Gemini and ChatGPT require valid API keys.
- Supported image types: PNG, JPG, JPEG, WEBP.
