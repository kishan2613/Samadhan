import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchChatRooms = async () => {
    const user = localStorage.getItem('user') 
    try {
      const res = await fetch('http://localhost:5000/api/chat/myRooms', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id}), 
      });

      if (!res.ok) throw new Error('Failed to fetch chat rooms');
      const data = await res.json();
      setChatRooms(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
    fetchChatRooms();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-xl">Loading chat rooms...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Chat Rooms</h2>

      {chatRooms.length === 0 ? (
        <p className="text-center text-gray-500">You are not part of any chat rooms yet.</p>
      ) : (
        <div className="grid gap-6">
          {chatRooms.map((room) => (
            <div
              key={room._id}
              className="border border-gray-300 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white"
            >
              <p className="text-lg font-semibold text-gray-800">Room ID: {room._id}</p>
              <p className="mt-2 text-gray-700">
                <strong>Members:</strong>{' '}
                {room.members.map((member) => member.name).join(', ')}
              </p>
              {room.proposal && (
                <p className="mt-1 text-gray-700">
                  <strong>Proposal:</strong> {room.proposal.title || 'No Title'}
                </p>
              )}
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate(`/chat/${room._id}`)}
              >
                Open Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatRooms;
