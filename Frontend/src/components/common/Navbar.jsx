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
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-8 py-4 font-sans transition-all duration-300 ${
        isScrolled
          ? "bg-white/20 backdrop-blur-sm shadow-sm border-b border-white/10"
          : "bg-[#F9F6F2]"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black">Samadhan</Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium text-[#1C1C1C]">
          <li>
            <Link to="/" className="hover:text-[#C1440E]">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-[#C1440E]">About Us</Link>
          </li>
          <li>
            <Link to="/find-lawyer" className="hover:text-[#C1440E]">Find Lawyer</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-[#C1440E]">Contact Us</Link>
          </li>
        </ul>

        {/* Sign Up Button */}
        <button className="relative bg-black text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:scale-105 transition-transform">
          Login
          <span className="absolute top-[-8px] left-[-10px] w-full h-full bg-black rounded-full -z-10 blur-sm opacity-20" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
