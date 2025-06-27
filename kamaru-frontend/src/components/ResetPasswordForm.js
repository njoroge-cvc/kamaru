import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBanners } from "../api"; // Import fetchBanners
import FloatingLabelInput from "./FloatingLabelInput"; // Import the reusable component
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for password toggle
import { Loader2 } from "lucide-react"; // Import the loader icon

const ResetPasswordForm = () => {
  const [shortToken, setShortToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(""); // State for the banner image
  const [showNewPassword, setShowNewPassword] = useState(false); // State for toggling new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
  const navigate = useNavigate();

  // Fetch the banner image
  useEffect(() => {
    fetchBanners()
      .then((res) => {
        if (res.data.banners.length > 0) {
          setBannerImage(res.data.banners[0].image_url); // Set the banner image
        }
      })
      .catch((err) => console.error("Error fetching banner image:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_token: shortToken, new_password: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successfully! You can now log in.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setShortToken("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to reset password.");
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
          Reset Password
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
          {/* Reset Code Field */}
          <FloatingLabelInput
            type="text"
            id="reset-code"
            name="reset-code"
            value={shortToken}
            onChange={(e) => setShortToken(e.target.value)}
            label="Reset Code"
            required
          />

          {/* New Password Field with Visibility Toggle */}
          <div className="relative">
            <FloatingLabelInput
              type={showNewPassword ? "text" : "password"}
              id="new-password"
              name="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              label="New Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#D57500] hover:text-[#333] focus:outline-none"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password Field with Visibility Toggle */}
          <div className="relative">
            <FloatingLabelInput
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label="Confirm Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#D57500] hover:text-[#333] focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:bg-[#333] disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    {loading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPasswordForm;