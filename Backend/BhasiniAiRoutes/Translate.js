// routes/translateRoute.js or in server.js
const express = require("express");
const {translateJsonWithRawResponse} =  require('../utility/Translate.js');

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

module.exports = router;
