import React, { useState, useEffect } from "react";
import { registerParticipant } from "../api";
import { useNavigate } from "react-router-dom";

const ParticipantsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Poetry",
    "Folk Songs",
    "Original Songs",
    "Rendition",
    "Use of African Proverbs in Spoken Word",
  ];

  // Redirect guests to login page
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
    registerParticipant(formData)
      .then(() => {
        alert("Registration successful!");
        setFormData({ name: "", email: "", phone: "", category: "" });
      })
      .catch((error) => {
        console.error("Error registering participant:", error);
        alert(error.response?.data?.error || "Failed to register. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-[#8F3B1B]">Fill in your details</h2>

      <div>
        <label className="block text-sm font-medium text-[#8F3B1B]">Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8F3B1B]">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8F3B1B]">Phone Number</label>
        <input
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DBCA60]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8F3B1B]">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#DBCA60]"
        >
          <option value="" disabled>Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D57500] text-white font-semibold py-2 rounded-md hover:bg-[#DBCA60] transition duration-300"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
};

export default ParticipantsRegistrationForm;