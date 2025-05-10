import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const Learning = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] py-10 px-6 md:px-20"
    >
      <motion.div
        className="flex flex-col md:flex-row items-center gap-10 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Left Side Image */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-1/2"
        >
          <img
            src="/assets/images/Learning.png"
            alt="Learning Mediation"
            className="rounded-2xl w-full  h-auto object-cover"
          />
        </motion.div>

        {/* Right Side Content */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4 font-serif">
            Begin Your Journey in Mediation
          </h2>
          <p className="text-gray-700 mb-6 text-sm md:text-base">
            Learn how to mediate conflicts and create meaningful resolutions. Our self-paced modules are perfect for beginners and professionals alike.
          </p>
          <button className="bg-[#d1a76e] text-black px-10 py-3 font-semibold text-sm uppercase rounded-full shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300">
            Start Learning
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Learning;
