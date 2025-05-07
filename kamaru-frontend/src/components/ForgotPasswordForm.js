import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../api"; // Import fetchBanners
import FloatingLabelInput from "./FloatingLabelInput"; // Import the reusable component
import { Loader2 } from "lucide-react"; // Import the loader icon

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(""); // State for the banner image
  const navigate = useNavigate();

  // Fetch the banner image
  useEffect(() => {
    fetchBanners()
      .then((res) => {
        if (res.data.banners.length > 0) {
          setBannerImage(res.data.banners[1].image_url); // Set the banner image
        }
      })
      .catch((err) => console.error("Error fetching banner image:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("A reset code has been sent to your email.");
        setTimeout(() => {
          navigate("/reset_password");
        }, 2000);
      } else {
        setError(data.error || "Failed to send reset code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url(${bannerImage || "/default-banner.jpg"})`, // Use fetched banner or default
        backgroundColor: "#FFF5EC",
      }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-[#333] text-center mb-6">
          Forgot Password?
        </h2>

        {message && (
          <p className="text-green-600 text-sm text-center bg-green-100 py-2 px-3 rounded mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-100 py-2 px-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <FloatingLabelInput
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            required
          />


          <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:bg-[#333] disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    {loading ? "Sending code..." : "Send Reset Code"}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            onClick={() => navigate("/login")}
            className="text-[#D57500] hover:text-[#333] font-semibold transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;