import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase the payload size limit to accommodate base64 images
  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Routes
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Image and mimeType are required" });
      }

      // Remove data URI prefix if present
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze the uploaded image and extract any actionable information. Categorize them into tasks, meetings, reminders, and notes. If you cannot find any, return empty arrays.",
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                description: "Actionable tasks found in the image",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING, description: "Low, Medium, or High" }
                  },
                  required: ["title"]
                }
              },
              meetings: {
                type: Type.ARRAY,
                description: "Meetings, appointments, or scheduled events found in the image",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    date: { type: Type.STRING },
                    time: { type: Type.STRING },
                    attendees: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title"]
                }
              },
              reminders: {
                type: Type.ARRAY,
                description: "Reminders or things to keep in mind found in the image",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    time: { type: Type.STRING }
                  },
                  required: ["title"]
                }
              },
              notes: {
                type: Type.ARRAY,
                description: "General information, reference material, or notes found in the image",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["title", "content"]
                }
              }
            },
            required: ["tasks", "meetings", "reminders", "notes"]
          }
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: "Failed to generate content" });
      }

      const extractedData = JSON.parse(text);
      res.json(extractedData);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during analysis" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
