import React, { useEffect } from "react"; // Import useEffect from React
import { Link, Route, Routes, useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import ManageEvents from "./ManageEvents";
import ManageParticipants from "./ManageParticipants";
import ManageGallery from "./ManageGallery";
import ManageVideos from "./ManageVideos";
import ManageUsers from "./ManageUsers";

/**
 * AdminDashboard component provides links to manage events, participants, gallery, and videos.
 * It uses React Router to render the appropriate management component based on the URL.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("is_admin") === "true"; // Check admin status

  useEffect(() => {
    if (!isAdmin) {
      alert("You do not have access to the admin dashboard.");
      navigate("/"); // Redirect non-admin users to the home page
    }
  }, [isAdmin, navigate]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="events">Manage Events</Link></li>
          <li><Link to="participants">Manage Participants</Link></li>
          <li><Link to="gallery">Manage Gallery</Link></li>
          <li><Link to="videos">Manage Videos</Link></li>
          <li><Link to="users">Manage Users</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="events" element={<ManageEvents />} />
        <Route path="participants" element={<ManageParticipants isAdmin={true} />} />
        <Route path="gallery" element={<ManageGallery />} />
        <Route path="videos" element={<ManageVideos />} />
        <Route path="users" element={<ManageUsers />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;