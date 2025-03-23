import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true"; // Check admin status

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin"); // Remove admin status
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
        <li><Link to="/videos">Videos</Link></li>
        <li><Link to="/register/participant">Participation</Link></li>
        {isAdmin && <li><Link to="/admin">Admin Dashboard</Link></li>} {/* Admin-only link */}
      </ul>
      <ul>
        {!token ? (
          <>
            <li><Link to="/register/user">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        ) : (
          <li>
            <button
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                background: "none",
                border: "none",
                color: "blue",
                textDecoration: "underline",
              }}
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;