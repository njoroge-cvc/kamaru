import React, { useState, useEffect } from "react";
import { registerUser, fetchBanners } from "../api"; // Import fetchBanners
import { useNavigate } from "react-router-dom";
import FloatingLabelInput from "./FloatingLabelInput"; // Import the reusable component
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react"; // Import the loader icon

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      await registerUser(formData);
      setSuccess(true);
      setFormData({ username: "", email: "", password: "" });
    } catch (error) {
      setError("Registration failed. Please try again.");
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
        <h2 className="text-3xl font-bold text-[#333] text-center mb-8">Register</h2>
        <p className="text-sm text-[#333] text-center mb-4">
          Please fill in the details below to create an account.
        </p>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded">
            Registration successful! You can now log in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Username Field */}
          <FloatingLabelInput
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            label="Username"
            required
          />

          {/* Email Field */}
          <FloatingLabelInput
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            label="Email"
            required
          />

          {/* Password Field with Visibility Toggle */}
          <div className="relative">
            <FloatingLabelInput
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              label="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#D57500] hover:text-[#333] focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:bg-[#333] disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#D57500] hover:text-[#333] transition-all underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationForm;