import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useMeetingURL } from "../MeetingURLContext";
import MicButton from "./MicButton";

// Utility to generate a random ID
function generateRandomID(len = 5) {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get URL params
export function getUrlParams(url = window.location.href) {
  const urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function App({ setCallroomID ,usernamenew }) {
  const containerRef = React.useRef(null);
  const hasJoined = React.useRef(false);
  const { setMeetingURL } = useMeetingURL();

  // Room ID
  const [roomID] = React.useState(() => {
    const existingRoomID = getUrlParams().get("roomID");
    return existingRoomID || generateRandomID();
  });

  // ✅ Create user ID and name once
  const [userID] = React.useState(() => generateRandomID());
  const [userName] = React.useState(() => generateRandomID());

  // Notify parent of roomID on mount
  React.useEffect(() => {
    if (setCallroomID) setCallroomID(roomID);
  }, [roomID, setCallroomID]);

  function notifyChatAboutMeeting(user, url) {
    console.log(`📢 ${user} started a call. Join: ${url}`);
  }

  const myMeeting = async (element) => {
    const appID = 1678403075;
    const serverSecret = "3e380849c2eef6d8c941e6ba23aefeed";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const meetingURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`;
    setMeetingURL(meetingURL);

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy this link",
          url: meetingURL,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });

    notifyChatAboutMeeting(userName, meetingURL);
  };

  React.useEffect(() => {
    if (containerRef.current && !hasJoined.current) {
      hasJoined.current = true;
      myMeeting(containerRef.current);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <div
        className="myCallContainer"
        ref={containerRef}
        style={{ width: "100vw", height: "100vh" }}
      />
      <div className="absolute bottom-6 left-6 z-50">
        {/* ✅ userName now available from state */}
        <MicButton roomId={roomID} username={usernamenew} />
      </div>
    </div>
  );
}
