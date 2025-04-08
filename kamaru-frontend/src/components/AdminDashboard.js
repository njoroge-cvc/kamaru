import React, { useEffect } from "react";
import { Link, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { FaUsers, FaImage, FaVideo, FaUserShield, FaCalendarAlt, FaSignOutAlt, FaCog } from "react-icons/fa";
import ManageParticipants from "./ManageParticipants";
import ManageGallery from "./ManageGallery";
import ManageVideos from "./ManageVideos";
import ManageUsers from "./ManageUsers";
import ManageEvent from "./ManageEvent";
import ManageSystemImages from "./ManageSystemImages"; // Import the ManageSystemImages component
import Stats from "./Stats";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin") === "true";
    if (!isAdmin) {
      alert("You do not have access to the admin dashboard.");
      navigate("/");
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    alert("You have been logged out.");
    navigate("/"); // Redirect to home page after logout
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="bg-[#8F3B1B] text-white p-6 w-16 md:w-1/4 flex flex-col items-center md:items-start min-h-screen">
        <h1 className="text-2xl font-bold hidden md:block mb-6">Admin Dashboard</h1>
        <ul className="space-y-6 md:space-y-3 flex flex-col items-center md:items-start w-full">
          {[
            { path: "/admin/events", icon: <FaCalendarAlt />, label: "Manage Events" },
            { path: "/admin/participants", icon: <FaUsers />, label: "Manage Participants" },
            { path: "/admin/gallery", icon: <FaImage />, label: "Manage Gallery" },
            { path: "/admin/videos", icon: <FaVideo />, label: "Manage Videos" },
            { path: "/admin/users", icon: <FaUserShield />, label: "Manage Users" },
            { path: "/admin/system_images", icon: <FaCog />, label: "Manage System Images" }, // New section for system images
          ].map(({ path, icon, label }) => (
            <li key={path} className="w-full">
              <Link
                to={path}
                className={`flex flex-col md:flex-row items-center gap-2 w-full p-2 rounded-md transition-all 
                  ${location.pathname === path ? "bg-[#D57500] text-white font-semibold" : "hover:text-[#D57500]"}`}
              >
                {icon}
                <span className="hidden md:inline">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
        >
          <FaSignOutAlt />
          <span className="hidden md:inline">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-3/4 p-6">
        {/* Breadcrumb Navigation */}
        <div className="text-gray-600 mb-4 text-sm">
          <span className="text-[#D57500] font-semibold">Admin</span> /{" "}
          <span className="capitalize">{location.pathname.replace("/admin/", "").replace("-", " ") || "Dashboard"}</span>
        </div>

        {/* Stats Section */}
        <Stats />

        {/* Routes for Admin Sections */}
        <div className="mt-6 md:mt-10">
          <Routes>
            <Route path="events" element={<ManageEvent />} />
            <Route path="participants" element={<ManageParticipants isAdmin={true} />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="videos" element={<ManageVideos />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="system_images" element={<ManageSystemImages />} /> {/* Route for system images */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;