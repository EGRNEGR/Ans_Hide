import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in environment.");
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Live Gemini multimodal test endpoint for the simulator
app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, prompt, systemPrompt, model = "gemini-3.6-flash" } = req.body;

    const ai = getGeminiClient();

    const parts: any[] = [];
    if (prompt) {
      parts.push({ text: prompt });
    } else {
      parts.push({ text: "Проанализируй экран и ответь на главный вопрос." });
    }

    if (imageBase64) {
      // Remove data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: systemPrompt || "Ты — встроенный ассистент. Проанализируй скриншот окна браузера. Кратко, емко и по существу ответь на главный вопрос на экране (реши задачу, переведи текст или дай подсказку). Избегай лишней «воды», пиши сразу суть, так как ответ выводится в маленьком оверлее.",
        maxOutputTokens: 1200,
        temperature: 0.1,
      },
    });

    const reply = response.text || "Ответ не получен от модели.";
    res.json({ success: true, text: reply, model: "gemini-3.6-flash" });
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ошибка при обращении к Gemini API",
    });
  }
});

// Vite middleware in dev / static in prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
