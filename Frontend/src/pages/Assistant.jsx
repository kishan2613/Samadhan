import { useState, useEffect } from "react";
import { Mic, Pause, Square } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";

const Assistant = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [userInteracted, setUserInteracted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Browser doesn't support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (userInteracted) {
      const welcomeMessage =
        "Hello, my name is Samadhan, and I am your AI Mediator. To get started, click on the mic button shown below and tell me your query.";
      speakText(welcomeMessage);
    }
  }, [userInteracted]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      console.log("Final Transcript:", transcript);
      ResponseGenerator(transcript);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const stopAll = () => {
    SpeechRecognition.stopListening();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const GEMINI_API_KEY = "AIzaSyCILU-_ezGfu3iojbS-hFe9-Fil4klNOlo"; // Replace with .env in production

  const ResponseGenerator = async (userTranscript) => {
    setIsLoading(true);
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are **Samadhan**, an AI-powered mediation assistant developed as per the guidelines of the **Mediation Act, 2023 (India)**.

Your role is to:
- Help users understand the **mediation process**, including pre-litigation mediation.
- Offer guidance on whether their dispute is eligible for mediation under the Act.
- Explain the rights and duties of parties under the Act.
- Suggest steps for initiating mediation or contacting a mediator/mediation service provider.
- Provide general legal awareness related to mediation, **not legal advice**.
- Use clear and simple language understandable to the common public.
- Respect confidentiality and neutrality as expected from a mediator.

Strictly avoid:
- Giving personal legal advice or deciding outcomes.
- Acting as a lawyer, judge, or arbitrator.
- Recommending specific individuals or law firms.

The Mediation Act promotes voluntary resolution of disputes through collaborative dialogue.

Now respond to the following user query with empathy and clarity.

**User Query:** ${userTranscript}
**Samadhan’s Response:**
                  `,
                },
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const responseText =
        geminiResponse.data.candidates[0].content.parts[0].text;
      speakText(responseText);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1.2;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Glowing Heartbeat Circle */}
        <div
          className={`w-60 h-60 rounded-full flex items-center justify-center relative ${
            isSpeaking ? "animate-heartbeat-glow" : ""
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full border-4 ${
              isSpeaking
                ? "border-blue-500 shadow-blue-500 shadow-xl"
                : "border-gray-700"
            }`}
          ></div>
          <img
            src="/assets/images/assistant.png"
            alt="Samadhan AI"
            className="w-52 h-52 object-cover rounded-full z-10"
          />
        </div>

        {/* Mic + Stop Buttons */}
        {userInteracted ? (
          <div className="flex gap-4">
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                listening ? "bg-red-500" : "bg-blue-600"
              } text-white hover:scale-105 transition-transform duration-200`}
            >
              {listening ? <Pause size={28} /> : <Mic size={28} />}
            </button>

            <button
              onClick={stopAll}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition"
            >
              <Square size={28} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setUserInteracted(true)}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full shadow hover:bg-blue-600"
          >
            Start Conversation
          </button>
        )}
      </div>
    </div>
  );
};

export default Assistant;
