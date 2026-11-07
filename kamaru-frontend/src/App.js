import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";
import SideRails from "./components/SideRails";
import ScrollProgress from "./components/ScrollProgress";
import { SessionSync } from "./components/useSession";
import "./index.css"; // Import Tailwind CSS

// Code-split every route except the landing page: visitors only download what they open,
// and the admin bundle (Excel/PDF export, rich-text editor) never loads for the public.
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const VideosPage = lazy(() => import("./pages/VideosPage"));
const UserRegistrationForm = lazy(() => import("./components/UserRegistrationForm"));
const ParticipantsRegistrationPage = lazy(() => import("./pages/ParticipantsRegistrationPage"));
const LoginForm = lazy(() => import("./components/LoginForm"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ForgotPasswordForm = lazy(() => import("./components/ForgotPasswordForm"));
const ResetPasswordForm = lazy(() => import("./components/ResetPasswordForm"));
const EventPage = lazy(() => import("./pages/EventPage"));
const AboutUs = lazy(() => import("./pages/AboutUsPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditionsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const VerifyNewsletter = lazy(() => import("./pages/VerifyNewsletter"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true" aria-label="Loading">
    <div className="h-1 w-40 animate-pulse bg-kamaru" />
  </div>
);



// Full-bleed pages (storytelling layouts) manage their own widths;
// everything else keeps the original centred container.
const FULL_BLEED = [
  "/", "/gallery", "/videos", "/about_us", "/register/participant",
  "/login", "/register/user", "/join", "/support", "/forgot_password", "/reset_password", "/verify-newsletter",
];

const Main = ({ children }) => {
  const { pathname } = useLocation();
  const full =
    FULL_BLEED.includes(pathname) || pathname.startsWith("/events/") || pathname.startsWith("/admin");
  return <main className={`flex-grow ${full ? "" : "container mx-auto p-4"}`}>{children}</main>;
};

const AppFooter = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin") ? null : <Footer />;
};

const App = () => {
  return (
    <Router>
      <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <SessionSync />
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <Main>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about_us" element={<AboutUs />} /> 
            <Route path="/events/:id" element={<EventPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/register/user" element={<UserRegistrationForm />} />
            <Route path="/join" element={<UserRegistrationForm />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/register/participant" element={<ParticipantsRegistrationPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot_password" element={<ForgotPasswordForm />} />
            <Route path="/reset_password" element={<ResetPasswordForm />} />
            <Route path="/admin/*" element={<AdminDashboard />} /> {/* Admin routes */}
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            {/* Newsletter verification route */}
            <Route 
              path="/verify-newsletter" 
              element={<VerifyNewsletter />} 
            />
          </Routes>
          </Suspense>
        </Main>
        <AppFooter />
        <SideRails />
        <ScrollProgress />
      </div>
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      </MotionConfig>
    </Router>
  );
};

export default App;