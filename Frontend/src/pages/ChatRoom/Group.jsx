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
  const location = useLocation();
  const isMeetingRoute = location.pathname === `/samadhan-meet/${roomId}`;
 
   

  return (
    <div className="relative flex pt-20 bg-white border-[2px] min-h-screen">
      {/* Main Content */}
      <div className={`flex w-full ${isMeetingRoute ? "blur-sm pointer-events-none" : ""}`}>
        <div className="w-1/3">
          <ChatRooms />
        </div>
        <div className="w-2/3">
          <Chat callroomID={callroomID} setUsernamenew={setUsernamenew} />
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
