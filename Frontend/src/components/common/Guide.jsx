import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
let currentAudio = null;
const UI_TEXT = {
  helpLabel: "Tap for help!",
  Ivr: "Welcome to our support system. You can say the name of the section you'd like to visit please speak clearly after the beep. To go to the main page, say ",
  op1: "To ask a question or get support, say ",
  op2: "To connect with a mediator, say",
  op3: "To explore learning resources, say",
  op4: "To engage with the community, say",
  op5: "Voice Guide",
  op6: "Video Guide",
  op7: "Why use us ?",
  op8: "Our website offers a range of helpful features Ask Samadhan – to get answers and support, Mediator Connect – to resolve disputes with expert help, Education – to access learning content and guidance, Community – to engage and interact with others, Language Change – to switch the website into your preferred language, and more. Explore freely and speak your needs anytime.",
};

const playBeep = () => {
  return new Promise((resolve) => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
    oscillator.onended = () => {
      context.close();
      resolve();
    };
  });
};

export default function Guide() {
  const [chatOpen, setChatOpen] = useState(false);
  const [ivrOpen, setIVROpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uiText, setUiText] = useState(UI_TEXT);
  const [isLogging, setIsLogging] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const navigate = useNavigate();
 

  if (!browserSupportsSpeechRecognition) {
    return <div>Your browser does not support speech recognition.</div>;
  }

  // Translate UI_TEXT on language change
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    const translateText = async () => {
      try {
        const res = await fetch("https://samadhan-zq8e.onrender.com/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: UI_TEXT, targetLang: lang }),
        });

        const data = await res.json();
        const map = {};
        (data?.pipelineResponse?.[0]?.output || []).forEach(
          ({ source, target }) => (map[source] = target)
        );

        const translated = Object.fromEntries(
          Object.entries(UI_TEXT).map(([key, val]) => [key, map[val] || val])
        );

        setUiText(translated);
      } catch (err) {
        console.error("Translation error:", err);
      }
    };

    translateText();
  }, []);

  // Play IVR message, then beep, then listen for commands
  const handleIVRSpeakOnly = async () => {
    const preferredLang = localStorage.getItem("preferredLanguage") || "en";

    const message = {
      ivr: "Welcome to our support system.You can say the name of the section you'd like to visit please speak clearly after the beep. To go to the main page, say ‘one one’. To ask a question or get support, say ‘two two’. To connect with a mediator, say ‘three three’. To explore learning resources, say ‘four four’. To engage with the community, say ‘five five’ ",
      //  You can say the name of the section you'd like to visit please speak clearly after the beep. To go to the main page, say ‘one one’. To ask a question or get support, say ‘two two’. To connect with a mediator, say ‘three three’. To explore learning resources, say ‘four four’. To engage with the community, say ‘five five’
    };

    try {
      const res = await fetch(
        "https://samadhan-zq8e.onrender.com/translate/translate-and-speak",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonObject: message,
            targetLang: preferredLang,
            sourceLang: "en",
          }),
        }
      );

      const data = await res.json();

      if (data?.audioContent && typeof data.audioContent === "string") {
        const audioSrc = `data:audio/wav;base64,${data.audioContent}`;
        const audio = new Audio(audioSrc);

        audio.onended = async () => {
          await playBeep();

          resetTranscript();
          SpeechRecognition.startListening({
            continuous: true,
            interimResults: true,
            language: preferredLang === "en" ? "en-IN" : preferredLang,
          });

          setIsLogging(true);

          setTimeout(() => {
            SpeechRecognition.stopListening();
            setIsLogging(false);
          }, 7000);
        };

        audio
          .play()
          .catch((err) => console.error("Audio play failed:", err.message));
      } else {
        console.warn("No audio content returned from TTS.");
        console.warn("Full response:", data?.pipelineResponse || data);
      }
    } catch (err) {
      console.error("TTS fetch error:", err.message);
    }
  };

  // React to voice commands and navigate accordingly
  useEffect(() => {
    if (!transcript) return; // don't run if no transcript

    console.log("Transcript:", transcript);

    const command = transcript.toLowerCase();
    const routeMap = {
      11: "/",
      22: "/Ask-Samadhan",
      33: "/mediator-connect",
      44: "/educate",
      55: "/samadhan-community",
    };

    for (const [key, path] of Object.entries(routeMap)) {
      if (command.includes(key)) {
        SpeechRecognition.stopListening();
        navigate(path);
        setIVROpen(false); // optional: close your IVR UI
        resetTranscript();
        break;
      }
    }
  }, [transcript, navigate, resetTranscript]);

  // Just keep your floating button, modals, etc.

  return (
    <div>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-2 z-50">
        <div className="bg-white text-black px-3 py-1 rounded-full shadow text-sm font-medium bubble-bounce">
          {uiText.helpLabel}
        </div>

        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer transition"
          aria-label="Open Help Menu"
        >
          <img
            src="/assets/images/avtarhome.png"
            alt="Help Icon"
            className="w-18 h-24 object-cover rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* Popup Menu */}
      {menuOpen && (
        <div className="fixed bottom-36 right-6 bg-white shadow-lg rounded-xl w-52 p-4 z-50 space-y-3">
          <button
            onClick={() => {
              setIVROpen(true);
              handleIVRSpeakOnly();
            }}
            className="w-full bg-[#87311e] text-white px-4 py-2 rounded-lg text-sm"
            aria-label="Start Voice Guide (IVR)"
          >
            {uiText.op5}
          </button>
          <button
            onClick={() => {
              setChatOpen(true);
              setMenuOpen(false);
            }}
            className="w-full bg-[#87311e] text-white px-4 py-2 rounded-lg text-sm"
            aria-label="Open Video Guide"
          >
            {uiText.op6}
          </button>

          <button
            onClick={async () => {
              setFeatureOpen(true);
              setMenuOpen(false);

              // 🔁 Toggle: Stop if already speaking
              if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
                return;
              }

              const preferredLang =
                localStorage.getItem("preferredLanguage") || "en";
              const message = {
                feature: uiText.op8,
              };

              try {
                const res = await fetch(
                  "https://samadhan-zq8e.onrender.com/translate/translate-and-speak",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      jsonObject: message,
                      targetLang: preferredLang,
                      sourceLang: "en",
                    }),
                  }
                );

                const data = await res.json();

                if (
                  data?.audioContent &&
                  typeof data.audioContent === "string"
                ) {
                  const audioSrc = `data:audio/wav;base64,${data.audioContent}`;
                  const audio = new Audio(audioSrc);
                  currentAudio = audio;

                  audio.onended = () => {
                    currentAudio = null; // Clear after finished
                  };

                  audio.play().catch((err) => {
                    console.error("Audio play failed:", err.message);
                  });
                } else {
                  console.warn("No audio content returned from TTS.");
                }
              } catch (err) {
                console.error("TTS fetch error:", err.message);
              }
            }}
            className="w-full bg-[#87311e] text-white px-4 py-2 rounded-lg text-sm"
            aria-label="Show Features"
          >
            {uiText.op7}
          </button>
        </div>
      )}

      {/* Video Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-11/12 md:w-1/2 h-1/2 bg-white rounded-lg overflow-hidden shadow-xl">
            <button
              onClick={() => setChatOpen(false)}
              className="absolute top-2 right-2 text-black bg-white p-1 px-2 rounded-full shadow hover:bg-gray-200"
              aria-label="Close Video Guide"
            >
              ✖
            </button>
            <video
              src="/assets/video.mp4"
              controls
              autoPlay
              className="w-full h-full pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
 

}
