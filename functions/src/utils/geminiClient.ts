import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Creates and returns a `GoogleGenerativeAI` client instance using the
 * `GEMINI_API_KEY` environment variable (set as a Firebase Function secret).
 *
 * @returns An initialised `GoogleGenerativeAI` instance.
 * @throws {Error} If `GEMINI_API_KEY` is not set in the environment.
 */
export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Fetches an image from `imageUrl`, encodes it as base64, and sends it
 * together with a text `prompt` to the `gemini-2.5-flash` model (v1beta API).
 *
 * The image is transmitted as an `inlineData` part (base64-encoded JPEG/PNG)
 * rather than a URL reference to avoid any server-side URL access restrictions.
 *
 * @param imageUrl - HTTPS URL of the item image hosted in Firebase Cloud Storage.
 * @param prompt - The system/user prompt that instructs Gemini to return JSON.
 * @returns The raw text response from Gemini (may contain a JSON block wrapped
 *   in a markdown code fence — use `parseAIResponse` to extract the JSON).
 * @throws {Error} If the image fetch fails (non-200 status) or the Gemini API
 *   call throws (network error, quota exceeded, etc.).
 */
export async function analyzeImageWithGemini(imageUrl: string, prompt: string): Promise<string> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }, { apiVersion: 'v1beta' });

  const imageResp = await fetch(imageUrl);
  if (!imageResp.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResp.statusText}`);
  }
  const arrayBuffer = await imageResp.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

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
