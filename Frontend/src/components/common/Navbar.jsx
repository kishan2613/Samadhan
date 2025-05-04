import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, ChevronDown } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div
        className={`absolute inset-0 -z-10 transition-all duration-300 ${
          isScrolled
            ? "bg-gradient-to-r from-[#f5f0eb] to-[#d6c6b8] backdrop-blur-sm shadow-md border-b border-white/20"
            : "bg-gradient-to-r from-[#f5f0eb] to-[#d6c6b8]"
        }`}
      />
      <div className="relative px-6 md:px-8 py-4 flex items-center justify-between font-sans">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black">Samadhan</Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium text-[#1C1C1C]">
          <li><Link to="/" className="hover:text-[#C1440E]">Home</Link></li>
          <li><Link to="/Ask-Samadhan" className="hover:text-[#C1440E]">Ask Samadhan</Link></li>
          <li><Link to="/mediator-connect" className="hover:text-[#C1440E]">Mediator Connect</Link></li>
          <li><Link to="/about" className="hover:text-[#C1440E]">About Us</Link></li>
        </ul>

        {/* Right Side */}
        <div className="flex items-center space-x-5 relative" ref={dropdownRef}>
          {/* Notification Icon */}
          <Link to="/notify" className="text-black hover:text-[#C1440E]">
            <Bell size={22} className="hover:scale-110 transition-transform duration-200" />
          </Link>

          {/* Auth Section */}
          {token && user ? (
            <div
              className="flex items-center bg-black text-white px-4 py-2 rounded-full shadow-md cursor-pointer space-x-2 relative"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.image ? (
                <img src={user.image} alt="User" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User size={20} />
              )}
              <span className="text-sm font-medium">{user.name}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>
          ) : (
            <button
              className="relative bg-black text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:scale-105 transition-transform"
              onClick={() => navigate("/SignUp")}
            >
              Login
              <span className="absolute top-[-8px] left-[-10px] w-full h-full bg-black rounded-full -z-10 blur-sm opacity-20" />
            </button>
          )}

          {/* Dropdown */}
          {dropdownOpen && token && user && (
            <div className="absolute right-0 top-14 bg-white shadow-lg rounded-lg overflow-hidden w-48 text-sm font-medium text-gray-800 z-50">
              <Link
                to="/Chat"
                className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                Chat Rooms
              </Link>

              {user.role === "mediator" ? (
                <Link
                  to="/active-proposal"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Proposals
                </Link>
              ) : (
                <Link
                  to="/look-suggest"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Suggestions
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
