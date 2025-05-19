import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Video,User } from "lucide-react";

const SERVER_URL = "http://localhost:5000";

export default function Chat({ callroomID , setUsernamenew, roomTitle }) {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const hasAnnouncedCall = useRef(false);

  // Load previous chat history
  useEffect(() => {
    axios
      .post(`${SERVER_URL}/api/chat/${roomId}`, { userId: user._id })
      .then((res) => setMessages(res.data.messages || []))
      .catch(console.error);
  }, [roomId, user._id]);

  // Setup socket connection
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
   setUsernamenew(user.name);

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

    return () => {
      socket.disconnect();
    };
  }, [roomId, user._id, user.name]);

  // Announce video call once if callroomID is available
  useEffect(() => {
    if (!callroomID || hasAnnouncedCall.current || !socketRef.current) return;

    hasAnnouncedCall.current = true;

    const tempId = `call-${Date.now()}`;
    const content = `${user.name} started a video call with room ID: ${callroomID}`;
   
    const messagePayload = {
      roomId, // send to room that users joined
      senderId: user._id,
      content,
      tempId,
      meta: { isCallInvite: true },
    };

    socketRef.current.emit("sendMessage", messagePayload);

    const optimisticMsg = {
      _id: tempId,
      sender: { name: "System" },
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const alreadyExists = prev.some((m) => m.content === content);
      return alreadyExists ? prev : [...prev, optimisticMsg];
    });
  }, [callroomID, roomId, user._id, user.name]);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const navigate = useNavigate();

  const startMeeting = () => {
    navigate(`/samadhan-meet/${roomId}`);
  };

return (
  <div className="flex flex-col h-[calc(100vh-4rem)] mt-16">
    {/* Header */}
    <div className="flex items-center justify-between bg-[#bb5b45] px-4 py-2 border-b shadow-sm">
      <div className="flex gap-2">
        <User className="w-8 h-8 p-1 rounded-full bg-white text-gray-700" />
        <h2 className="text-lg font-semibold text-white">{roomTitle || "Chat Room"}</h2>
      </div>  
      <button
        onClick={startMeeting}
        className="bg-[#d1a76e] text-white p-2 rounded-full hover:bg-[#20c15d]"
        title="Start Video Call"
      >
        <Video className="w-5 h-5" />
      </button>
    </div>

    {/* Chat messages area */}
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/assets/images/LanguageSelectBG.png')]  bg-cover">
      {messages.map((msg, index) => {
        const isMe = msg.sender?._id === user._id;
        const alignment = isMe ? "items-end" : "items-start";
        const bubbleColor = isMe ? "bg-[#d1a76e]" : "bg-white";
        const textAlign = isMe ? "text-right" : "text-left";

        return (
          <div key={msg._id || index} className={`flex flex-col ${alignment}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${bubbleColor} ${textAlign}`}>
              <p className="text-xs text-black">{msg.sender.name}</p> 
              <p className="text-sm text-black">{msg.content}</p>
              <p className="text-xs text-grey-800">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>

    {/* Input area */}
    <div className="flex items-center p-3 bg-[#bb5b45] border-t">
      <input
        type="text"
        placeholder="Type a message"
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
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
