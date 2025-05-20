import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Volume2, Loader } from "lucide-react";
import AssistantData from "../WebData/Assistant.json";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/**
 * AI Voice Assistant Component
 * A multilingual voice interface for interacting with an AI assistant.
 * Modified with a two-column layout - image on left, assistant on right
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

  // =============== REFS ===============
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());

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
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      if (audioBlob.size === 0) {
        throw new Error(AssistantDataMock.processingErrors.audio);
      }

      // Create form data
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Send to server
      const response = await fetch(
        `http://localhost:5000/audio?lang=${target_lang}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
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
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =============== RENDER COMPONENT ===============
  return (
    <div className="min-h-screen flex flex-col bg-[#d6c6b8] mt-16 p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-[#bb5b45] mb-8">
        {AssistantDataMock.heading}
      </h1>

      {/* Two-column layout container */}
      <div className="border-4 border-[#87311e] transition duration-pulse ease-in-out  flex flex-col lg:flex-row w-full gap-6 bg-[#f5f0eb] rounded-2xl  justify-center items-center">

        {/* left Column for Voice Assistant */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg w-full max-w-md text-center animate-pulse mb-4">
              {error}
            </div>
          )}

          {/* Start Session Button */}
          {!activeSession && (
            <button
              onClick={() => setActiveSession(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition"
            >
              {AssistantDataMock.buttons?.startConversation || "Start Conversation"}
            </button>
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
                      e.target.src = "https://via.placeholder.com/200?text=AI+Assistant";
                    }}
                  />
                </div>

                {/* Status Indicators */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {processing && (
                    <div className="bg-black bg-opacity-40 rounded-full p-4">
                      <Loader className="text-yellow-400 animate-spin" size={32} />
                    </div>
                  )}

                  {playing && !processing && (
                    <div className="bg-black bg-opacity-40 rounded-full p-4">
                      <Volume2 className="text-blue-400 animate-pulse" size={32} />
                    </div>
                  )}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6 mt-4">
                {/* Record/Stop Button */}
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={processing || playing}
                  aria-label={
                    recording
                      ? AssistantDataMock.stopRecording || "Stop Recording"
                      : AssistantDataMock.startRecording || "Start Recording"
                  }
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    recording
                      ? "bg-red-600 hover:bg-red-700"
                      : processing || playing
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
              <div className="text-[#bb5b45] text-center mt-4 font-medium">
                {recording
                  ? AssistantDataMock.statusMessages?.listening || "Listening..."
                  : processing
                  ? AssistantDataMock.statusMessages?.processing || "Processing..."
                  : playing
                  ? AssistantDataMock.statusMessages?.playing || "Speaking..."
                  : AssistantDataMock.statusMessages?.idle || "Ready to help"}
              </div>
            </div>
          )}
        </div>

      {/* Left Column for Image (placeholder for your image) */}
         <div className="w-full lg:w-1/2 flex justify-center items-center">
          <div className=" rounded-lg  overflow-hidden w-full  max-w-md">
            <img
              src="/assets/images/Assistant-page.png"
              alt="Your image will go here"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceAssistant;