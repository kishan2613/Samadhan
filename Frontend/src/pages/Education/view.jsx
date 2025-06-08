import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Collapse,
  Paper,
  Button,
  Dialog,
  useTheme,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress, // Import CircularProgress for the loader
  Backdrop, // Import Backdrop for the loader overlay
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  School,
  ArrowForward,
  EmojiEvents,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
// Ensure the path to your JSON data is correct
import educationData from "../../WebData/Education.json";
import TranslateText from "../../WebData/EduText.json"; // Imported the translation text file

// --- API Endpoint ---
const TRANSLATE_API_URL = "http://localhost:5000/translate/translate-and-speak";

// --- Constants ---
const TYPING_SPEED = 150; // Milliseconds per word/token for visual typing
// Removed CLEAR_DELAY
const AUTOPLAY_ADVANCE_DELAY = 2000; // Delay before auto-advancing to the next submodule AFTER content is ready
const PREFERRED_LANG_STORAGE_KEY = "preferredLang"; // Key for localStorage
const DEFAULT_TARGET_LANG = localStorage.getItem("preferredLanguage"); // Set default language to 'hi'

// --- Custom Styled Components (Keep as before) ---
const PageContainer = styled(Box)(() => ({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fff9e6 0%, #ffefba 100%)",
  fontFamily: "Comic Sans MS, Poppins, sans-serif",
  overflow: "hidden",
  "@media (max-width: 600px)": {
    flexDirection: "column",
    minHeight: "auto",
  },
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  width: "30%",
  flexShrink: 0,
  overflowY: "auto",
  borderRight: "3px solid #ffcc80",
  padding: theme.spacing(4),
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: "0 20px 20px 0",
  boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
  "@media (max-width: 600px)": {
    width: "100%",
    borderRight: "none",
    borderBottom: "3px solid #ffcc80",
    maxHeight: "50vh",
    padding: theme.spacing(2),
    borderRadius: "0 0 20px 20px",
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  width: "70%",
  flexGrow: 1,
  padding: theme.spacing(6),
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "@media (max-width: 600px)": {
    width: "100%",
    padding: theme.spacing(2),
  },
}));

const BoardContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#8b4513",
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.2), inset 0 -4px 8px rgba(0,0,0,0.2)",
  marginBottom: theme.spacing(4),
  height: "60vh",
  maxHeight: "600px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.01)",
  },
  "@media (max-width: 900px)": {
    height: "50vh",
    maxHeight: "500px",
    padding: theme.spacing(2),
  },
  "@media (max-width: 600px)": {
    height: "40vh",
    maxHeight: "400px",
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.shape.borderRadius * 3,
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
    pointerEvents: "none",
    zIndex: 1,
  },
}));

const GreenBoard = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: "#2e7d32",
  color: "#ffffff",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  position: "relative",
  overflowY: "auto", // Scrolling on the Paper itself
  display: "flex",
  flexDirection: "column",
  boxShadow: "none",
  paddingBottom: theme.spacing(8), // Increased padding to make space for fixed buttons/character
  // Chalk dust effect
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='30' cy='50' r='1'/%3E%3Ccircle cx='70' cy='30' r='1'/%3E%3Ccircle cx='25' cy='76' r='1'/%3E%3Ccircle cx='50' cy='15' r='1'/%3E%3Ccircle cx='85' cy='65' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 1,
  },
  // Custom scrollbar
  scrollbarColor: "rgba(255,255,255,0.5) #2e7d32",
  scrollbarWidth: "thin",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#2e7d32",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
}));

const StartButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2, 4),
  fontSize: "1.5rem",
  fontWeight: "bold",
  borderRadius: "30px",
  backgroundColor: "#ff9800",
  color: "#fff",
  boxShadow: "0 6px 0 #e65100, 0 8px 16px rgba(0,0,0,0.2)",
  transition: "all 0.2s ease",
  textTransform: "none",
  fontFamily: "Comic Sans MS, Poppins, sans-serif",
  "&:hover": {
    backgroundColor: "#ff9800",
    boxShadow: "0 4px 0 #e65100, 0 6px 12px rgba(0,0,0,0.18)",
    transform: "translateY(2px)",
  },
  "&:active": {
    backgroundColor: "#f57c00",
    boxShadow: "0 2px 0 #e65100, 0 3px 6px rgba(0,0,0,0.14)",
    transform: "translateY(4px)",
  },
}));

const NextButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: "1.2rem",
  fontWeight: "bold",
  borderRadius: "20px",
  backgroundColor: "#4caf50",
  color: "#fff",
  boxShadow: "0 4px 0 #2e7d32, 0 6px 12px rgba(0,0,0,0.18)",
  transition: "all 0.2s ease",
  textTransform: "none",
  fontFamily: "Comic Sans MS, Poppins, sans-serif",
  "&:hover": {
    backgroundColor: "#4caf50",
    boxShadow: "0 3px 0 #2e7d32, 0 4px 8px rgba(0,0,0,0.16)",
    transform: "translateY(1px)",
  },
  "&:active": {
    backgroundColor: "#388e3c",
    boxShadow: "0 1px 0 #2e7d32, 0 2px 4px rgba(0,0,0,0.14)",
    transform: "translateY(3px)",
  },
}));

// Teacher character SVG component (Keep as before)
// const TeacherCharacter = () => (
//   <Box
//     sx={{
//       width: "150px",
//       height: "200px",
//       position: "relative",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       "@media (max-width: 600px)": {
//         width: "100px",
//         height: "150px",
//       },
//     }}
//   >
//     {/* Head */}
//     <Box
//       sx={{
//         width: "70px",
//         height: "70px",
//         borderRadius: "50%",
//         backgroundColor: "#ffdbac",
//         position: "relative",
//         zIndex: 2,
//         "@media (max-width: 600px)": {
//           width: "50px",
//           height: "50px",
//         },
//       }}
//     >
//       {/* Eyes */}
//       <Box
//         sx={{
//           width: "10px",
//           height: "10px",
//           borderRadius: "50%",
//           backgroundColor: "#000",
//           position: "absolute",
//           top: "25px",
//           left: "20px",
//           "@media (max-width: 600px)": {
//             width: "8px",
//             height: "8px",
//             top: "20px",
//             left: "15px",
//           },
//         }}
//       />
//       <Box
//         sx={{
//           width: "10px",
//           height: "10px",
//           borderRadius: "50%",
//           backgroundColor: "#000",
//           position: "absolute",
//           top: "25px",
//           right: "20px",
//           "@media (max-width: 600px)": {
//             width: "8px",
//             height: "8px",
//             top: "20px",
//             right: "15px",
//           },
//         }}
//       />

//       {/* Smile */}
//       <Box
//         sx={{
//           width: "30px",
//           height: "15px",
//           borderBottomLeftRadius: "30px",
//           borderBottomRightRadius: "30px",
//           border: "2px solid #000",
//           borderTop: "none",
//           position: "absolute",
//           bottom: "15px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           "@media (max-width: 600px)": {
//             width: "25px",
//             height: "12px",
//             bottom: "10px",
//           },
//         }}
//       />

//       {/* Hair */}
//       <Box
//         sx={{
//           width: "80px",
//           height: "25px",
//           borderTopLeftRadius: "40px",
//           borderTopRightRadius: "40px",
//           backgroundColor: "#6a4126",
//           position: "absolute",
//           top: "-5px",
//           left: "-5px",
//           "@media (max-width: 600px)": {
//             width: "60px",
//             height: "20px",
//             top: "-5px",
//             left: "-5px",
//           },
//         }}
//       />

//       {/* Glasses */}
//       <Box
//         sx={{
//           width: "20px",
//           height: "20px",
//           border: "2px solid #666",
//           borderRadius: "50%",
//           position: "absolute",
//           top: "22px",
//           left: "15px",
//           backgroundColor: "transparent",
//           "@media (max-width: 600px)": {
//             width: "16px",
//             height: "16px",
//             top: "18px",
//             left: "12px",
//           },
//         }}
//       />
//       <Box
//         sx={{
//           width: "20px",
//           height: "20px",
//           border: "2px solid #666",
//           borderRadius: "50%",
//           position: "absolute",
//           top: "22px",
//           right: "15px",
//           backgroundColor: "transparent",
//           "@media (max-width: 600px)": {
//             width: "16px",
//             height: "16px",
//             top: "18px",
//             right: "12px",
//           },
//         }}
//       />
//       <Box
//         sx={{
//           width: "10px",
//           height: "2px",
//           backgroundColor: "#666",
//           position: "absolute",
//           top: "32px",
//           left: "35px",
//           transform: "translateX(-50%)",
//           "@media (max-width: 600px)": {
//             width: "6px",
//             top: "26px",
//             left: "25px",
//           },
//         }}
//       />
//     </Box>

//     {/* Body */}
//     <Box
//       sx={{
//         width: "90px",
//         height: "120px",
//         borderRadius: "20px 20px 0 0",
//         backgroundColor: "#3f51b5",
//         marginTop: "-10px",
//         position: "relative",
//         zIndex: 1,
//         "@media (max-width: 600px)": {
//           width: "70px",
//           height: "100px",
//         },
//       }}
//     >
//       {/* Collar */}
//       <Box
//         sx={{
//           width: "60px",
//           height: "20px",
//           borderTopLeftRadius: "10px",
//           borderTopRightRadius: "10px",
//           backgroundColor: "#fff",
//           position: "absolute",
//           top: "10px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           "@media (max-width: 600px)": {
//             width: "50px",
//             height: "15px",
//           },
//         }}
//       />

//       {/* Tie */}
//       <Box
//         sx={{
//           width: "20px",
//           height: "50px",
//           backgroundColor: "#ff5252",
//           position: "absolute",
//           top: "25px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           clipPath: "polygon(50% 0%, 100% 0%, 50% 100%, 0% 0%)",
//           "@media (max-width: 600px)": {
//             width: "16px",
//             height: "40px",
//             top: "20px",
//           },
//         }}
//       />

//       {/* Arms */}
//       <Box
//         sx={{
//           width: "20px",
//           height: "80px",
//           backgroundColor: "#3f51b5",
//           position: "absolute",
//           top: "20px",
//           left: "-15px",
//           borderRadius: "10px",
//           transform: "rotate(20deg)",
//           "@media (max-width: 600px)": {
//             width: "15px",
//             height: "70px",
//             left: "-12px",
//           },
//         }}
//       />
//       <Box
//         sx={{
//           width: "20px",
//           height: "80px",
//           backgroundColor: "#3f51b5",
//           position: "absolute",
//           top: "20px",
//           right: "-15px",
//           borderRadius: "10px",
//           transform: "rotate(-20deg)",
//           "@media (max-width: 600px)": {
//             width: "15px",
//             height: "70px",
//             right: "-12px",
//           },
//         }}
//       />
//     </Box>

//     {/* Chalk/Pointer */}
//     <Box
//       sx={{
//         width: "80px",
//         height: "8px",
//         backgroundColor: "#fff",
//         position: "absolute",
//         top: "130px",
//         left: "5px",
//         borderRadius: "4px",
//         transform: "rotate(-45deg)",
//         transformOrigin: "left center",
//         "@media (max-width: 600px)": {
//           width: "60px",
//           height: "6px",
//           top: "100px",
//         },
//       }}
//     />
//   </Box>
// );

