import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";

const MicButton = ({ roomId, username }) => {
  const [language, setLanguage] = useState("en");
  const [gender, setGender] = useState("male");
  const [isListening, setIsListening] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const lastReceivedTextRef = useRef(""); // last received text

  const [chatMessages, setChatMessages] = useState([]); // {from, text} objects

  useEffect(() => {
    setSocketId(socket.id);

    const handleSpeechMessage = ({ from, text }) => {
      if (from !== username && from !== socket.id) {
        console.log(`🗣️ User ${from} said: ${text}`);
        lastReceivedTextRef.current = text;
        setHasUnreadMessage(true);
        setChatMessages((msgs) => [...msgs, { from, text }]);
      }
    };

    socket.on("speech-message", handleSpeechMessage);

    return () => {
      socket.off("speech-message", handleSpeechMessage);
    };
  }, [username]);

  useEffect(() => {
    if (roomId && username) {
      socket.emit("join-room", { roomId, username });
      console.log(`✅ ${username} joined room ${roomId}`);
    }
  }, [roomId, username]);

  const getLangCode = (lang) => {
    const map = {
      hi: "hi-IN",
      bn: "bn-IN",
      mr: "mr-IN",
      mai: "mai-IN",
      bho: "hi-IN",
      gu: "gu-IN",
      kn: "kn-IN",
      en: "en-US",
    };
    return map[lang] || "en-US";
  };

  const handleMicToggle = () => {
    if (hasUnreadMessage) {
      // Speak the last received text
      if ("speechSynthesis" in window && lastReceivedTextRef.current) {
        const utterance = new SpeechSynthesisUtterance(lastReceivedTextRef.current);
        utterance.lang = getLangCode(language);

        utterance.onend = () => {
          setHasUnreadMessage(false); // reset after speaking
        };

        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Regular mic toggle logic
      if (!roomId || !username) {
        alert("⚠️ Missing Room ID or Username");
        return;
      }

      if (!("webkitSpeechRecognition" in window)) {
        alert("Speech Recognition not supported in this browser");
        return;
      }

      if (!isListening) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = getLangCode(language);
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript?.trim();
          if (transcript) {
            socket.emit("speech", {
              roomId,
              text: transcript,
              language,
              gender,
              from: username,
            });
            // Add to chat as sent message
            setChatMessages((msgs) => [...msgs, { from: username, text: transcript }]);
          } else {
            console.log("🛑 Empty speech result");
          }
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
      } else {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative flex items-center space-x-2">
      {/* Mic Speak/Listen Button */}
      <button
        onClick={handleMicToggle}
        className={`px-4 py-2 rounded-full text-white font-semibold shadow-lg transition
          ${
            isListening
              ? "bg-red-600 animate-pulse"
              : hasUnreadMessage
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        title={hasUnreadMessage ? "Click to listen to new message" : isListening ? "Stop speaking" : "Speak"}
      >
        🎤 {isListening ? "Stop" : hasUnreadMessage ? "Listen" : "Speak"}
      </button>

      {/* Translator Card above Speak button */}
      {showTranslator && (
        <div className="absolute bottom-14 left-0 w-64 max-h-40 overflow-auto bg-gray-50 border border-gray-400 rounded p-3 shadow-lg z-50 text-sm text-gray-700">
          <div className="font-semibold mb-1">Translator Console Texts:</div>
          {chatMessages.length === 0 && <div className="italic text-gray-500">No messages yet.</div>}
          {chatMessages.map((msg, i) => (
            <div key={i} className="mb-1">
              <strong>{msg.from === username ? "You" : msg.from}:</strong> {msg.text}
            </div>
          ))}
        </div>
      )}

      {/* Settings / Options Button */}
      <button
        onClick={() => {
          setShowOptions((prev) => !prev);
          // Close translator and chat when options closed
          if (showOptions) {
            setShowChat(false);
            setShowTranslator(false);
          }
        }}
        className="w-9 h-9 flex items-center justify-center text-xl rounded-full bg-gray-200 hover:bg-gray-300"
        title="Settings"
      >
        ⋮
      </button>

      {/* Options Popup */}
      {showOptions && (
        <div className="absolute bottom-14 left-0 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 space-y-3 text-sm">
          {/* Tabs for Chat and Settings */}
          <div className="flex justify-between mb-2">
            <button
              className={`px-3 py-1 rounded ${
                showChat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setShowChat(true)}
            >
              Chat
            </button>
            <button
              className={`px-3 py-1 rounded ${
                !showChat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setShowChat(false)}
            >
              Settings
            </button>
          </div>

          {showChat ? (
            <div className="max-h-48 overflow-auto border border-gray-300 rounded p-2 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="italic text-gray-500">No chat messages yet.</div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-1 ${
                      msg.from === username ? "text-right text-blue-600" : "text-left text-gray-800"
                    }`}
                  >
                    <strong>{msg.from === username ? "You" : msg.from}:</strong> {msg.text}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block font-medium mb-1">Language</label>
                <select
                  className="w-full border border-gray-300 px-3 py-1 rounded mb-3"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="mai">Maithili</option>
                  <option value="bho">Bhojpuri</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Gender</label>
                <select
                  className="w-full border border-gray-300 px-3 py-1 rounded mb-3"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <button
                className="w-full bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                onClick={() => setShowOptions(false)}
              >
                ✅ Joined
              </button>

              {/* Translator toggle button */}
              <button
                className="w-full mt-2 bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
                onClick={() => setShowTranslator((prev) => !prev)}
              >
                {showTranslator ? "Hide Translator" : "Show Translator"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MicButton;
