import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Volume2,
  Loader,
  Upload,
  X,
  FileText,
  Download,
} from "lucide-react";
import AssistantData from "../WebData/Assistant.json";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import Loaders from "../components/common/Loader";

/**
 * AI Voice Assistant Component
 * A multilingual voice interface for interacting with an AI assistant.
 * Modified with a two-column layout - image on left, assistant on right
 * Enhanced with PDF upload functionality and PDF download with April Fool message
 */

const assistantcache = {};

const VoiceAssistant = () => {
  // =============== STATE MANAGEMENT ===============
  const [activeSession, setActiveSession] = useState(false);
  const target_lang = localStorage.getItem("preferredLanguage");
  const [AssistantDataMock, setAssistantData] = useState(AssistantData);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // =============== PDF UPLOAD STATE ===============
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [pdfContent, setPdfContent] = useState("");
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // =============== REFS ===============
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());
  const fileInputRef = useRef(null);

  // =============== PDF UPLOAD HANDLERS ===============
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showError("Please select a valid PDF file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError("PDF file size should be less than 10MB.");
      return;
    }

    try {
      setExtractingPdf(true); // Optional: show loading state

      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(
        "http://localhost:5000/api/auth/extract-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.text) {
        throw new Error(result.message || "Failed to extract text from PDF.");
      }

      setUploadedPdf({
        name: file.name,
        size: file.size,
        content: result.text,
      });

      setPdfContent(result.text);
      console.log("Extracted PDF content:", result.text);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      showError(
        error.message || "An error occurred while extracting text from the PDF."
      );
    } finally {
      setExtractingPdf(false); // Optional: hide loading state
    }
  };

   // =============== ENHANCED PDF DOWNLOAD HANDLER ===============
  const handleDownloadPdf = async () => {
  if (!target_lang) {
    showError("Language preference not found.");
    return;
  }
  if (!pdfContent) {
    showError("No content to download.");
    return;
  }

  try {
    setDownloadingPdf(true);

   // 1) Translate the text
    const translateRes = await fetch(
      "http://localhost:5000/translate/translate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonObject: pdfContent,
          targetLang: target_lang,
        }),
      }
    );
    
    if (!translateRes.ok) throw new Error("Translation failed");
    
    const { pipelineResponse } = await translateRes.json();
    const segments = pipelineResponse?.[0]?.output;
    
    if (!Array.isArray(segments)) throw new Error("Bad translation format");
    
    const translatedText = segments.map((s) => s.target).join("");

    // 2) request PDF from your Node service
    const pdfRes = await fetch("http://localhost:5000/api/auth/download-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: translatedText,
        language: target_lang,
      }),
    });
    if (!pdfRes.ok) throw new Error("PDF generation failed");

    const blob = await pdfRes.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${target_lang}.pdf`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    showError(err.message);
  } finally {
    setDownloadingPdf(false);
  }
};


  const removePDF = () => {
    setUploadedPdf(null);
    setPdfContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // =============== WELCOME MESSAGE ===============
  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    if (assistantcache[preferredLanguage]) {
      setAssistantData(assistantcache[preferredLanguage]);
      return;
    }

    if (preferredLanguage) {
      const translateContent = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            "http://localhost:5000/translate/translate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonObject: AssistantData,
                targetLang: preferredLanguage,
              }),
            }
          );

          const data = await response.json();

          if (data?.pipelineResponse?.[0]?.output) {
            const translations = data.pipelineResponse[0].output;
            const translationMap = {};

            // Map all source -> target pairs
            translations.forEach(({ source, target }) => {
              translationMap[source] = target;
            });

            // Recursively replace matching strings in content
            const translateJSON = (obj) => {
              if (typeof obj === "string") {
                return translationMap[obj] || obj;
              } else if (Array.isArray(obj)) {
                return obj.map(translateJSON);
              } else if (typeof obj === "object" && obj !== null) {
                const newObj = {};
                for (let key in obj) {
                  newObj[key] = translateJSON(obj[key]);
                }
                return newObj;
              }
              return obj;
            };

            const newTranslatedContent = translateJSON(AssistantData);
            assistantcache[preferredLanguage] = newTranslatedContent;
            setAssistantData(newTranslatedContent);
          }
        } catch (err) {
          console.error("Translation API error:", err);
        } finally {
          setLoading(false);
        }
      };

      translateContent();
    }
  }, []);

  useEffect(() => {
    if (activeSession) {
      const welcomeMessage = AssistantDataMock.welcomeMessage;

      // Small delay to ensure speech synthesis is ready
      setTimeout(() => speakText(welcomeMessage), 300);
    }
  }, [activeSession]);

  // =============== AUDIO PLAYER SETUP ===============
  useEffect(() => {
    const player = audioPlayerRef.current;

    // Set up event listeners for the audio player
    player.onplay = () => setPlaying(true);
    player.onended = () => setPlaying(false);
    player.onpause = () => setPlaying(false);
    player.onerror = () => {
      setPlaying(false);
      // showError(AssistantDataMock.processingErrors.No_Audio);
    };

    return () => {
      // Clean up event listeners
      player.onplay = null;
      player.onended = null;
      player.onpause = null;
      player.onerror = null;

      // Stop playback
      player.pause();
      player.src = "";
    };
  }, []);

  // =============== CLEANUP ON UNMOUNT ===============
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      stopRecording();

      // Stop any ongoing speech synthesis
      window.speechSynthesis?.cancel();

      // Stop any audio playback
      const player = audioPlayerRef.current;
      if (player) {
        player.pause();
        player.src = "";
      }
    };
  }, []);

  // =============== ERROR HANDLING ===============
  const showError = (message) => {
    setError(message);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  // =============== TEXT-TO-SPEECH FUNCTION ===============
  const speakText = (text, language = target_lang) => {
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      showError(AssistantDataMock.errorFallback);
      return;
    }

    // Map your internal codes to real BCP-47 voice locales
    const localeMap = {
      en: "en-US",
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      gu: "gu-IN",
      pa: "pa-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      mr: "mr-IN",
      or: "or-IN",
      as: "as-IN",
      brx: "brx-IN",
      mni: "mni-IN",
    };

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeMap[language] || language;

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // =============== RECORDING FUNCTIONS ===============
  const startRecording = async () => {
    // Don't start recording if already in progress
    if (recording || processing || playing) return;

    // Clear previous error
    setError(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Clear previous audio chunks
      audioChunksRef.current = [];

      // Create new media recorder
      const recorder = new MediaRecorder(stream);

      // Store audio chunks when data is available
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        console.log("Recording stopped");

        // Stop all tracks in the stream
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;

        // Process the recording if we have data
        if (audioChunksRef.current.length > 0) {
          processRecording();
        } else {
          showError(AssistantDataMock.processingErrors.noAudio);
          setRecording(false);
        }
      };

      // Handle recording errors
      recorder.onerror = (event) => {
        console.error("Recording error:", event.error);
        showError(AssistantDataMock.processingErrors.recording);
        setRecording(false);

        // Clean up stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
      };

      // Start recording
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);

      let errorMessage = AssistantDataMock.microphoneError.notFound;

      if (error.name === "NotAllowedError") {
        errorMessage += AssistantDataMock.microphoneError.notAllowed;
      } else if (error.name === "NotFoundError") {
        errorMessage += AssistantDataMock.microphoneError.unknown;
      } else {
        errorMessage += error.message || "Unknown error.";
      }

      showError(errorMessage);
    }
  };

  const stopRecording = () => {
    // Only stop if currently recording
    if (!recording || !mediaRecorderRef.current) return;

    try {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        // The recording state will be updated in the onstop handler
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      showError(AssistantDataMock.processingErrors.audio);

      // Force cleanup
      setRecording(false);

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
    }
  };

  // =============== PROCESS RECORDED AUDIO ===============
  const processRecording = async () => {
    setProcessing(true);

    try {
      // Create blob from audio chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      if (audioBlob.size === 0) {
        throw new Error(AssistantDataMock.processingErrors.audio);
      }

      // Create form data
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Add PDF content if available
      if (pdfContent) {
        formData.append("fileContent", pdfContent);
        formData.append("fileName", uploadedPdf?.name || "uploaded.pdf");
      }

      // Send to server
      const response = await fetch(
        `http://localhost:5000/audio?lang=${target_lang}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Get response as array buffer
      const audioData = await response.arrayBuffer();

      if (!audioData || audioData.byteLength === 0) {
        throw new Error(AssistantDataMock.processingErrors.emptyResponse);
      }

      // Get content type or default to audio/mpeg
      const contentType = response.headers.get("content-type") || "audio/mpeg";

      // Create audio blob from response
      const audioResponseBlob = new Blob([audioData], { type: contentType });

      // Create object URL for audio playback
      const audioUrl = URL.createObjectURL(audioResponseBlob);

      // Play the response audio
      const player = audioPlayerRef.current;
      player.src = audioUrl;

      // Play and set up cleanup
      player.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(audioUrl);
        player.src = "";
      };

      player.play().catch((error) => {
        console.error("Error playing audio:", error);
        showError(AssistantDataMock.processingErrors.audio);
        URL.revokeObjectURL(audioUrl);
      });

      setPlaying(true);
    } catch (error) {
      console.error("Error processing recording:", error);
      showError(AssistantDataMock.processingErrors.generic);
    } finally {
      setProcessing(false);
      setRecording(false);
    }
  };

  // =============== EMERGENCY STOP FUNCTION ===============
  const stopEverything = () => {
    // Stop recording if active
    if (recording && mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error("Error stopping recorder:", error);
      }
    }

    // Stop stream tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop audio playback
    const player = audioPlayerRef.current;
    if (player) {
      player.pause();
      player.src = "";
    }

    // Reset states
    setRecording(false);
    setProcessing(false);
    setPlaying(false);
    setError(null);
  };

  if (loading) {
    return <Loaders />;
  }

  // =============== RENDER COMPONENT ===============
  return (
    <div className="min-h-screen flex flex-col bg-[#d6c6b8] p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-[#bb5b45] mb-8">
        {AssistantDataMock.heading}
      </h1>

      {/* Two-column layout container */}
      <div className="border-4 border-[#87311e] transition duration-pulse ease-in-out flex flex-col lg:flex-row w-full gap-6 bg-[#f5f0eb] bg-[url('/assets/images/Assistant-Bg.png')] bg-cover rounded-2xl justify-center items-center">
        {/* Left Column for Voice Assistant */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg w-full max-w-md text-center animate-pulse mb-4">
              {error}
            </div>
          )}

          {/* PDF Upload Section - Always visible when session is active */}
          {activeSession && (
            <div className="w-full max-w-md mb-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={extractingPdf || recording || processing || playing}
              />

              {/* PDF Upload Area */}
              {!uploadedPdf ? (
                <div
                  onClick={!extractingPdf ? triggerFileSelect : undefined}
                  className={`border-2 border-dashed border-[#bb5b45] rounded-lg p-4 mt-2 text-center cursor-pointer hover:bg-[#f5f0eb] transition-colors ${
                    extractingPdf ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="mx-auto mb-2 text-[#bb5b45]" size={32} />
                  <p className="text-[#bb5b45] font-semibold">
                    {extractingPdf
                      ? AssistantDataMock.PdfTitle || "Extracting PDF..."
                      : AssistantDataMock.PdfTitle || "Upload PDF"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {AssistantDataMock.fileInfo ||
                      "Click to select a PDF file (Max 10MB)"}
                  </p>
                  {extractingPdf && (
                    <div className="mt-2">
                      <Loader
                        className="animate-spin mx-auto text-[#bb5b45]"
                        size={20}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <FileText className="text-green-600 mr-2" size={20} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-800 truncate">
                          {uploadedPdf.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(uploadedPdf.size / 1024).toFixed(1)} KB • Text
                          extracted
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removePDF}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      disabled={recording || processing || playing}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* PDF Download Button */}
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={
                        downloadingPdf || recording || processing || playing
                      }
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        downloadingPdf || recording || processing || playing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {downloadingPdf ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          {AssistantDataMock.downloadingPdftext}
                          <Download size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Start Session Button */}
          {!activeSession && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Typewriter animated text */}
              <p className="mb-8 text-2xl font-bold text-[#bb5b45] animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-black pr-4">
                {AssistantDataMock.welcome || "Start Conversation"}
              </p>

              {/* Centered button */}
              <button
                onClick={() => setActiveSession(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition"
              >
                {AssistantDataMock.buttons?.startConversation ||
                  "Start Conversation"}
              </button>
            </div>
          )}

          {activeSession && (
            <div className="flex flex-col items-center max-w-md w-full">
              {/* Assistant Avatar */}
              <div className="relative w-40 h-40 my-4">
                {/* Status Ring */}
                <div
                  className={`absolute inset-0 rounded-full border-8 ${
                    recording
                      ? "border-red-500 animate-pulse"
                      : processing
                      ? "border-yellow-500 animate-pulse"
                      : playing
                      ? "border-blue-500 animate-pulse"
                      : ""
                  }`}
                />

                {/* Assistant Image */}
                <div className="absolute inset-2 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  <img
                    src="/assets/images/assistant.png"
                    alt={AssistantDataMock.AiAlt || "AI Assistant"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/200?text=AI+Assistant";
                    }}
                  />
                </div>

                {/* Status Indicators */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {processing && (
                    <div className="bg-black bg-opacity-40 rounded-full p-4">
                      <Loader
                        className="text-yellow-400 animate-spin"
                        size={32}
                      />
                    </div>
                  )}

                  {playing && !processing && (
                    <div className="bg-black bg-opacity-40 rounded-full p-4">
                      <Volume2
                        className="text-blue-400 animate-pulse"
                        size={32}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6 mt-4">
                {/* Record/Stop Button */}
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={processing || playing || extractingPdf}
                  aria-label={
                    recording
                      ? AssistantDataMock.stopRecording || "Stop Recording"
                      : AssistantDataMock.startRecording || "Start Recording"
                  }
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    recording
                      ? "bg-red-600 hover:bg-red-700"
                      : processing || playing || extractingPdf
                      ? "bg-gray-700 cursor-not-allowed opacity-70"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Mic size={24} className="text-white" />
                </button>

                {/* Emergency Stop Button */}
                <button
                  onClick={stopEverything}
                  aria-label={AssistantDataMock.stopAll || "Stop Everything"}
                  className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center shadow-lg transition-colors"
                >
                  <Square size={20} className="text-white" />
                </button>
              </div>

              {/* Status Text */}
              <div className="text-[#bb5b45] text-center mt-4 mb-2 font-medium">
                {extractingPdf
                  ? "Extracting PDF content..."
                  : downloadingPdf
                  ? "Generating PDF..."
                  : recording
                  ? AssistantDataMock.statusMessages?.listening ||
                    "Listening..."
                  : processing
                  ? AssistantDataMock.statusMessages?.processing ||
                    "Processing..."
                  : playing
                  ? AssistantDataMock.statusMessages?.playing || "Speaking..."
                  : AssistantDataMock.statusMessages?.idle || "Ready to help"}
              </div>

              {/* PDF Status Indicator */}
              {uploadedPdf && (
                <div className="text-sm text-green-600 mt-2 text-center">
                  📄 {AssistantDataMock.SuccessFile}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column for Image (placeholder for your image) */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <div className="rounded-lg overflow-hidden w-full max-w-md">
            <img
              src="/assets/images/Assistant-page.png"
              alt="Your image will go here"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <p className="italic text-center text-[#bb5b45] p-2 mt-4">
        {AssistantDataMock.Outsell ||
          "Your AI Assistant is here to help you with your queries. Upload a PDF document and ask questions about it, or just click the microphone button and start speaking!"}
      </p>
    </div>
  );
};

export default VoiceAssistant;
