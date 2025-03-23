import React, { useState } from "react";
import { registerUser } from "../api";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "", // Changed from "name" to "username"
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData); // Debugging
    registerUser(formData)
      .then(() => alert("Registration successful!"))
      .catch((error) => console.error("Error registering user:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username" // Changed from "name" to "username"
        placeholder="Username"
        value={formData.username}
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
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;