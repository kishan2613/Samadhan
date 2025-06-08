import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import moduleData from "../../WebData/Quizmodules.json";
const UI_TEXT = {
  helpLabel: "Test yourself",
  op1: "Module",
};
export default function QuizModules() {
  const navigate = useNavigate();
  const [uiText, setUiText] = useState(UI_TEXT);
  // const [moddata,setModdata] = useState(moduleData);
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    const translateText = async () => {
      try {
        const res = await fetch("http://localhost:5000/translate/translate", {
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
  const handleModuleClick = (moduleNum) => {
    navigate(`/quiz/module-${moduleNum}`);
  };

  return (
    <div className="min-h-screen bg-[url('/assets/images/Assistant-Bg.png')] bg-cover py-10 px-4">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-center mb-10 text-[#bb5b45] drop-shadow">
        {/* {moddata.title} */}
        {uiText.helpLabel}
      </h1>

      {/* Content Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Module Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleModuleClick(num)}
              className="bg-[#bb5b45]  text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>
                <img
                  src="/favicon.png"
                  alt="icon"
                  style={{
                    width: "18px",
                    height: "20px",
                    display: "inline",
                    marginRight: "4px",
                    marginBottom: "4px",
                    verticalAlign: "middle",
                  }}
                />
                {uiText.op1} {num}
              </span>
            </button>
          ))}
        </div>

        {/* Right Side Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/assets/images/Quiz.jpg"
            alt="Quiz Illustration"
            className="w-full max-w-md rounded-2xl shadow-xl  duration-300"
          />
        </div>
      </div>
    </div>
  );
}
