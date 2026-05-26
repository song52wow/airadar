import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_NEWS } from "./src/data";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to lazy-initialize GoogleGenAI
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route 1: Generate dynamic AI Investor Report based on the day's 30 news items
  app.get("/api/analyst/report", async (req, res) => {
    try {
      const ai = getGeminiClient();

      const prompt = `你是一位顶尖的硬科技赛道（AI大模型、人形机器人、半导体芯片）核心投研合伙人。这里是今日（2026年5月25日）的所有行业投资快讯：
${JSON.stringify(INITIAL_NEWS, null, 2)}

请深度阅读并交叉关联上面的行业雷达快讯，输出今日的宏观半导体与 AI/具身智能投资简报。
请完全遵守下面的 JSON 格式和属性要求输出（输出必须是合法的 JSON 字符串，不做任何多余的包裹，可解析）：

- sentimentIndex: 市场整体情绪指数，取值 0 到 100 之间的整数（例如：85 代表高涨，40 代表低迷保守）
- marketVibe: 对今日硬科技市场总体氛围的一句话点评（15字以内）
- keyTakeaways: 3条今日最核心、高屋建瓴的硬科技赛道宏观投研洞察（每条 30-50 字，富有穿透力和前瞻眼光）
- trackAnalysis: 包含下述三个赛道的具体总结：
  - ai: 大模型与开源生态的最新演进及算力采购格局变化总结，并给出一句直接的买入/观望投资配置建议（60-90字）
  - robot: 人形机器人与具身智能在量产线、家庭端或者工信部标准制订上的演进解读评估（60-90字）
  - semiconductor: 半导体先进工艺（如 A16背面供电）、高宽带内存 HBM4 或通用 GPU 核心突破及订单对攻分析评估（60-90字）
- hotCompanies: 今日最值得投研跟踪的 4 家热门实体公司/股票代码（如 NVDA, TSMC, AAPL, 宇树科技 ），形式为字符串数组。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentimentIndex: {
                type: Type.INTEGER,
                description: "Market sentiment rating from 0 (extremely negative/prudent) to 100 (highly bullish/excited).",
              },
              marketVibe: {
                type: Type.STRING,
                description: "A succinct caption summarizing today's tech market atmosphere.",
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Three profound macroeconomic takeaways or trend signals from today's feeds.",
              },
              trackAnalysis: {
                type: Type.OBJECT,
                properties: {
                  ai: { type: Type.STRING },
                  robot: { type: Type.STRING },
                  semiconductor: { type: Type.STRING },
                },
                required: ["ai", "robot", "semiconductor"],
              },
              hotCompanies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 4 hot companies receiving the most dynamic structural boosts today.",
              },
            },
            required: ["sentimentIndex", "marketVibe", "keyTakeaways", "trackAnalysis", "hotCompanies"],
          },
        },
      });

      const responseText = response.text?.trim() || "{}";
      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Failed to generate investment report:", error);
      res.status(500).json({
        error: error.message || "Internal server error generating report.",
        isConfigError: error.message?.includes("GEMINI_API_KEY"),
      });
    }
  });

  // API Route 2: Grounded Q&A Chat Client with AI investment analyst
  app.post("/api/analyst/chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Missing required 'message' in request body." });
      }

      // We format custom chats seeded by today's events as background knowledge
      const systemInstruction = `你是一位精通人工智能、人形机器人、半导体芯片三大硬科技赛道的顶尖投资理财基金经理（花名：雷达大师）。你正在为大众及专业机构投资者提供今日最新动态的深度研判解答。
今天（2026年5月25日）的最新硬科技赛道行业雷达快讯如下（请将其作为最核心的实时事实依据）：
${JSON.stringify(INITIAL_NEWS, null, 2)}

【回答指南】：
- 使用友好、极其专业、富有逻辑、有条理且稍带幽默感的基金经理人设。
- 善于结合今日新闻的数据（如：1000亿美元星际之门，9.9万元 Unitree H1-E，A16 背面供电工艺，12层 HBM4）解答。
- 给出清晰敏锐的“黄金投资直觉”。
- 每次回答必须控制在 150 - 300 字之间（精炼至上，避免废话）。
- 如果用户提问的内容与今日快讯毫无关系、也不是关于这三个硬科技领域（AI、机器人、半导体），请幽默而温柔地提醒对方，并拉回到今日的主线行情上来。
- 直接输出 Markdown 文本，结构层次要清晰。`;

      // Structure contents with history
      const formattedContents = history.map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      // Append current message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "非常抱歉，雷达信号受到些许电磁波干扰，请您重新发送一次您的投资咨询。";
      res.json({ text });
    } catch (error: any) {
      console.error("Failed in analyst chat conversation:", error);
      res.status(500).json({
        error: error.message || "Internal server error in conversation.",
        isConfigError: error.message?.includes("GEMINI_API_KEY"),
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Track Radar Backend] Server listening at http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
