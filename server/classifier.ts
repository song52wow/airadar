import type { NewsItem } from "../src/types";
import type { RawRssItem } from "./rssFetcher";
import type { AIClient } from "./ai/types";

const BATCH_SIZE = 8;

// ============ Keyword-based fallback (no AI needed) ============

const TRACK_KEYWORDS: Record<"ai" | "robot" | "semiconductor", RegExp[]> = {
  ai: [
    /AI|大模型|GPT|LLM|深度学习|机器学习|NLP|计算机视觉|大语言模型|Claude|Gemini|ChatGPT/i,
    /生成式|多模态|transformer|开源模型|智能体|Agent|Copilot|DeepSeek|豆包|Kimi/i,
    /向量|embedding|语言模型|文本生成|图像生成|视频生成|语音识别|自然语言/i,
    /HuggingFace|OpenAI|Anthropic|智谱|零一万物|月之暗面|百川|通义|文心/i,
  ],
  robot: [
    /机器人|人形|具身智能|双足|灵巧手|伺服电机|减速器|自动化|Optimus|Figure|Unitree/i,
    /宇树|机械臂|AGV|AMR|无人驾驶|自动驾驶|传感器|步态|运动控制|触觉/i,
    /傅利叶|银河通用|优必选|智元|逐际动力|特斯拉.*机器|工业机器|服务机器/i,
  ],
  semiconductor: [
    /半导体|芯片|晶圆|光刻|纳米|EUV|HBM|台积电|英伟达|NVDA|AMD|ASML/i,
    /封装|流片|制程|晶体管|存储|DRAM|NAND|闪存|集成电路|SoC|GPU|CPU|NPU/i,
    /代工|Fab|摩尔线程|壁仞|博通|长江存储|中芯国际|三星.*晶圆|SK.?海力士/i,
    /Blackwell|MI400|CoWoS|背面供电|High-NA/i,
  ],
};

function classifyTrackByKeyword(title: string, description: string): "ai" | "robot" | "semiconductor" | null {
  const text = `${title} ${description}`;

  const scores: Record<string, number> = { ai: 0, robot: 0, semiconductor: 0 };

  for (const [track, patterns] of Object.entries(TRACK_KEYWORDS) as Array<
    ["ai" | "robot" | "semiconductor", RegExp[]]
  >) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[track] += matches.length;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? (best[0] as "ai" | "robot" | "semiconductor") : null;
}

function extractKeywordsByPattern(title: string): string[] {
  const patterns: Array<[RegExp, string]> = [
    [/大模型|LLM|GPT/i, "大模型"],
    [/人形|具身智能|双足/i, "人形机器人"],
    [/芯片|半导体|晶圆/i, "芯片"],
    [/GPU|算力|加速卡/i, "GPU"],
    [/HBM|存储|内存/i, "HBM"],
    [/光刻|EUV|纳米/i, "光刻"],
    [/融资|IPO|上市/i, "融资"],
    [/开源|闭源/i, "开源"],
  ];

  const keywords: string[] = [];
  for (const [pattern, keyword] of patterns) {
    if (pattern.test(title)) {
      keywords.push(keyword);
    }
  }
  return keywords.slice(0, 3);
}

function classifyByKeyword(rawItems: RawRssItem[]): NewsItem[] {
  const results: NewsItem[] = [];

  for (const raw of rawItems) {
    const track = classifyTrackByKeyword(raw.title, raw.description);
    if (!track) continue;

    results.push({
      id: `rss-${shortHash(raw.guid || raw.link || raw.title)}`,
      track,
      time: formatTime(raw.pubDate),
      source: raw.sourceLabel,
      summary: raw.title.slice(0, 50),
      details: raw.description.slice(0, 200),
      impact: "neutral",
      symbols: [],
      keywords: extractKeywordsByPattern(raw.title),
    });
  }

  console.log(
    `[classifier:keyword] Classified ${results.length}/${rawItems.length} items (no AI)`
  );
  return results;
}

// ============ AI-based classification ============

const CLASSIFY_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      guid: { type: "string" },
      track: { type: "string", enum: ["ai", "robot", "semiconductor"] },
      summary: { type: "string" },
      details: { type: "string" },
      impact: { type: "string", enum: ["positive", "neutral", "negative"] },
      symbols: { type: "array", items: { type: "string" } },
      keywords: { type: "array", items: { type: "string" } },
    },
    required: ["guid", "track", "summary", "details", "impact", "symbols", "keywords"],
  },
};

function buildClassifyPrompt(batch: RawRssItem[], today: string): string {
  return `你是一位硬科技赛道投资分析师。下面是来自中文科技媒体的新闻快讯列表。
请对每条新闻进行分类和标注，只保留与以下三大赛道相关的内容：
  - ai: AI大模型、机器学习、深度学习、NLP、计算机视觉、AI应用
  - robot: 人形机器人、具身智能、工业机器人、自动化
  - semiconductor: 半导体、芯片、晶圆、光刻、GPU、HBM、先进封装

对于每条相关新闻，输出 JSON 数组格式（无关内容则不包含在输出中）。

今日日期：${today}
新闻列表：
${JSON.stringify(
  batch.map((r) => ({ guid: r.guid, title: r.title, description: r.description, source: r.sourceLabel })),
  null,
  2
)}`;
}

async function classifyWithAI(
  rawItems: RawRssItem[],
  ai: AIClient
): Promise<NewsItem[]> {
  if (rawItems.length === 0) return [];

  const results: NewsItem[] = [];
  const today = new Date().toLocaleDateString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  for (let i = 0; i < rawItems.length; i += BATCH_SIZE) {
    const batch = rawItems.slice(i, i + BATCH_SIZE);

    try {
      const response = await ai.chat({
        messages: [{ role: "user", content: buildClassifyPrompt(batch, today) }],
        structuredOutput: { schema: CLASSIFY_SCHEMA },
      });

      const text = response.text;
      if (!text) continue;

      const parsed = JSON.parse(text);
      // Handle single object instead of array
      const classified = (Array.isArray(parsed) ? parsed : [parsed]) as Array<{
        guid: string;
        track: "ai" | "robot" | "semiconductor";
        summary: string;
        details: string;
        impact: "positive" | "neutral" | "negative";
        symbols: string[];
        keywords: string[];
      }>;

      const rawMap = new Map(batch.map((r) => [r.guid, r]));

      for (const c of classified) {
        const raw = rawMap.get(c.guid);
        if (!raw) continue;

        results.push({
          id: `rss-${shortHash(c.guid || raw.link || raw.title)}`,
          track: c.track,
          time: formatTime(raw.pubDate),
          source: raw.sourceLabel,
          summary: c.summary,
          details: c.details,
          impact: c.impact,
          symbols: c.symbols || [],
          keywords: c.keywords || [],
        });
      }
    } catch (err: any) {
      console.warn("[classifier:ai] Batch classification failed:", err.message);
    }
  }

  console.log(
    `[classifier:ai] Classified ${results.length}/${rawItems.length} items`
  );

  return results;
}

// ============ Main export ============

export async function classifyItems(
  rawItems: RawRssItem[],
  ai: AIClient | null
): Promise<NewsItem[]> {
  if (rawItems.length === 0) return [];

  if (ai) {
    try {
      return await classifyWithAI(rawItems, ai);
    } catch (err: any) {
      console.warn("[classifier] AI classification failed, falling back to keyword:", err.message);
    }
  }

  return classifyByKeyword(rawItems);
}

// ============ Utils ============

function formatTime(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });
  } catch {
    return new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

function shortHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
