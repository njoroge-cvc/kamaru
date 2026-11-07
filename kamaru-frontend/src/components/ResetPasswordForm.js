import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../api";
import { AuthShell, Field, PasswordInput, Alert, Spinner, useBanner } from "./ui";

const ResetPasswordForm = () => {
  const [shortToken, setShortToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const banner = useBanner();
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
      await resetPassword({ short_token: shortToken.trim(), new_password: newPassword });
      setMessage("Password reset successfully! Taking you to login…");
      setShortToken("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      banner={banner}
      title="Reset your password"
      subtitle="Enter the code from your email and choose a new password."
      footer={
        <>
          Didn’t get a code?{" "}
          <Link to="/forgot_password" className="font-semibold text-ochre hover:text-earth">
            Send another
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && <Alert tone="success">{message}</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Reset code" hint="Valid for 15 minutes.">
          <input
            value={shortToken}
            onChange={(e) => setShortToken(e.target.value)}
            required
            maxLength={6}
            autoComplete="one-time-code"
            className="k-input text-center font-display text-2xl tracking-[0.5em]"
            placeholder="••••••"
          />
        </Field>
        <Field label="New password">
          <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </Field>
        <button type="submit" disabled={loading} className="k-btn-primary w-full py-3">
          {loading && <Spinner />}
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordForm;
