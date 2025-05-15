// routes/ask.js
const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const FLASK_FAISS_URL  = "http://localhost:5001/ask";
const GEMINI_API_KEY   = "Put gemini key here ************";    // set in your env  

// POST /ask
router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Empty question" });
  }

  try {
    // 1) Get semantic context from your Flask FAISS service
    const faissResp = await axios.post(FLASK_FAISS_URL, { question });
    const { results } = faissResp.data;  // array of { score, text, source }

    // 2) Build a prompt for Gemini
    //    We include the top 5 snippets as context, then ask for a simple explanation.
    const contextText = results
      .map((r, i) => `Context ${i+1} (source: ${r.source}):\n${r.text}`)
      .join("\n\n");

    const geminiPrompt = `
User’s question:
"${question}"

Based on the following contexts, please frame a clear, simple solution for the user. 
Explain in very easy language, and include at least one illustrative example.

${contextText}
`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: geminiPrompt,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // 4) Extract the generated text and return it
    const rawText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Raw extracted text:", rawText);

    // Extract multiple JSON blocks
    const jsonMatches = rawText.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatches && jsonMatches[1]) {
      try {
        const jsonString = jsonMatches[1].trim();
        const parsedObject = JSON.parse(jsonString);
        return res.json({ question, answer: parsedObject });
      } catch (err) {
        console.error("Error parsing JSON block:", err);
      }
    }

    // 6) Fallback: Just return raw explanation
    return res.json({
      question,
      answer: { explanation: rawText.trim() },
    });

  } catch (error) {
    console.error("Error in /ask:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate answer" });
  }
});

module.exports = router;
