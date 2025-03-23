import React, { useState } from "react";
import { registerParticipant } from "../api";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
    };

    registerParticipant(payload)
      .then(() => alert("Registration successful!"))
      .catch((error) => console.error("Error registering participant:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="phone" placeholder="Phone" onChange={handleChange} required />
      <input name="category" placeholder="Category" onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm;