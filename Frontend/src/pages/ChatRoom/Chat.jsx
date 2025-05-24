import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Video, User, FileSignature } from "lucide-react";
import ConsentFormModal from "./ConsentFormModal";

/**
 * Chat component – old UI preserved, new features added:
 * 1. Consent form flow (modal + header button)
 * 2. "Join Call" link when another user starts a video call
 * 3. Minor tidy‑ups & prop‑drilling parity with previous version
 */

const SERVER_URL = "http://localhost:5000";

export default function Chat({ callroomID, setUsernamenew, roomTitle }) {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConsentOpen, setConsentOpen] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const hasAnnouncedCall = useRef(false);

  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize SpeechRecognition once on mount
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage((prev) => prev + finalTranscript.trim() + " ");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  }, []);

  /****************************
   *  Fetch historic messages *
   ***************************/
  useEffect(() => {
    axios
      .post(`${SERVER_URL}/api/chat/${roomId}`, { userId: user._id })
      .then((res) => setMessages(res.data.messages || []))
      .catch(console.error);
  }, [roomId, user._id]);

  /****************************
   *  Socket.IO bootstrapping *
   ***************************/
  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinRoom", {
      roomId,
      userId: user._id,
      userName: user.name,
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageSaved", ({ _id, tempId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, _id } : m))
      );
    });

    socket.on("userJoined", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `join-${Date.now()}`,
          sender: { name: "System" },
          content: `${userName} joined`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    socket.on("userLeft", ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `left-${Date.now()}`,
          sender: { name: "System" },
          content: `${userName} left`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    setUsernamenew?.(user.name);

    return () => {
      socket.disconnect();
    };
  }, [roomId, user._id, user.name, setUsernamenew]);

  /*****************************************
   *  Announce *my* call exactly once      *
   *****************************************/
  useEffect(() => {
    if (!callroomID || hasAnnouncedCall.current || !socketRef.current) return;

    hasAnnouncedCall.current = true;

    const tempId = `call-${Date.now()}`;
    const content = `${user.name} started a video call with room ID: ${callroomID}`;

    const payload = {
      roomId,
      senderId: user._id,
      content,
      tempId,
      meta: { isCallInvite: true },
    };

    socketRef.current.emit("sendMessage", payload);

    // optimistic rendering so the sender sees it instantly
    setMessages((prev) => {
      const exists = prev.some((m) => m.content === content);
      return exists
        ? prev
        : [
            ...prev,
            {
              _id: tempId,
              sender: { name: "System" },
              content,
              timestamp: new Date().toISOString(),
            },
          ];
    });
  }, [callroomID, roomId, user._id, user.name]);

  /***********************
   *  Auto‑scroll bottom *
   ***********************/
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /*********************
   *  Message sending  *
   *********************/
  const handleSend = () => {
    if (!message.trim()) return;

    const tempId = Date.now().toString();
    const newMsg = {
      _id: tempId,
      sender: user,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    socketRef.current.emit("sendMessage", {
      roomId,
      senderId: user._id,
      content: message,
      tempId,
    });

    setMessage("");
  };

  /********************
   *  Helpers / UI    *
   ********************/
  const startMeeting = () => {
    navigate(`/samadhan-meet/${roomId}`);
  };

  const joinCall = (inviteContent) => {
    const match = inviteContent.match(/room ID: (\w+)/);
    const remoteRoomID = match ? match[1] : null;
    if (remoteRoomID) {
      navigate(`/samadhan-meet/${roomId}?roomID=${remoteRoomID}`);
    }
  };

  /********************
   *  Render          *
   ********************/
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] ">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#bb5b45] px-4 py-2 border-b shadow-sm">
        <div className="flex gap-2 items-center">
          <User className="w-8 h-8 p-1 rounded-full bg-white text-gray-700" />
          <h2 className="text-lg font-semibold text-white">
            {roomTitle || "Chat Room"}
          </h2>
        </div>

        <div className="flex gap-2">
          {/* Video call */}
          <button
            onClick={startMeeting}
            className="bg-[#d1a76e] text-white p-2 rounded-full hover:bg-[#20c15d]"
            title="Start Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          {/* Consent form */}
          <button
            onClick={() => setConsentOpen(true)}
            className="bg-[#6a8ddb] text-white p-2 rounded-full hover:bg-[#5879c2]"
            title="Open Consent Form"
          >
            <FileSignature className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ConsentFormModal
        isOpen={isConsentOpen}
        onClose={() => setConsentOpen(false)}
        roomId={roomId}
        userId={user._id}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/assets/images/LanguageSelectBG.png')] bg-cover">
        {messages.map((msg, idx) => {
          const isMe = msg?.sender?._id === user._id;
          const alignment = isMe ? "items-end" : "items-start";
          const bubbleColor = isMe ? "bg-[#d1a76e]" : "bg-white";
          const textAlign = isMe ? "text-right" : "text-left";

          const showJoin =
            !isMe && msg.content?.includes("started a video call");

          return (
            <div key={msg._id || idx} className={`flex flex-col ${alignment}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${bubbleColor} ${textAlign}`}
              >
                <p className="text-xs text-black font-semibold">
                  {msg.sender?.name}
                </p>
                <p className="text-sm text-black inline-block">{msg.content}</p>
                {showJoin && (
                  <button
                    onClick={() => joinCall(msg.content)}
                    className="ml-2 text-blue-700 underline text-xs hover:text-blue-900"
                  >
                    Join Call
                  </button>
                )}
                <p className="text-[10px] text-gray-800 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center p-3 bg-[#bb5b45] border-t">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        {/* Mic Button */}
        <button
          onClick={() => {
            if (!recognitionRef.current) return;

            if (isListening) {
              recognitionRef.current.stop();
            } else {
              setMessage(""); // optional: reset previous message
              recognitionRef.current.start();
            }
            setIsListening((prev) => !prev);
          }}
          className={`relative ml-2 p-3 rounded-full ${
            isListening ? "bg-red-600" : "bg-green-600"
          } text-white flex items-center justify-center`}
          title={isListening ? "Stop Recording" : "Start Voice Input"}
        >
          🎤
          {isListening && (
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="ml-2 bg-[#d1a76e] hover:bg-green-600 text-black px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
