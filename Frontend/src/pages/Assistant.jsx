import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Volume2, Loader, ChevronDown } from "lucide-react";

/**
 * AI Voice Assistant Component
 * A multilingual voice interface for interacting with an AI assistant.
 */
const VoiceAssistant = () => {
  // =============== STATE MANAGEMENT ===============
  const [activeSession, setActiveSession] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);

  // =============== REFS ===============
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());

  // =============== LANGUAGE OPTIONS ===============
  const languages = {
    en: "English",
    as: "Assamese",
    brx: "Bodo",
    gu: "Gujarati",
    hi: "Hindi",
    kn: "Kannada",
    ml: "Malayalam",
    mni: "Manipuri",
    mr: "Marathi",
    or: "Oriya",
    pa: "Punjabi",
    ta: "Tamil",
    te: "Telugu"
  };

  // =============== WELCOME MESSAGE ===============
  useEffect(() => {
    if (activeSession) {
      const welcomeMessage = 
        "Hello, I am Samadhan, your AI assistant. Please select your preferred language and click the microphone button to ask your question.";
      
      // Small delay to ensure speech synthesis is ready
      setTimeout(() => speakText(welcomeMessage, "en"), 300);
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
      showError("Failed to play the response audio");
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
  const speakText = (text, language = selectedLanguage) => {
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      showError("Text-to-speech is not supported in your browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
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
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
        
        // Process the recording if we have data
        if (audioChunksRef.current.length > 0) {
          processRecording();
        } else {
          showError("No audio was recorded. Please try again.");
          setRecording(false);
        }
      };
      
      // Handle recording errors
      recorder.onerror = (event) => {
        console.error("Recording error:", event.error);
        showError(`Recording error: ${event.error.message || "unknown error"}`);
        setRecording(false);
        
        // Clean up stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };
      
      // Start recording
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      
      let errorMessage = "Could not access microphone. ";
      
      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No microphone found.";
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
      showError("Error stopping recording");
      
      // Force cleanup
      setRecording(false);
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
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
        throw new Error("Empty audio recording");
      }
      
      // Create form data
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      
      // Send to server
      const response = await fetch(
        `http://localhost:5000/audio?lang=${selectedLanguage}`,
        {
          method: "POST",
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Get response as array buffer
      const audioData = await response.arrayBuffer();
      
      if (!audioData || audioData.byteLength === 0) {
        throw new Error("Server returned empty audio response");
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
      
      player.play().catch(error => {
        console.error("Error playing audio:", error);
        showError("Could not play audio response");
        URL.revokeObjectURL(audioUrl);
      });
      
      setPlaying(true);
      
    } catch (error) {
      console.error("Error processing recording:", error);
      showError(error.message || "Error processing your request");
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
      audioStreamRef.current.getTracks().forEach(track => track.stop());
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

  // =============== RENDER COMPONENT ===============
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="flex flex-col items-center max-w-md w-full gap-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">Samadhan AI Assistant</h1>
        
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg w-full text-center animate-pulse">
            {error}
          </div>
        )}
        
        {/* Start Session Button */}
        {!activeSession && (
          <button
            onClick={() => setActiveSession(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition"
          >
            Start Conversation
          </button>
        )}
        
        {activeSession && (
          <>
            {/* Language Selector */}
            <div className="relative w-full">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={recording || processing || playing}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="text-gray-400" size={20} />
              </div>
            </div>
            
            {/* Assistant Avatar */}
            <div className="relative w-48 h-48 my-6">
              {/* Status Ring */}
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  recording
                    ? "border-red-500 animate-pulse" 
                    : processing
                    ? "border-yellow-500 animate-pulse" 
                    : playing
                    ? "border-blue-500 animate-pulse" 
                    : "border-gray-700"
                }`}
              />
              
              {/* Assistant Image */}
              <div className="absolute inset-2 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                <img
                  src="/assets/images/assistant.png"
                  alt="AI Assistant"
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
                    <Loader className="text-yellow-400 animate-spin" size={36} />
                  </div>
                )}
                
                {playing && !processing && (
                  <div className="bg-black bg-opacity-40 rounded-full p-4">
                    <Volume2 className="text-blue-400 animate-pulse" size={36} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-8 mt-2">
              {/* Record/Stop Button */}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={processing || playing}
                aria-label={recording ? "Stop recording" : "Start recording"}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  recording
                    ? "bg-red-600 hover:bg-red-700"
                    : processing || playing
                    ? "bg-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Mic size={28} className="text-white" />
              </button>
              
              {/* Emergency Stop Button */}
              <button
                onClick={stopEverything}
                aria-label="Stop all activities"
                className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center shadow-lg transition-colors"
              >
                <Square size={24} className="text-white" />
              </button>
            </div>
            
            {/* Status Text */}
            <div className="text-gray-300 text-center mt-4">
              {recording
                ? "Listening... Click mic to stop"
                : processing
                ? "Processing your request..."
                : playing
                ? "Playing response..."
                : "Click mic to speak"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;