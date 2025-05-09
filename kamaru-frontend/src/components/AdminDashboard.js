import React, { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  FaUsers,
  FaImage,
  FaVideo,
  FaUserShield,
  FaCalendarAlt,
  FaCog,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaBarsStaggered } from "react-icons/fa6";
import ManageParticipants from "./ManageParticipants";
import ManageGallery from "./ManageGallery";
import ManageVideos from "./ManageVideos";
import ManageUsers from "./ManageUsers";
import ManageEvent from "./ManageEvent";
import ManageSystemImages from "./ManageSystemImages";
import Stats from "./Stats";

const navItems = [
  { path: "/admin/events", icon: <FaCalendarAlt />, label: "Events" },
  { path: "/admin/participants", icon: <FaUsers />, label: "Participants" },
  { path: "/admin/gallery", icon: <FaImage />, label: "Gallery" },
  { path: "/admin/videos", icon: <FaVideo />, label: "Videos" },
  { path: "/admin/users", icon: <FaUserShield />, label: "Users" },
  { path: "/admin/system_images", icon: <FaCog />, label: "System Images" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin") === "true";
    if (!isAdmin) {
      console.warn("Unauthorized access attempt to admin dashboard.");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    navigate("/");
  };

  const currentPath = location.pathname;

  const getBreadcrumb = () => {
    const cleanPath = currentPath.replace("/admin/", "");
    if (!cleanPath) return "Dashboard";
    return cleanPath.split("/").map(seg => seg.replace("_", " ")).join(" / ");
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-[#D57500] text-white flex flex-col fixed md:static z-20 h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } ${isSidebarOpenMobile ? "left-0" : "-left-full"} md:left-0 top-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {!isSidebarCollapsed && <h2 className="text-lg font-bold">Admin</h2>}
          <button
            onClick={() =>
              isSidebarCollapsed
                ? setIsSidebarCollapsed(false)
                : setIsSidebarOpenMobile(false)
            }
            className="text-white md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-white hidden md:block"
            aria-label="Toggle sidebar"
          >
            <FaBarsStaggered />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 px-2 pt-4">
            {navItems.map(({ path, icon, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  title={label}
                  aria-label={label}
                  className={`flex items-center p-2 rounded-md transition-all ${
                    currentPath === path
                      ? "bg-white text-[#D57500] font-semibold shadow"
                      : "hover:bg-[#333] hover:text-white"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="ml-3 text-sm">{label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="border-[#fff]/20 my-4 mx-2" />

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full bg-[#333] hover:bg-[#222] text-white p-2 rounded-md transition"
            aria-label="Logout"
          >
            <FiLogOut />
            {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpenMobile && (
        <div
          onClick={() => setIsSidebarOpenMobile(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden ml-0 md:ml-auto">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="text-[#D57500] text-xl md:hidden"
              onClick={() => setIsSidebarOpenMobile(true)}
              aria-label="Open sidebar"
            >
              <FaBarsStaggered />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full max-w-xs"
              aria-label="Search"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 text-xl" aria-label="Notifications">
              🔔
            </button>
            <img
              src="/path/to/profile.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => (e.currentTarget.src = "/default-profile.png")}
            />
          </div>
        </header>

        {/* Scrollable content */}
        <div className="px-6 py-2 flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="py-1 text-sm text-gray-600">
            <span className="text-[#D57500] font-semibold">Admin</span>
            <span className="mx-2">/</span>
            <span className="capitalize">{getBreadcrumb()}</span>
          </div>

          {/* Stats */}
          <Stats />

          {/* Routes */}
          <div className="mt-6">
            <Routes>
              <Route path="events" element={<ManageEvent />} />
              <Route
                path="participants"
                element={<ManageParticipants isAdmin={true} />}
              />
              <Route path="gallery" element={<ManageGallery />} />
              <Route path="videos" element={<ManageVideos />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="system_images" element={<ManageSystemImages />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
