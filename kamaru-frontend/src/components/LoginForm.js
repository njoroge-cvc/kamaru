import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(credentials)
      .then((response) => {
        const { token, is_admin } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("is_admin", is_admin); // Store admin status
        alert("Login successful!");
  
        // Redirect based on user role
        if (is_admin) {
          navigate("/admin");
        } else {
          navigate("/"); // Redirect regular users to the home page
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Login failed. Please check your credentials.");
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        placeholder="Email"
        value={credentials.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;