import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#8F3B1B] text-white text-center py-8 mt-10 relative">
      <div className="container mx-auto px-6">
        {/* Navigation Links */}
        <div className="mb-6 flex flex-wrap justify-center space-x-6">
          <Link to="/" className="hover:text-[#F4A261] transition-all">Home</Link>
          <Link to="/gallery" className="hover:text-[#F4A261] transition-all">Gallery</Link>
          <Link to="/videos" className="hover:text-[#F4A261] transition-all">Videos</Link>
          <Link to="/register/participant" className="hover:text-[#F4A261] transition-all">Participate</Link>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-6 mb-6 text-2xl">
          <a href="https://web.facebook.com/Kamaruchallenge" className="hover:text-[#F4A261] transition-all">
            <FaFacebook />
          </a>
          <a href="https://www.youtube.com/@KAMARUCHALLENGE-2024" className="hover:text-[#D57500] transition-all">
            <FaYoutube />
          </a>
          <a href="https://instagram.com" className="hover:text-[#F4A261] transition-all">
            <FaInstagram />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm opacity-80">
          © {new Date().getFullYear()} Kamaru Challenge - Ndeiya Edition. All Rights Reserved.
        </p>
      </div>

      {/* Back to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#D57500] text-white p-3 rounded-full shadow-md hover:bg-[#8F3B1B] transition-all duration-300 flex items-center justify-center w-12 h-12"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;
