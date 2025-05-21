// routes/translateRoute.js or in server.js
const express = require("express");
const {translateJsonWithRawResponse} =  require('../utility/Translate.js');
const { translateAndSpeak } = require('../utility/Translate.js');

const router = express.Router();

router.post('/translate', async (req, res) => {
  const { jsonObject, targetLang } = req.body;

  if (!jsonObject || !targetLang) {
    return res.status(400).json({ error: "Missing jsonObject or targetLang" });
  }

  try {
    const { pipelineResponse, translatedJson } = await translateJsonWithRawResponse(jsonObject, targetLang);
    return res.json({ pipelineResponse, translatedJson });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ error: "Translation failed", message: error.message });
  }
});

// Route to handle translation and speech generation
router.post('/translate-and-speak', async (req, res) => {
  const { jsonObject, targetLang, sourceLang } = req.body; // Also get sourceLang from body

  // Basic validation for required parameters
  if (!jsonObject || !targetLang) {
    return res.status(400).json({ error: "Missing required parameters: jsonObject or targetLang" });
  }

  // Optional: Add validation that jsonObject is actually an object, targetLang/sourceLang are strings etc.
  if (typeof jsonObject !== 'object' || jsonObject === null) {
       return res.status(400).json({ error: "Invalid jsonObject format. Expected an object." });
  }
   if (typeof targetLang !== 'string' || targetLang.length === 0) {
       return res.status(400).json({ error: "Invalid targetLang. Expected a non-empty string." });
  }
  // sourceLang is optional, but if provided, validate it
  if (sourceLang !== undefined && typeof sourceLang !== 'string') {
       return res.status(400).json({ error: "Invalid sourceLang. Expected a string." });
  }


  try {
    // Call the translateAndSpeak function with the provided data
    // Pass sourceLang if provided, otherwise it defaults to 'en' within the function
    const { translatedJson, audioBuffer, pipelineResponse } = await translateAndSpeak(jsonObject, targetLang, sourceLang);

    // Encode the audio buffer to base64 before sending it in the JSON response
    let audioBase64 = null;
    if (audioBuffer instanceof Buffer) {
        audioBase64 = audioBuffer.toString('base64');
    } else if (audioBuffer !== null) {
        // Handle cases where audioBuffer might be something unexpected but not null
         console.warn("translateAndSpeak returned non-buffer audio data:", audioBuffer);
    }


    // Send the translated JSON and the base64 audio content back to the client
    return res.json({
      translatedJson: translatedJson, // The JSON object with translated strings
      audioContent: audioBase64, // The base64 encoded audio data (or null)
      pipelineResponse: pipelineResponse, // Include the full API response for debugging
    });

  } catch (error) {
    // Log the error on the server side
    console.error("Translation and TTS API error:", error);

    // Send an error response to the client
    // Avoid exposing full internal error details in production
    return res.status(500).json({
      error: "Failed to translate and generate speech",
      // Optionally include a specific message from the caught error,
      // but be cautious about leaking sensitive details.
      message: error.message || "An unexpected error occurred."
    });
  }
});

module.exports = router;
