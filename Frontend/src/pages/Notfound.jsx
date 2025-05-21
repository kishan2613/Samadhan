// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-row items-center justify-center bg-[#f5f0eb] text-[#87311e] px-4 py-10">
      {/* Top Image */}
      <img
        src="/assets/images/NotFound.png" // Replace with your actual image path
        alt="Not Found"
        className="w-80 h-auto mb-8 drop-shadow-xl hidden md:block"
      />
        <div>
      {/* 404 Text */}
      <h1 className="text-7xl font-extrabold text-[#87311e] mb-4 ">404</h1>
      <p className="text-2xl font-medium text-center mb-6 animate-typing overflow-hidden whitespace-nowrap ">
        Oops! The page you're looking for doesn't exist.
      </p>

      {/* Button to Go Home */}
      <Link
        to="/"
        className="bg-[#bb5b45] hover:bg-[#a04a32] text-white px-8 py-3 rounded-full text-lg shadow-md transition duration-300 ease-in-out"
      >
        Go Back Home
      </Link>

      {/* Optional Footer Quote */}
      <p className="mt-8 italic text-center text-[#a15743] max-w-md ">
        “Even the best navigators can miss a page. Let’s get you back on track.”
      </p>
      </div>
    </div>
  );
};

export default NotFound;
