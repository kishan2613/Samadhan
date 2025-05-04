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
      const { room } = data;
      navigate(`/VideoCall/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => socket.off("room:join", handleJoinRoom);
  }, [socket, handleJoinRoom]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-gradient bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] bg-[length:400%_400%] transition-all duration-1000">
      {/* Form Section */}
<div className="flex-1 flex items-center justify-center px-6 py-10">
  <div className="bg-white/80 shadow-2xl rounded-3xl p-10 w-full max-w-md border border-[#e5d8c6] backdrop-blur-md animate-fadeIn">
    <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-[#c28f53] via-[#a9744d] to-[#8e5d37] text-transparent bg-clip-text mb-8">
      Mediator Connect
    </h2>
    <form className="space-y-6" onSubmit={handlesubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
        <div className="relative mt-1">
          <input
            type="email"
            id="email"
            className="w-full rounded-md border border-gray-300 p-3 pl-10 outline-none focus:ring-2 focus:ring-[#c1440e] transition"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V9a4 4 0 10-8 0v3m8 0H8" />
          </svg>
        </div>
      </div>
      <div>
        <label htmlFor="room" className="block text-sm font-semibold text-gray-700">Room ID</label>
        <div className="relative mt-1">
          <input
            type="text"
            id="room"
            className="w-full rounded-md border border-gray-300 p-3 pl-10 outline-none focus:ring-2 focus:ring-[#c1440e] transition"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-3-3.87M4 4v16h16V4H4zm4 4h8v2H8V8z" />
          </svg>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#d1a76e] via-[#c28f53] to-[#a9744d] hover:from-[#cfa56d] hover:to-[#976039] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-xl"
      >
        Join Now
      </button>
    </form>
  </div>
</div>


     {/* Right Content Section */}
<div className="flex-1 flex items-center justify-center p-10 bg-white/40  rounded-l-xl">
  <div className="  rounded-2xl p-8 max-w-md w-full space-y-5 ">
    <div className="flex justify-center">
      <img
        src="/assets/images/About-Hero.png"
        alt="Mediator Connect"
        className="max-w-[300px] rounded-md "
      />
    </div>
    <h3 className="text-2xl font-bold text-[#3a2c1e] flex items-center justify-center gap-2">
      <svg
        className="w-6 h-6 text-[#c1440e]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Resolve Disputes Peacefully
    </h3>
    <p className="text-gray-700 text-sm leading-relaxed">
      Instantly connect with <span className="font-semibold text-[#a86c42]">verified mediators</span> via secure video calls. 
      Get the help you need without the hassle of long legal battles.
    </p>
    <div className="text-sm italic text-[#5e5145] bg-[#f6efea] rounded-lg p-3 border border-[#dfcdbb]">
      "Justice delayed is justice denied. Talk it out with a mediator today."
    </div>
  </div>
</div>
    </div>
  );
}

export default Lobby;
