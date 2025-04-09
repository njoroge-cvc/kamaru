import React, { useState, useEffect } from "react";
import { registerParticipant } from "../api";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Spinner icon from lucide-react

const ParticipantsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "Poetry",
    "Folk Songs",
    "Original Songs",
    "Rendition",
    "Use of African Proverbs in Spoken Word",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to register as a participant.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    registerParticipant(formData)
      .then(() => {
        setFeedback({ type: "success", message: "🎉 Registration successful!" });
        setFormData({ name: "", email: "", phone: "", category: "" });
      })
      .catch((error) => {
        console.error("Error registering participant:", error);
        setFeedback({
          type: "error",
          message: error.response?.data?.error || "❌ Failed to register. Please try again.",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-2xl space-y-6 animate-fade-in"
    >
      <h2 className="text-2xl font-bold text-center text-[#D57500]">Register to Contend</h2>
      <p className="text-center text-sm text-gray-500">
        Fill in your details to participate in the upcoming festival.
      </p>

      {feedback && (
        <div
          className={`p-3 rounded-md text-sm text-center font-medium ${
            feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Name */}
      <div className="relative">
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder=" "
          required
          disabled={loading}
          className="peer w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60] placeholder-transparent"
        />
        <label
          htmlFor="name"
          className="absolute left-3 top-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#8F3B1B]"
        >
          Full Name
        </label>
      </div>

      {/* Email */}
      <div className="relative">
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder=" "
          required
          disabled={loading}
          className="peer w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60] placeholder-transparent"
        />
        <label
          htmlFor="email"
          className="absolute left-3 top-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#8F3B1B]"
        >
          Email Address
        </label>
      </div>

      {/* Phone */}
      <div className="relative">
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder=" "
          required
          disabled={loading}
          className="peer w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60] placeholder-transparent"
        />
        <label
          htmlFor="phone"
          className="absolute left-3 top-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#8F3B1B]"
        >
          Phone Number
        </label>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-[#333] mb-1">
          Select Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#DBCA60]"
        >
          <option value="" disabled>
            -- Choose --
          </option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="animate-spin w-5 h-5" />}
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
};

export default ParticipantsRegistrationForm;
