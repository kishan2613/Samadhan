// MeetingURLContext.jsx
import React, { createContext, useState, useContext } from "react";

const MeetingURLContext = createContext();

export function MeetingURLProvider({ children }) {
  const [meetingURL, setMeetingURL] = useState("");

  return (
    <MeetingURLContext.Provider value={{ meetingURL, setMeetingURL }}>
      {children}
    </MeetingURLContext.Provider>
  );
}

export function useMeetingURL() {
  return useContext(MeetingURLContext);
}
