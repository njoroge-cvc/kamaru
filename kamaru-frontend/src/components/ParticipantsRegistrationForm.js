import React, { useState, useEffect } from "react";
import { registerParticipant, fetchActiveSeason } from "../api";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import FloatingLabelInput from "./FloatingLabelInput";

const ParticipantsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [activeSeason, setActiveSeason] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Poetry",
    "Folk Songs and Dances",
    "Original Songs",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to register as a participant.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchActiveSeason()
      .then((response) => {
        setActiveSeason(response.data);
      })
      .catch((error) => {
        console.error("Error fetching active season:", error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
    setDropdownOpen(false);
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
    <div className="flex justify-center items-center min-h-full bg-fixed bg-cover bg-center relative z-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-6 bg-white shadow-2xl rounded-2xl space-y-6 animate-fade-in w-full"
      >
        <h2 className="text-2xl font-bold text-center text-[#D57500]">Register to Compete</h2>
        <p className="text-center text-sm text-gray-500">
         Enter your details to compete in {activeSeason?.name || "Kamaru Challenge"}.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-md text-sm text-center font-medium ${
              feedback.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <FloatingLabelInput
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          label="Full Name"
          required
        />

        <FloatingLabelInput
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          label="Email Address"
          required
        />

        <FloatingLabelInput
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          label="Phone Number"
          required
        />

        {/* Custom Dropdown for Category */}
        <div className="relative z-50">
          <label htmlFor="category" className="block text-sm font-medium text-[#333] mb-1">
            Select Category
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#D57500]"
          >
            {formData.category || "-- Choose --"}
            {dropdownOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {dropdownOpen && (
            <ul className="absolute w-full bg-white border rounded-md shadow-md mt-1 z-50">
              {categories.map((cat, idx) => (
                <li
                  key={idx}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-3 py-2 hover:bg-[#333] hover:text-white cursor-pointer items-start transition"
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:bg-[#333] disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default ParticipantsRegistrationForm;
