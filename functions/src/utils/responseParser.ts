export function stripMarkdownFences(rawText: string): string {
  const trimmed = rawText.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const withoutOpening = trimmed.replace(/^```(?:json)?\s*/i, "");
  return withoutOpening.replace(/\s*```\s*$/i, "").trim();
}

export function parseAIResponse(rawText: string): unknown {
  const cleanedText = stripMarkdownFences(rawText);
  return JSON.parse(cleanedText);
}
