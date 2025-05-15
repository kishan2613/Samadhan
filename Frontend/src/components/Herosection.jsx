import React from "react";
import { motion } from "framer-motion";

const Herosection = () => {
  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] text-[#2b2b2b] relative">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-6 gap-0 relative overflow-hidden">
      <div className="mobile">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <img
            src="/assets/images/lady-justice..png"
            alt="Lady Justice"
            className="h-15.625vw ml-1.042vw  mt-7 object-contain z-20 relative md:hidden "
          />
        </motion.div>
      </div>        

        {/* Left Content */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w-lg space-y-6 z-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
  <span className="whitespace-nowrap">Resolving Conflicts</span><br />
  Through Dialogue &
  Understanding
</h1>

          <button className="bg-[#d1a76e] text-black px-8 py-3 font-semibold text-sm uppercase rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
            Get Started
          </button>
          <p className="text-sm text-gray-700">
            We help individuals and organizations resolve disputes peacefully.<br />
            Explore affordable, confidential, and legally supported mediation solutions.
          </p>
        </motion.div>

        {/* Centered Statue with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <img
            src="/assets/images/lady-justice..png"
            alt="Lady Justice"
            className="h-28.646vw ml-1.042vw w-[400px]  object-contain z-20 relative hidden md:block "
          />
        </motion.div>



        {/* Right Content */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative flex items-center justify-between min-h-26.042vw z-0"
        >
          {/* "Our lawyers" text */}
          <p className="absolute top-13 right-[-2.604vw] text-s text-gray-900 px-4 py-10 rounded-bl-lg max-w-xs z-20 hidden md:block">
            Our mediators have decades of combined experience in conflict resolution.<br />
            Trusted in family, business, and civil disputes.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Herosection;