const TeacherCharacter = () => (
  <Box
    sx={{
      position: "absolute",
      bottom: 0,
      right: 0,
      width: { xs: "120px", sm: "180px", md: "220px" },
      height: "auto",
      zIndex: 1,
      pointerEvents: "none", // optional: so it doesn't interfere with buttons
    }}
  >
    <img
      src="/assets/images/masterji.png" // Your image path
      alt="Teacher"
      style={{
        width: "100%",
        height: "auto",
        objectFit: "contain",
      }}
    />
  </Box>
);




// Basic markdown formatter
const formatMarkdown = (text) => {
  if (!text) return "";
  // Keep HTML tags and regex literals
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Preserve newlines, assuming the API returns them or they are inherent in the source data structure
  formattedText = formattedText.replace(/\n/g, "<br />");
  return formattedText;
};

// Helper function to extract strings from a nested object structure
const flattenObjectStrings = (obj) => {
  let allStrings = [];

  function recurse(current) {
    if (typeof current === "string") {
      if (current.trim().length > 0) {
        allStrings.push(current);
      }
    } else if (Array.isArray(current)) {
      current.forEach((item) => {
        if (
          typeof item === "string" ||
          (typeof item === "object" && item !== null)
        ) {
          recurse(item);
        }
      });
    } else if (typeof current === "object" && current !== null) {
      Object.values(current).forEach((value) => {
        if (
          typeof value === "string" ||
          (typeof value === "object" && value !== null)
        ) {
          recurse(value);
        }
      });
    }
  }

  recurse(obj);
  return allStrings.join("\n\n"); // Keep join string
};

