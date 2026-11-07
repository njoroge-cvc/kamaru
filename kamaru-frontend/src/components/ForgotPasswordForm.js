import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api";
import { AuthShell, Field, Alert, Spinner, useBanner } from "./ui";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const banner = useBanner();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setMessage(data?.message || "If that email is registered, a reset code has been sent to it.");
      setTimeout(() => navigate("/reset_password"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      banner={banner}
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a 6-character reset code."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-ochre hover:text-earth">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && <Alert tone="success">{message}</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="k-input" placeholder="you@example.com" />
        </Field>
        <button type="submit" disabled={loading} className="k-btn-primary w-full py-3">
          {loading && <Spinner />}
          {loading ? "Sending…" : "Send reset code"}
        </button>
        <p className="text-center text-sm">
          <Link to="/reset_password" className="font-semibold text-ochre hover:text-earth">
            I already have a code
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordForm;
