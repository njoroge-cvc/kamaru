import React, { useEffect, useState } from "react";
import { loginUser, fetchBanners } from "../api";
import { useNavigate } from "react-router-dom";
import FloatingLabelInput from "./FloatingLabelInput"; // Import the reusable component
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react"; // Import the loader icon
const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(""); // Default banner image
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Function to fetch the banner image from the server
  useEffect(() => {
    // Fetch the banner image
    fetchBanners()
      .then((res) => {
        if (res.data.banners.length > 0) {
          setBannerImage(res.data.banners[1].image_url); // Set the first banner image
        }
      })
      .catch((err) => console.error("Error fetching banner image:", err));
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(credentials);
      const { token, is_admin } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("is_admin", is_admin);

      alert("Login successful!");
      navigate(is_admin ? "/admin" : "/");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex justify-center items-center min-h-screen bg-fixed bg-cover bg-center"
      style={{ 
        backgroundImage: `url(${bannerImage || "/default-banner.jpg"})`,
        backgroundColor: "#FFF5EC"}}
    >
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-[#333] text-center mb-8">Welcome Back!</h2>
        <p className="text-sm text-[#333] text-center mb-4">
          Please enter your email and password to log in.
        </p>
        {/* Error Message */}

        {error && (
          <p className="text-red-600 text-sm text-center bg-red-100 py-2 px-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <FloatingLabelInput
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            label="Email"
            required
          />

          {/* Password Field */}
          <div className="relative">
  <FloatingLabelInput
    type={showPassword ? "text" : "password"}
    id="password"
    name="password"
    value={credentials.password}
    onChange={handleChange}
    label="Password"
    required
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#D57500] hover:text-[#333] focus:outline-none"
  >
    {showPassword ? <FaEyeSlash/> : <FaEye/>}
  </button>
</div>

          <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#D57500] text-white font-semibold py-3 rounded-md hover:bg-[#333] transition duration-300 disabled:bg-[#333] disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6 space-y-3 text-sm">
          <button
            onClick={() => navigate("/forgot_password")}
            className="text-[#D57500] hover:text-[#333] transition"
          >
            Forgot your password?
          </button>
          <p>
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register/user")}
              className="font-semibold text-[#D57500] hover:text-[#333] transition"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;