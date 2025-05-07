import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = 'http://localhost:5000';
export default function Chat() {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem('user')); // { _id, name }

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  // load history
  useEffect(() => {
    axios.post(`${SERVER_URL}/api/chat/${roomId}`, { userId: user._id })
      .then(res => setMessages(res.data.messages || []))
      .catch(console.error);
  }, [roomId, user._id]);

  // setup socket
  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ['websocket'] });
    // join with identity
    socketRef.current.emit('joinRoom', { roomId, userId: user._id, userName: user.name });

    // incoming chat
    socketRef.current.on('receiveMessage', msg => setMessages(prev => [...prev, msg]));
    socketRef.current.on('messageSaved', ({ _id, tempId }) => {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _id } : m));
    });

    // user join/leave notifications
    socketRef.current.on('userJoined', ({ userName }) => {
      setMessages(prev => [...prev, { _id: `join-${Date.now()}`, sender: { name: 'System' }, content: `${userName} joined`, timestamp: new Date().toISOString() }]);
    });
    socketRef.current.on('userLeft', ({ userName }) => {
      setMessages(prev => [...prev, { _id: `left-${Date.now()}`, sender: { name: 'System' }, content: `${userName} left`, timestamp: new Date().toISOString() }]);
    });

    return () => {
      socketRef.current.off('receiveMessage');
      socketRef.current.off('messageSaved');
      socketRef.current.off('userJoined');
      socketRef.current.off('userLeft');
      socketRef.current.disconnect();
    };
  }, [roomId, user._id, user.name]);

  // scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const tempId = Date.now().toString();
    const optimistic = { _id: tempId, sender: user, content: message, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    socketRef.current.emit('sendMessage', { roomId, senderId: user._id, content: message, tempId });
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded flex flex-col h-[80vh]">
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map(msg => {
          const isMe = msg.sender._id === user._id;
          const style = isMe ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left';
          return (
            <div key={msg._id} className={`mb-2 p-2 rounded ${style}`}>
              <div className="font-semibold text-sm">{msg.sender.name}</div>
              <div>{msg.content}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
  
      {/* Input box */}
      <div className="flex items-center mt-4">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
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
  
}
