export const buildPrompt = ({ imageCount, idList, languages }) => {
  const languageLine = languages.length
    ? `Languages under test: ${languages.join(", ")}`
    : "Languages under test: not specified";

  return `MOBILE APP VISUAL QA ANALYSIS TASK
Expert UI/UX Quality Review

CONTEXT:
You are a senior mobile app QA engineer specializing in i18n/l10n testing.
You have been provided ${imageCount} screenshots from the SAME mobile application.

APP CONTEXT:
- Platform: Android (Xiaomi Mi A1, Android 13)
- App Type: Industrial IoT pump monitoring and control
- Target Users: Professional engineers and technicians
- Critical Requirement: High precision in technical data display
- ${languageLine}

MISSION:
Inspect EVERY screenshot and identify ANY visual defects impacting usability,
especially those caused by localization. Be extremely thorough.

VISUAL DEFECTS TO DETECT (flag if user impact):
1) Text overflow/truncation (ellipsis, cut text, broken lines)
2) Text clipping (diacritics cut, descenders clipped)
3) Layout breaking (overlaps, elements out of viewport)
4) Alignment issues (misaligned labels/icons/headers)
5) Font rendering problems (size/weight inconsistencies)
6) Whitespace issues (crowded or excessive spacing)
7) Localization-specific (RTL issues, number/date/unit issues)

SCREENSHOTS (${imageCount} total):
  • ${idList}

OUTPUT FORMAT (STRICT):
[EXACT_FILENAME] [True/False] - [Reason in English, max 15 words]

True = No visual defects detected
False = Defect(s) found that negatively impact UX

BEGIN ANALYSIS NOW:`;
};
