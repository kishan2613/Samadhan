import React from "react";

const Herosection = () => {
  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] text-[#2b2b2b] relative">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-6 gap-0 relative overflow-hidden">
        {/* Left Content */}
        <div className="flex-1 max-w-lg space-y-6 z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
            Resolving Conflicts<br />Through Dialogue &<br />Understanding
          </h1>
          <button className="bg-[#d1a76e] text-black px-8 py-3 font-semibold text-sm uppercase rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
            Get Started
          </button>
          <p className="text-sm text-gray-700">
            We help individuals and organizations resolve disputes peacefully.<br />
            Explore affordable, confidential, and legally supported mediation solutions.
          </p>
        </div>

        {/* Right Side with Statue */}
        <div className="flex-1 relative flex items-center justify-between min-h-[500px] z-0">
          {/* "Our lawyers" text in top right */}
          <p className="absolute top-13 right-[-50px] text-s text-gray-900 px-4 py-10 rounded-bl-lg max-w-xs z-20">
            Our mediators have decades of combined experience in conflict resolution.<br />
            Trusted in family, business, and civil disputes.
          </p>

          {/* Large "Mediation" background text */}
          <h2 className="absolute text-[180px] right-[100px] font-extrabold text-white opacity-[0.5] select-none pointer-events-none z-0 leading-none">
            Mediation
          </h2>

          {/* Centered Statue */}
          <img
            src="/assets/images/lady-justice..png"
            alt="Lady Justice"
            className="h-[550px] w-[400px] object-contain z-10"
          />
        </div>
      </section>
    </div>
  );
};

export default Herosection;