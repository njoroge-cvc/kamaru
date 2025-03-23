import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";

import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";
import VideosPage from "./pages/VideosPage";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

// App component is the root component of the application
// It contains the Navbar and the Routes
// The Routes component contains Route components
// Each Route component is a page in the application
// The path prop is the URL path
// The element prop is the component to render when the path matches
// The component prop can be used instead of the element prop
// The component prop is a function that returns a React element
// The element prop is a React element
// The element prop is preferred over the component prop
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/register/user" element={<RegisterForm />} /> {/* User registration */}
        <Route path="/register/participant" element={<Register />} /> {/* Participant registration */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;