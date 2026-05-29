import { GoogleGenAI, Type } from "@google/genai";
import type { AIClient, ChatOptions, ChatResult } from "../types";

// Convert JSON Schema to Gemini Type format
function toGeminiType(schema: Record<string, unknown>): any {
  function convert(obj: unknown): any {
    if (typeof obj !== "object" || obj === null) {
      return { type: Type.STRING };
    }

    const o = obj as Record<string, any>;

    function mapType(t: string): any {
      switch (t) {
        case "string": return Type.STRING;
        case "integer": case "number": return Type.INTEGER;
        case "boolean": return Type.BOOLEAN;
        default: return Type.STRING;
      }
    }

    const jsonType = o.type as string;

    if (jsonType === "array") {
      return {
        type: Type.ARRAY,
        items: o.items ? convert(o.items) : { type: Type.STRING },
      };
    }

    if (jsonType === "object" || o.properties) {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      if (o.properties) {
        for (const [key, val] of Object.entries(o.properties)) {
          properties[key] = convert(val);
        }
      }
      if (o.required) {
        required.push(...(o.required as string[]));
      }
      return { type: Type.OBJECT, properties, required };
    }

    // Primitive with enum constraint
    if (o.enum) {
      return { type: mapType(jsonType || "string"), enum: o.enum };
    }

    // Plain primitive
    if (jsonType) {
      return { type: mapType(jsonType) };
    }

    return { type: Type.STRING };
  }

  return convert(schema);
}

export function createGeminiClient(config: {
  apiKey: string;
  model?: string;
}): AIClient {
  const model = config.model || "gemini-3.5-flash";
  const ai = new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: {
      headers: { "User-Agent": "aistudio-build" },
    },
  });

  return {
    async chat(options: ChatOptions): Promise<ChatResult> {
      const { messages, systemInstruction, temperature, structuredOutput } =
        options;

      // Convert messages to Gemini format
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const genConfig: any = {};
      if (systemInstruction) genConfig.systemInstruction = systemInstruction;
      if (temperature !== undefined) genConfig.temperature = temperature;

      if (structuredOutput) {
        genConfig.responseMimeType = "application/json";
        genConfig.responseSchema = toGeminiType(structuredOutput.schema);
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: genConfig,
      });

      const text = response.text?.trim() || "{}";
      return { text };
    },
  };
}
