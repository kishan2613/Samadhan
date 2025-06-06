// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#f5f0eb] text-[#87311e] px-4 py-10 text-center md:text-left">
      {/* Image Section */}
      <img
        src="/assets/images/NotFound.png"
        alt="Not Found"
        className="w-60 md:w-80 h-auto mb-6 md:mb-0 md:mr-10 drop-shadow-xl"
      />

      {/* Text Content */}
      <div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#87311e] mb-4">404</h1>
        <p className="text-lg md:text-2xl font-medium mb-6 animate-typing overflow-hidden whitespace-nowrap">
          Oops! The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-block bg-[#bb5b45] hover:bg-[#a04a32] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-base md:text-lg shadow-md transition duration-300 ease-in-out"
        >
          Go Back Home
        </Link>

        <p className="mt-6 md:mt-8 italic text-[#a15743] max-w-xs md:max-w-md mx-auto md:mx-0">
          “Even the best navigators can miss a page. Let’s get you back on track.”
        </p>
      </div>
    </div>
  );
};

export default NotFound;
