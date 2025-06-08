// utils/translation.js

const fetch = require('node-fetch');

/**
 * Recursively extracts all string values from a JSON-like object and stores their paths.
 * @param {*} obj - The input object or array.
 * @param {Array} basePath - Internal use: path tracking during recursion.
 * @returns {Array<{ path: Array<string|number>, text: string }>}.
 */
function flattenStrings(obj, basePath = []) {
  const entries = [];
  if (typeof obj === "string") { 
    entries.push({ path: basePath, text: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      entries.push(...flattenStrings(item, basePath.concat(index)));
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      // Only flatten strings or nested structures
      if (typeof value === 'string' || typeof value === 'object') {
        entries.push(...flattenStrings(value, basePath.concat(key)));
      }
    });
  }
  return entries;
}

/**
 * Reconstructs a JSON object from a flat list of path-text pairs.
 * @param {*} template - The original structure to guide reconstruction.
 * @param {Array<{ path: Array<string|number>, text: string }>} translatedEntries
 * @returns {*} - Rebuilt object with translated text.
 */
function rebuildObject(template, translatedEntries) {
  // Start with full deep clone of original template to preserve non-string fields
  const result = JSON.parse(JSON.stringify(template));

  function setAtPath(obj, path, value) {
    const [head, ...rest] = path;
    if (rest.length === 0) {
      obj[head] = value;
    } else {
      setAtPath(obj[head], rest, value);
    }
  }

  translatedEntries.forEach(({ path, text }) => {
    setAtPath(result, path, text);
  });

  return result;
}

/**
 * Translates a JSON object using the Bhashini pipeline API.
 * Returns both the translated object and the full raw API response.
 * @param {*} jsonObject - The input object containing strings.
 * @param {string} targetLang - Target language code (e.g., 'hi', 'gu').
 * @returns {{ pipelineResponse: object, translatedJson: object }}
 */
