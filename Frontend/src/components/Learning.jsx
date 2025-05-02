import React from "react";


const Learning = () => {
  return (
    <section className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] py-0 px-6 md:px-20">
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-6xl mx-auto">
        {/* Left Side Image */}
        <div className="w-full md:w-1/2">
          <img
            src="/assets/images/Learning.png" // Make sure this path matches your project
            alt="Learning Mediation"
            className="rounded-2xl w-full h-sm object-cover "
          />
        </div>

        {/* Right Side Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4 font-serif">
            Begin Your Journey in Mediation
          </h2>
          <p className="text-gray-700 mb-6 text-sm md:text-base">
            Learn how to mediate conflicts and create meaningful resolutions. Our self-paced modules are perfect for beginners and professionals alike.
          </p>
          <button className="bg-[#d1a76e] text-black px-10 py-3 font-semibold text-sm uppercase rounded-full shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300">
            Start Learning
          </button>
        </div>
      </div>
    </section>
  );
};

export default Learning;
