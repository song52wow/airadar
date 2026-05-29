import type { AIClient, ChatOptions, ChatResult } from "../types";

function guessModel(baseUrl: string): string {
  if (baseUrl.includes("api.deepseek.com")) return "deepseek-chat";
  if (baseUrl.includes("api.minimax.chat")) return "abab6.5s-chat";
  if (baseUrl.includes("api.openai.com")) return "gpt-3.5-turbo";
  if (baseUrl.includes("open.bigmodel.cn")) return "glm-4-flash";
  if (baseUrl.includes("api.moonshot.cn")) return "moonshot-v1-8k";
  return "gpt-3.5-turbo";
}

export function createOpenAICompatClient(config: {
  apiKey: string;
  baseUrl: string;
  model?: string;
}): AIClient {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const model = config.model || guessModel(baseUrl);

  async function rawChat(options: ChatOptions): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];

    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }

    // If structured output is requested, add schema instruction to system prompt
    if (options.structuredOutput) {
      const schemaDesc = JSON.stringify(
        options.structuredOutput.schema,
        null,
        2
      );
      const schemaMsg = `你必须严格按照以下 JSON Schema 格式输出。只输出合法的 JSON，不要包含任何其他文本、markdown 标记或代码块：\n${schemaDesc}`;

      if (messages.length > 0 && messages[0].role === "system") {
        messages[0].content += "\n\n" + schemaMsg;
      } else {
        messages.unshift({ role: "system", content: schemaMsg });
      }
    }

    messages.push(...options.messages);

    const body: Record<string, unknown> = {
      model,
      messages,
    };

    if (options.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    if (options.structuredOutput) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `OpenAI-compat API error ${res.status}: ${errorText.slice(0, 200)}`
      );
    }

    const data = await res.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() || "";
    return text;
  }

  return {
    async chat(options: ChatOptions): Promise<ChatResult> {
      const text = await rawChat(options);

      // Strip reasoning tags (MiniMax M2.7, DeepSeek-R1, etc.)
      let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

      // Strip markdown code fences if present
      cleaned = cleaned
        .replace(/^```(?:json)?\s*\n?/im, "")
        .replace(/\n?```\s*$/, "")
        .trim();

      return { text: cleaned };
    },
  };
}
