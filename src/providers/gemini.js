const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

export const analyzeWithGemini = async ({ apiKey, prompt, imageDataUrls }) => {
  const parts = [
    { text: prompt },
    ...imageDataUrls.map((dataUrl) => {
      const [meta, data] = dataUrl.split(",");
      const mimeMatch = meta.match(/data:(.*);base64/);
      return {
        inline_data: {
          mime_type: mimeMatch ? mimeMatch[1] : "image/png",
          data
        }
      };
    })
  ];

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ??
    "";
  return text || "No response received from Gemini.";
};
