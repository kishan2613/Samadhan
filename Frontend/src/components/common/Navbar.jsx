import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Background Gradient Layer */}
      <div
        className={`absolute inset-0 -z-10 transition-all duration-300 ${
          isScrolled
            ? "bg-gradient-to-r from-[#f5f0eb] to-[#d6c6b8] backdrop-blur-sm shadow-md border-b border-white/20"
            : "bg-gradient-to-r from-[#f5f0eb] to-[#d6c6b8]"
        }`}
      />

      {/* Navbar Content */}
      <div className="relative px-6 md:px-8 py-4 flex items-center justify-between font-sans">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black">
          Samadhan
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium text-[#1C1C1C]">
          <li><Link to="/" className="hover:text-[#C1440E]">Home</Link></li>
          <li><Link to="/Ask-Samadhan" className="hover:text-[#C1440E]">Ask Samadhan</Link></li>
          <li><Link to="/mediator-connect" className="hover:text-[#C1440E]">Mediator Connect</Link></li>
          <li><Link to="/about" className="hover:text-[#C1440E]">About Us</Link></li>
        </ul>

       {/* Bhashini Logo + Login */}
<div className="flex items-center space-x-5">
  {/* Bhashini Logo */}
  <img
    src="/assets/images/Bhashini.png" // <-- Update path as needed
    alt="Bhashini"
    className="h-8 w-auto object-contain"
  />
  
  {/* Login Button */}
  <button className="relative bg-black text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:scale-105 transition-transform">
    Login
    <span className="absolute top-[-8px] left-[-10px] w-full h-full bg-black rounded-full -z-10 blur-sm opacity-20" />
  </button>
</div>

      </div>
    </nav>
  );
};

export default Navbar;
