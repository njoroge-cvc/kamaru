import React, { useState } from "react";
import { loginUser } from "../api";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(credentials)
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem("token", token); // Save token for authenticated requests
        alert("Login successful!");
      })
      .catch((error) => console.error("Error logging in:", error));
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