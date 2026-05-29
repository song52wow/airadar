export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StructuredOutput {
  schema: Record<string, unknown>;
}

export interface ChatOptions {
  messages: ChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  structuredOutput?: StructuredOutput;
}

export interface ChatResult {
  text: string;
}

export interface AIClient {
  chat(options: ChatOptions): Promise<ChatResult>;
}
