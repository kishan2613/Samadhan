import React, { useState, useEffect } from "react";
import { socket } from "./socket";

const MicButton = () => {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [language, setLanguage] = useState("en");
  const [gender, setGender] = useState("male");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    socket.on("speech-message", ({ from, text }) => {
      if (from !== username) {
        console.log(`User ${from} said: ${text}`);
      }
    });

    return () => socket.off("speech-message");
  }, [username]);
  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId);
      console.log(`Joined room: ${roomId}`);
    }
  }, [roomId]);

  const handleMicToggle = () => {
    if (!roomId) {
      alert("Please enter a Room ID");
      return;
    }

    if (!isListening) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-US";
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
    <div className="relative inline-block">
      <button
        onClick={handleMicToggle}
        className={`px-4 py-2 rounded-full text-white shadow-lg transition ${
          isListening
            ? "bg-red-600 animate-pulse"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        🎤 {isListening ? "Stop" : "Speak"}
      </button>

      <button
        onClick={() => setShowOptions(!showOptions)}
        className="ml-2 px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        ⋮
      </button>

      {showOptions && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room ID
            </label>
            <input
              type="text"
              maxLength={4}
              placeholder="1234"
              className="w-full border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g., A or B"
              className="w-full border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring focus:border-blue-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
            onClick={() => {
              if (roomId && username) {
                socket.emit("join-room", { roomId, username });
                setJoined(true);
                console.log(`${username} joined room ${roomId}`);
              } else {
                alert("Enter both room ID and username");
              }
            }}
          >
            ✅ Join Room
          </button>
        </div>
      )}
    </div>
  );
};

export default MicButton;
