export const buildPrompt = ({ imageCount, idList, languages }) => {
  const languageLine = languages.length
    ? languages.join(", ")
    : "Not specified";

  return `╔═══════════════════════════════════════════════════════════════════════════════╗
║                    MOBILE APP VISUAL QA ANALYSIS TASK                         ║
║                         Expert UI/UX Quality Review                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 CONTEXT:
You are a senior mobile app QA engineer specializing in internationalization (i18n) and
localization (l10n) testing. You have been provided ${imageCount} screenshots from the
SAME mobile application (Wilo-Smart Connect - Industrial Pump Control) translated into
multiple languages.

🎯 YOUR MISSION:
Perform a comprehensive visual quality inspection of EVERY SINGLE screenshot to identify
ANY visual defects that could negatively impact user experience, particularly those caused
by translation/localization issues.

📱 APP CONTEXT:
- Platform: Android (Xiaomi Mi A1, Android 13)
- App Type: Industrial IoT pump monitoring and control
- Target Users: Professional engineers and technicians
- Critical Requirement: High precision in technical data display
- Languages under test: ${languageLine}

🔍 VISUAL DEFECTS TO DETECT:

┌─ CRITICAL ISSUES (Must Flag) ─────────────────────────────────────────────┐
│                                                                             │
│ 1. TEXT OVERFLOW & TRUNCATION:                                            │
│    • Text extending beyond button/container boundaries                     │
│    • Labels cut off with ellipsis (...) or partial visibility             │
│    • Multi-line text breaking awkwardly                                    │
│    • Horizontal scrolling indicators on fixed-width elements               │
│                                                                             │
│ 2. TEXT CLIPPING:                                                          │
│    • Top/bottom of characters cut off (descenders like g, y, p)           │
│    • Accented characters (ü, ñ, ő, ș) partially hidden                    │
│    • Diacritics clipped or overlapping with container edges                │
│                                                                             │
│ 3. LAYOUT BREAKING:                                                        │
│    • UI elements overlapping incorrectly                                   │
│    • Buttons/cards pushed out of viewport                                  │
│    • Misaligned grids or uneven spacing                                    │
│    • Broken responsive layout (elements stacked incorrectly)               │
│                                                                             │
│ 4. ALIGNMENT ISSUES:                                                       │
│    • Text not center-aligned in buttons                                    │
│    • Icons misaligned with text labels                                     │
│    • Uneven margins/padding creating visual imbalance                      │
│    • Headers not properly aligned                                          │
│                                                                             │
│ 5. FONT RENDERING PROBLEMS:                                                │
│    • Inconsistent font sizes in same context                               │
│    • Incorrect font weights (too bold/thin)                                │
│    • Letter spacing too tight (text cramped)                               │
│    • Letter spacing too loose (text scattered)                             │
│    • Font fallback issues (wrong font family used)                         │
│                                                                             │
│ 6. WHITESPACE ISSUES:                                                      │
│    • Insufficient padding causing crowded appearance                        │
│    • Excessive whitespace creating disconnected UI                         │
│    • Uneven spacing between related elements                               │
│                                                                             │
│ 7. LOCALIZATION-SPECIFIC:                                                  │
│    • Text direction issues (RTL languages if present)                      │
│    • Number/date format inconsistencies                                    │
│    • Currency symbol placement errors                                      │
│    • Unit of measurement display problems                                  │
│    • Untranslated UI strings (e.g., English text in non-English screens)   │
│    • Wrong locale on screen (e.g., _tr screenshot still mostly English)    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

✅ ACCEPTABLE CONDITIONS (NOT Issues):
- Slight variations in text length across languages (expected in i18n)
- Different font rendering on various languages (as long as readable)
- Intentional design choices (e.g., minimal padding for compact design)
- Minor pixel-level imperfections that don't impact usability

⚠️ ANALYSIS GUIDELINES:

1. BE EXTREMELY THOROUGH: Examine EVERY UI element in each screenshot
2. FOCUS ON USER IMPACT: Only flag issues that harm usability/readability
3. CONSIDER LANGUAGE CONTEXT: Longer German words vs shorter English is normal
4. CHECK ALL ZONES: Top nav, content area, bottom nav, buttons, cards, lists
5. VERIFY TECHNICAL DATA: Numbers, units, values must be fully visible
6. ASSESS PROFESSIONAL STANDARDS: This is for industrial users, quality matters
7. VALIDATE SCREEN LANGUAGE: If filename indicates locale (e.g., *_tr.png), UI text must match that locale
8. FLAG MISSING TRANSLATION: Treat untranslated or fallback English strings as defects for target locales

📸 SCREENSHOTS TO ANALYZE (${imageCount} total):
  • ${idList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OUTPUT FORMAT (STRICTLY FOLLOW):

For EACH screenshot, provide ONE line in this EXACT format:

[EXACT_FILENAME] [True/False] - [Detailed reason in English]

• True  = No visual defects detected, UI is clean and professional
• False = Visual defect(s) found that negatively impact UX

📝 RESPONSE QUALITY REQUIREMENTS:

✓ Use EXACT filename from the list above (copy-paste to avoid typos)
✓ Provide SPECIFIC reason, not generic statements
✓ Mention EXACT UI zone and problematic text/value (e.g., header, button, bottom nav)
✓ Keep reason concise but informative (max 18 words)
✓ For locale mismatch, explicitly say which text appears untranslated/wrong-language

❌ BAD Examples:
  pump_dashboard_tr.png False - Issues found
  documents_page_de.png True - Good

✅ GOOD Examples:
  pump_dashboard_tr.png False - Button text "Ayarlar" extends beyond button boundary
  documents_page_de.png True - All text properly contained, no overflow detected
  pump_settings_nb.png False - Header "Pumpeinnstillinger" truncated with ellipsis
  monitoring_ro.png True - Clean layout, all elements aligned correctly
  settings_tr.png False - Title "Settings" is English, expected Turkish localization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 BEGIN ANALYSIS NOW:

Analyze all ${imageCount} screenshots systematically and provide your detailed assessment
below, one line per screenshot:`;
};
