import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex justify-center items-center min-h-screen bg-[#FFF5EC] px-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-[#8F3B1B] text-center mb-4">Register</h2>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center bg-green-100 p-2 rounded">
            Registration successful! You can now log in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
          />

          <button
            type="submit"
            className="w-full bg-[#D57500] hover:bg-[#8F3B1B] text-white py-3 rounded-md transition duration-300"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#D57500] hover:text-[#8F3B1B] transition-all underline"
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
