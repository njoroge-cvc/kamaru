import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = () => {
  const [shortToken, setShortToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex justify-center items-center min-h-screen bg-[#FFFFFF] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#F4A261]">
        <h2 className="text-3xl font-bold text-[#8F3B1B] text-center mb-6">
          Reset Password
        </h2>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Enter the reset code"
            value={shortToken}
            onChange={(e) => setShortToken(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#D57500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-all"
          />

          <button
            type="submit"
            className="w-full bg-[#D57500] hover:bg-[#8F3B1B] text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordForm;
