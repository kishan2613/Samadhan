import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatRooms = ({setRoomTitle}) => {
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
  <div className="w-full h-full mt-16 mb-4 pt-2 ">
    <div className="max-w-md mx-auto  ">
      {chatRooms.map((room) => {
        const mediator = room.members.find((member) => member.role === "mediator");
        const parties = room.members.filter((member) => member.role !== "mediator");

        if (!mediator || parties.length < 2) return null;

        const partyNames = parties.map((p) => (p._id === user._id ? "You" : p.name));
        const roomTitle = `${partyNames.join(" and ")}`;

        return (
          <div
            key={room._id}
            className="flex items-center px-4 py-3 rounded-xl m-2 bg-white hover:bg-[#ebebeb] border-b cursor-pointer transition"
            onClick={() =>
              navigate(`/chat/${room._id}`, {
                state: { Title: roomTitle, roomId: room._id, userId: user._id },
              })
            }
          >
            <img
              src={
                mediator.image
                  ? mediator.image
                  : "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
              }
              alt={mediator.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div className="flex-1 border-b border-gray-100 pb-2">
              <h2 className="text-[15px] font-medium text-gray-800">{roomTitle}</h2>
              <p className="text-xs text-gray-500">Mediator: {mediator.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

};

export default ChatRooms;
