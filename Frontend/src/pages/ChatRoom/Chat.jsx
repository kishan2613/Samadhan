// Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SERVER_URL = 'http://localhost:5000';

export default function Chat() {
  const { roomId } = useParams();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // 1) Create socket and join room on connect
  const socketRef = useRef();
  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      console.log('Socket connected, joining room', roomId);
      socketRef.current.emit('joinRoom', roomId);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  // 2) After join, fetch history & listen
  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      // Wait for socket to connect
      const onConnect = () => {
        socketRef.current.emit('joinRoom', roomId);

        // fetch after join
        axios
          .post(`${SERVER_URL}/api/chat/${roomId}`, { userId: user._id })
          .then(res => setMessages(res.data.messages || []))
          .catch(console.error);

        socketRef.current.on('receiveMessage', handleReceive);
      };
      socketRef.current.on('connect', onConnect);
      return () => {
        socketRef.current.off('connect', onConnect);
      };
    }

    // Already connected
    axios
      .post(`${SERVER_URL}/api/chat/${roomId}`, { userId: user._id })
      .then(res => setMessages(res.data.messages || []))
      .catch(console.error);

    socketRef.current.on('receiveMessage', handleReceive);
    return () => {
      socketRef.current.off('receiveMessage', handleReceive);
    };
  }, [roomId, user._id]);

  function handleReceive(msg) {
    setMessages(prev => [...prev, msg]);
  }

  // 3) Auto‐scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4) Send
  const handleSend = async () => {
    if (!message.trim()) return;
    const tempId = Date.now().toString();
    const optimistic = {
      _id: tempId,
      sender: user,
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    socketRef.current.emit('sendMessage', {
      roomId,
      senderId: user._id,
      content: message,
    });

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/chat/${roomId}/message`,
        { content: message, userId: user._id }
      );
      setMessages(prev =>
        prev.map(m => (m._id === tempId ? { ...m, _id: res.data._id } : m))
      );
    } catch (err) {
      console.error('Save error', err);
    }

    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow bg-white h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map(msg => {
          const isMe = msg.sender._id === user._id;
          return (
            <div
              key={msg._id}
              className={`mb-2 p-2 rounded ${
                isMe ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
              }`}
            >
              <div className="font-semibold text-sm">{msg.sender.name}</div>
              <div>{msg.content}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center">
        <input
          className="flex-1 border px-4 py-2 rounded-l focus:outline-none"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
