import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/generate", async (req, res) => {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

  if (!topic || topic.length > 200) {
    return res.status(400).json({ error: "Topic must be between 1 and 200 characters." });
  }

  const prompt = `
Generate exactly 5 beginner-friendly flashcards about: ${topic}.

Return ONLY valid JSON in this exact format:
{
  "cards": [
    { "question": "...", "answer": "..." }
  ]
}
  `;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      if (!text) throw new Error("The AI returned an empty response.");

      const data = JSON.parse(text);
      if (
        !Array.isArray(data.cards) ||
        data.cards.length !== 5 ||
        data.cards.some(card =>
          typeof card?.question !== "string" || typeof card?.answer !== "string"
        )
      ) {
        throw new Error("The AI returned flashcards in an invalid format.");
      }

      return res.json(data);

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      const isTemporary =
        error.status === 503 ||
        error.status === 429 ||
        error.status === 500 ||
        error.status === 502 ||
        String(error.message).includes("high demand");

      if (!isTemporary) break;

      await new Promise(resolve => setTimeout(resolve, attempt * 5000));
    }
  }

  res.status(500).json({
    error: "AI service is busy. Please try again in a few minutes."
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
