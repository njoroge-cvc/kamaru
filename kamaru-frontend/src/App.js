import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage"; // Corrected import for HomePage
import GalleryPage from "./pages/GalleryPage"; // Ensure this file exists
import VideosPage from "./pages/VideosPage"; // Ensure this file exists
import UserRegistrationForm from "./components/UserRegistrationForm"; // Corrected import for user registration
import ParticipantsRegistrationPage from "./pages/ParticipantsRegistrationPage"; // Corrected import for participant registration
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard"; // import AdminDashboard component

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Home page */}
        <Route path="/gallery" element={<GalleryPage />} /> {/* Gallery page */}
        <Route path="/videos" element={<VideosPage />} /> {/* Videos page */}
        <Route path="/register/user" element={<UserRegistrationForm />} /> {/* User registration */}
        <Route path="/register/participant" element={<ParticipantsRegistrationPage />} /> {/* Participant registration */}
        <Route path="/login" element={<LoginForm />} /> {/* Login page */}
        <Route path="/admin/*" element={<AdminDashboard />} /> {/* Admin dashboard */}
      </Routes>
    </Router>
  );
};

export default App;