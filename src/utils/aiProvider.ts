/**
 * Format a provider + model into a human-readable label for display.
 * Example: ("openai-compat", "MiniMax-M2.7")  -> "MiniMax M2.7"
 *          ("gemini", "gemini-3.5-flash")      -> "Gemini 3.5 Flash"
 *          ("openai-compat", "deepseek-chat")  -> "DeepSeek Chat"
 *          ("openai-compat", "abab6.5s-chat")  -> "MiniMax 6.5s Chat"
 *
 * Falls back to the provider name if no model is configured.
 */
const FAMILY_BRAND: Record<string, string> = {
  gemini: "Gemini",
  claude: "Claude",
  gpt: "GPT",
  deepseek: "DeepSeek",
  minimax: "MiniMax",
  qwen: "Qwen",
  llama: "Llama",
  abab: "MiniMax", // MiniMax's internal model family
};

export function formatModelLabel(provider: string, model?: string | null): string {
  if (!model) {
    if (provider === "gemini") return "Gemini";
    if (provider === "openai-compat") return "OpenAI Compatible";
    return provider;
  }
  // Detect known family prefix and strip it (case-insensitive, original case preserved in suffix).
  const lower = model.toLowerCase();
  let family: string | null = null;
  let rest = model;
  for (const [key, brand] of Object.entries(FAMILY_BRAND)) {
    if (lower.startsWith(key)) {
      family = brand;
      rest = model.slice(key.length).replace(/^[-_]+/, "");
      break;
    }
  }
  // Split the suffix on - or _; title-case alphabetic tokens, leave mixed/alphanumeric as-is
  // so that "M2.7", "4o", "3.5" stay readable.
  const tokens = rest.split(/[-_]+/).filter(Boolean);
  const pretty = tokens
    .map((t) => (/^[a-zA-Z]+$/.test(t) ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t))
    .join(" ");
  return [family, pretty].filter(Boolean).join(" ");
}

/**
 * Name of the env var that holds the API key for the given provider.
 * Used in offline-mode hints to tell the user exactly which env var to set.
 */
export function apiKeyEnvName(provider: string): string {
  if (provider === "openai-compat") return "AI_API_KEY";
  // gemini (and the legacy default)
  return "AI_API_KEY";
}
