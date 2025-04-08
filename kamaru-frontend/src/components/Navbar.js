import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserShield,
  FaUser,
  FaHandshake,
  FaImages,
  FaVideo,
  FaChevronDown,
  FaMoon,
  FaSun,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { fetchSystemImage } from "../api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  useEffect(() => {
    fetchSystemImage("logo")
      .then((response) => {
        if (response.data.image) {
          setLogo(response.data.image.image_url);
        }
      })
      .catch((error) => console.error("Error fetching logo:", error));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(null);
  };

  const handleDropdownToggle = (menu) => {
    setDropdownOpen((prev) => (prev === menu ? null : menu));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    closeMenu();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-[#333] dark:text-white text-[#333] py-4 shadow-md z-50 relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          {logo ? (
            <img src={logo} alt="Kamaru Challenge Logo" className="h-10 w-auto" />
          ) : (
            <span className="text-xl font-bold text-[#D57500]">Kamaru Challenge</span>
          )}
        </Link>

        {/* Mobile Menu Buttons */}
        <div className="md:hidden flex gap-4 items-center z-50">
          <button onClick={toggleDarkMode} className="text-2xl text-[#D57500] dark:text-white">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-2xl text-[#D57500] dark:text-white focus:outline-none"
          >
            {menuOpen ? <FaTimes className="transition-transform duration-300" /> : <FaBars className="transition-transform duration-300" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <ul
          ref={dropdownRef}
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex md:items-center md:gap-6 fixed md:static top-0 left-0 w-full md:w-auto bg-white dark:bg-[#333] shadow-md md:shadow-none flex-col md:flex-row transition-all duration-300 ease-in-out p-8 md:p-0 z-40 md:z-auto`}
        >
          <li>
            <Link to="/" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">
              Home
            </Link>
          </li>
          <li>
            <HashLink to="/#events" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]" smooth>
              Events
            </HashLink>
          </li>
          <li>
            <HashLink to="/#gallery" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]" smooth>
              Gallery
            </HashLink>
          </li>

          {[
            {
              label: "Participate",
              key: "participate",
              items: [
                { to: "/register/participant", icon: <FaUser />, text: "As a Contestant" },
                { to: "/register/partner", icon: <FaHandshake />, text: "As a Partner" },
              ],
            },
            {
              label: "Our Journey",
              key: "journey",
              items: [
                { to: "/#gallery", icon: <FaImages />, text: "Gallery" },
                { to: "/#videos", icon: <FaVideo />, text: "Videos" },
              ],
            },
          ].map((drop) => (
            <li key={drop.key} className="relative w-full md:w-auto">
              <button
                onClick={() => handleDropdownToggle(drop.key)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen === drop.key}
                aria-controls={`dropdown-${drop.key}`}
                className="flex items-center gap-2 py-2 text-lg hover:text-[#D57500] w-full md:w-auto"
              >
                {drop.label}
                <FaChevronDown className={`transition-transform ${dropdownOpen === drop.key ? "rotate-180" : ""}`} />
              </button>
              <ul
                id={`dropdown-${drop.key}`}
                className={`${
                  dropdownOpen === drop.key ? "block" : "hidden"
                } md:absolute md:top-full md:left-0 text-white bg-[#333] md:mt-2 py-2 md:w-48 z-50`}
              >
                {drop.items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      onClick={() => {
                        closeMenu();
                        setDropdownOpen(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:text-[#D57500] transition"
                    >
                      {item.icon} {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link to="/admin" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">
                <FaUserShield className="inline mr-1" />
                Admin Dashboard
              </Link>
            </li>
          )}

          {!token ? (
            <>
              <li>
                <Link to="/register/user" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">
                  <FaUserPlus className="inline mr-1" />
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">
                  <FaSignInAlt className="inline mr-1" />
                  Login
                </Link>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="bg-[#D57500] hover:bg-[#8F3B1B] text-white px-6 py-2 rounded-md transition-all w-full md:w-auto"
              >
                <FaSignOutAlt className="inline mr-1" />
                Logout
              </button>
            </li>
          )}

          <li className="hidden md:block">
            <button onClick={toggleDarkMode} className="text-xl text-[#D57500] dark:text-white">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
