import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase the payload size limit to accommodate base64 images
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add it to your environment variables." });
      }

      // Initialize Gemini client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const { image, mimeType, text: inputText, clientDate } = req.body;
      if (!image && !inputText) {
        return res.status(400).json({ error: "Image or text is required" });
      }

      const contents = [];
      if (image && mimeType) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
      
      if (inputText) {
        contents.push({ text: `Analyze the following text:\n\n${inputText}` });
      }

      const currentDate = clientDate || new Date().toString();
      
      contents.push({
        text: `Analyze the provided content and extract actionable information. Categorize into tasks, meetings, reminders, and notes. Always preserve original wording wherever possible; do not summarize unless necessary.

Current Date and Time context for relative date resolution: ${currentDate}

CRITICAL PROCESSING ORDER FOR EACH EXTRACTED TASK INDEPENDENTLY:
Step 1: Extract Task independently. Do not determine dates before separating the tasks.
Step 2: Extract explicit date. Look for specific dates (e.g., 28 June) or relative date words (e.g., Today, Tomorrow, Tonight, Day after tomorrow, Next Monday).
Step 3: Extract explicit time.
Step 4: Resolve relative date expressions into YYYY-MM-DD format using the Current Date context above. Examples: Today -> Current Date, Tomorrow -> Current Date + 1 Day. Relative date words must ONLY affect the task in which they appear. Never reuse the previous task's date.
Step 5: If the task has NO explicit date but has an explicit time, leave dueDate empty (the system will automatically assign Today's Date later). If it has neither date nor time, leave both empty.

OUTPUT FORMAT:
- dueDate: YYYY-MM-DD (ONLY if found in Step 2 and resolved in Step 4)
- dueTime: HH:MM in 24-hour format (ONLY if found in Step 3)
- Never apply one task's date or time to another task. Each task must resolve its own date independently.`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
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
                    priority: { type: Type.STRING, description: "Low, Medium, or High" },
                    dueDate: { type: Type.STRING, description: "YYYY-MM-DD. ONLY if clearly visible/mentioned." },
                    dueTime: { type: Type.STRING, description: "HH:MM (24-hour). ONLY if clearly visible/mentioned." },
                    dueDateSource: { type: Type.STRING, description: "Always 'Extracted' if dueDate is populated." },
                    dueTimeSource: { type: Type.STRING, description: "Always 'Extracted' if dueTime is populated." }
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

      // Apply Date & Time Rules for Tasks
      if (extractedData.tasks && Array.isArray(extractedData.tasks)) {
        extractedData.tasks.forEach((task: any) => {
          const hasDate = !!task.dueDate;
          const hasTime = !!task.dueTime;

          if (hasDate && hasTime) {
            // Rule 1: Use both exactly as extracted.
            task.dueDateSource = "Extracted";
            task.dueTimeSource = "Extracted";
          } else if (!hasDate && hasTime) {
            // Rule 2: If ONLY Time is present, automatically assign Today's Date
            const today = new Date(currentDate);
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            task.dueDate = `${year}-${month}-${day}`;
            task.dueDateSource = "Auto";
            task.dueTimeSource = "Extracted";
          } else if (hasDate && !hasTime) {
            // Rule 3: If ONLY Date is present, use extracted date. Leave Time blank.
            task.dueDateSource = "Extracted";
            delete task.dueTime;
            delete task.dueTimeSource;
          } else {
            // Rule 4: If neither exists, leave both empty.
            delete task.dueDate;
            delete task.dueTime;
            delete task.dueDateSource;
            delete task.dueTimeSource;
          }
        });
      }

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
