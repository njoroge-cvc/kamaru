import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex justify-center items-center min-h-screen bg-[#FFF5EC] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#F4A261]">
        <h2 className="text-3xl font-bold text-[#8F3B1B] text-center mb-6">Welcome Back!</h2>

        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <button
            type="submit"
            className="w-full bg-[#D57500] hover:bg-[#8F3B1B] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-5 space-y-3">
          <button
            onClick={() => navigate("/forgot_password")}
            className="text-[#D57500] hover:text-[#8F3B1B] transition-all"
          >
            Forgot your password?
          </button>
          <p className="text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register/user")}
              className="text-[#D57500] hover:text-[#8F3B1B] font-semibold transition-all"
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
