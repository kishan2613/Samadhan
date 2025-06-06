import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ConsentFormModal from "./ConsentFormModal";
import ChatUI from "../../WebData/ChatUI.json";

const SERVER_URL = "http://localhost:5000";

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
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold">{uiText.chatTitle}</h2>
        <button
          onClick={() => navigate(`/samadhan-meet/${roomId}`)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {uiText.startMeeting}
        </button>
        <button
          onClick={() => setConsentOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {uiText.consentForm}
        </button>
      </div>

      <ConsentFormModal
        isOpen={isConsentOpen}
        onClose={() => setConsentOpen(false)}
        roomId={roomId}
        userId={userId}
      />

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, i) => {
          const isMe = msg.sender._id === userId;
          const style = isMe ? "bg-blue-100 text-right" : "bg-gray-100 text-left";
          const key = msg._id || `${msg.content}-${i}`;

          return (
            <div key={key} className={`mb-2 p-2 rounded ${style}`}>
              <div className="font-semibold text-sm">
                {msg.sender.name}
              </div>
              <div>
                {msg.content}
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

      <div className="flex items-center mt-4">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={uiText.placeholder}
          className="flex-1 border px-4 py-2 rounded-l focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          {uiText.sendButton}
        </button>
      </div>
    </div>
  );
}
