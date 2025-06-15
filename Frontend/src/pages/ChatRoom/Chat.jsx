import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ConsentFormModal from "./ConsentFormModal";
import ChatUI from "../../WebData/ChatUI.json";
import { Video, User, FileSignature } from "lucide-react";

const SERVER_URL = "https://samadhan-zq8e.onrender.com";

export default function Chat({ callroomID, setUsernamenew }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id;
  const [uiText, setUiText] = useState(ChatUI);
  const [translationMap, setTranslationMap] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const hasAnnouncedCall = useRef(false);
  const [isConsentOpen, setConsentOpen] = useState(false);

  // deep-translate helper
  const translateJSON = (obj, map) => {
    if (typeof obj === "string") return map[obj] || obj;
    if (Array.isArray(obj)) return obj.map(o => translateJSON(o, map));
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, translateJSON(v, map)])
      );
    }
    return obj;
  };

  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      // 1️⃣ Translate static UI text
      try {
        const resUI = await fetch(`${SERVER_URL}/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: ChatUI, targetLang: lang })
        });
        const { pipelineResponse } = await resUI.json();
        const outputsUI = pipelineResponse?.[0]?.output || [];
        const uiMap = {};
        outputsUI.forEach(({ source, target }) => {
          uiMap[source] = target;
        });
        setUiText(translateJSON(ChatUI, uiMap));
        setTranslationMap(uiMap);
      } catch (err) {
        console.error("UI translation error:", err);
      }

      // 2️⃣ Load previous chat history, then translate it
      try {
        const resMsgs = await axios.post(
          `${SERVER_URL}/api/chat/${roomId}`,
          { userId }
        );
        let loaded = resMsgs.data.messages || [];

        if (loaded.length) {
          const resDyn = await fetch(
            `${SERVER_URL}/translate/translate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonObject: loaded, targetLang: lang })
            }
          );
          const { pipelineResponse: dynResp } = await resDyn.json();
          const outputsDyn = dynResp?.[0]?.output || [];
          const dynMap = {};
          outputsDyn.forEach(({ source, target }) => {
            dynMap[source] = target;
          });
          loaded = translateJSON(loaded, dynMap);
        }

        setMessages(loaded);
      } catch (err) {
        console.error("History translation error:", err);
      }
    })();
  }, [roomId, userId]);

  // Setup socket after history
  useEffect(() => {
    if (!userId) return;
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinRoom", {
      roomId,
      userId,
      userName: user.name
    });

    socket.on("receiveMessage", (msg) => {
      // translate incoming if map available
      const content = translationMap
        ? translateJSON(msg.content, translationMap)
        : msg.content;
      setMessages(prev => [...prev, { ...msg, content }]);
    });

    socket.on("messageSaved", ({ _id, tempId }) => {
      setMessages(prev =>
        prev.map(m => (m._id === tempId ? { ...m, _id } : m))
      );
    });

    socket.on("userJoined", ({ userName }) => {
      const raw = `${userName} joined`;
      const content = translationMap?.[raw] || raw;
      setMessages(prev => [
        ...prev,
        {
          _id: `join-${Date.now()}`,
          sender: { name: uiText.systemLabel },
          content,
          timestamp: new Date().toISOString()
        }
      ]);
    });

    socket.on("userLeft", ({ userName }) => {
      const raw = `${userName} left`;
      const content = translationMap?.[raw] || raw;
      setMessages(prev => [
        ...prev,
        {
          _id: `left-${Date.now()}`,
          sender: { name: uiText.systemLabel },
          content,
          timestamp: new Date().toISOString()
        }
      ]);
    });

    setUsernamenew(user.name);

    return () => socket.disconnect();
  }, [roomId, userId, translationMap, uiText.systemLabel, user.name, setUsernamenew]);

  // Announce video call
  useEffect(() => {
    if (!callroomID || hasAnnouncedCall.current || !socketRef.current) return;
    hasAnnouncedCall.current = true;

    const raw = `${user.name} ${uiText.startedCallLabel} ${callroomID}`;
    const content = translationMap?.[raw] || raw;
    const tempId = `call-${Date.now()}`;
    const messagePayload = {
      roomId,
      senderId: userId,
      content,
      tempId,
      meta: { isCallInvite: true }
    };

    socketRef.current.emit("sendMessage", messagePayload);
    setMessages(prev => {
      const exists = prev.some(m => m.content === content);
      return exists
        ? prev
        : [
            ...prev,
            {
              _id: tempId,
              sender: { name: uiText.systemLabel },
              content,
              timestamp: new Date().toISOString()
            }
          ];
    });
  }, [callroomID, roomId, userId, user.name, translationMap, uiText.startedCallLabel, uiText.systemLabel]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!uiText) return;
    const raw = message.trim();
    if (!raw) return;

    const tempId = Date.now().toString();
    const msgPayload = {
      roomId,
      senderId: userId,
      content: raw,
       timestamp: new Date().toISOString(),
      tempId
    };
    setMessages(prev => [...prev, { _id: tempId, sender: user, content: raw, timestamp: new Date().toISOString() }]);
    socketRef.current.emit("sendMessage", msgPayload);
    setMessage("");
  };

  // Chat input state
  const [message, setMessage] = useState("");

  // Render
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] ">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#bb5b45] bg-[url('/assets/images/Assistant-Bg.png')] bg-cover  p-2 border-b shadow-sm">
        <h2 className="text-lg text-white font-semibold">{uiText.chatTitle}</h2>
        <div className="flex gap-3">
        <button
          onClick={() => navigate(`/samadhan-meet/${roomId}`)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {/* {uiText.startMeeting} */}
          <Video className="w-5 h-5" />
        </button>
        <button
          onClick={() => setConsentOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {/* {uiText.consentForm} */}
          <FileSignature className="w-5 h-5" />
        </button>
        </div>
      </div>

      <ConsentFormModal
        isOpen={isConsentOpen}
        onClose={() => setConsentOpen(false)}
        roomId={roomId}
        userId={userId}
      />

      <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-[url('/assets/images/LanguageSelectBG.png')] bg-cover">
        {messages.map((msg, i) => {
          const isMe = msg.sender._id === userId;
          const alignment = isMe ? "items-end" : "items-start";
           const textAlign = isMe ? "text-right" : "text-left";
            const bubbleColor = isMe ? "bg-[#d1a76e]" : "bg-white";
          const style = isMe ? "bg-white-50 text-right" : "bg-gray-100 text-left";
          const key = msg._id || `${msg.content}-${i}`;

          return (
           <div key={msg._id || idx} className={`flex flex-col ${alignment}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${bubbleColor} ${textAlign}`}
              >
                <p className="text-sm text-black font-semibold">
                  {msg.sender.name}
                </p>
                <p className="text-sm text-black inline-block">
                  {msg.content}
                </p>
                {/* <p className="text-xs text-gray-800 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p> */}

              </div>
              <div>
                
                {msg.meta?.isCallInvite && !isMe && (
                  <button
                    className="ml-2 text-blue-600 underline hover:text-blue-800"
                    onClick={() =>
                      navigate(`/samadhan-meet/${roomId}?roomID=${callroomID}`)
                    }
                  >
                    {uiText.joinCall}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex items-center p-3 bg-[#bb5b45] border-t">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={uiText.placeholder}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-[#d1a76e] hover:bg-green-600 text-black px-4 py-2 rounded-full"
        >
          {uiText.sendButton}
        </button>
      </div>
    </div>
  );
}
