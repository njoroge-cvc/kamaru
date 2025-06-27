import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import VideosPage from "./pages/VideosPage";
import UserRegistrationForm from "./components/UserRegistrationForm";
import ParticipantsRegistrationPage from "./pages/ParticipantsRegistrationPage";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import EventPage from "./pages/EventPage";
import AboutUs from "./pages/AboutUsPage"; 
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import ScrollToTop from "./components/ScrollToTop";
import "./index.css"; // Import Tailwind CSS



const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about_us" element={<AboutUs />} /> 
            <Route path="/events/:id" element={<EventPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/register/user" element={<UserRegistrationForm />} />
            <Route path="/register/participant" element={<ParticipantsRegistrationPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot_password" element={<ForgotPasswordForm />} />
            <Route path="/reset_password" element={<ResetPasswordForm />} />
            <Route path="/admin/*" element={<AdminDashboard />} /> {/* Admin routes */}
            <Route path="/terms" element={<TermsAndConditionsPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;