async function translateJsonWithRawResponse(jsonObject, targetLang) {
  const entries = flattenStrings(jsonObject);

  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: "en",
            targetLanguage: targetLang
          },
          serviceId: "ai4bharat/indictrans-v2-all-gpu--t4"
        }
      }
    ],
    inputData: {
      input: entries.map(({ text }) => ({ source: text }))
    }
  };

  const response = await fetch(
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "KKu_EaZ6tl7oEvIxtbSFwhLyDUTFr2GvWsdq08LoSCmHqOFuW4Fz8ho-pP7bgXVj"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(`Translation API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const pipelineResponse = data.pipelineResponse || data;

  const translatedTexts =
    (pipelineResponse[0]?.output || []).map(item => item.target) || [];

  const translatedEntries = entries.map((entry, index) => ({
    path: entry.path,
    text: translatedTexts[index] ?? entry.text
  }));

  const translatedJson = rebuildObject(jsonObject, translatedEntries);

  return { pipelineResponse, translatedJson };
}

/**
 * Translates a JSON object to a specified language using the Bhashini pipeline API.
 * Returns only the translated object.
 * @param {*} jsonObject - The input object containing strings.
 * @param {string} targetLang - Target language code (e.g., 'hi', 'ta').
 * @returns {*} - Translated object.
 */
async function translateJson(jsonObject, targetLang) {
  const { translatedJson } = await translateJsonWithRawResponse(jsonObject, targetLang);
  return translatedJson;
}

/**
 * @param {*} jsonObject - The input object containing strings to translate.
 * @param {string} targetLang - Target language code for translation and TTS (e.g., 'hi', 'gu').
 * @param {string} [sourceLang='en'] - Source language code for translation. Defaults to 'en'.
 * @returns {Promise<{ translatedJson: object, audioBuffer: Buffer | null, pipelineResponse: object }>}
 *          Returns an object containing the translated JSON, the audio buffer (or null if audio failed),
 *          and the full raw pipeline response for debugging/inspection.
 * @throws {Error} If the API request fails or the response structure is unexpected.
 */
async function translateAndSpeak(jsonObject, targetLang, sourceLang = 'en') {
  const entries = flattenStrings(jsonObject);
  // Create an array of input objects, each with a 'source' property containing the text
  const sourceTexts = entries.map(({ text }) => ({ source: text }));

  const nmtServiceId = "ai4bharat/indictrans-v2-all-gpu--t4"; // Translation service ID
  const ttsServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"; // TTS service ID

  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
          },
          serviceId: nmtServiceId
          // Add specific configs if required by the translation service (e.g., model ID)
        }
      },
      {
        taskType: "tts",
        config: {
          language: {
            sourceLanguage: targetLang // TTS source language is the translation target language
             // Add sourceScriptCode if required by the TTS service config for this language
          },
          serviceId: ttsServiceId,
          gender: "male", // Or "female" if needed and supported
          samplingRate: 8000, // As specified, common sample rate
          audioFormat: "wav", // Common format, ensure it matches API output
          encoding: "base64" // Requesting base64 encoding for easy handling
          // Add specific configs if required by the TTS service (e.g., model ID)
        }
      }
    ],
    inputData: {
        // The inputData field provides the input for the *first* task in the pipeline (translation)
        // The output of the translation task is implicitly used as input for the TTS task by the API
        input: sourceTexts
    }
  };

   // Ensure fetch is available (if not global in your Node version, uncomment require('node-fetch'))
   if (typeof fetch === 'undefined') {
        console.error("Fetch is not defined. Please ensure node-fetch is available or use a compatible environment.");
        throw new Error("Fetch API is not available. Cannot make HTTP requests.");
    }


  const response = await fetch(
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // IMPORTANT: THIS API KEY SHOULD BE SECURED.
        // DO NOT HARDCODE IN FRONTEND/CLIENT-SIDE CODE.
        // Use environment variables (e.g., process.env.BHASHINI_API_KEY)
        // or a secure configuration approach in a backend service.
        "Authorization": "KKu_EaZ6tl7oEvIxtbSFwhLyDUTFr2GvWsdq08LoSCmHqOFuW4Fz8ho-pP7bgXVj"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    // Get text body for more detailed error info from the API
    const errorBody = await response.text();
    throw new Error(`Translation/TTS API request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  // The API response structure has 'pipelineResponse' at the top level containing an array of task results
  const pipelineResponse = data.pipelineResponse;

  // Validate the expected structure
  if (!pipelineResponse || !Array.isArray(pipelineResponse) || pipelineResponse.length < 2) {
      console.error("Unexpected API response structure for translateAndSpeak:", JSON.stringify(data, null, 2));
      throw new Error("Unexpected API response structure. Expected pipelineResponse array with translation and TTS outputs.");
  }

  // Find the output for each task type in the response array
  const translationTaskResult = pipelineResponse.find(task => task.taskType === 'translation');
  const ttsTaskResult = pipelineResponse.find(task => task.taskType === 'tts');

  // --- Process Translation Results ---
  const translatedTexts = translationTaskResult?.output?.map(item => item.target) || [];

  // Map the translated texts back to the original structure based on the original entry paths
  const translatedEntries = entries.map((entry, index) => ({
    path: entry.path,
    // Use the translated text from the API response if available,
    // otherwise fallback to the original text from the input object.
    text: translatedTexts[index] ?? entry.text
  }));

  // Reconstruct the full JSON object with translated strings
  const translatedJson = rebuildObject(jsonObject, translatedEntries);

  // --- Process TTS Results ---
  let audioBuffer = null;
  // Check if the TTS task result exists and has audio content
 const audioBase64Output =
  ttsTaskResult?.audio?.[1]?.audioContent ??
  ttsTaskResult?.audio?.[0]?.audioContent ??
  null;


  if (audioBase64Output) {
     try {
        // Decode the base64 string into a Node.js Buffer
        audioBuffer = Buffer.from(audioBase64Output, 'base64');
     } catch (e) {
        console.error("Failed to decode base64 audio from TTS response:", e);
        // audioBuffer remains null if decoding fails
     }
  } else {
      console.warn("TTS audio content not found in the API response for translateAndSpeak.");
      // audioBuffer remains null
  }

  // Return both the translated JSON and the audio Buffer
  return { translatedJson, audioBuffer, pipelineResponse: data }; // Also returning raw response for completeness/debugging
}

module.exports = {
  translateJson,
  translateJsonWithRawResponse,
  translateAndSpeak
};
