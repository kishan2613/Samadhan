import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fetchChatRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/myRooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!res.ok) throw new Error("Failed to fetch chat rooms");
      const data = await res.json();
      setChatRooms(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl">Loading chat rooms...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Your Chat Rooms
      </h2>

      {chatRooms.length === 0 ? (
        <p className="text-center text-gray-500">
          You are not part of any chat rooms yet.
        </p>
      ) : (
        <div className="grid gap-8">
          {chatRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white shadow-lg rounded-2xl p-6 transition-transform hover:scale-[1.01]"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Room ID: <span className="text-blue-700">{room._id}</span>
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {room.members.map((member) => (
                  <div
                    key={member._id}
                    className="bg-gray-50 p-4 rounded-lg border hover:border-blue-500 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          member.image
                            ? member.image
                            : "https://via.placeholder.com/64x64?text=User"
                        }
                        alt={member.name}
                        className="w-14 h-14 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="text-md font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                            member.role === "mediator"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() =>
                    navigate(`/chat/${room._id}`, {
                      state: { roomId: room._id, userId: user._id },
                    })
                  }
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatRooms;
