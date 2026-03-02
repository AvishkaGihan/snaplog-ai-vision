import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeImageWithGemini(
  imageUrl: string,
  prompt: string,
): Promise<string> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageResp = await fetch(imageUrl);
  if (!imageResp.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResp.statusText}`);
  }
  const arrayBuffer = await imageResp.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    },
    { text: prompt },
  ]);

  return result.response.text();
}
