PixelEye is an intelligent command-line interface (CLI) designed to streamline the QA and localization process. By leveraging advanced Vision AI, it analyzes application screenshots to identify common UI friction points that traditional testing tools often miss.

Key Features:

Translation Integrity: Detects missing translations or placeholder strings.

Overflow Detection: Identifies text that breaks containers or gets clipped due to length.

Layout Quality: Flags poor readability, such as sub-optimal line wrapping (e.g., words split into 3+ lines).

Context-Aware Analysis: Understands the target language to ensure the UI adapts correctly to different script lengths.

## Quick Start

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


## Automated npm publish (GitHub Actions)

This repository now includes a workflow at `.github/workflows/publish.yml` that publishes to npm when you publish a GitHub Release.

### One-time setup

1. Create an npm access token (Automation token recommended).
2. In GitHub, go to **Settings → Secrets and variables → Actions** and add:
   - `NPM_TOKEN`: your npm token
3. Ensure package ownership matches `package.json` name (`@opinel19/pixeleye`).

### Release flow

1. Bump version locally and push:
   ```bash
   npm version patch
   git push --follow-tags
   ```
2. Create/publish a GitHub Release for that tag.
3. Workflow runs and publishes the package to npm automatically.

> If your npm org/package is not public, adjust `npm publish --access public` in the workflow.

