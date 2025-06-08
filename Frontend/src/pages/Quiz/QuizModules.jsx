import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuizModules() {
  const navigate = useNavigate();

  const handleModuleClick = (moduleNum) => {
    navigate(`/quiz/module-${moduleNum}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="text-2xl font-bold text-center mb-4">Test Yourself</div>
      {/* Left Section */}
    <div className="flex">
        <div className="flex flex-col gap-2 justify-center mb-6 w-1/2">
        {[1, 2, 3, 4, 5, 6,7,8,9,10].map((num) => (
          <button
            key={num}
            onClick={() => handleModuleClick(num)}
            className="px-4 py-2 bg-terra text-white rounded-2xl hover:scale-105 transition-transform"
          >
            Module {num}
          </button>
        ))}
      </div>
    
    {/* Right Section */}
        <div className="w-2/3">
           <img
           src="/assets/images/Assistant-page.png"
           alt="Quizsection"
           />
        </div>  
    </div>
    </div>
  );
}
