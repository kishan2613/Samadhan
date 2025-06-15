const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data"); // Although less used now, keep it for potential future use or other routes
const router = express.Router();
const upload = multer(); // uses memory storage
const Buffer = require('buffer').Buffer; // Import Buffer for Base64 conversion

// Import the ffmpeg installer package
const ffmpeg = require('fluent-ffmpeg'); // For audio conversion
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Tell fluent-ffmpeg to use the bundled ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import Buffer for Base64 conversion


/**
 * Converts audio buffer (any format FFmpeg supports) to FLAC format (16kHz mono) 
 * and returns its base64 representation.
 * This function will now serve as your primary audio preparation utility for ASR.
 * @param {Buffer} audioBuffer - Original audio buffer
 * @returns {Promise<string>} - Base64 encoded FLAC audio
 */
async function convertToFlacBase64(audioBuffer) {
  return new Promise((resolve, reject) => {
    // Create temporary file paths with unique names to avoid conflicts
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Use a generic input file name for FFmpeg to auto-detect format
    const uniqueId = uuidv4();
    // Using a specific extension might help ffmpeg detect the input format better,
    // but .temp often works. If issues persist with specific formats, you might
    // try adding the original file extension if available (file.originalname).
    const inputPath = path.join(tempDir, `input-${uniqueId}.temp`); 
    const outputPath = path.join(tempDir, `output-${uniqueId}.flac`);
    
    // Write the buffer to a temporary file
    fs.writeFileSync(inputPath, audioBuffer);
    console.log(`Temp input file created: ${inputPath}`);

    // Convert to FLAC format using ffmpeg
    ffmpeg(inputPath)
      .audioFrequency(16000) // Set sampling rate to 16kHz for better ASR compatibility
      .audioChannels(1)      // Convert to mono for better ASR compatibility
      .format('flac')        // Output format: FLAC
      .save(outputPath)      // Save to output path
      .on('error', (err) => {
        console.error(`FFmpeg Error for ${inputPath}:`, err.message);
        // Clean up temp files
        try {
          // Check existence before unlinking to prevent errors during cleanup
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          console.log(`Cleaned up temp files: ${inputPath}, ${outputPath}`);
        } catch (cleanupErr) {
          console.error('Error during cleanup:', cleanupErr);
        }
        // Check if the error is specifically "Cannot find ffmpeg"
        if (err.message.includes("Cannot find ffmpeg")) {
             reject(new Error(`FFmpeg executable not found. Ensure it's installed or the installer package works correctly. Details: ${err.message}`));
        } else {
            reject(new Error(`FLAC conversion error: ${err.message}`));
        }
      })
      .on('end', () => {
        console.log(`FFmpeg conversion successful: ${outputPath}`);
        try {
          // Read the FLAC file and convert to base64
          const flacBuffer = fs.readFileSync(outputPath);
          const base64Data = flacBuffer.toString('base64');
          console.log(`Converted FLAC file to Base64, length: ${base64Data.length}`);
          
          // Clean up temp files
          // Check existence before unlinking
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          console.log(`Cleaned up temp files: ${inputPath}, ${outputPath}`);
          
          resolve(base64Data);
        } catch (err) {
          console.error(`Error reading or encoding FLAC file ${outputPath}:`, err.message);
          // Clean up on error
          try {
             // Check existence before unlinking
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            console.log(`Cleaned up temp files after error: ${inputPath}, ${outputPath}`);
          } catch (cleanupErr) {
            console.error('Error during cleanup after error:', cleanupErr);
          }
          reject(new Error(`Error processing converted FLAC file: ${err.message}`));
        }
      });
  });
}

// Load environment variables or define constants
// Ensure your API key is securely managed (e.g., via environment variables in production)
const BHASINI_API_KEY = "KKu_EaZ6tl7oEvIxtbSFwhLyDUTFr2GvWsdq08LoSCmHqOFuW4Fz8ho-pP7bgXVj"; // Use your actual API key
const BHASINI_PIPELINE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

// Service IDs provided by the user
const NMT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"; // For both targetLang->en and en->targetLang
const TTS_SERVICE_ID = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"; 
const ASR_SERVICE_ID_FOR_TARGET_LANG = "ai4bharat/conformer-hi-gpu--t4"; // <<<--- REPLACE THIS - ENSURE THIS ASR SERVICE SUPPORTS FLAC@16kHz

