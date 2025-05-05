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
import { fetchSystemImage } from "../api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [logo, setLogo] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  useEffect(() => {
    fetchSystemImage("logo")
      .then((res) => {
        if (res.data?.image?.image_url) setLogo(res.data.image.image_url);
      })
      .catch((err) => console.error("Logo fetch failed", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    navigate("/");
    setMenuOpen(false);
  };

  const handleDropdownToggle = (key) =>
    setDropdownOpen(dropdownOpen === key ? null : key);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const navItems = [
    {
      label: "Participate",
      key: "participate",
      items: [
        { to: "/register/participant", text: "To Contest", hash: false },
        { to: "/register/partner", text: "To Partner", hash: false },
      ],
    },
    {
      label: "Our Journey",
      key: "journey",
      items: [
        { to: "/#gallery", text: "Gallery", hash: true },
        { to: "/#videos", text: "Videos", hash: true },
      ],
    },
  ];

  return (
    <header className="bg-[#333] text-white z-50 w-full">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10 w-auto sm:h-12" />
            ) : (
              <span className="text-lg font-semibold">Kamaru Challenge</span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="-m-2.5 p-2.5 text-white"
          >
            <FaBars className="h-6 w-6" />
          </button>
        </div>

        {/* Center Navigation */}
        <div className="hidden lg:flex lg:gap-x-10">
          <ul className="flex gap-6">
            <li>
              <Link to="/" className="text-sm font-semibold hover:text-[#D57500]">
                Home
              </Link>
            </li>
            <li>
              <HashLink
                to="/#events"
                smooth
                className="text-sm font-semibold hover:text-[#D57500]"
              >
                Events
              </HashLink>
            </li>
          </ul>
          {navItems.map((nav) => (
            <div key={nav.key} className="relative" ref={dropdownRef}>
              <button
                onClick={() => handleDropdownToggle(nav.key)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                {nav.label}
                <FaChevronDown
                  className={`transition-transform ${
                    dropdownOpen === nav.key ? "rotate-180" : ""
                  }`}
                />
              </button>
              {dropdownOpen === nav.key && (
                <div className="absolute left-0 mt-2 w-48 bg-[#333] rounded shadow-lg py-2 z-50">
                  {nav.items.map((item, idx) => {
                    const ItemComponent = item.hash ? HashLink : Link;
                    return (
                      <ItemComponent
                        key={idx}
                        to={item.to}
                        smooth={item.hash}
                        onClick={() => {
                          setMenuOpen(false);
                          setDropdownOpen(null);
                        }}
                        className="block px-4 py-2 text-sm hover:text-[#D57500]"
                      >
                        {item.text} <FaAngleDoubleRight className="inline ml-2" />
                      </ItemComponent>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-semibold hover:text-[#D57500]"
            >
              Admin
            </Link>
          )}
          {!token ? (
            <>
              <Link
                to="/register/user"
                className="text-sm font-semibold hover:text-[#D57500]"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold hover:text-[#D57500]"
              >
                Login
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold bg-[#D57500] px-4 py-2 rounded hover:bg-white hover:text-[#333] transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-[#333] text-white p-6">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" onClick={() => setMenuOpen(false)}>
                {logo ? (
                  <img src={logo} alt="Logo" className="h-10 w-auto" />
                ) : (
                  <span className="text-lg font-semibold">Kamaru Challenge</span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(false)}>
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-lg hover:text-[#D57500]"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <HashLink
                    to="/#events"
                    smooth
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-lg hover:text-[#D57500]"
                  >
                    Events
                  </HashLink>
                </li>
              </ul>
              {navItems.map((nav) => (
                <div key={nav.key}>
                  <div
                    onClick={() => handleDropdownToggle(nav.key)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{nav.label}</span>
                    <FaChevronDown
                      className={`transition-transform ${
                        dropdownOpen === nav.key ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {dropdownOpen === nav.key && (
                    <div className="pl-4 mt-2 space-y-1">
                      {nav.items.map((item, idx) => {
                        const ItemComponent = item.hash ? HashLink : Link;
                        return (
                          <ItemComponent
                            key={idx}
                            to={item.to}
                            smooth={item.hash}
                            onClick={() => setMenuOpen(false)}
                            className="block text-sm hover:text-[#D57500]"
                          >
                            {item.text}
                          </ItemComponent>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {!token ? (
                <>
                  <Link
                    to="/register/user"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-lg hover:text-[#D57500]"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-lg hover:text-[#D57500]"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full text-left"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;