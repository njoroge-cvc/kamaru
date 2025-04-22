import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaYoutube, FaInstagram, FaArrowUp } from "react-icons/fa";
import NewsletterForm from "./NewsletterSubscriptionForm"; // Import the NewsletterForm component
import { fetchSystemImage } from "../api"; // Import the fetchSystemImage API function

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [logo, setLogo] = useState(null); // State to store the logo URL

  useEffect(() => {
    // Fetch the logo from the system images
    fetchSystemImage("logo")
      .then((response) => {
        if (response.data.image) {
          setLogo(response.data.image.image_url); // Set the logo URL
        }
      })
      .catch((error) => console.error("Error fetching logo:", error));
  }, []);

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
    <footer className="bg-[#333] text-white py-8 mt-10 relative">
      <div className="container mx-auto px-6">
        {/* Main Footer Section */}
        <div className="md:flex justify-between items-start mb-8">
          {/* Logo Section */}
          <div className="md:w-1/3 text-center md:text-center mb-6 md:mb-0">
            {logo ? (
              <img
                src={logo}
                alt="Kamaru Challenge Logo"
                className="h-16 sm:h-20 md:h-24 lg:h-32 w-auto max-w-[80%] mx-auto"
              />
            ) : (
              <p className="text-lg font-bold">Kamaru Challenge</p>
            )}
            <p className="text-sm text-gray-200 mt-4">
              Fanning the Flame of Values through Music & Culture.
            </p>
          </div>

          {/* Newsletter Subscription Section */}
          <div className="md:w-1/3 text-center mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-[#F4A261] mb-4">Stay Connected</h2>
            <p className="text-sm text-gray-200 mb-4">
              Never miss an update! Get the latest news, events, and insider tips delivered straight to your inbox.
            </p>
            <NewsletterForm />
          </div>

          {/* Quick Links and Social Media Section */}
          <div className="md:w-1/3 text-center">
            <h2 className="text-2xl font-bold text-[#F4A261] mb-4">Follow Us</h2>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#F4A261] mb-4">Quick Links</h3>
              <div className="flex flex-col items-center space-y-2">
                <Link to="/" className="hover:text-[#F4A261] transition-all">Home</Link>
                <Link to="/gallery" className="hover:text-[#F4A261] transition-all">Gallery</Link>
                <Link to="/videos" className="hover:text-[#F4A261] transition-all">Videos</Link>
                <Link to="/register/participant" className="hover:text-[#F4A261] transition-all">Participate</Link>
              </div>
            </div>
            <div className="flex justify-center space-x-4 text-2xl">
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
          </div>
        </div>

        {/* Copyright and Terms Section */}
        <div className="border-t border-white-600 pt-4 text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Kamaru Challenge - Ndeiya Edition. All Rights Reserved.
          </p>
          <p className="text-sm opacity-80 mt-2">
            <Link to="/terms" className="hover:text-[#F4A261] transition-all">Terms & Conditions</Link>
          </p>
        </div>
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