// Helper function to call your existing /ask route
async function askEnglish(question, fileContent = null) {
  console.log("Asking local /ask route with question:", question);
  let enhancedQuestion = question;
  if (fileContent && fileContent.trim()) {
    enhancedQuestion = `${question}\n\nUser has provided this reference file content:\n${fileContent}`;
    console.log("Enhanced question with file content, total length:", enhancedQuestion.length);
  }
  try {
    const resp = await axios.post(
      "http://localhost:5000/ask/azure", // Make sure this is your actual /ask route
      { question: enhancedQuestion },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("/ask response status:", resp.status);
    // Log part of the response data to see its structure
    console.log("/ask response data (partial):", JSON.stringify(resp.data, null, 2).substring(0, 500) + '...');
    return resp.data; // Expected format: { question, answer: { explanation: "..."} } or similar
  } catch (error) {
    console.error("Error calling local /ask route:", error.response?.data || error.message);
    throw new Error("Failed to get answer from local service");
  }
}

router.post("/", upload.single("audio"), async (req, res) => {
  const { file } = req;
  const targetLang = req.query.lang;

  if (!file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  if (!targetLang) {
    return res.status(400).json({ error: "Missing target language code ('lang' query parameter)" });
  }

  let fileContent = null;


  try {
    // Check if file content is provided in the request body
    if (req.body && req.body.fileContent) {
      fileContent = req.body.fileContent;
      console.log("File content received in request body, length:", fileContent.length);
    } else if (req.body && typeof req.body === 'string') {
      // In case the entire body is the file content as a string
      try {
        const parsedBody = JSON.parse(req.body);
        if (parsedBody.fileContent) {
          fileContent = parsedBody.fileContent;
          console.log("File content extracted from JSON body, length:", fileContent.length);
        }
      } catch (parseError) {
        // If parsing fails, treat the entire body as file content
        fileContent = req.body;
        console.log("Entire request body treated as file content, length:", fileContent.length);
      }
    }
    
    // Additional check for multipart form data with text field
    if (!fileContent && req.body && req.body.text) {
      fileContent = req.body.text;
      console.log("File content extracted from 'text' field, length:", fileContent.length);
    }
    
    if (fileContent) {
      console.log("File content preview (first 200 chars):", fileContent.substring(0, 200) + "...");
    } else {
      console.log("No file content provided in request");
    }
  } catch (error) {
    console.warn("Error processing file content from request body:", error.message);
    fileContent = null;
  }
  // --- End file content extraction ---


  // --- Log the original file type (MIME type) ---
  let inputMimeType = file.mimetype || 'unknown'; 
  console.log("Input audio file MIME type:", inputMimeType);
  // --- End logging ---


  // --- Basic validation for placeholder ASR ID ---
  if (ASR_SERVICE_ID_FOR_TARGET_LANG === "YOUR_ASR_SERVICE_ID_FOR_TARGET_LANG") {
       console.error("ASR Service ID placeholder not replaced.");
       return res.status(500).json({ error: "Server configuration error: ASR Service ID not set." });
  }


  console.log(`Received audio file for language: ${targetLang}, size: ${file.size}`);

  try {
    // 1. Convert original audio buffer to FLAC and then to Base64 for Bhashini ASR
    // This step is necessary because the ASR task config specifies "audioFormat": "flac"
    console.log(`Converting input audio (detected type: ${inputMimeType}) to FLAC for ASR...`);
    const audioBase64 = await convertToFlacBase64(file.buffer);
    console.log(`Audio converted to FLAC Base64, length: ${audioBase64.length}`);

    // 2. Call Bhashini Pipeline API for STT (targetLang) + Translation (targetLang -> English)
    console.log(`Calling Bhashini Pipeline for STT+Translation (${targetLang} -> en)...`);
    const sttTranslationPayload = {
      "pipelineTasks": [
        {
          "taskType": "asr",
          "config": {
            "language": { "sourceLanguage": targetLang }, // Use actual targetLang here
            "serviceId": ASR_SERVICE_ID_FOR_TARGET_LANG, 
            "audioFormat": "flac", // Must match the format of the Base64 content
            "samplingRate": 16000 // Must match the sampling rate of the Base64 content (from convertToFlacBase64)
          }
        },
        {
          "taskType": "translation",
          "config": {
            "language": { "sourceLanguage": targetLang, "targetLanguage": "en" }, // Use actual targetLang here
            "serviceId": NMT_SERVICE_ID
          }
        }
      ],
      "inputData": {
        "audio": [{ "audioContent": audioBase64 }]
      }
    };

    const pipelineHeaders = {
      "Accept": "*/*",
      "Authorization": BHASINI_API_KEY,
    };

    const sttTranslationResp = await axios.post(
      BHASINI_PIPELINE_URL,
      sttTranslationPayload,
      { headers: pipelineHeaders }
    );

    // Process STT + Translation Response
    console.log("STT+Translation API response status:", sttTranslationResp.status); 
    const pipelineResponse = sttTranslationResp.data.pipelineResponse;

    // Find the translation output specifically
    const translationTaskOutput = pipelineResponse.find(task => task.taskType === 'translation');

    if (!translationTaskOutput || !translationTaskOutput.output || translationTaskOutput.output.length === 0 || !translationTaskOutput.output[0].target) {
         console.error("Unexpected response structure from STT+Translation API:", JSON.stringify(sttTranslationResp.data, null, 2));
         throw new Error("Failed to get translated text from Bhashini API.");
    }

    const englishText = translationTaskOutput.output[0].target; // Extract English text
    console.log("Translated English Text from Bhashini:", englishText);

    // 3. Use your /ask route to get the answer
    const answerPayload = await askEnglish(englishText, fileContent);

    // 4. Format the answer for TTS
    let answerTextEnglish;
    if (answerPayload && answerPayload.answer && answerPayload.answer.explanation) {
      answerTextEnglish = answerPayload.answer.explanation;
    } else if (answerPayload && answerPayload.answer) {
       // Fallback if 'explanation' is not present, stringify the whole answer object
       try {
         answerTextEnglish = JSON.stringify(answerPayload.answer, null, 2);
       } catch (e) {
         console.warn("Could not stringify answerPayload.answer, using raw payload:", answerPayload);
         answerTextEnglish = "An answer was received but could not be formatted.";
       }
    } else {
        console.warn("Answer payload missing expected structure:", answerPayload);
        answerTextEnglish = "Could not retrieve a valid answer.";
    }

    console.log("Formatted English Answer Text for TTS:", answerTextEnglish);

    // 5. Call Bhashini Pipeline for Translation+TTS (English -> targetLang)
    console.log(`Calling Bhashini Pipeline for Translation+TTS (en -> ${targetLang})...`);

    const ttsTranslationPayload = {
      "pipelineTasks": [
         {
            "taskType": "translation",
            "config": {
               "language": {
                  "sourceLanguage": "en", // Source is English
                  "targetLanguage": targetLang // Target is the original language
               },
               "serviceId": NMT_SERVICE_ID
            }
         },
         {
            "taskType": "tts",
            "config": {
               "language": {
                  "sourceLanguage": targetLang 
               },
               "serviceId": TTS_SERVICE_ID,
               "gender": "female", // Can be adjusted based on service capabilities
               "samplingRate": 8000 // Check Bhashini service documentation for preferred rates (8kHz is common for TTS)
            }
         }
      ],
      "inputData": {
         "input": [
            {
               "source": answerTextEnglish // Input text is the formatted English answer
            }
         ]
      }
    };

    const ttsTranslationResp = await axios.post(
      BHASINI_PIPELINE_URL,
      ttsTranslationPayload,
      { headers: pipelineHeaders }
    );

    // Process Translation + TTS Response
    console.log("Translation+TTS API response status:", ttsTranslationResp.status); 
    const ttsPipelineResponse = ttsTranslationResp.data.pipelineResponse;

     // Find the TTS output specifically
     const ttsTaskOutput = ttsPipelineResponse.find(task => task.taskType === 'tts');

    if (!ttsTaskOutput || !ttsTaskOutput.audio || ttsTaskOutput.audio.length === 0 || !ttsTaskOutput.audio[0].audioContent) {
         console.error("Unexpected response structure from Translation+TTS API:", JSON.stringify(ttsTranslationResp.data, null, 2));
         throw new Error("Failed to get audio content from Bhashini TTS API.");
    }

    const audioBase64Output = ttsTaskOutput.audio[0].audioContent; // Extract Base64 audio from TTS task
    console.log(`Received Base64 audio from Bhashini TTS, length: ${audioBase64Output.length}`);

    const audioBuffer = Buffer.from(audioBase64Output, 'base64');
    console.log(`Base64 audio converted back to Buffer, size: ${audioBuffer.length}`);

    // Determine the output audio format if possible (TTS service might specify)
    // Bhashini TTS usually returns base64 of WAV or MP3. Check response structure or docs.
    const outputAudioFormat = ttsTaskOutput.config?.audioFormat || 'wav'; // Default to wav if not specified or unknown

    res.set({
      "Content-Type": `audio/${outputAudioFormat}`, // Set content type based on actual output format
      "Content-Length": audioBuffer.length,
      "Access-Control-Allow-Origin": "*", // Add CORS header if calling from a different origin
      "Access-Control-Allow-Methods": "POST" // Add CORS header
    });
    return res.send(audioBuffer);

  } catch (error) {
    console.error("Error in /multiask processing:", error.response?.data || error.message);
    let userMessage = "Failed to process request.";
    if (error.message.includes("FFmpeg executable not found")) {
        userMessage = `Server configuration error: FFmpeg executable could not be found. Please contact support. Details: ${error.message}`;
    } else if (error.message.includes("FLAC conversion error")) {
        userMessage = `Failed to convert audio to the required format: ${error.message}`;
    } else if (error.message.includes("Failed to get translated text")) {
        userMessage = "Speech recognition and translation failed.";
    } else if (error.message.includes("Failed to get answer from local service")) {
         userMessage = "Failed to get answer from the question answering service.";
    } else if (error.message.includes("Failed to get audio content")) {
         userMessage = "Text-to-speech conversion failed.";
    } else if (error.message.includes("ASR Service ID not set")) {
         userMessage = "Server configuration error: ASR Service ID not set.";
    } else if (error.response && error.response.status === 401) {
         userMessage = "Authentication failed with Bhashini API. Check your API key.";
    } else if (error.response && error.response.status === 400) {
         // Attempt to include Bhashini's specific error message if available
         const bhasiniError = error.response.data?.message || JSON.stringify(error.response.data);
         userMessage = `Bad request to Bhashini API: ${bhasiniError}`;
         console.error("Bhashini API 400 response details:", error.response.data);
    }
    return res
      .status(500)
      .json({ error: userMessage, details: error.message });
  }
});

module.exports = router;