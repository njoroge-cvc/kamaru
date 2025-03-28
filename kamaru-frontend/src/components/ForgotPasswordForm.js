import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex justify-center items-center min-h-screen bg-[#FFFFFF] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#F4A261]">
        <h2 className="text-3xl font-bold text-[#8F3B1B] text-center mb-6">
          Forgot Password?
        </h2>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <button
            type="submit"
            className="w-full bg-[#D57500] hover:bg-[#8F3B1B] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            onClick={() => navigate("/login")}
            className="text-[#D57500] hover:text-[#8F3B1B] font-semibold transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
