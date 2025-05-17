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

  if (chatRooms.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        You are not part of any chat rooms yet.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 p-4">
      {chatRooms.map((room) => {
        const mediator = room.members.find((member) => member.role === "mediator");
        const parties = room.members.filter((member) => member.role !== "mediator");

        if (!mediator || parties.length < 2) return null;

        const partyNames = parties.map((p) => {
          if (p._id === user._id) {
            return "You";
          }
          return p.name;
        });

        const roomTitle = `Chat room with ${partyNames.join(" and ")}`;

        return (
          <div
            key={room._id}
            className="flex items-center justify-between border rounded-lg p-4 shadow bg-white cursor-pointer hover:shadow-md transition"
            onClick={() => 
              navigate(`/chat/${room._id}`, {
                state: { roomId: room._id, userId: user._id },
              })
            }
          >
            <div className="flex items-center">
              <img
                src={
                  mediator.image
                    ? mediator.image
                    : "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
                }
                alt={mediator.name}
                className="w-20 h-20 rounded-lg object-cover mr-4"
              />
              <div>
                <h2 className="text-lg font-semibold">{roomTitle}</h2>
                <p className="text-sm text-green-700">Mediator: {mediator.name}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatRooms;
