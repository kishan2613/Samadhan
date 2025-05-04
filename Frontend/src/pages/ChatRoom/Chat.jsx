// components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // replace with your backend

const Chat = ({ roomId, userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Join the room on mount
  useEffect(() => {
    socket.emit('joinRoom', roomId);
    fetchMessages();

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Fetch message history from backend
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${roomId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    socket.emit('sendMessage', {
      roomId,
      senderId: userId,
      content: message
    });

    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow bg-white h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className={`mb-2 ${msg.sender === userId ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${msg.sender === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border px-4 py-2 rounded-l focus:outline-none"
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
};

export default Chat;
