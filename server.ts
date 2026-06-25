import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 files
  app.use(express.json({ limit: "50mb" }));
  
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Generate Agenda
  app.post("/api/generate-agenda", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "Missing fileData or mimeType" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            },
          },
          "Extract a structured meeting agenda from this document. Identify the stakeholders, the topics to cover, and the estimated time to spend on each topic in minutes."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stakeholders: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of participants or stakeholders for the meeting.",
              },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Topic title" },
                    description: { type: Type.STRING, description: "Brief description of what will be covered" },
                    timeMinutes: { type: Type.NUMBER, description: "Estimated time in minutes" },
                  },
                  required: ["title", "description", "timeMinutes"],
                },
                description: "The timeline of topics for the agenda.",
              },
            },
            required: ["stakeholders", "topics"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini");
      }
      const data = JSON.parse(text);
      res.json(data);
    } catch (error: any) {
      console.error("Error generating agenda:", error);
      res.status(500).json({ error: error.message || "Failed to generate agenda" });
    }
  });

  // API Route: Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, contextData } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are an expert meeting facilitator and executive assistant. Your role is to help the user prepare for their meeting based on the provided document/agenda context. Answer questions concisely and professionally. Context: " + (contextData ? JSON.stringify(contextData) : "None provided yet."),
        }
      });
      
      // We simulate history by sending the message. 
      // Note: @google/genai chat doesn't let us pass history easily in create(), 
      // wait, we can pass history in config, or we can just use generateContent for simplicity with full conversation history.
      // Let's just use generateContent with the full history since that's more flexible.
      
      const contents = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are an expert meeting facilitator and executive assistant. Your role is to help the user prepare for their meeting based on the provided document/agenda context. Answer questions concisely and professionally. Context: " + (contextData ? JSON.stringify(contextData) : "None provided yet."),
        }
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of response) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
      
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: error.message || "Failed to respond in chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