// Main Component
export default function ClassroomComponent({ TranslateText }) {
  const [expandedModule, setExpandedModule] = useState(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState(null);
  const [displayContent, setDisplayContent] = useState(""); // Content currently on the board (animating)
  const [fullContent, setFullContent] = useState(""); // The full translated content string for animation
  const [isAnimating, setIsAnimating] = useState(false); // True if typing animation is running
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0); // Tracks module index for autoplay/completion
  const [currentSubmoduleIndex, setCurrentSubmoduleIndex] = useState(0); // Tracks submodule index for autoplay/completion
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const theme = useTheme();
  const [isSubmoduleComplete, setIsSubmoduleComplete] = useState(false); // True when the typing animation for the current submodule finishes

  // Loader States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    TranslateText["ui.board.loading"]
  ); // Replaced initial state string

  // Language State
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET_LANG); // Initialize with default

  // Refs for animation state, audio, and caching
  const animationTimeoutId = useRef(null); // Holds the ID of the active animation timeout
  const wordIndexRef = useRef(0); // Tracks the index of the next word to type from fullContent
  const wordsRef = useRef([]); // Array of words/spaces from fullContent
  // Removed isClearingRef
  const boardInnerRef = useRef(null); // Ref for the GreenBoard Paper element (the scrollable container)

  // Audio Refs
  const ttsAudioRef = useRef(null); // For the generated speech audio HTML element
  const currentAudioObjectURLRef = useRef(null); // To manage Audio object URLs for cleanup

  // Refs to store the interdependent animation functions to break circular dependencies
  const typeNextWordStepRef = useRef();
  // Removed startClearingRef
  const finishTypingAnimationRef = useRef();
  const stopAnimationRef = useRef();

  // Cache for translated content and audio data
  const translatedDataCache = useRef(new Map());

  // Get module keys from the imported data
  const moduleKeys = Object.keys(educationData);
  // console.log(moduleKeys)
  // --- Helper Functions (useCallback for stability) ---

  // Clean up the current audio object URL
  const revokeCurrentAudioObjectURL = useCallback(() => {
    if (currentAudioObjectURLRef.current) {
      console.log(
        TranslateText["console.revokingPreviousAudioUrl"],
        currentAudioObjectURLRef.current
      ); // Replaced console log string
      URL.revokeObjectURL(currentAudioObjectURLRef.current);
      currentAudioObjectURLRef.current = null;
    }
  }, [currentAudioObjectURLRef]);

  // Function to stop TTS audio playback
  const stopTtsAudioPlayback = useCallback(() => {
    if (ttsAudioRef.current && !ttsAudioRef.current.paused) {
      console.log(TranslateText["console.stoppingTtsAudio"]); // Replaced console log string
      ttsAudioRef.current.pause();
      // Don't reset currentTime on pause, only when starting new playback or cleanup
      // ttsAudioRef.current.currentTime = 0;
    }
  }, [ttsAudioRef]);

  // Function to play TTS audio from a base64 string - UPDATED TO MATCH processRecording cleanup
  const playTtsAudioFromBase64 = useCallback(
    async (base64) => {
      // stopTtsAudioPlayback() is called at the start of selectSubmodule
      // revokeCurrentAudioObjectURL() is called at the start of selectSubmodule

      if (!base64) {
        console.warn(TranslateText["console.noAudioDataProvided"]); // Replaced console warn string
        // Revoke any previous URL if no new data is provided
        revokeCurrentAudioObjectURL();
        return;
      }
      if (!ttsAudioRef.current) {
        console.warn(TranslateText["console.ttsAudioRefNotAvailableFunc"]); // Replaced console warn string
        revokeCurrentAudioObjectURL(); // Clean up if ref is unexpectedly null
        return;
      }
      try {
        // Decode base64 to ArrayBuffer
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob from ArrayBuffer. Use 'audio/wav' assuming API returns it.
        const audioBlob = new Blob([byteArray], { type: "audio/wav" }); // Keep string literal for MIME type

        // Create Object URL
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store the NEW URL in the ref *before* setting src
        currentAudioObjectURLRef.current = audioUrl;
        console.log(TranslateText["console.createdNewAudioUrl"], audioUrl); // Replaced console log string

        // Set Audio element source and play
        if (ttsAudioRef.current) {
          ttsAudioRef.current.src = audioUrl;
          ttsAudioRef.current.currentTime = 0; // Reset playback to start

          // --- Add event listeners similar to processRecording ---

          // Cleanup listener: Revoke URL when playback ends naturally // Replaced comment
          // Use a function that captures the specific audioUrl for this playback instance
          const handleAudioEnded = () => {
            console.log(TranslateText["console.ttsAudioEndedCleanup"]); // Replaced console log string
            // Only revoke if this listener instance is still associated with the current src
            if (ttsAudioRef.current && ttsAudioRef.current.src === audioUrl) {
              // We don't need to call revokeCurrentAudioObjectURL here because
              // `currentAudioObjectURLRef.current` might already point to the *next* audio's URL
              // if the next item loaded very quickly.
              // Instead, just revoke THIS specific URL that finished.
              URL.revokeObjectURL(audioUrl);
              console.log(
                TranslateText["console.revokedAudioUrlEnded"],
                audioUrl
              ); // Replaced console log string
              // Clear the src only if it still matches this URL
              if (ttsAudioRef.current && ttsAudioRef.current.src === audioUrl) {
                ttsAudioRef.current.src = "";
              }
            } else {
              console.log(
                TranslateText["console.audioEndedSrcChangedCleanup"],
                audioUrl
              ); // Replaced console log string
              // This means a new audio source was set before this one finished.
              // The cleanup for the NEW source will handle the ref and its own URL.
              // The cleanup for THIS source should just revoke THIS specific URL.
              URL.revokeObjectURL(audioUrl);
              console.log(
                TranslateText["console.revokedAudioUrlEndedSrcChanged"],
                audioUrl
              ); // Replaced console log string
            }

            // Remove the listener to prevent it from firing again for old sources
            ttsAudioRef.current.removeEventListener("ended", handleAudioEnded);
          };
          ttsAudioRef.current.addEventListener("ended", handleAudioEnded, {
            once: true,
          }); // Use once: true for automatic removal

          // Error listener: Revoke URL on playback error // Replaced comment
          const handleAudioError = (e) => {
            console.error(TranslateText["console.ttsAudioError"], e); // Replaced console error string
            // Only revoke if this listener instance is still associated with the current src
            if (ttsAudioRef.current && ttsAudioRef.current.src === audioUrl) {
              URL.revokeObjectURL(audioUrl);
              console.log(
                TranslateText["console.revokedAudioUrlError"],
                audioUrl
              ); // Replaced console log string
              // Clear the src only if it still matches this URL
              if (ttsAudioRef.current && ttsAudioRef.current.src === audioUrl) {
                ttsAudioRef.current.src = "";
              }
            } else {
              console.log(
                TranslateText["console.audioErrorSrcChangedCleanup"],
                audioUrl
              ); // Replaced console log string
              URL.revokeObjectURL(audioUrl);
              console.log(
                TranslateText["console.revokedAudioUrlErrorSrcChanged"],
                audioUrl
              ); // Replaced console log string
            }

            // Remove the listener
            ttsAudioRef.current.removeEventListener("error", handleAudioError);
            // Handle specific error types if needed (e.g., show user feedback)
          };
          ttsAudioRef.current.addEventListener("error", handleAudioError, {
            once: true,
          }); // Use once: true

          // Canplaythrough listener to auto-play when ready // Replaced comment
          const handleCanPlayThrough = () => {
            console.log(TranslateText["console.ttsAudioPlayableAttempt"]); // Replaced console log string
            // Only attempt play if this listener instance is still associated with the current src
            if (ttsAudioRef.current && ttsAudioRef.current.src === audioUrl) {
              // Remove the listener
              ttsAudioRef.current.removeEventListener(
                "canplaythrough",
                handleCanPlayThrough
              );
              const playPromise = ttsAudioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.warn(
                    TranslateText["console.ttsAudioPlaybackPrevented"],
                    error
                  ); // Replaced console warn string
                  // Autoplay failed, revoke URL as playback won't happen
                  // Check src again in case it changed while promise was pending
                  if (
                    ttsAudioRef.current &&
                    ttsAudioRef.current.src === audioUrl
                  ) {
                    URL.revokeObjectURL(audioUrl);
                    console.log(
                      TranslateText["console.revokedAudioUrlPlayPrevented"],
                      audioUrl
                    ); // Replaced console log string
                    ttsAudioRef.current.src = "";
                  } else {
                    console.log(
                      TranslateText["console.playPreventedSrcChanged"],
                      audioUrl
                    ); // Replaced console log string
                    // The URL for this specific audio (`audioUrl`) needs to be revoked even if the ref was updated.
                    // The cleanup in stopAnimationRef or onended/onerror for the *new* audio will handle the ref.
                    // This specific old URL must be revoked.
                    if (audioUrl) {
                      console.log(
                        TranslateText["console.revokingOrphanedUrl"],
                        audioUrl
                      ); // Replaced console log string
                      URL.revokeObjectURL(audioUrl);
                    }
                    console.log(
                      TranslateText[
                        "console.revokedAudioUrlPlayPreventedSrcChanged"
                      ],
                      audioUrl
                    ); // Replaced console log string
                  }
                  // Consider showing a play button to the user here
                });
              }
            } else {
              console.log(
                TranslateText["console.ttsAudioPlayableSrcChanged"],
                audioUrl
              ); // Replaced console log string
              // The URL for this specific audio (`audioUrl`) needs to be revoked even if the ref was updated.
              // The cleanup in stopAnimationRef or onended/onerror for the *new* audio will handle the ref.
              // This specific old URL must be revoked.
              if (audioUrl) {
                console.log(
                  TranslateText["console.revokingOrphanedUrl"],
                  audioUrl
                ); // Replaced console log string
                URL.revokeObjectURL(audioUrl);
              }
            }
          };
          ttsAudioRef.current.addEventListener(
            "canplaythrough",
            handleCanPlayThrough,
            { once: true }
          ); // Use once: true

          // Start loading the audio data
          ttsAudioRef.current.load();
        } else {
          console.warn(TranslateText["console.ttsAudioRefNotAvailable"]); // Replaced console warn string
          // Revoke the URL created in this attempt if the ref was null
          if (audioUrl) {
            console.log(
              TranslateText["console.revokingAudioUrlRefNull"],
              audioUrl
            ); // Replaced console log string
            URL.revokeObjectURL(audioUrl);
          }
          revokeCurrentAudioObjectURL(); // Also ensure the ref is cleared
        }
      } catch (error) {
        console.error(TranslateText["console.errorDecodingAudio"], error); // Replaced console error string
        // Ensure the URL created in this try block is revoked on any sync error
        //  if (currentAudioObjectURLRef.current === audioUrl) { // Check if the created URL was assigned to the ref
        //      revokeCurrentAudioObjectURL(); // Use the helper to clear ref and revoke
        //  } else if (audioUrl) { // If created but not assigned to ref (e.g., error before assignment)
        //       console.log("Revoking audio URL on sync error:", audioUrl);
        //      URL.revokeObjectURL(audioUrl);
        //  }
      }
    },
    [
      revokeCurrentAudioObjectURL,
      ttsAudioRef,
      currentAudioObjectURLRef,
      TranslateText,
    ]
  ); // Added TranslateText to deps

  // --- Animation Control Functions (defined and assigned to refs) ---
  // Removed startClearingRef definition

  stopAnimationRef.current = useCallback(() => {
    console.log(TranslateText["console.stoppingAnimationAudio"]); // Replaced console log string
    // Clear the currently active animation timeout (could be typing step or autoplay advance)
    if (animationTimeoutId.current) {
      clearTimeout(animationTimeoutId.current);
      animationTimeoutId.current = null;
      console.log(
        TranslateText["console.clearedAnimationTimeout"],
        animationTimeoutId.current
      ); // Replaced console log string
    }
    // Stop audio playback immediately
    stopTtsAudioPlayback(); // This pauses the audio element
    // Revoke the URL associated with the audio that was just stopped/active
    // This also clears the currentAudioObjectURLRef.current ref.
    revokeCurrentAudioObjectURL();
    // Reset animation state variables
    setIsAnimating(false);
    // Removed isClearingRef logic
    setIsSubmoduleComplete(false); // Reset completion state
    wordIndexRef.current = 0; // Reset typing progress
    wordsRef.current = []; // Clear word list
    setDisplayContent(""); // Clear displayed text
    console.log(TranslateText["console.animationStateReset"]); // Replaced console log string
  }, [
    animationTimeoutId,
    stopTtsAudioPlayback,
    revokeCurrentAudioObjectURL,
    setIsAnimating,
    setIsSubmoduleComplete,
    wordIndexRef,
    wordsRef,
    setDisplayContent,
    TranslateText,
  ]); // Removed isClearingRef

  // Removed isBoardFull function

  finishTypingAnimationRef.current = useCallback(() => {
    console.log(TranslateText["console.typingAnimationFinished"]); // Replaced console log string
    setIsAnimating(false); // Typing is done, overall animation might still be considered active if audio is pending
    setIsSubmoduleComplete(true); // Mark the current submodule's typing animation as complete
    // The animation timeout for the *last* word is implicitly cleared by the effect or explicitly below.
    // Clear the timeout ref just in case.
    if (animationTimeoutId.current) {
      clearTimeout(animationTimeoutId.current);
      animationTimeoutId.current = null;
      console.log(
        TranslateText["console.clearedFinalAnimationTimeoutInFinish"],
        animationTimeoutId.current
      ); // Replaced console log string
    }
    // Audio continues playing until 'ended' fires (handled by onended listener)
    // Autoplay advance depends on isSubmoduleComplete AND audio finishing (checked in autoplay effect).
  }, [
    setIsAnimating,
    setIsSubmoduleComplete,
    animationTimeoutId,
    TranslateText,
  ]); // Added TranslateText to deps

  // Removed startClearingRef function

  // This effect *is* the typing animation loop.
  useEffect(() => {
    console.log(TranslateText["console.typingEffectTriggered"], {
      // Replaced console log string
      wordIndex: wordIndexRef.current,
      totalWords: wordsRef.current.length,
      // Removed isClearing log
      // isAnimating: isAnimating // Avoid depending on isAnimating to prevent cycles if possible
    });

    // Get current values from refs - important to capture values *at the start of the effect*
    const currentWordIndex = wordIndexRef.current;
    const totalWords = wordsRef.current.length;

    // --- Determine if we should proceed or stop ---

    // Removed: 1. If currently in the clearing state...

    // 2. If all words have been typed, finish the animation.
    if (currentWordIndex >= totalWords && totalWords > 0) {
      console.log(
        `${TranslateText["console.typingEffectAllWordsTyped1"]}${currentWordIndex}/${totalWords}${TranslateText["console.typingEffectAllWordsTyped2"]}`
      ); // Replaced console log string
      // Clear any active timeout (shouldn't be one if index >= totalWords, but safe check)
      if (animationTimeoutId.current) {
        clearTimeout(animationTimeoutId.current);
        animationTimeoutId.current = null;
        console.log(
          TranslateText["console.typingEffectClearedTimeoutAllWords"]
        ); // Replaced console log string
      }
      // Call the finish handler. Use a small delay/RAF to ensure the last render happens.
      requestAnimationFrame(() => {
        if (finishTypingAnimationRef.current) {
          finishTypingAnimationRef.current(); // This sets isAnimating=false, isSubmoduleComplete=true
        }
      });
      // This instance of the effect stops here.
      return;
    }

    // 3. If there are no words at all (empty content), stop animating.
    if (totalWords === 0) {
      console.log(TranslateText["console.typingEffectNoWords"]); // Replaced console log string
      // Clear any active timeout
      if (animationTimeoutId.current) {
        clearTimeout(animationTimeoutId.current);
        animationTimeoutId.current = null;
        console.log(TranslateText["console.typingEffectClearedTimeoutNoWords"]); // Replaced console log string
      }
      // Ensure animating is false if there's nothing to do
      setIsAnimating(false);
      setIsSubmoduleComplete(false); // Not complete if there was nothing to start
      return; // Stop this instance of the effect
    }

    // --- If we reach here, it means we should type the word at `currentWordIndex` ---

    // Get the word to display at the *current* index
    const wordToType = wordsRef.current[currentWordIndex];

    // Schedule the display of this word after a delay
    console.log(
      `${TranslateText["console.typingEffectSchedulingTimeout1"]}${
        currentWordIndex + 1
      }${TranslateText["console.typingEffectSchedulingTimeout2"]}${wordToType}${
        TranslateText["console.typingEffectSchedulingTimeout3"]
      }${TYPING_SPEED}${
        TranslateText["console.typingEffectSchedulingTimeout4"]
      }`
    ); // Replaced console log string

    const timer = setTimeout(() => {
      console.log(
        `${TranslateText["console.typingTimeoutCallbackFired1"]}${currentWordIndex}${TranslateText["console.typingTimeoutCallbackFired2"]}`
      ); // Replaced console log string

      // Removed: Double-check state inside the callback - particularly clearing state

      // --- Inside the callback, perform the action for this word ---
      // Update state to append the word. This triggers a re-render.
      setDisplayContent((prev) => prev + wordToType);
      console.log(
        `${TranslateText["console.callbackDisplayedWord1"]}${
          currentWordIndex + 1
        }${TranslateText["console.callbackDisplayedWord2"]}${
          displayContent.length + wordToType.length
        }`
      ); // Replaced console log string // Log updated length

      // Increment the index immediately *after* updating state for this word
      wordIndexRef.current++;
      console.log(
        `${TranslateText["console.callbackIncrementedIndex1"]}${wordIndexRef.current}${TranslateText["console.callbackIncrementedIndex2"]}`
      ); // Replaced console log string

      // --- After updating state, check for board full and potentially clear ---
      // Use requestAnimationFrame to wait for the DOM update before checking board height.
      requestAnimationFrame(() => {
        console.log(
          `${TranslateText["console.callbackRafFired1"]}${wordIndexRef.current}.`
        ); // Removed IsClearing log
        // Removed: Final check after RAF to be safe

        // Determine the next action: continue typing, or finish
        const isLastWord = wordIndexRef.current >= wordsRef.current.length;
        // Removed shouldClear check

        console.log(
          `${TranslateText["console.decisionPoint1"]}${isLastWord}, ${TranslateText["console.decisionPoint3"]}${wordIndexRef.current}`
        ); // Removed shouldClear from log

        // Removed: if (shouldClear && !isLastWord) { ... startClearingRef.current() ... }
        if (!isLastWord) {
          // Board is not full and content remains (always true if not the last word now)
          console.log(TranslateText["console.boardNotFullContentRemains"]); // Replaced console log string
          // Schedule the next word step by calling the ref function recursively
          if (typeNextWordStepRef.current) {
            typeNextWordStepRef.current();
          }
        } else {
          // All words typed
          console.log(TranslateText["console.allWordsTypedFinishing"]); // Replaced console log string
          // Typing animation complete - call the ref function
          if (finishTypingAnimationRef.current) {
            finishTypingAnimationRef.current();
          }
        }
      });
    }, TYPING_SPEED); // Delay before displaying THIS word

    // Store the ID of the timeout we just scheduled in the shared ref.
    // This ID represents the *pending* animation step (displaying the word scheduled by this effect instance).
    animationTimeoutId.current = timer;
    console.log(
      TranslateText["console.typingTimeoutIdSet"],
      animationTimeoutId.current
    ); // Replaced console log string

    // Cleanup function for *this specific* effect instance:
    // Runs when dependencies change (e.g., index increments)
    // or when the component unmounts.
    return () => {
      console.log(
        `${TranslateText["console.typingEffectCleanup1"]}${currentWordIndex}. ${TranslateText["console.typingEffectCleanup3"]}${animationTimeoutId.current}`
      ); // Removed IsClearing log
      // Clear the timeout associated with this effect instance.
      // It's crucial to check if animationTimeoutId.current still holds the ID *this* effect instance set.
      // Using a local variable `timer` (captured in the closure) is safer for cleanup.
      console.log(
        `${TranslateText["console.clearingTimeoutId1"]}${timer} ${
          TranslateText["console.clearingTimeoutId2"]
        }${currentWordIndex + 1}`
      ); // Replaced console log string
      clearTimeout(timer);
      // We *don't* clear animationTimeoutId.current here because a new timeout might have
      // just been set by a subsequent effect run *before* this cleanup runs.
      // The shared ref management is complex; relying on the *next* effect or `stopAnimationRef` to clear is often necessary.
      // The cleanup in the `useEffect([fullContent])` will clear `animationTimeoutId.current` when content changes.
      // The cleanup in the autoplay effect will clear `animationTimeoutId.current` IF it's an advance timeout.
      // This shared ref approach is error-prone; a dedicated ref for *typing* timeouts might be better,
      // but let's see if this version works first.
    };

    // Dependencies: The state/ref values that should cause this effect to re-run.
    // wordIndexRef.current: Incrementing this should trigger the next typing step.
    // wordsRef.current: Changes when new content is loaded, should restart animation logic.
    // Removed isClearingRef dependency
    // displayContent: Used by isBoardFull (removed), keep as it changes when text is added.
    // Removed isBoardFull dependency
    // Removed startClearingRef dependency
    // finishTypingAnimationRef: Functions called inside.
  }, [
    wordIndexRef,
    wordsRef,
    displayContent,
    finishTypingAnimationRef,
    animationTimeoutId,
    TYPING_SPEED,
    setDisplayContent,
    TranslateText,
  ]); // Removed isClearingRef, isBoardFull, startClearingRef

  typeNextWordStepRef.current = useCallback(() => {
    // Removed: Stop if currently in the clearing state

    // Check if all words have been typed
    if (wordIndexRef.current >= wordsRef.current.length) {
      console.log(TranslateText["console.typeNextWordAllWords"]); // Replaced console log string
      // If we've reached the end, finish the animation by calling the ref function
      if (finishTypingAnimationRef.current) {
        finishTypingAnimationRef.current();
      }
      return;
    }

    // Get the next word/token to display
    const nextWord = wordsRef.current[wordIndexRef.current];

    // Update state to append the next word. Functional update is safe.
    // Adding the word to displayContent immediately triggers a render.
    setDisplayContent((prev) => prev + nextWord);
    console.log(
      `${TranslateText["console.displayedWord1"]}${
        wordIndexRef.current + 1
      }: "${nextWord}"`
    ); // Replaced console log string

    // Increment the index immediately *after* updating state for this word
    const currentWordIndex = wordIndexRef.current;
    wordIndexRef.current++; // Prepare for the *next* step

    // Schedule the *next* step (the next word) AFTER a delay
    console.log(
      `${TranslateText["console.schedulingNextTimeout1"]}${
        wordIndexRef.current
      }${TranslateText["console.schedulingNextTimeout2"]}${
        currentWordIndex + 1
      }${TranslateText["console.schedulingNextTimeout3"]}${TYPING_SPEED}${
        TranslateText["console.schedulingNextTimeout4"]
      }`
    ); // Replaced console log string
    const timer = setTimeout(() => {
      console.log(
        `${TranslateText["console.timeoutCallbackFiredNext1"]}${wordIndexRef.current}. ${TranslateText["console.timeoutCallbackFiredNext3"]}${wordsRef.current.length}`
      ); // Removed IsClearing log

      // Removed: Double-check state after timeout fires

      // Check AFTER the DOM has potentially updated
      // Use requestAnimationFrame to wait for the next browser paint cycle where the last word is rendered
      requestAnimationFrame(() => {
        console.log(
          `${TranslateText["console.animationFrameCallbackFiredNext1"]}${wordIndexRef.current}.`
        ); // Removed IsClearing log
        // Removed: Final check after RAF to be safe

        // Determine the next action: continue typing, or finish
        const isLastWord = wordIndexRef.current >= wordsRef.current.length;
        // Removed shouldClear

        console.log(
          `${TranslateText["console.decisionPoint1"]}${isLastWord}, ${TranslateText["console.decisionPoint3"]}${wordIndexRef.current}`
        ); // Removed shouldClear from log

        // Removed: if (shouldClear && !isLastWord) { ... }
        if (!isLastWord) {
          // Continue typing
          console.log(TranslateText["console.boardNotFullContentRemains"]); // Replaced console log string (can keep this, it just means we continue)
          // Schedule the next word step by calling the ref function recursively
          if (typeNextWordStepRef.current) {
            typeNextWordStepRef.current();
          }
        } else {
          // All words typed
          console.log(TranslateText["console.allWordsTypedFinishing"]); // Replaced console log string
          // Typing animation complete - call the ref function
          if (finishTypingAnimationRef.current) {
            finishTypingAnimationRef.current();
          }
        }
      });
    }, TYPING_SPEED); // Delay before processing the *next* word

    // Store timeout ID for the timer that will process the *next* word
    animationTimeoutId.current = timer;
    console.log(
      TranslateText["console.timeoutIdSetNext"],
      animationTimeoutId.current
    ); // Replaced console log string
  }, [
    setDisplayContent,
    TYPING_SPEED,
    wordIndexRef,
    wordsRef,
    animationTimeoutId,
    finishTypingAnimationRef,
    typeNextWordStepRef,
    TranslateText,
  ]); // Removed isBoardFull, isClearingRef, startClearingRef

  // Starts the overall typing animation process for the current fullContent string.
  // This is called once when new fullContent is available.
  const startTypingAnimation = useCallback(() => {
    console.log(TranslateText["console.startingTypingAnimation"]); // Replaced console log string
    // isAnimating is set true inside useEffect([fullContent]) when fullContent is not empty
    // Set animating flag true for the whole process (already done in effect)
    // Initiate the very first typing step by calling the ref function
    if (typeNextWordStepRef.current) {
      // Check ref.current exists
      typeNextWordStepRef.current();
    }
  }, [TranslateText]); // Added TranslateText to deps // No dependencies needed here as it only calls a stable ref function

  // --- Fetching and Caching Logic (useCallback) ---

  const fetchTranslatedContentAndAudio = useCallback(
    async (moduleKey, submoduleIndex, lang) => {
      const cacheKey = `${moduleKey}-${submoduleIndex}-${lang}`;
      if (translatedDataCache.current.has(cacheKey)) {
        console.log(`${TranslateText["console.cacheHit"]}${cacheKey}`); // Replaced console log string
        setIsLoading(false);
        // Return cached data directly
        return translatedDataCache.current.get(cacheKey);
      }

      const moduleData = educationData[moduleKey];
      console.log(moduleData , moduleKey);
      const submoduleData = moduleData?.submodule?.[submoduleIndex];

      if (!moduleData || !submoduleData || !submoduleData.content) {
        console.error(TranslateText["console.attemptedFetchInvalidSubmodule"], {
          moduleKey,
          submoduleIndex,
          hasContent: !!submoduleData?.content,
        }); // Replaced console error string
        // Use combined error string and parts from JSON
        const errorMsg = `${TranslateText["error.dataNotFound1"]}${
          moduleKeys.indexOf(moduleKey) + 1
        }${TranslateText["error.dataNotFound2"]}${submoduleIndex + 1}${
          TranslateText["error.dataNotFound3"]
        }`;
        // Update states directly to show error message and stop loading
        setFullContent(errorMsg);
        setSelectedSubmodule({
          moduleKey,
          submoduleIndex,
          name: TranslateText["error.dataErrorFallback"],
        }); // Keep selection highlighted in list // Replaced string
        setIsLoading(false);
        stopAnimationRef.current(); // Ensure animation/audio stops
        stopTtsAudioPlayback();
        revokeCurrentAudioObjectURL();
        // Return an object with error text so selectSubmodule can handle it
        return { flattenedText: errorMsg, audioContent: null };
      }

      const originalContentObject = submoduleData; // Still based on educationData structure for sending to API

      if (!TRANSLATE_API_URL) {
        console.log(TranslateText["console.translateApiNotConfigured"]); // Replaced console log string
        const flattenedOriginalText = flattenObjectStrings(
          originalContentObject.content
        );
        const englishData = {
          translatedJson: originalContentObject,
          flattenedText: flattenedOriginalText,
          audioContent: null, // No TTS when API is not used
        };
        translatedDataCache.current.set(cacheKey, englishData);
        setIsLoading(false);
        return englishData;
      }

      const payload = {
        jsonObject: originalContentObject,
        targetLang: lang,
        sourceLang: "en",
      };

      // Get submodule name from EduText.json for loading message
      const submoduleNamesForModule =
        TranslateText["data.submoduleNames"][moduleKey]?.submoduleNames;
      const submoduleNameForLoading =
        submoduleNamesForModule?.[submoduleIndex] ||
        TranslateText["error.unknownTopicFallback"]; // Replaced string

      setLoadingMessage(TranslateText["loadingMessageUnique"]); // Replaced loading message string
      setIsLoading(true); // Show loader

      try {
        const response = await fetch(TRANSLATE_API_URL, {
          method: "POST", // Keep string literal
          headers: {
            "Content-Type": "application/json", // Keep string literal
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            TranslateText["console.apiErrorResponse"],
            response.status,
            errorBody
          ); // Replaced console error string
          const errorMsg = `${TranslateText["error.apiRequestFailed1"]}${
            response.status
          }${TranslateText["error.apiRequestFailed2"]}${errorBody.substring(
            0,
            200
          )}${TranslateText["error.apiRequestFailed3"]}`;
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log(
          `${TranslateText["console.successfullyFetchedData1"]}${cacheKey}${TranslateText["console.successfullyFetchedData2"]}`,
          Object.keys(data),
          `${TranslateText["console.translatedJsonKeys"]}`,
          Object.keys(data.translatedJson || {})
        ); // Replaced console log strings

        const translatedJsonStructure = data.translatedJson;
        const audioContent = data.audioContent; // Assuming the base64 is here

        // Check if essential parts of the response exist
        if (!translatedJsonStructure || !translatedJsonStructure.content) {
          console.warn(TranslateText["console.apiResponseMissingKeys"], data); // Replaced console warn string
          // Fallback to original English content if translation is missing/unexpected from API
          const originalContentToFlatten = originalContentObject.content || {};
          const flattenedOriginalText = flattenObjectStrings(
            originalContentToFlatten
          );
          const fallbackData = {
            translatedJson: originalContentObject, // Store original structure
            flattenedText: flattenedOriginalText, // Store the flattened text for animation
            audioContent: null, // No TTS
          };
          translatedDataCache.current.set(cacheKey, fallbackData);
          setIsLoading(false); // Hide loader
          return fallbackData;
        }

        const flattenedTranslatedText = flattenObjectStrings(
          translatedJsonStructure.content
        );

        const cachedData = {
          translatedJson: translatedJsonStructure,
          flattenedText: flattenedTranslatedText,
          audioContent: audioContent, // Store the base64 audio string
        };
        translatedDataCache.current.set(cacheKey, cachedData);
        setIsLoading(false); // Hide loader

        return cachedData; // Return the fetched and cached data
      } catch (error) {
        console.error(
          `${TranslateText["console.failedFetchTranslation1"]}${submoduleNameForLoading}${TranslateText["console.failedFetchTranslation2"]}`,
          error
        ); // Replaced console error string
        // Clear cache for this item on error to attempt re-fetch later
        translatedDataCache.current.delete(cacheKey);

        // Set an error message to be displayed on the board
        const errorMessage = `${TranslateText["error.loadingContentFailed1"]}${submoduleNameForLoading}${TranslateText["error.loadingContentFailed2"]}${error.message}`;
        setFullContent(errorMessage); // Display the error message
        setSelectedSubmodule({
          moduleKey,
          submoduleIndex,
          name: TranslateText["error.loadingContentFallback"],
        }); // Keep selection highlighted // Replaced string

        setIsLoading(false); // Hide loader on error
        stopAnimationRef.current(); // Stop any residual animation/audio
        stopTtsAudioPlayback(); // Explicitly stop TTS audio
        revokeCurrentAudioObjectURL();

        // Don't re-throw here, let the error message display handle it
        return { flattenedText: errorMessage, audioContent: null }; // Return error object
      }
    },
    [
      moduleKeys,
      translatedDataCache,
      setIsLoading,
      setLoadingMessage,
      targetLang,
      stopAnimationRef,
      stopTtsAudioPlayback,
      revokeCurrentAudioObjectURL,
      setFullContent,
      setSelectedSubmodule,
      flattenObjectStrings,
      TranslateText,
    ]
  ); // Added flattenObjectStrings and TranslateText to deps

  // Function to select and display a submodule (handles fetching/caching and rendering)
  const selectSubmodule = useCallback(
    async (moduleKey, submoduleIndex) => {
      console.log(TranslateText["console.selectSubmoduleCalled"], {
        moduleKey,
        submoduleIndex,
        targetLang,
      }); // Replaced console log string

      // 1. Stop any existing animation and audio immediately *before* fetching new content.
      // This clears the old animation timeout and revokes the URL of the previous audio.
      stopAnimationRef.current();

      // 2. Get original data for title and initial display state
      const currentModule = educationData[moduleKey];
      const currentSubmodule = currentModule?.submodule?.[submoduleIndex];

      if (!currentModule || !currentSubmodule) {
        console.error(TranslateText["console.selectSubmoduleInvalidKeys"], {
          moduleKey,
          submoduleIndex,
        }); // Replaced console error string
        setFullContent(TranslateText["error.invalidModuleTopicSelected"]); // Replaced string
        setSelectedSubmodule(null);
        setIsLoading(false);
        stopAnimationRef.current();
        stopTtsAudioPlayback();
        revokeCurrentAudioObjectURL();
        return;
      }

      // 3. Update UI selection state immediately
      // Get submodule name from EduText.json now for UI list item display
      const submoduleNamesForModule =
        TranslateText["data.submoduleNames"][moduleKey]?.submoduleNames;
      const submoduleNameForUI =
        submoduleNamesForModule?.[submoduleIndex] ||
        TranslateText["error.unknownTopicFallback"]; // Replaced string

      setExpandedModule(moduleKey);
      setSelectedSubmodule({
        moduleKey,
        submoduleIndex,
        name: submoduleNameForUI, // Display name from EduText.json
      });
      setCurrentModuleIndex(moduleKeys.indexOf(moduleKey));
      setCurrentSubmoduleIndex(submoduleIndex);

      // 4. Clear board display and reset animation state variables/refs for the new content
      setDisplayContent("");
      setFullContent(""); // Clearing fullContent stops the previous effect and triggers the new one when content is ready
      setIsSubmoduleComplete(false);
      // isAnimating is set true in the useEffect triggered by setFullContent
      wordIndexRef.current = 0;
      wordsRef.current = []; // Clear wordsRef immediately
      // Removed isClearingRef logic

      // 5. Fetch or get from cache the translated data and audio
      // fetchTranslatedContentAndAudio manages showing the loader *during the fetch itself*.
      try {
        const fetchedData = await fetchTranslatedContentAndAudio(
          moduleKey,
          submoduleIndex,
          targetLang
        );

        // 6. Play TTS audio AFTER fetch completes.
        // playTtsAudioFromBase64 now handles URL creation and cleanup via listeners.
        // This should ideally happen *before* setting fullContent for best sync,
        // but browser autoplay policies might delay actual playback until after first render.
        if (fetchedData?.audioContent) {
          playTtsAudioFromBase64(fetchedData.audioContent);
        } else {
          console.warn(TranslateText["console.noAudioContentReceived"]); // Replaced console warn string
          // If no audio, stop and revoke any leftover old URL just in case
          stopTtsAudioPlayback();
          revokeCurrentAudioObjectURL();
        }

        // 7. Set fullContent to trigger the useEffect to start typing animation.
        // This happens after audio initiation.
        setFullContent(
          fetchedData?.flattenedText ||
            TranslateText["error.contentNotAvailable"]
        ); // Replaced string
      } catch (error) {
        // Errors during fetch are handled inside fetchTranslatedContentAndAudio
        // It sets the error message on the board and hides the loader.
        console.error(
          TranslateText["console.errorCaughtInSelectSubmodule"],
          error
        ); // Replaced console error string - added key
        setIsLoading(false); // Ensure loader is off
        // Error during fetch - ensure any potential audio setup failure is cleaned up
        stopTtsAudioPlayback();
        revokeCurrentAudioObjectURL();
      }
    },
    [
      moduleKeys,
      targetLang,
      stopAnimationRef,
      revokeCurrentAudioObjectURL,
      setExpandedModule,
      setSelectedSubmodule,
      setCurrentModuleIndex,
      setCurrentSubmoduleIndex,
      setDisplayContent,
      setFullContent,
      setIsSubmoduleComplete,
      wordIndexRef,
      wordsRef,
      fetchTranslatedContentAndAudio,
      playTtsAudioFromBase64,
      stopTtsAudioPlayback,
      setIsLoading,
      TranslateText,
    ]
  ); // Removed isClearingRef

  // --- Event Handlers (useCallback) ---

  const handleModuleClick = useCallback(
    (moduleKey) => {
      if (
        !isLoading &&
        (!autoPlayEnabled ||
          moduleKeys[currentModuleIndex] === moduleKey ||
          expandedModule === moduleKey)
      ) {
        setExpandedModule(expandedModule === moduleKey ? null : moduleKey);
      }
    },
    [
      isLoading,
      autoPlayEnabled,
      moduleKeys,
      currentModuleIndex,
      expandedModule,
      setExpandedModule,
    ]
  );

  const handleSubmoduleClick = useCallback(
    (moduleKey, submoduleIndex) => {
      console.log(TranslateText["console.manualSubmoduleClick"], {
        moduleKey,
        submoduleIndex,
      }); // Replaced console log string
      if (isLoading) {
        console.log(TranslateText["console.manualClickIgnoredLoading"]); // Replaced console log string
        return;
      }
      setAutoPlayEnabled(false); // Disable autoplay on manual selection
      selectSubmodule(moduleKey, submoduleIndex);
    },
    [selectSubmodule, setAutoPlayEnabled, isLoading, TranslateText]
  ); // Added TranslateText to deps

  const startLearningJourney = useCallback(async () => {
    console.log(TranslateText["console.startButtonCLicked"]); // Replaced console log string
    // Hide the start screen UI immediately
    setShowStartScreen(false);
    // Enable autoplay - this state change, combined with !showStartScreen and !selectedSubmodule,
    // triggers the initial load effect (`useEffect` on `showStartScreen`, `autoPlayEnabled`, etc.).
    setAutoPlayEnabled(true);
    // The actual loading and selection of the first submodule happens in the effect.
  }, [setShowStartScreen, setAutoPlayEnabled, TranslateText]); // Added TranslateText to deps

  const continueToNextModule = useCallback(async () => {
    console.log(TranslateText["console.continuingToNextModule"]); // Replaced console log string
    setShowContinueDialog(false); // Close the dialog

    const nextModuleIndex = currentModuleIndex + 1;

    // Check if there is a next module index within the bounds of the data
    if (nextModuleIndex < moduleKeys.length) {
      const nextModuleKey = moduleKeys[nextModuleIndex];
      // selectSubmodule handles fetching (if not cached), loading, and starting animation/audio
      // It also manages the loader internally now.
      await selectSubmodule(nextModuleKey, 0); // Load the first submodule of the next module
      // Autoplay is already enabled, will continue automatically from here.
    } else {
      console.warn(TranslateText["console.continueCalledNoModules"]); // Replaced console warn string
      setAutoPlayEnabled(false); // Course finished, turn off autoplay
      // Display a final message
      setFullContent(TranslateText["dialog.courseComplete.body"]); // Replaced string
      setSelectedSubmodule({ name: TranslateText["ui.courseComplete.title"] }); // Update UI state for list // Replaced string
      stopAnimationRef.current(); // Ensure everything stops
      stopTtsAudioPlayback();
      revokeCurrentAudioObjectURL();
      setIsLoading(false); // Ensure loader is off
    }
  }, [
    currentModuleIndex,
    moduleKeys,
    selectSubmodule,
    setAutoPlayEnabled,
    setFullContent,
    setSelectedSubmodule,
    stopAnimationRef,
    stopTtsAudioPlayback,
    revokeCurrentAudioObjectURL,
    setIsLoading,
    setShowContinueDialog,
    TranslateText,
  ]); // Added TranslateText to deps

  // Handle manual click of the "Next" button displayed on the board
  const goToNextSubmodule = useCallback(async () => {
    console.log(TranslateText["console.manualNextButtonClicked"]); // Replaced console log string
    if (isLoading) {
      console.log(TranslateText["console.manualNextIgnoredLoading"]); // Replaced console log string
      return;
    }
    setAutoPlayEnabled(false); // Disable autoplay on manual intervention

    const currentModuleKey = moduleKeys[currentModuleIndex];
    const currentModuleData = educationData[currentModuleKey]; // Need this to check submodule count

    if (!currentModuleKey || !currentModuleData) {
      console.error(TranslateText["error.manualNextInvalidModule"]); // Replaced console error string
      stopAnimationRef.current();
      stopTtsAudioPlayback();
      revokeCurrentAudioObjectURL();
      setIsLoading(false);
      return;
    }

    // Check if there's a next submodule *within the current module*
    if (currentSubmoduleIndex + 1 < currentModuleData.submodule.length) {
      // Select the next submodule in the same module
      console.log(
        `${
          TranslateText["console.manualNextMovingSubmodule1"]
        }"${currentModuleKey}"${
          TranslateText["console.manualNextMovingSubmodule2"]
        }${currentSubmoduleIndex + 1}`
      ); // Replaced console log string
      // selectSubmodule handles fetching (if not cached), loading, and starting animation/audio
      await selectSubmodule(currentModuleKey, currentSubmoduleIndex + 1);
    } else {
      // No more submodules in the current module. Check for next module.
      console.log(
        `${TranslateText["console.manualNextModuleCompleted1"]}"${currentModuleKey}"${TranslateText["console.manualNextModuleCompleted2"]}`
      ); // Replaced console log string
      if (currentModuleIndex + 1 < moduleKeys.length) {
        // Show the continue dialog for the next module transition
        console.log(TranslateText["console.manualNextModuleFoundDialog"]); // Replaced console log string
        // Don't automatically advance, show dialog. User clicks continue.
        setShowContinueDialog(true);
        // Autoplay is already off due to manual click.
      } else {
        // All modules and submodules completed manually.
        console.log(TranslateText["console.manualFinishedLast"]); // Replaced console log string
        setFullContent(TranslateText["dialog.courseComplete.body"]); // Replaced string
        setSelectedSubmodule({
          name: TranslateText["ui.courseComplete.title"],
        }); // Replaced string
        stopAnimationRef.current();
        stopTtsAudioPlayback();
        revokeCurrentAudioObjectURL();
        setIsLoading(false); // Ensure loader is off
      }
    }
  }, [
    currentModuleIndex,
    currentSubmoduleIndex,
    moduleKeys,
    selectSubmodule,
    setAutoPlayEnabled,
    setShowContinueDialog,
    setFullContent,
    setSelectedSubmodule,
    stopAnimationRef,
    stopTtsAudioPlayback,
    revokeCurrentAudioObjectURL,
    setIsLoading,
    TranslateText,
  ]); // Added TranslateText to deps

  // --- Effects ---

  // Effect: Read preferred language from localStorage on mount // Replaced comment
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem(PREFERRED_LANG_STORAGE_KEY);
      if (storedLang) {
        setTargetLang(storedLang);
        console.log(
          TranslateText["console.preferredLanguageLoaded"],
          storedLang
        ); // Replaced console log string
      } else {
        setTargetLang(DEFAULT_TARGET_LANG);
        console.log(
          `${TranslateText["console.noPreferredLanguageFound"]}${DEFAULT_TARGET_LANG}${TranslateText["console.noPreferredLanguageFound2"]}`
        ); // Replaced console log string
      }
    } catch (error) {
      console.error(TranslateText["console.couldNotAccessLocalStorage"], error); // Replaced console error string
      setTargetLang(DEFAULT_TARGET_LANG);
    }
  }, [TranslateText]); // Empty dependency array means this runs only once on mount // Added TranslateText to deps

  // Effect: Triggered when the component transitions from the start screen // Replaced comment
  // to the main learning view, AND when targetLang is initialized.
  // This handles the *very first* content load in autoplay mode.
  useEffect(() => {
    console.log(TranslateText["console.initialLoadEffectCheck"], {
      // Replaced console log string
      showStartScreen,
      autoPlayEnabled,
      selectedSubmodule,
      isLoading,
      targetLangInitialized: targetLang !== undefined && targetLang !== null,
    });

    // Trigger initial load ONLY if:
    // 1. We are NOT showing the start screen anymore (`!showStartScreen`)
    // 2. Autoplay is enabled (`autoPlayEnabled`) - implies start button was clicked
    // 3. No submodule has been selected yet (`!selectedSubmodule`) - prevents re-running after first load
    // 4. We are NOT currently loading (`!isLoading`) - prevents infinite loops if fetch fails quickly or races
    // 5. The targetLang state has been initialized.
    if (
      !showStartScreen &&
      autoPlayEnabled &&
      !selectedSubmodule &&
      !isLoading &&
      targetLang !== undefined &&
      targetLang !== null
    ) {
      console.log(TranslateText["console.initialLoadEffectConditionsMet"]); // Replaced console log string

      const firstModuleKey = moduleKeys[0];
      const firstSubmodule = educationData[firstModuleKey]?.submodule?.[0]; // Still need educationData for structure check

      if (firstModuleKey && firstSubmodule) {
        // Call selectSubmodule to fetch, load, animate, and play the first item
        // selectSubmodule internally manages the loader state, stops previous audio, etc.
        selectSubmodule(firstModuleKey, 0);
      } else {
        console.error(TranslateText["console.initialLoadEffectNoData"]); // Replaced console error string
        // Handle missing data - set an error message on the board
        setFullContent(TranslateText["error.initialLoadFailed"]); // Replaced string
        setSelectedSubmodule({
          name: TranslateText["error.initializationErrorFallback"],
        }); // Set a dummy state to show the board area // Replaced string
        setIsLoading(false); // Ensure loader is off
        setAutoPlayEnabled(false); // Cannot autoplay if no data
        // Animation/audio stop and cleanup
        stopAnimationRef.current();
        stopTtsAudioPlayback();
        revokeCurrentAudioObjectURL();
      }
    }
    // Dependencies: States that transition out of start screen, autoplay, initial load flag (`!selectedSubmodule`), loading, and language state.
    // selectSubmodule is called *inside* the effect, but including it in deps would create a cycle.
    // The conditions ensure it only runs once for the initial load.
  }, [
    showStartScreen,
    autoPlayEnabled,
    selectedSubmodule,
    isLoading,
    targetLang,
    moduleKeys,
    setFullContent,
    setSelectedSubmodule,
    setIsLoading,
    setAutoPlayEnabled,
    stopAnimationRef,
    stopTtsAudioPlayback,
    revokeCurrentAudioObjectURL,
    selectSubmodule,
    TranslateText,
  ]); // Added TranslateText to deps

  // Effect: Triggered when `fullContent` changes to start a new typing animation.
  useEffect(() => {
    console.log(TranslateText["console.useEffectFullContentTriggered"], {
      fullContentExists: !!fullContent,
    }); // Replaced console log string

    // Always stop existing animation timeouts associated with the *previous* fullContent.
    // Audio cleanup for the previous content is handled by selectSubmodule->stopAnimationRef.current
    // and the audio element's event listeners.
    if (animationTimeoutId.current) {
      clearTimeout(animationTimeoutId.current);
      animationTimeoutId.current = null; // Clear the ref
      console.log(
        TranslateText["console.clearedPreviousAnimationTimeoutDuringCleanup"]
      ); // Replaced console log string - added key
    }

    if (fullContent) {
      // Initialize state and refs for the new animation
      wordIndexRef.current = 0;
      // Split content into words and spaces. Keep spaces as tokens for animation timing.
      wordsRef.current = fullContent
        .split(/(\s+)/g)
        .filter((s) => s.length > 0); // Keep regex literal
      // Removed isClearingRef logic
      setIsSubmoduleComplete(false);
      setDisplayContent(""); // Start with a blank board visually for the new content
      setIsAnimating(true); // Indicate that the animation process is now active

      console.log(TranslateText["console.newContentLoadedInitializing"], {
        wordsCount: wordsRef.current.length,
      }); // Replaced console log string - added key

      // Start the typing animation process.
      // TTS audio playback for this content should have been started by selectSubmodule
      // just before fullContent was set. The typing animation will sync *visually* with the audio playing.
      // The actual first step is scheduled by startTypingAnimation.
      startTypingAnimation();
    } else {
      // If fullContent becomes empty (e.g., during clearing, initial state, or error)
      setDisplayContent("");
      setIsSubmoduleComplete(false);
      setIsAnimating(false); // No animation when content is explicitly empty
      // Removed isClearingRef logic
      wordIndexRef.current = 0;
      wordsRef.current = [];
      // Audio cleanup handled by selectSubmodule -> stopAnimationRef.current or its own event listeners
    }

    // Cleanup function: Runs when fullContent changes again or component unmounts
    return () => {
      console.log(TranslateText["console.useEffectFullContentCleanup"]); // Replaced console log string
      // Ensure the currently active animation timeout (if any) is cleared when this effect cleans up.
      // This handles cases where the component unmounts or fullContent changes again *before*
      // the current typing/clearing timeout fires.
      if (animationTimeoutId.current) {
        clearTimeout(animationTimeoutId.current);
        animationTimeoutId.current = null; // Clear the ref
        console.log(
          TranslateText["console.clearedAnimationTimeoutInCleanupReturn"]
        ); // Replaced console log string - added key
      }
      // Audio URL cleanup is primarily handled by the 'ended'/'error' listeners
      // or by stopAnimationRef.current in selectSubmodule. Rely on those.
    };
    // Dependencies: fullContent (trigger), and functions/refs used directly or indirectly.
    // startTypingAnimation, animationTimeoutId, etc. are needed for state/ref management within the effect.
  }, [
    fullContent,
    startTypingAnimation,
    animationTimeoutId,
    setIsAnimating,
    setIsSubmoduleComplete,
    setDisplayContent,
    wordIndexRef,
    wordsRef,
    TranslateText,
  ]); // Removed isClearingRef

  // Effect: Scroll the board content to the bottom as text appears
  useEffect(() => {
    // Only scroll if the board ref is available (removed clearing check)
    if (boardInnerRef.current) {
      // Smooth scroll the scrollable container to the bottom
      boardInnerRef.current.scrollTo({
        top: boardInnerRef.current.scrollHeight,
        behavior: "smooth", // Keep string literal for behavior
      });
    }
    // Scroll effect depends on displayContent changing (adding new text)
  }, [displayContent, boardInnerRef]); // Removed isClearingRef

  // Effect: Handles autoplay progression and pre-fetching the *next* item.
  // This effect runs AFTER the current submodule's TYPING animation completes (`isSubmoduleComplete`).
  useEffect(() => {
    console.log(TranslateText["console.autoplayPrefetchEffectCheck"], {
      // Replaced console log string
      autoPlayEnabled,
      isSubmoduleComplete,
      isAnimating,
      showContinueDialog,
      currentModuleIndex,
      currentSubmoduleIndex,
      isLoading,
    });

    // Conditions to potentially trigger the next step (either advance or prefetch)
    // We trigger the logic when:
    // 1. Autoplay is enabled.
    // 2. The *typing* animation for the current submodule is complete.
    // 3. The overall animation process is *not* currently active.
    // 4. The continue dialog is *not* showing.
    // 5. We are *not* currently loading.
    const shouldConsiderNext =
      autoPlayEnabled &&
      isSubmoduleComplete &&
      !isAnimating &&
      !showContinueDialog &&
      !isLoading;

    // Check if the currently playing audio has ended before automatically advancing
    // This adds better synchronization for autoplay.
    const isAudioFinished =
      !ttsAudioRef.current ||
      ttsAudioRef.current.paused ||
      ttsAudioRef.current.ended ||
      ttsAudioRef.current.src === "";
    console.log(
      `${
        TranslateText["console.autoplayAudioCheck1"]
      }${!!ttsAudioRef.current}, ${
        TranslateText["console.autoplayAudioCheck2"]
      }${ttsAudioRef.current?.paused}, ${
        TranslateText["console.autoplayAudioCheck3"]
      }${ttsAudioRef.current?.ended}, ${
        TranslateText["console.autoplayAudioCheck4"]
      }${ttsAudioRef.current?.src}, ${
        TranslateText["console.autoplayAudioCheck5"]
      }${isAudioFinished}`
    ); // Replaced console log string

    // Refined condition: proceed only if considered next AND audio is finished
    const shouldProceedToNext = shouldConsiderNext && isAudioFinished;

    if (!shouldProceedToNext) {
      // Clear any pending *autoplay advance* timeout if conditions are no longer met
      // (e.g., state changed, manual click, audio not finished yet).
      // animationTimeoutId is used to store the advance delay timeout in this effect.
      const advanceTimeout = animationTimeoutId.current; // Capture the current ID
      // Check if the current timeout ID corresponds to a timeout scheduled by *this* effect (i.e., an advance timeout)
      // This is tricky because animationTimeoutId is shared. A better way is to have a separate ref for autoplay timeouts.
      // For simplicity, let's just clear the shared one if the conditions to *proceed* aren't met.
      if (advanceTimeout && !isAnimating) {
        // Ensure we don't clear a typing/clearing timeout
        clearTimeout(advanceTimeout);
        animationTimeoutId.current = null; // Clear the shared ref
        console.log(
          TranslateText[
            "console.clearedPendingAutoplayAdvanceTimeoutConditionsNotMet"
          ]
        ); // Replaced console log string
      }
      // Note: This does *not* cancel a fetch that might have been started in a previous effect run.
      return; // Don't proceed if conditions aren't right or audio isn't finished
    }

    // Current submodule TYPING animation is complete, autoplay is on, AND audio has finished.
    console.log(TranslateText["console.autoplayConditionsMetConsideringNext"]); // Replaced console log string - added key

    // Determine the *next* item's indices.
    const currentModuleKey = moduleKeys[currentModuleIndex];
    const currentModuleData = educationData[currentModuleKey]; // Need this for structure check

    if (!currentModuleData) {
      console.error(TranslateText["console.autoplayPrefetchInvalidModuleData"]); // Replaced console error string
      setAutoPlayEnabled(false);
      setIsLoading(false);
      return;
    }

    const nextSubmoduleIndex = currentSubmoduleIndex + 1;
    const isMovingToNextModule =
      nextSubmoduleIndex >= currentModuleData.submodule.length;

    const nextModuleIndex = currentModuleIndex + (isMovingToNextModule ? 1 : 0);
    const targetNextSubmoduleIndex = isMovingToNextModule
      ? 0
      : nextSubmoduleIndex;

    // Check if there is a *next* submodule/module in the data
    if (nextModuleIndex < moduleKeys.length) {
      const nextModuleKey = moduleKeys[nextModuleIndex];
      const nextSubmoduleData =
        educationData[nextModuleKey]?.submodule?.[targetNextSubmoduleIndex]; // Need this for structure check

      if (!nextSubmoduleData) {
        console.error(TranslateText["error.autoplayPrefetchDataNotFound"]); // Replaced console error string
        setAutoPlayEnabled(false);
        setIsLoading(false);
        return;
      }

      const nextCacheKey = `${nextModuleKey}-${targetNextSubmoduleIndex}-${targetLang}`;

      if (translatedDataCache.current.has(nextCacheKey)) {
        console.log(
          `${TranslateText["console.autoplayNextContentCached1"]}${nextCacheKey}${TranslateText["console.autoplayNextContentCached2"]}`
        ); // Replaced console log string
        // Content is ready, schedule the auto-advance AFTER the standard delay
        // This delay gives the user time to process the end of the current submodule
        const advanceTimeout = setTimeout(async () => {
          console.log(
            `${TranslateText["console.autoplayAdvancingCached1"]}${nextCacheKey}${TranslateText["autoplayAdvancingCached2"]}`
          ); // Replaced console log string
          setIsLoading(false); // Should already be false if coming from cached hit path
          await selectSubmodule(nextModuleKey, targetNextSubmoduleIndex);
        }, AUTOPLAY_ADVANCE_DELAY);
        animationTimeoutId.current = advanceTimeout; // Store the advance timeout ID
        console.log(
          TranslateText["console.autoplayAdvanceTimeoutSet"],
          animationTimeoutId.current
        ); // Replaced console log string
      } else {
        console.log(
          `${TranslateText["console.autoplayPrefetchNotCached1"]}${nextCacheKey}${TranslateText["autoplayPrefetchNotCached2"]}`
        ); // Replaced console log string
        // Next content is NOT cached, trigger fetch *immediately* for pre-loading.
        // The fetch function will show the loader and update the message.
        // We *don't* await the fetch here because we want the effect to finish and let the fetch run in the background.
        // We handle the promise resolution (`.then()`) to schedule the *advance* once the fetch is complete.
        fetchTranslatedContentAndAudio(
          nextModuleKey,
          targetNextSubmoduleIndex,
          targetLang
        )
          .then(() => {
            console.log(
              `${TranslateText["autoplayPrefetchFetchComplete1"]}${nextCacheKey}${TranslateText["autoplayPrefetchFetchComplete2"]}`
            ); // Replaced console log string
            // Now that data is cached, schedule the advance after the standard delay
            const advanceTimeout = setTimeout(async () => {
              console.log(
                `${TranslateText["autoplayAdvancingFetched1"]}${nextCacheKey}${TranslateText["autoplayAdvancingFetched2"]}`
              ); // Replaced console log string
              setIsLoading(false); // Ensure loader is off before advancing
              await selectSubmodule(nextModuleKey, targetNextSubmoduleIndex);
            }, AUTOPLAY_ADVANCE_DELAY); // Standard delay AFTER fetch is ready
            animationTimeoutId.current = advanceTimeout; // Store the advance timeout ID
            console.log(
              TranslateText["autoplayAdvanceTimeoutSetAfterFetch"],
              animationTimeoutId.current
            ); // Replaced console log string
          })
          .catch((error) => {
            console.error(
              `${TranslateText["autoplayPrefetchFailed1"]}${nextCacheKey}${TranslateText["autoplayPrefetchFailed2"]}`,
              error
            ); // Replaced console error string
            setAutoPlayEnabled(false); // Stop autoplay on error
            setIsLoading(false); // Hide loader
            stopAnimationRef.current(); // Ensure things stop
            stopTtsAudioPlayback();
            revokeCurrentAudioObjectURL();
          });
        // Loader is visible during the fetch because setIsLoading(true) is called in fetchTranslatedContentAndAudio
      }
    } else {
      // All modules completed in the entire course
      console.log(TranslateText["console.autoplayAllModulesCompleted"]); // Replaced console log string
      setShowContinueDialog(true); // Show the course complete dialog
      setAutoPlayEnabled(false); // Autoplay turned off here as the journey is complete.
      setIsLoading(false); // Ensure loader is off
      stopAnimationRef.current(); // Ensure things stop
      stopTtsAudioPlayback();
      revokeCurrentAudioObjectURL();
    }

    // Cleanup function: Clear the timeout if state changes before it fires
    return () => {
      console.log(TranslateText["console.autoplayPrefetchEffectCleanup"]); // Replaced console log string
      // Clear the stored timeout ID IF it corresponds to an advance timeout
      // The state conditions at the start of the effect help decide if the timeout should be cleared.
      // A simple check here is if the current timeout ID is > 0 (valid) and != the ID set by the typing loop.
      // A separate ref for autoplay timeouts would be cleaner, but let's work with current structure.
      const pendingTimeout = animationTimeoutId.current;
      // Crude check: if isAnimating is false, it's likely an advance timeout set by THIS effect
      if (pendingTimeout && !isAnimating) {
        clearTimeout(pendingTimeout);
        animationTimeoutId.current = null; // Clear the ref
        console.log(TranslateText["clearedPendingAutoplayTimeoutCleanup"]); // Replaced console log string
      }
      // Note: This cleanup *does not* cancel the ongoing fetch if one was started.
    };
    // Dependencies: Autoplay conditions states/refs, current position indices, moduleKeys,
    // functions it calls (selectSubmodule, fetch...), targetLang, state setters, cleanup function refs.
    // Including `ttsAudioRef.current.paused`, `ttsAudioRef.current.ended`, `ttsAudioRef.current.src` ensures the effect re-evaluates when audio playback state changes.
  }, [
    autoPlayEnabled,
    isSubmoduleComplete,
    isAnimating,
    showContinueDialog,
    currentModuleIndex,
    currentSubmoduleIndex,
    moduleKeys,
    selectSubmodule,
    fetchTranslatedContentAndAudio,
    targetLang,
    setIsLoading,
    setAutoPlayEnabled,
    setShowContinueDialog,
    stopAnimationRef,
    stopTtsAudioPlayback,
    revokeCurrentAudioObjectURL,
    animationTimeoutId,
    ttsAudioRef,
    TranslateText,
  ]); // Added TranslateText to deps
  // Note on ttsAudioRef dependency: accessing .paused, .ended, .src makes the effect dependent on the *object reference* ttsAudioRef.current,
  // and React *might* re-run the effect if the *properties* of the object change, even if the object reference itself is stable. This is the intended behavior here to react to audio state changes.

  // Effect to create and cleanup the Audio elements once on mount
  useEffect(() => {
    console.log(TranslateText["creatingAudioElements"]); // Replaced console log string

    ttsAudioRef.current = new Audio(); // Create HTML Audio element for TTS playback
    ttsAudioRef.current.volume = 1.0; // Full volume for speech

    // Cleanup function: removes audio elements when component unmounts
    return () => {
      console.log(TranslateText["audioElementsCleanup"]); // Replaced console log string
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        // Remove all specific listeners added in playTtsAudioFromBase64
        // Note: Using removeEventListener requires the *same* function instance.
        // Attaching unique listeners or using `once: true` helps manage this.
        // Since we used `once: true`, they *should* be gone if playback finished/errored.
        // But explicitly clearing them here is a failsafe on unmount.
        ttsAudioRef.current.onended = null; // Clear any remaining listeners
        ttsAudioRef.current.onerror = null;
        ttsAudioRef.current.oncanplaythrough = null;
        ttsAudioRef.current.src = ""; // Remove source
        ttsAudioRef.current = null; // Nullify the ref
      }
      // Ensure any lingering Object URL is revoked on unmount
      if (currentAudioObjectURLRef.current) {
        console.log(TranslateText["finalRevokeOnUnmount"]); // Replaced console log string
        URL.revokeObjectURL(currentAudioObjectURLRef.current);
        currentAudioObjectURLRef.current = null;
      }
    };
  }, [TranslateText]); // Empty dependency array means this runs only once on mount // Added TranslateText to deps

  // --- Render JSX ---

  return (
    <PageContainer>
      {/* Loader Backdrop - Shown when isLoading is true */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2, color: "#fff" }}>
          {loadingMessage}
        </Typography>
      </Backdrop>

      {/* Left Section - Course Index (30%) */}
      <LeftPanel>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#ff6f00",
            textAlign: "center",
            borderBottom: "2px dashed #ff9800",
            paddingBottom: 1,
            marginBottom: 3,
          }}
        >
          <School sx={{ mr: 1, verticalAlign: "bottom" }} />
          {TranslateText["ui.title.learningAdventure"]} {/* Replaced string */}
        </Typography>

        <List component="nav">
          {/* Map through module keys */}
          {moduleKeys.map((moduleKey, moduleIdx) => {
            const moduleData = educationData[moduleKey];
            if (!moduleData) return null;

            // Get module name from TranslateText.json for the main list item
            const moduleTranslateName =
              TranslateText["data.submoduleNames"][moduleKey]?.name ||
              moduleData.name; // Fallback to original name if not in TranslateText

            return (
              <Box key={moduleKey} sx={{ mb: 2 }}>
                {/* Module List Item Button (Expand/Collapse) */}
                <ListItemButton
                  onClick={() => handleModuleClick(moduleKey)}
                  selected={expandedModule === moduleKey}
                  sx={{
                    borderRadius: 2,
                    backgroundColor:
                      expandedModule === moduleKey
                        ? "rgba(255, 152, 0, 0.15)"
                        : "transparent",
                    border: "2px solid",
                    borderColor:
                      expandedModule === moduleKey ? "#ff9800" : "transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      transform: "translateX(5px)",
                    },
                    color:
                      autoPlayEnabled && moduleIdx > currentModuleIndex
                        ? "#777"
                        : "#333",
                    opacity:
                      autoPlayEnabled && moduleIdx > currentModuleIndex
                        ? 0.7
                        : 1,
                  }}
                  disabled={
                    (autoPlayEnabled && moduleIdx > currentModuleIndex) ||
                    isLoading
                  }
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "medium", flexGrow: 1 }}
                  >
                    {moduleIdx + 1}. {moduleTranslateName}{" "}
                    {/* Use translated module name */}
                  </Typography>
                  {expandedModule === moduleKey ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItemButton>

                {/* Collapse for submodules */}
                <Collapse
                  in={expandedModule === moduleKey}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 2, mt: 1 }}>
                    {/* Map through submodules */}
                    {moduleData.submodule?.map((submodule, subIndex) => {
                      // Get submodule name from TranslateText.json
                      const submoduleName =
                        TranslateText["data.submoduleNames"][moduleKey]
                          ?.submoduleNames?.[subIndex] ||
                        TranslateText["error.unknownTopicFallback"]; // Use TranslateText
                      return (
                        <ListItemButton
                          key={subIndex}
                          sx={{
                            borderRadius: 2,
                            my: 0.5,
                            pl: 4,
                            backgroundColor:
                              selectedSubmodule?.moduleKey === moduleKey &&
                              selectedSubmodule?.submoduleIndex === subIndex
                                ? "rgba(76, 175, 80, 0.15)"
                                : "transparent",
                            border: "1px solid",
                            borderColor:
                              selectedSubmodule?.moduleKey === moduleKey &&
                              selectedSubmodule?.submoduleIndex === subIndex
                                ? "#4caf50"
                                : "transparent",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                              transform: "translateX(5px)",
                            },
                            "&::after":
                              autoPlayEnabled &&
                              (moduleIdx < currentModuleIndex ||
                                (moduleIdx === currentModuleIndex &&
                                  subIndex < currentSubmoduleIndex))
                                ? {
                                    content: `"${TranslateText["ui.css.checkmark"]}"`,
                                    color: "#4caf50",
                                    fontWeight: "bold",
                                    marginLeft: "8px" /* Replaced string */,
                                  }
                                : {},
                            color:
                              autoPlayEnabled &&
                              moduleIdx === currentModuleIndex &&
                              subIndex > currentSubmoduleIndex
                                ? "#777"
                                : "#333",
                            opacity:
                              autoPlayEnabled &&
                              moduleIdx === currentModuleIndex &&
                              subIndex > currentSubmoduleIndex
                                ? 0.7
                                : 1,
                          }}
                          onClick={() =>
                            handleSubmoduleClick(moduleKey, subIndex)
                          }
                          selected={
                            selectedSubmodule?.moduleKey === moduleKey &&
                            selectedSubmodule?.submoduleIndex === subIndex
                          }
                          disabled={
                            (autoPlayEnabled &&
                              !(
                                selectedSubmodule?.moduleKey === moduleKey &&
                                selectedSubmodule?.submoduleIndex === subIndex
                              )) ||
                            isLoading
                          }
                        >
                          <Typography variant="body2">
                            {subIndex + 1}. {submoduleName}{" "}
                            {/* Use submodule name from TranslateText */}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </LeftPanel>

      {/* Right Section - Classroom Display (70%) */}
      <RightPanel>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 6,
            color: "#ff6f00",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)", // Keep CSS string literal
          }}
        >
          {TranslateText["ui.title.interactiveClassroom"]}{" "}
          {/* Replaced string */}
        </Typography>

        {showStartScreen ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.7)", // Keep CSS string literal
              borderRadius: 4,
              padding: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)", // Keep CSS string literal
            }}
          >
            <img
              src="https://tse2.mm.bing.net/th?id=OIP.qgH_ERpBPypO6MD8rNgMyAHaFe&pid=Api&P=0&h=180" // Keep URL string literal (cannot be in JSON as it's asset src)
              alt={TranslateText["ui.alt.classroomIllustration"]}
              style={{
                marginBottom: "2rem",
                borderRadius: "12px",
                maxWidth: "20%",
                height: "auto",
              }} // Keep CSS string literal
            />
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "#ff6f00", fontWeight: "bold", mb: 3 }}
            >
              {" "}
              {/* Keep CSS string literal */}
              {TranslateText["ui.startScreen.title"]} {/* Replaced string */}
            </Typography>
        
            <StartButton
              startIcon={<School />}
              onClick={startLearningJourney}
              variant="contained" // Keep string literal
              disabled={isLoading}
            >
              {TranslateText["ui.startScreen.startButton"]}{" "}
              {/* Replaced string */}
            </StartButton>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <BoardContainer>
              <GreenBoard ref={boardInnerRef} elevation={0}>
                {selectedSubmodule ? (
                  <>
                    <Typography
                      variant="h6" // Keep string literal
                      component="h2" // Keep string literal
                      sx={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
                        paddingBottom: theme.spacing(2), // Keep CSS string literal
                        marginBottom: theme.spacing(4),
                        fontWeight: "medium",
                        flexShrink: 0, // Keep CSS string literal
                      }}
                    >
                      {/* Get submodule name from TranslateText.json */}
                      {/* Fallback to a different loading message from TranslateText */}
                      {TranslateText["data.submoduleNames"][
                        selectedSubmodule.moduleKey
                      ]?.submoduleNames?.[selectedSubmodule.submoduleIndex] ||
                        TranslateText["ui.board.loading"]}{" "}
                      {/* Replaced string and fallback */}
                    </Typography>
                    <Typography
                      component="div" // Keep string literal
                      sx={{
                        flexGrow: 1, // Keep CSS string literal
                        lineHeight: 1.7,
                        fontSize: "1.1rem", // Keep CSS string literal
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word", // Keep CSS string literal
                        minHeight: 0, // Keep CSS string literal
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(displayContent),
                      }}
                    />
                    {isLoading && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: theme.spacing(2),
                          left: "50%",
                          transform: "translateX(-50%)",
                          color: "rgba(255,255,255,0.7)",
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {" "}
                        {/* Keep CSS string literal */}
                        <CircularProgress
                          size={16}
                          sx={{ mr: 1 }}
                          color="inherit"
                        />{" "}
                        {/* Keep prop string literal */}
                        {loadingMessage}
                      </Box>
                    )}

                    {/* Check if fullContent starts with 'Error:' using the string literal from the JSON key */}
                    {!isLoading &&
                      !isAnimating &&
                      fullContent.startsWith(
                        TranslateText["ui.board.errorHeader"] + ":"
                      ) && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                            color: "#ff5252",
                            zIndex: 2,
                          }}
                        >
                          {" "}
                          {/* Keep CSS string literal */}
                          <Typography variant="h6">
                            {TranslateText["ui.board.errorHeader"]}
                          </Typography>{" "}
                          {/* Replaced string */}
                          <Typography variant="body1">{fullContent}</Typography>
                        </Box>
                      )}

                    {/* Manual "Next" Button */}
                    {/* Show if NOT loading, NOT animating, typing is complete, NOT in autoplay, and there is a next item */}
                    {!isLoading &&
                      !isAnimating &&
                      isSubmoduleComplete &&
                      !autoPlayEnabled &&
                      currentModuleIndex < moduleKeys.length &&
                      educationData[moduleKeys[currentModuleIndex]]
                        ?.submodule && // Check current module exists
                      (currentSubmoduleIndex + 1 <
                        (educationData[moduleKeys[currentModuleIndex]].submodule
                          .length || 0) ||
                        currentModuleIndex + 1 < moduleKeys.length) && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: theme.spacing(2),
                            right: theme.spacing(2),
                            zIndex: 2,
                          }}
                        >
                          <NextButton
                            onClick={goToNextSubmodule}
                            endIcon={<ArrowForward />}
                          >
                            {TranslateText["ui.board.manualNextButton"]}{" "}
                            {/* Replaced string */}
                          </NextButton>
                        </Box>
                      )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{ opacity: 0.7 }}
                    >
                      {" "}
                      {/* Keep CSS string literal */}
                      {TranslateText["ui.board.initialPrompt"]}{" "}
                      {/* Replaced string */}
                    </Typography>
                  </Box>
                )}
                 
              </GreenBoard>
            </BoardContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start", // Vertically center both items
                width: "95%",
              }}
            >
              <Button
                onClick={() => goToNextSubmodule()}
                variant="contained"
                sx={{
                  borderRadius: 16,
                  bgcolor: "black",
                  minHeight: "auto", // Prevent button height inflation
                  padding: "8px", // Optional: control padding
                }}
              >
                <NavigateNextIcon sx={{ fontSize: 32 }} />
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "@keyframes float": {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                    "100%": { transform: "translateY(0px)" },
                  },
                  animation: "float 3s ease-in-out infinite",
                }}
              >
                <TeacherCharacter />
              </Box>
            </Box>
          </Box>
        )}

        <Dialog
          open={showContinueDialog}
          onClose={() => setShowContinueDialog(false)} // Allow closing dialog manually
          aria-labelledby="continue-dialog-title" // Keep string literal
          aria-describedby="continue-dialog-description" // Keep string literal
          disableEscapeKeyDown={autoPlayEnabled || isLoading} // Prevent closing with escape if in autoplay or loading
          BackdropProps={{ invisible: autoPlayEnabled }} // Invisible backdrop in autoplay
        >
          <DialogTitle
            id="continue-dialog-title"
            sx={{ bgcolor: "#ffcc80", color: "#333", fontWeight: "bold" }}
          >
            {" "}
            {/* Keep CSS string literal */}
            {currentModuleIndex + 1 < moduleKeys.length
              ? TranslateText["dialog.moduleComplete.title"]
              : TranslateText["dialog.courseComplete.title"]}{" "}
            {/* Replaced string */}
            <EmojiEvents sx={{ ml: 1 }} />
          </DialogTitle>
          <DialogContent sx={{ p: theme.spacing(4), textAlign: "center" }}>
            {" "}
            {/* Keep CSS string literal */}
            {currentModuleIndex + 1 < moduleKeys.length ? (
              <>
                <Typography variant="body1" sx={{ mb: theme.spacing(2) }}>
                  {TranslateText["dialog.moduleComplete.body"]}{" "}
                  {/* Replaced string */}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#ff6f00", fontWeight: "medium" }}
                >
                  {" "}
                  {/* Keep CSS string literal */}
                  {/* Replaced string and concatenation, using module name from TranslateText */}
                  {TranslateText["dialog.moduleComplete.nextModulePrompt1"]}
                  {currentModuleIndex + 2}
                  {TranslateText["dialog.moduleComplete.nextModulePrompt2"]}
                  {TranslateText["data.submoduleNames"][
                    moduleKeys[currentModuleIndex + 1]
                  ]?.name ||
                    TranslateText["dialog.moduleComplete.unknownModuleName"]}
                  ?
                </Typography>
              </>
            ) : (
              <Typography
                variant="h6"
                sx={{ color: "#4caf50", fontWeight: "medium" }}
              >
                {" "}
                {/* Keep CSS string literal */}
                {TranslateText["dialog.courseComplete.body"]}{" "}
                {/* Replaced string */}
              </Typography>
            )}
          </DialogContent>
          <DialogActions
            sx={{ justifyContent: "center", pb: theme.spacing(3) }}
          >
            {" "}
            {/* Keep CSS string literal */}
            {currentModuleIndex + 1 < moduleKeys.length ? (
              <NextButton
                onClick={continueToNextModule}
                autoFocus
                endIcon={<ArrowForward />}
                disabled={isLoading}
              >
                {TranslateText["dialog.button.continueToNextModule"]}{" "}
                {/* Replaced string */}
              </NextButton>
            ) : (
              <Button
                onClick={() => setShowContinueDialog(false)}
                color="primary"
                variant="contained"
                disabled={isLoading}
              >
                {" "}
                {/* Keep prop string literal */}
                {TranslateText["dialog.button.finish"]} {/* Replaced string */}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </RightPanel>
    </PageContainer>
  );
}
