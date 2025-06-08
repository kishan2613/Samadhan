import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import quizData from "../../WebData/Quize.json";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
const UI_TEXT = {
  op1: "Submit Quiz",
  op2: "Quiz Results",
  op3: "Score",
  op4: "Correct",
  op5: "View Correct Answers",
  op6: "Attempted",
  op7: "See Attempted Questions",
  op8: "Coins Earned",
  op9: "Redeem Coins",
  op10: "Close",
  op11: "Incorrect",
};
const Quiz = () => {
  // const [selectedModule] = useState("module 3");
  const { moduleId } = useParams();
const selectedModule = moduleId.replace("-", " ");


  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  const module = quizData[selectedModule];
  
  const [uiText, setUiText] = useState(module);
  const [uiTextstable, setUiTextstable] = useState(UI_TEXT);
   
  useEffect(() => {
  const lang = localStorage.getItem("preferredLanguage");
  if (!lang) return;

  const translateText = async () => {
    try {
      const res = await fetch("http://localhost:5000/translate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonObject: module, targetLang: lang }),
      });

      const data = await res.json();
      const map = {};
      (data?.pipelineResponse?.[0]?.output || []).forEach(
        ({ source, target }) => (map[source] = target)
      );

      const translatedQuiz = module.quiz.map((q) => ({
        question: map[q.question] || q.question,
        options: q.options.map((opt) => map[opt] || opt),
        answer: map[q.answer] || q.answer,
      }));

      const translated = {
        ...module,
        name: map[module.name] || module.name,
        quiz: translatedQuiz,
      };

      setUiText(translated);
    } catch (err) {
      console.error("Translation error:", err);
    }
  };

  translateText();
}, []);


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

        setUiTextstable(translated);
      } catch (err) {
        console.error("Translation error:", err);
      }
    };

    translateText();
  }, []);
  const quiz = uiText.quiz;
  const handleOptionChange = (index, value) => {
    setUserAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const correct = quiz.reduce((acc, q, i) => {
      if (userAnswers[i] === q.answer) return acc + 1;
      return acc;
    }, 0);
    setCorrectCount(correct);
    setShowResult(true);
  };

  const chartData = {
   labels: [uiTextstable.op4, uiTextstable.op11],

    datasets: [
      {
        data: [correctCount, quiz.length - correctCount],
        backgroundColor: ["#4ade80", "#f87171"],
      },
    ],
  };

  const percentage = Math.round((correctCount / quiz.length) * 100);
  const coins = correctCount * 10;

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-terra mb-8">
        {uiText.name}
      </h1>

      <div className="w-full max-w-4xl space-y-6">
        {uiText.quiz.map((q, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white shadow-xl border-4 border-transparent 
                   bg-gradient-to-r from-gold via-bronze to-terra 
                   [background-size:200%_200%] animate-gradient-x transition-all duration-500"
          >
            <Typography variant="h6" className="text-terra font-semibold mb-2">
              {i + 1}. {q.question}

            </Typography>
            <RadioGroup
              value={userAnswers[i] || ""}
              onChange={(e) => handleOptionChange(i, e.target.value)}
            >
              {q.options.map((opt, idx) => (
                <FormControlLabel
                  key={idx}
                  value={opt}
                  control={<Radio color="primary" />}
                  label={<span className="text-gray-800">{opt}</span>}
                />
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="text-center">
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="!bg-terra !text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform"
            disabled={Object.keys(userAnswers).length < quiz.length}
          >
             {uiTextstable.op1}
          </Button>
        </div>
      </div>
 
      {/* Result Dialog */}
      <Dialog open={showResult} onClose={() => setShowResult(false)}>
        <div className="bg-gradient-to-br from-beige via-gold to-bronze p-6 rounded-2xl shadow-2xl w-[95vw] max-w-md text-center text-gray-800">
          <Typography variant="h5" className="font-bold text-terra mb-4">
            {uiTextstable.op2}
          </Typography>

          {/* Pie Chart */}
          <div className="flex justify-center mb-6">
            <Pie data={chartData} />
          </div>

          {/* Score Meter */}
          <motion.div
            className="relative w-full h-6 bg-dccfc3 rounded-full overflow-hidden mb-4"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-terra text-white text-sm flex items-center justify-center rounded-full"
              style={{ width: `${percentage}%` }}
            >
               {uiTextstable.op3}: {percentage}%
            </div>
          </motion.div>

          {/* Result Stats with Buttons */}
          <div className="space-y-4 text-lg">
            <div className="flex flex-col items-center">
              <p>
                ✅{uiTextstable.op4}:{" "}
                <span className="font-bold text-terra">{correctCount}</span>
              </p>
              <button className="mt-1 px-4 py-1 text-sm rounded-full bg-terra text-white hover:scale-105 transition">
                 {uiTextstable.op5}
              </button>
            </div>

            <div className="flex flex-col items-center">
              <p>
                📝{uiTextstable.op6}:{" "}
                <span className="font-bold text-terra">
                  {Object.keys(userAnswers).length}
                </span>
              </p>
              <button className="mt-1 px-4 py-1 text-sm rounded-full bg-terra text-white hover:scale-105 transition">
                {uiTextstable.op7}
              </button>
            </div>

            <div className="flex flex-col items-center">
              <p>
                🏆{uiTextstable.op8}
                <motion.span
                  className="font-bold text-terra ml-1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.5 }}
                >
                  {coins} 🪙
                </motion.span>
              </p>
              <button className="mt-1 px-4 py-1 text-sm rounded-full bg-terra text-white hover:scale-105 transition">
                {uiTextstable.op9}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            className="mt-6 w-full !bg-terra text-white font-semibold hover:scale-105 transition-transform"
            variant="contained"
            onClick={() => setShowResult(false)}
          >
            {uiTextstable.op10}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Quiz;
