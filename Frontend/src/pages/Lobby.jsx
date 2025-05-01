import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider.jsx";

function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();
  const handlesubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );
  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/VideoCall/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Enter Your Name And Room ID Below
        </h1>
        <form className="space-y-4" onSubmit={handlesubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="room"
              className="block text-sm font-medium text-gray-700"
            >
              Room ID
            </label>
            <input
              type="text"
              id="room"
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
              placeholder="Enter room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
export default Lobby;
