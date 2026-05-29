import type { AIClient } from "./types";
import { createGeminiClient } from "./backends/gemini";
import { createOpenAICompatClient } from "./backends/openai-compat";

let cachedClient: AIClient | null = null;

export function getAIClient(): AIClient | null {
  if (cachedClient) return cachedClient;

  const provider = process.env.AI_PROVIDER || "gemini";
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || undefined;

  if (!apiKey) return null;

  if (provider === "openai-compat") {
    const baseUrl = process.env.AI_BASE_URL;
    if (!baseUrl) {
      console.warn("[ai/client] AI_BASE_URL required for openai-compat provider");
      return null;
    }
    cachedClient = createOpenAICompatClient({ apiKey, baseUrl, model });
  } else {
    // Default: gemini
    cachedClient = createGeminiClient({ apiKey, model });
  }

  console.log(`[ai/client] Using provider=${provider} model=${model || "auto"}`);
  return cachedClient;
}
