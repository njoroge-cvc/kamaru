import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from local storage
    alert("You have been logged out.");
    navigate("/login"); // Redirect to the login page
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
        <li><Link to="/videos">Videos</Link></li>
        <li><Link to="/register/participant">Register</Link></li>
        <li><Link to="/admin">Admin</Link></li>
      </ul>
      <ul>
        <li><Link to="/register/user">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/admin">Admin Dashboard</Link></li>
        <li><button onClick={handleLogout} style={{ cursor: "pointer", background: "none", border: "none", color: "blue", textDecoration: "underline" }}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;