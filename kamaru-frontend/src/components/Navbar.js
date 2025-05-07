import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
  FaAngleDoubleRight,
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { fetchSystemImage } from "../api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // for desktop
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null); // for mobile
  const [logo, setLogo] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  useEffect(() => {
    fetchSystemImage("logo")
      .then((response) => {
        if (response.data.image) {
          setLogo(response.data.image.image_url);
        }
      })
      .catch((error) => console.error("Error fetching logo:", error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setTimeout(() => {
      setMenuOpen(false);
      setDropdownOpen(null);
      setMobileDropdownOpen(null);
    }, 300);
  };

  const handleDropdownToggle = (menu) => {
    setDropdownOpen((prev) => (prev === menu ? null : menu));
  };

  const handleMobileDropdownToggle = (menu) => {
    setMobileDropdownOpen((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    closeMenu();
    navigate("/");
  };

  const dropdowns = [
    {
      label: "Participate",
      key: "participate",
      items: [
        { to: "/register/participant", text: "To Contest", icon: <FaAngleDoubleRight className="text-sm" /> },
        { to: "/register/partner", text: "To Partner", icon: <FaAngleDoubleRight className="text-sm" /> },
      ],
    },
    {
      label: "Our Journey",
      key: "journey",
      items: [
        { to: "/#gallery", text: "Gallery", icon: <FaAngleDoubleRight className="text-sm" />, hash: true },
        { to: "/#videos", text: "Videos", icon: <FaAngleDoubleRight className="text-sm" />, hash: true },
      ],
    },
  ];

  return (
    <nav className="bg-[#333] text-white py-4 shadow-md z-50 relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            {logo ? (
              <img src={logo} alt="Kamaru Challenge Logo" className="h-12 lg:h-16 w-auto" />
            ) : (
              <span className="text-xl font-bold text-white">Kamaru Challenge</span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-2xl text-white"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6" ref={dropdownRef}>
          <Link to="/" className="text-lg hover:text-[#D57500]">Home</Link>
          <HashLink smooth to="/#events" className="text-lg hover:text-[#D57500]">Events</HashLink>

          {dropdowns.map((drop) => (
            <div key={drop.key} className="relative">
              <button
                onClick={() => handleDropdownToggle(drop.key)}
                className="flex items-center gap-2 text-lg hover:text-[#D57500]"
              >
                {drop.label}
                <FaChevronDown className={`transition-transform ${dropdownOpen === drop.key ? "rotate-180" : ""}`} />
              </button>
              <ul
                className={`absolute top-full left-0 bg-[#333] mt-2 py-2 w-64 rounded-md shadow-lg z-50 ${
                  dropdownOpen === drop.key ? "block" : "hidden"
                }`}
              >
                {drop.items.map((item, idx) => (
                  <li key={idx} className="flex items-center px-4 py-2 hover:text-[#D57500]">
                    {item.hash ? (
                      <HashLink smooth to={item.to} onClick={closeMenu} className="mr-2">
                        {item.text}
                      </HashLink>
                    ) : (
                      <Link to={item.to} onClick={closeMenu} className="mr-2">
                        {item.text}
                      </Link>
                    )}
                    {item.icon}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {isAdmin && (
            <Link to="/admin" className="text-lg hover:text-[#D57500]">Admin</Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-4">
          {!token ? (
            <>
              <Link to="/register/user" className="text-lg px-3 py-1 rounded-2xl border-2 border-white hover:text-[#333] hover:border-transparent hover:bg-[#D57500] flex items-center gap-2">
                <span>Register</span>
                <FiUserPlus />
              </Link>
              <Link to="/login" className="text-lg px-3 py-1 rounded-2xl border-2 border-white hover:text-[#333] hover:border-transparent hover:bg-[#D57500] flex items-center gap-2">
                <span>Login</span>
                <FiLogIn />
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-[#D57500] hover:bg-[#444] text-white px-4 py-2 rounded-md"
            >
              <FaSignOutAlt className="inline mr-1" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#333] px-4 pb-4">
          <Link to="/" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">Home</Link>
          <HashLink smooth to="/#events" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">Events</HashLink>

          {dropdowns.map((drop) => (
            <div key={drop.key}>
              <button
                onClick={() => handleMobileDropdownToggle(drop.key)}
                className="flex items-center gap-2 py-2 text-lg hover:text-[#D57500]"
              >
                {drop.label}
                <FaChevronDown className={`transition-transform ${mobileDropdownOpen === drop.key ? "rotate-180" : ""}`} />
              </button>
              {mobileDropdownOpen === drop.key && (
                <ul className="pl-4">
                  {drop.items.map((item, idx) => (
                    <li key={idx} className="flex items-center py-1 hover:text-[#D57500]">
                      {item.icon}
                      {item.hash ? (
                        <HashLink
                          smooth
                          to={item.to}
                          onClick={closeMenu}
                          className="ml-2"
                        >
                          {item.text}
                        </HashLink>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={closeMenu}
                          className="ml-2"
                        >
                          {item.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {isAdmin && (
            <Link to="/admin" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">
              Admin
            </Link>
          )}

          <hr className="border-t border-gray-500 my-2" />

          {!token ? (
            <>
              <Link to="/register/user" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">Register</Link>
              <Link to="/login" onClick={closeMenu} className="block py-2 text-lg hover:text-[#D57500]">Login</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full text-left bg-[#D57500] hover:bg-[#444] text-white px-4 py-2 mt-2 rounded-md"
            >
              <FaSignOutAlt className="inline mr-1" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
