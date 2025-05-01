import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-beige via-white to-beige shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">Samadhan</Link>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg">
          <li><Link to="/" className="hover:text-orange-600 transition">Home</Link></li>
          <li><Link to="/about" className="hover:text-orange-600 transition">About Us</Link></li>
          <li><Link to="/login" className="hover:text-orange-600 transition">Login</Link></li>
          <li><Link to="/signup" className="hover:text-orange-600 transition">Sin Up</Link></li>
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pb-4">
          <ul className="space-y-4 text-lg">
            <li><Link to="/" className="block text-gray-700 hover:text-orange-600">Home</Link></li>
            <li><Link to="/about" className="block text-gray-700 hover:text-orange-600">About Us</Link></li>
            <li><Link to="/login" className="block text-gray-700 hover:text-orange-600">Login</Link></li>
            <li><Link to="/signup" className="block text-gray-700 hover:text-orange-600">Sign Up</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
