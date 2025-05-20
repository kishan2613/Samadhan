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

module.exports = {
  translateJson,
  translateJsonWithRawResponse
};
