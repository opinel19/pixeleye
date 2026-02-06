const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export const analyzeWithOpenAI = async ({ apiKey, prompt, imageDataUrls }) => {
  const content = [
    { type: "text", text: prompt },
    ...imageDataUrls.map((url) => ({
      type: "image_url",
      image_url: { url }
    }))
  ];

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
      temperature: 0.2,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "No response received from OpenAI.";
};
