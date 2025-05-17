import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useMeetingURL } from "../pages/MeetingURLContext";

function randomID(len) {
  let result = "";
  if (result) return result;
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  const urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function App() {
  const containerRef = React.useRef(null);
  const hasJoined = React.useRef(false);
  const { setMeetingURL } = useMeetingURL();  // get setter from context

  const roomID = getUrlParams().get("roomID") || randomID(5);

  function notifyChatAboutMeeting(user, url) {
    console.log(`📢 ${user} started a call. Join: ${url}`);
  }

  const myMeeting = async (element) => {
    const appID = 1678403075;
    const serverSecret = "3e380849c2eef6d8c941e6ba23aefeed";

    const userID = randomID(5);
    const userName = randomID(5);

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const meetingURL =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?roomID=" +
      roomID;

    setMeetingURL(meetingURL); // Set meeting URL in context

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy link",
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
    <div
      className="myCallContainer"
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
