import React, { useState, useEffect } from "react";
import { registerParticipant } from "../api";
import { useNavigate } from "react-router-dom";

/**
 * ParticipantsRegistrationForm component allows logged-in users to register themselves as participants.
 * Guests are redirected to the login page.
 */
const ParticipantsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to register as a participant.");
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    registerParticipant(formData)
      .then(() => {
        alert("Registration successful!");
        setFormData({ name: "", email: "", phone: "", category: "" }); // Reset form
      })
      .catch((error) => {
        console.error("Error registering participant:", error);
        alert("Failed to register. Please try again.");
      })
      .finally(() => setLoading(false)); // Stop loading
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Register as a Participant</h3>
      <input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
};

export default ParticipantsRegistrationForm;