import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ConsentFormModal from "./ConsentFormModal"; 
import { Video,User } from "lucide-react";// Import the modal at the top

const SERVER_URL = "http://localhost:5000";

export default function Chat({ callroomID, setUsernamenew }) {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const endRef = useRef(null);
  const hasAnnouncedCall = useRef(false);
  const [isConsentOpen, setConsentOpen] = useState(false);

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
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <button
          onClick={startMeeting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Start Meeting
        </button>
        <button
          onClick={() => setConsentOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Consent Form
        </button>
      </div>
      <ConsentFormModal
        isOpen={isConsentOpen}
        onClose={() => setConsentOpen(false)}
        roomId={roomId}
        userId={user._id}
      />
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user._id;
          const style = isMe
            ? "bg-blue-100 text-right"
            : "bg-gray-100 text-left";

          const messageKey =
            msg._id || `${msg.content}-${msg.timestamp || index}`;

          return (
            <div key={messageKey} className={`mb-2 p-2 rounded ${style}`}>
              <div className="font-semibold text-sm">{msg.sender.name}</div>
              <div>
                <div>
                  {msg.content}
                  {msg.content.includes("started a video call") &&
                    msg.sender._id !== user._id && (
                      <button
                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                        onClick={() => {
                          const roomMatch = msg.content.match(/room ID: (\w+)/);
                          const joinRoomId = roomMatch ? roomMatch[1] : null;
                          if (joinRoomId) {
                            navigate(
                              `/samadhan-meet/${roomId}?roomID=${joinRoomId}`
                            );
                          }
                        }}
                      >
                        Join Call
                      </button>
                    )}
                </div>
              </div>
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
