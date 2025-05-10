import React from 'react';

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] px-[4vw] md:px-[6vw] pt-[8vh] relative overflow-hidden">
      
      {/* Lady Justice image - Hidden on small screens */}
      <img
        src="/assets/images/lady-justice..png"
        alt="Lady Justice"
        className="hidden md:block absolute top-[9vh] bottom-0 right-[-3vw] h-[55vh] object-contain z-10 pointer-events-none"
      />

      {/* Footer Container */}
      <footer className="bg-[#0f0f0f] text-white rounded-t-2xl py-[6vh] px-[4vw] relative overflow-hidden z-0">
        <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-4 gap-y-[4vh] md:gap-8 relative z-10">

          {/* Branding */}
          <div>
            <h2 className="text-[6vw] md:text-2xl font-bold mb-[2vh]">Samadhan</h2>
            <p className="text-[3.5vw] md:text-sm text-gray-300 leading-relaxed">
              Empowering communities and institutions with the tools and knowledge to resolve disputes effectively through mediation, as envisioned in the Mediation Act, 2023.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">SOLUTIONS</h4>
            <ul className="space-y-[1vh] text-[3.5vw] md:text-sm text-gray-300">
              <li><a href="/chatbot" className="hover:text-white hover:underline transition duration-200">Mediation Chatbot</a></li>
              <li><a href="/interactive-guides" className="hover:text-white hover:underline transition duration-200">Interactive Guides</a></li>
              <li><a href="/virtual-assistant" className="hover:text-white hover:underline transition duration-200">Virtual Assistant</a></li>
              <li><a href="/case-studies" className="hover:text-white hover:underline transition duration-200">Case Studies</a></li>
              <li><a href="/regional-guides" className="hover:text-white hover:underline transition duration-200">Regional Language Guides</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">RESOURCES</h4>
            <ul className="space-y-[1vh] text-[3.5vw] md:text-sm text-gray-300">
              <li><a href="/about-mediation" className="hover:text-white hover:underline transition duration-200">About Mediation</a></li>
              <li><a href="/misconceptions" className="hover:text-white hover:underline transition duration-200">Addressing Misconceptions</a></li>
              <li><a href="/connect-mediators" className="hover:text-white hover:underline transition duration-200">Connect with Mediators</a></li>
              <li><a href="/downloads" className="hover:text-white hover:underline transition duration-200">Downloadable Documents</a></li>
              <li><a href="/gamification" className="hover:text-white hover:underline transition duration-200">Gamification & Storytelling</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">CONTACT US</h4>
            <p className="text-[3.5vw] md:text-sm text-gray-300 leading-relaxed">
              Samadhan Initiative<br />
              New Delhi, India<br />
              Tel: (+91) 123-456-7890<br />
              Email: <a href="mailto:info@samadhan.in" className="underline hover:text-white transition duration-200">info@samadhan.in</a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[3vw] md:text-xs text-gray-400 mt-[4vh]">
          © {new Date().getFullYear()} Samadhan. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
