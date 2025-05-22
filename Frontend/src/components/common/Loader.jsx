import React from "react";

const Loaders = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-50">
      <div className="relative w-36 h-36">
        {/* Spinning Ring */}
        <div className="absolute inset-0 rounded-full bg-[#d6c6b8] border-4 border-t-[#bb5b45] border-b-transparent border-l-transparent border-r-transparent animate-spin" />

        {/* Center Image */}
        <img
          src="/assets/images/Loader.png" // Replace with your image path
          alt="center-img"
          className="w-26 h-26 rounded-full object-cover absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
};

export default Loaders;
