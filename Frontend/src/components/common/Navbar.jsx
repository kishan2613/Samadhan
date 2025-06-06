import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, ChevronDown, Menu, X } from "lucide-react";
import NavigationText from "../../WebData/Navigation.json"

const navCache = {};

const Navbar = ({handleLangChange}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [Navigation, setNavigation] = useState(NavigationText);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    // If cached, use it
    if (navCache[preferredLanguage]) {
      setNavigation(navCache[preferredLanguage]);
      return;
    }

    // Otherwise fetch & translate
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/translate/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonObject: NavigationText,
              targetLang: preferredLanguage,
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

        const translated = translateJSON(NavigationText);
        navCache[preferredLanguage] = translated;
        setNavigation(translated);
      } catch (err) {
        console.error("Navbar translation error:", err);
      }
    })();
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        <Link to="/" className="text-2xl  font-bold text-black">
          SamaDhan
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium text-[#1C1C1C]">
          <li><Link to="/" className="hover:text-[#C1440E]">{Navigation.labels.home}</Link></li>
          <li><Link to="/Ask-Samadhan" className="hover:text-[#C1440E]">{Navigation.labels.askSamadhan}</Link></li>
          <li><Link to="/mediator-connect" className="hover:text-[#C1440E]">{Navigation.labels.mediatorConnect}</Link></li>
          <li><Link to="/educate" className="hover:text-[#C1440E]">{Navigation.labels.education}</Link></li>
          <li><Link to="/about" className="hover:text-[#C1440E]">{Navigation.labels.aboutUs}</Link></li>
        </ul>

        {/* Right Side */}
        <div className="flex items-center space-x-5 relative" ref={dropdownRef}>
          <img
            src="/assets/images/Bhashini.png"
            alt="Bhashini Logo"
            className="h-8 hidden md:block"
          />
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
              onClick={() => navigate("/login")}
            >
              {Navigation.labels.login}
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
                {Navigation.labels.chatRooms}
              </Link>

              {user.role === "mediator" ? (
                <Link
                  to="/active-proposal"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  {Navigation.labels.proposals}
                </Link>
              ) : (
                <Link
                  to="/samadhan-community"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  {Navigation.labels.communitySuggestions}
                </Link>
              )}

              <button
                onClick={handleLangChange}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                {Navigation.labels.ChangeLang}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                {Navigation.labels.logout}
              </button>
            </div>
          )}

          {/* Bhashini + Login + Hamburger for mobile */}
          <div className="flex items-center space-x-5 md:space-x-5">
           

            {/* Hamburger Menu for Mobile */}
            <button
              className="md:hidden focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 bg-[#f5f0eb] space-y-4 text-sm font-medium text-[#1C1C1C]">
          <Link to="/" onClick={toggleMobileMenu} className="block hover:text-[#C1440E]">{Navigation.labels.home}</Link>
          <Link to="/Ask-Samadhan" onClick={toggleMobileMenu} className="block hover:text-[#C1440E]">{Navigation.labels.askSamadhan}</Link>
          <Link to="/mediator-connect" onClick={toggleMobileMenu} className="block hover:text-[#C1440E]">{Navigation.labels.mediatorConnect}</Link>
          <Link to="/about" onClick={toggleMobileMenu} className="block hover:text-[#C1440E]">{Navigation.labels.aboutUs}</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;