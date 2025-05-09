import React, { useState } from "react";
import { FaBars, FaInbox, FaUsers, FaCalendarAlt, FaVideo } from "react-icons/fa";
import { MdGroupAdd } from "react-icons/md";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { label: "Dashboard", icon: <FaCalendarAlt />, path: "/admin/dashboard" },
    { label: "Participants", icon: <MdGroupAdd />, path: "/admin/participants" },
    { label: "Users", icon: <FaUsers />, path: "/admin/users" },
    { label: "Videos", icon: <FaVideo />, path: "/admin/videos" },
    { label: "Inbox", icon: <FaInbox />, path: "/admin/inbox" },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-screen transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        <h1 className={`text-lg font-bold ${isCollapsed ? "hidden" : "block"}`}>
          Admin Panel
        </h1>
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
        >
          <FaBars />
        </button>
      </div>

      {/* Sidebar Menu */}
      <nav className="mt-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-4 p-3 hover:bg-gray-700 transition"
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`${isCollapsed ? "hidden" : "block"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;