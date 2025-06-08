import React from "react";
import { useNavigate } from "react-router-dom";
// import moduleData from "../../WebData/Quizmodules.json";

export default function QuizModules() {
  const navigate = useNavigate();
  // const [moddata,setModdata] = useState(moduleData);

  const handleModuleClick = (moduleNum) => {
    navigate(`/quiz/module-${moduleNum}`);
  };

  return (
    <div className="min-h-screen bg-[url('/assets/images/Assistant-Bg.png')] bg-cover py-10 px-4">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-center mb-10 text-[#bb5b45] drop-shadow">
        {/* {moddata.title} */}
        Test yourself
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
              📘 Module {num}
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
