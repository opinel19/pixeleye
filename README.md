PixelEye is an intelligent command-line interface (CLI) designed to streamline the QA and localization process. By leveraging advanced Vision AI, it analyzes application screenshots to identify common UI friction points that traditional testing tools often miss.

Key Features:

Translation Integrity: Detects missing translations or placeholder strings.

Overflow Detection: Identifies text that breaks containers or gets clipped due to length.

Layout Quality: Flags poor readability, such as sub-optimal line wrapping (e.g., words split into 3+ lines).

Context-Aware Analysis: Understands the target language to ensure the UI adapts correctly to different script lengths.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the CLI:
   ```bash
   npm start
   ```

3. Follow the prompts to select provider, add API key, image paths, and languages.

## Notes

- Gemini and ChatGPT require valid API keys.
- Supported image types: PNG, JPG, JPEG, WEBP.
