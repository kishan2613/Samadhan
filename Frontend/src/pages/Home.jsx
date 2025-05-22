import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import content from "../WebData/Home.json";
import businessIcon from "/assets/images/business.png"; 
import criminalIcon from "/assets/images/criminal.png";
import familyIcon from "/assets/images/business.png";
import LanguageSelector from "../pages/AskLang/view";
import CaseStats from "./Graph";

const homeCache = {};

const Home = () => {

  //Language selector
   const [languageSet, setLanguageSet] = useState(false);
   const [showLangModal, setShowLangModal] = useState(false);
   console.log(languageSet)
  
    useEffect(() => {
    const stored = localStorage.getItem('preferredLanguage');
    if (stored) {
      setLanguageSet(true);
    } else {
      setShowLangModal(true);
    }
  }, []);

  const handleLanguageSelected = () => {
    setLanguageSet(true);
    setShowLangModal(false);
  };


  const location = useLocation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const icon = [businessIcon,criminalIcon,familyIcon]

  const [translatedContent, setTranslatedContent] = useState(content);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    // if we already did this language, pull from cache
    if (homeCache[lang]) {
      setTranslatedContent(homeCache[lang]);
      return;
    }

    // otherwise translate once
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/translate/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonObject: content,
              targetLang: lang,
            }),
          }
        );
        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => {
          map[source] = target;
        });
        const translateJSON = (obj) => {
          if (typeof obj === "string") return map[obj] || obj;
          if (Array.isArray(obj)) return obj.map(translateJSON);
          if (obj && typeof obj === "object") {
            return Object.fromEntries(
              Object.entries(obj).map(([k, v]) => [k, translateJSON(v)])
            );
          }
          return obj;
        };
        const translated = translateJSON(content);
        homeCache[lang] = translated;
        setTranslatedContent(translated);
      } catch (err) {
        console.error("Home translation error:", err);
      }
    })();
  }, []);


  const { hero, quote, laws, learning } = translatedContent;

  return (
    <div>
       {/* ✅ Language Selector Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center">
          <div >
            <LanguageSelector onLanguageSelected={handleLanguageSelected} />
          </div>
        </div>
      )}
      {/* Hero Section */}
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

          {/* Left Animated Text */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-lg space-y-6 z-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
              <span className="whitespace-nowrap">{hero.heading[0]}</span>
              <br />
              {hero.heading[1]}
            </h1>
            <button className="bg-[#d1a76e] text-black px-8 py-3 font-semibold text-sm uppercase rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
              {hero.button}
            </button>
            <p className="text-sm text-gray-700">{hero.paragraph}</p>
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
            {hero.subheading}
          </p>
        </motion.div>
      </section>
    </div>

      {/* Quote & Laws */}
       <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] py-16 px-4 md:px-20 text-center">
      <div className="rounded-[20px] p-[10px] bg-white">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-12">
            {quote.text}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {laws.map((law, index) => (
               <div
            key={index}
            className="flex flex-col items-center text-center space-y-4"
          >
                <img
                  src={icon[index]}
                  alt={law.title}
                  className="w-16 h-18"
                />
                <h3 className="font-bold font-serif text-lg">{law.title}</h3>
                <p className="text-gray-600 max-w-xs">{law.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
        <CaseStats/>
      {/* Learning Section */}
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

          <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4 font-serif">
              {learning.heading}
            </h2>
             <p className="text-gray-700 mb-6 text-sm md:text-base">
              {learning.paragraph}
            </p>
             <button className="bg-[#d1a76e] text-black px-10 py-3 font-semibold text-sm uppercase rounded-full shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300">
              {learning.button}
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
