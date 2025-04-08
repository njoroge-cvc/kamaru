import React, { useState, useEffect } from "react";
import ParticipantsRegistrationForm from "../components/ParticipantsRegistrationForm";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchBanners } from "../api"; // Import the fetchBanners API function

const ParticipantsRegistrationPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null); // State to store the banner image
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch banners and set the first banner as the page banner
    fetchBanners()
      .then((response) => {
        if (response.data.banners.length > 0) {
          setBannerImage(response.data.banners[0].image_url); // Use the first banner
        }
      })
      .catch((error) => console.error("Error fetching banners:", error));
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
      }, 1000); // Smooth transition effect
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Section */}
      <div
        className="relative w-full h-80 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bannerImage || "/path/to/default-banner.jpg"})`, // Use the fetched banner or a default image
        }}
      >
        <div className="absolute inset-0  flex items-center justify-center">
        <div className="absolute bottom-6 flex justify-center w-full">
  <div className="animate-bounce">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-[#333]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="bg-white py-3 px-6 shadow-sm">
        <ul className="flex space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-[#D57500]">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/register/participant" className="text-[#8F3B1B] font-semibold">
              Participate
            </Link>
          </li>
        </ul>
      </nav>

      {/* How to Participate Section */}
      <section className="p-8 bg-white">
        <h2 className="text-3xl font-bold text-[#8F3B1B] text-center mb-6">
          How to Participate
        </h2>
        <p className="text-gray-700 text-center mb-6 max-w-3xl mx-auto">
          Be part of the <strong>Kamaru Challenge – Ndeiya Edition</strong>. 
          Showcase your talent creatively using the Kikuyu language and promote timeless values. 
          Follow the steps below to register and participate.
        </p>
        <hr className="border-t border-gray-300 w-1/4 mx-auto mb-6" />
      </section>

      {/* Eligibility, Judging Criteria, and Prizes Section */}
      <section className="p-8 bg-[#FFF7ED]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b border-gray-300 py-6">
          {/* Eligibility */}
          <div className="text-center md:border-r md:border-gray-300 px-6">
            <h3 className="text-xl font-bold text-[#8F3B1B] mb-4">Eligibility</h3>
            <p className="text-gray-700">
              Open to all ages. Participants must creatively use the Kikuyu language in their performances.
            </p>
          </div>

          {/* Judging Criteria */}
          <div className="text-center md:border-r md:border-gray-300 px-6">
            <h3 className="text-xl font-bold text-[#8F3B1B] mb-4">Judging Criteria</h3>
            <p className="text-gray-700">
              Performances will be judged based on creativity, adherence to moral values, and audience engagement.
            </p>
          </div>

          {/* Prizes */}
          <div className="text-center px-6">
            <h3 className="text-xl font-bold text-[#8F3B1B] mb-4">Prizes</h3>
            <p className="text-gray-700">
              Winners will receive cash prizes: <br />
              🏆 <strong>Ksh 50,000</strong> for best performers <br />
              🥈 <strong>Ksh 25,000</strong> for first runners-up <br />
              🥉 <strong>Ksh 15,000</strong> for second runners-up
            </p>
          </div>
        </div>
      </section>

      {/* Participate Button */}
      <section className="p-8 text-center">
        {!showForm ? (
          <button
            onClick={handleParticipateClick}
            className="bg-[#D57500] text-white px-8 py-3 rounded-md shadow-md hover:bg-[#8F3B1B] transition duration-300 flex items-center justify-center mx-auto"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2 h-5 w-5 border-t-2 border-white rounded-full"></span>
            ) : (
              "Register to Participate"
            )}
          </button>
        ) : (
          <div className="mt-6">
            <ParticipantsRegistrationForm />
          </div>
        )}
      </section>
    </div>
  );
};

export default ParticipantsRegistrationPage;