import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import VideosPage from "./pages/VideosPage";
import UserRegistrationForm from "./components/UserRegistrationForm";
import ParticipantsRegistrationPage from "./pages/ParticipantsRegistrationPage";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/register/user" element={<UserRegistrationForm />} />
            <Route path="/register/participant" element={<ParticipantsRegistrationPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;