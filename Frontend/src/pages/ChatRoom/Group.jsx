import React, { useState } from "react";
import ChatRooms from "./Rooms";
import Chat from "./Chat";
// import MicButton from "./MicButton";
import VideoConference from "./VideoConference";
import { useParams,useLocation } from "react-router-dom";

export default function Groups() {
  const { roomId } = useParams();
  const [callroomID, setCallroomID] = useState("");
  const [usernamenew, setUsernamenew] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const location = useLocation();
  const isMeetingRoute = location.pathname === `/samadhan-meet/${roomId}`;
  const {Title} = location.state || {};
   

  return (
    <div className="relative flex min-h-screen bg-cover border-[2px] ">
      {/* Main Content */}
      <div className={`flex w-full ${isMeetingRoute ? "blur-sm pointer-events-none" : ""}`}>
        <div className="w-7/12 hidden md:block">
          <ChatRooms  />
        </div>
        <div className="w-full ">
          <Chat callroomID={callroomID} setUsernamenew={setUsernamenew} roomTitle={Title} />
        </div>
      </div>

      {/* Fullscreen Video Conference Popup */}
      {isMeetingRoute && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center shadow-xl">
          <VideoConference setCallroomID={setCallroomID} usernamenew={usernamenew} />
        </div>
      )}
    </div>
  );
}
