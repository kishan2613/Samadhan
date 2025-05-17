import React, { useState, useEffect } from "react";
import { socket } from "./socket";

const MicButton = ({ roomId, username }) => {
  const [language, setLanguage] = useState("en");
  const [gender, setGender] = useState("male");
  const [isListening, setIsListening] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // closed by default

  useEffect(() => {
    socket.on("speech-message", ({ from, text }) => {
      if (from !== username) {
        console.log(`User ${from} said: ${text}`);
      }
    });

    return () => socket.off("speech-message");
  }, [username]);

  useEffect(() => {
    if (roomId && username) {
      socket.emit("join-room", { roomId, username });
      console.log(`${username} joined room ${roomId}`);
    }
  }, [roomId, username]);

  const handleMicToggle = () => {
    if (!roomId || !username) {
      alert("Missing Room ID or Username");
      return;
    }

    if (!isListening) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang =
        language === "hi"
          ? "hi-IN"
          : language === "bn"
          ? "bn-IN"
          : language === "mr"
          ? "mr-IN"
          : language === "mai"
          ? "mai-IN"
          : language === "bho"
          ? "hi-IN"
          : language === "gu"
          ? "gu-IN"
          : language === "kn"
          ? "kn-IN"
          : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        socket.emit("speech", {
          roomId,
          text: transcript,
          language,
          gender,
          from: username,
        });
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="relative flex items-center space-x-2">
      {/* 🎤 Mic Button */}
      <button
        onClick={handleMicToggle}
        className={`px-4 py-2 rounded-full text-white font-semibold shadow-lg transition ${
          isListening
            ? "bg-red-600 animate-pulse"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        🎤 {isListening ? "Stop" : "Speak"}
      </button>

      {/* ⋮ Three Dots */}
      <button
        onClick={() => setShowOptions((prev) => !prev)}
        className="w-9 h-9 flex items-center justify-center text-xl rounded-full bg-gray-200 hover:bg-gray-300"
        title="Settings"
      >
        ⋮
      </button>

      {/* Dropdown Options */}
      {showOptions && (
        <div className="absolute bottom-14 left-0 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              className="w-full border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="w-full border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <button
            className="w-full mt-2 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
            onClick={() => setShowOptions(false)}
          >
            ✅ Joined
          </button>
        </div>
      )}
    </div>
  );
};

export default MicButton;
