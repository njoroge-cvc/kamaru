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
  const eventDate = new Date("2026-08-15T00:00:00"); // Set to August 15, 2026 (the day of the event)
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

      {/* Objectives, Categories, Awards */}
      <section className="bg-[#FFF7ED] py-10 px-4">
        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
    
          {/* Objectives */}
          <div className="max-w-lg mx-auto text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-4">
              <FaBullseye className="text-[#333] text-6xl" />
            </div>

            <h3 className="text-xl font-bold text-[#D57500] mb-4">
              Objectives
            </h3>

            <p className="text-sm text-[#333] mb-4">
              The Performed Items Must:
            </p>

            <ul className="space-y-4 text-sm text-[#333]">
              {[
                "Praise, enhance, and promote moral values.",
                "Identify and call out moral vices in the community.",
                "Encourage joyful and positive living in the community.",
                "Be performed in Kikuyu language.",
              ].map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-4">
              <FaMicrophoneAlt className="text-[#333] text-5xl" />
            </div>

            <h3 className="text-xl font-bold text-[#D57500] mb-4">
              Competition Categories
            </h3>

            <ul className="text-sm text-[#333] space-y-2">
              {[
                "Poetry",
                "Folk Songs and Dances",
                "Original Songs",
              ].map((cat, i) => (
                <li key={i}>{cat}</li>
              ))}
            </ul>
          </div>

          {/* Awards */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-3">
              <FaTrophy className="text-[#333] text-5xl" />
            </div>

            <h3 className="text-xl font-bold text-[#D57500] mb-4">
              Awards
            </h3>

            <p className="text-sm text-[#333] leading-relaxed">
              Winners in each Category will receive{" "}
              <strong className="text-[#D57500]">
                Ksh 50,000
              </strong>
              , with first runners-up and second runners-up receiving{" "}
              <strong className="text-[#D57500]">
                Ksh 25,000
              </strong>{" "}
              and{" "}
              <strong className="text-[#D57500]">
                Ksh 15,000
              </strong>{" "}
              respectively.
            </p>
          </div>
        </div>
      </section>

      {/* NB Section */}
      <div className="py-8 px-4 text-center">
        <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
          <strong>NB:</strong> 
          <br />
          Entry categories that register less than 4 participants will be grouped together and the best
          performers determined irrespective of category.
          <br />
          <br />
          No item (song/poem/folk song & dance) that previously won in any past Kamaru Challenge contest is allowed to win again when done by the same participant(s).
        </p>
      </div>

      {/* Countdown */}
      <section className="bg-[#FFF7ED] py-8 px-4 text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 flex justify-center items-center gap-2">
          <FaCalendarAlt /> Event Date: August 15, 2026
        </h3>
        <p className="text-sm sm:text-base text-gray-700 mb-4">
          Mark your calendar and prepare your performance!
        </p>
        {/* Countdown will only show if the event date is in the future - 
        once the event date has passed, it will show a message instead*/}
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
            <FaSmile /> Today is the Big Day! Have fun!
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
