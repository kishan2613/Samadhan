import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { MeetingURLProvider } from "../src/pages/MeetingURLContext.jsx";

createRoot(document.getElementById("root")).render(
  <MeetingURLProvider>
    <App />
  </MeetingURLProvider>
);
