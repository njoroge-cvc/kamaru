import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaCalendarAlt,
  FaBullseye,
  FaMicrophoneAlt,
  FaTrophy,
  FaCheckCircle,
  FaSmile,
} from "react-icons/fa";
import ParticipantsRegistrationForm from "../components/ParticipantsRegistrationForm";
import { fetchBanners } from "../api";
import "../index.css";

const ParticipantsRegistrationPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners()
      .then((res) => {
        if (res.data.banners.length > 0) {
          setBannerImage({
            main: res.data.banners[1].image_url,
            cta: res.data.banners[0].image_url,
          });
        }
      })
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

useEffect(() => {
  const eventDate = new Date("2025-08-16T00:00:00");
  const interval = setInterval(() => {
    const now = new Date();
    const distance = eventDate - now;

    if (distance < 0) {
      clearInterval(interval);
      setCountdown(null);
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / 1000 / 60) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const handleParticipateClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("You must be logged in to register!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    } else {
      setLoading(true);
      setTimeout(() => {
        setShowForm(true);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#333]">

      {/* Banner */}
      <div
        className="relative w-full h-[100px] md:h-[200px] lg:h-[300px] xl:h-[600px] bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImage?.main || "/default-banner.jpg"})` }}
      >
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <FaChevronDown className="text-white animate-bounce text-xl sm:text-2xl" />
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white px-4 py-2 text-sm shadow-sm">
        <nav className="flex space-x-2 text-gray-600">
          <Link to="/" className="hover:text-[#D57500]">Home</Link>
          <span>/</span>
          <span className="text-[#D57500] font-semibold">Participate</span>
        </nav>
      </div>

      {/* About */}
      <section className="py-8 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">About the Event</h2>
        <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
          The <strong>Kamaru Challenge – Ndeiya Edition</strong> is an annual musical competition offering a platform for the Ndeiya community to showcase their talent in Kikuyu language, promoting timeless values and joyful, positive living.
        </p>
      </section>

      {/* Objectives, Categories, Prizes */}
      <section className="bg-[#FFF7ED] py-10 px-4">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold text-[#D57500] flex items-center gap-2 mb-4">
              <FaBullseye className="text-[#333]" /> Objectives
            </h3>
            <p className="text-sm text-[#333] mb-4">The Performed Items Must:</p>
            <ul className="space-y-4 text-sm text-[#333]">
              {[
                "Praise, enhance, and promote moral values.",
                "Identify and call out moral vices in the community.",
                "Encourage joyful and positive living in the community.",
                "Be performed in Kikuyu language.",
              ].map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#D57500] mt-1" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#D57500] flex items-center gap-2 mb-4">
              <FaMicrophoneAlt className="text-[#333]" /> Competition Categories
            </h3>
            <ul className="text-sm text-[#333] space-y-2 pl-1">
              {["Poetry", "Folk Songs", "Original Songs", "Rendition"].map((cat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D57500] rounded-full"></span>
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#D57500] flex items-center gap-2 mb-4">
              <FaTrophy className="text-[#333]" /> Prizes
            </h3>
            <p className="text-sm text-[#333] leading-relaxed">
              Top performers win <strong className="text-[#D57500]">Ksh 50,000</strong>, with runners-up receiving <strong className="text-[#D57500]">Ksh 25,000</strong> and <strong className="text-[#D57500]">Ksh 15,000</strong>.
              <br />
              The best rendition gets <strong className="text-[#D57500]">Ksh 40,000</strong>, and runners-up receive <strong className="text-[#D57500]">Ksh 20,000</strong> and <strong className="text-[#D57500]">Ksh 10,000</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* NB Section */}
      <div className="py-8 px-4 text-center">
        <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
          <strong>NB:</strong> Entry categories that register less than 4 participants will be grouped together and the best
          performers determined irrespective of category.
        </p>
      </div>
      <div className="py-4 px-4 text-center">
        <p className="text-sm sm:text-base text-[#D57500] font-semibold max-w-xl mx-auto leading-relaxed">
          No song that previously won in any past Kamaru Challenge contest is allowed to win again when sung by the same participant.<br />
          However, if performed by a different individual or group, it may only qualify for <strong>2<sup>nd</sup></strong> or <strong>3<sup>rd</sup></strong> place.
        </p>
      </div>

      {/* Countdown */}
      <section className="bg-[#FFF7ED] py-8 px-4 text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 flex justify-center items-center gap-2">
          <FaCalendarAlt /> Event Date: August 16, 2025
        </h3>
        <p className="text-sm sm:text-base text-gray-700 mb-4">
          Mark your calendar and prepare your performance!
        </p>
        {countdown ? (
          <div className="flex justify-center gap-3 text-white font-medium text-sm sm:text-base">
            {Object.entries(countdown).map(([label, val]) => (
              <div key={label} className="bg-[#D57500] px-3 py-2 rounded-lg shadow">
                {val} {label}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-semibold text-[#D57500] flex justify-center items-center gap-2">
            <FaSmile /> The event has started!
          </p>
        )}
      </section>

      {/* CTA Registration */}
      <section
        className="py-8 px-4 text-center"
        style={{
          backgroundImage: `url(${bannerImage?.cta || "/default-banner.jpg"})`,
          backgroundColor: "white",
        }}
      >
        {!showForm ? (
          <button
            onClick={handleParticipateClick}
            disabled={loading}
            className="bg-[#D57500] hover:bg-[#333] text-white px-6 py-3 rounded-md font-semibold shadow-md transition-all"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Click to Register"
            )}
          </button>
        ) : (
          <div className="mt-6 max-w-md mx-auto">
            <ParticipantsRegistrationForm />
          </div>
        )}
      </section>
    </div>
  );
};

export default ParticipantsRegistrationPage;
