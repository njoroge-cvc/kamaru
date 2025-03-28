import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUserShield } from "react-icons/fa"; // Icons for auth actions

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    alert("You have been logged out.");
    setMenuOpen(false); // Close menu after logout
    navigate("/login");
  };

  // Close menu when clicking outside or selecting an item
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="bg-[#8F3B1B] text-white py-4 shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-[#DBCA60]">
          Kamaru Challenge
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Navigation Links */}
        <ul
          ref={menuRef}
          className={`absolute md:static left-0 top-16 md:top-0 w-full md:w-auto bg-[#8F3B1B] md:bg-transparent flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-0 
            transition-transform duration-300 ease-in-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full md:translate-y-0 opacity-0 md:opacity-100"} md:flex`}
        >
          {[
            { path: "/", label: "Home" },
            { path: "/gallery", label: "Gallery" },
            { path: "/videos", label: "Videos" },
            { path: "/register/participant", label: "Participate" },
          ].map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className="block px-4 py-2 hover:text-[#DBCA60] transition-all"
                onClick={() => setMenuOpen(false)} // Close menu on click
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Admin Dashboard */}
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 hover:text-[#DBCA60] transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <FaUserShield className="text-lg" />
                Admin Dashboard
              </Link>
            </li>
          )}

          {/* Authentication Links */}
          {!token ? (
            <>
              <li>
                <Link
                  to="/register/user"
                  className="flex items-center gap-2 px-4 py-2 hover:text-[#DBCA60] transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUserPlus className="text-lg" />
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:text-[#DBCA60] transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaSignInAlt className="text-lg" />
                  Login
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[#D57500] hover:bg-[#DBCA60] text-white px-6 py-2 rounded-md w-full md:w-auto transition-all"
              >
                <FaSignOutAlt className="text-lg" />
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
