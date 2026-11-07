import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api";
import { AuthShell, Field, PasswordInput, Alert, Spinner, useBanner } from "./ui";

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const banner = useBanner();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);
    try {
      await registerUser(formData);
      setSuccess(true);
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      banner={banner}
      title="Join the Kamaru community"
      subtitle="One free account lets you enter the Challenge each season and stay close to our gatherings."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ochre hover:text-earth">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="rounded-2xl bg-cream-dark px-4 py-3 text-sm text-earth">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ochre underline underline-offset-4 hover:text-earth">
            Log in instead
          </Link>
        </p>
        {error && <Alert>{error}</Alert>}
        {success && (
          <Alert tone="success">
            Welcome to the community! <Link to="/login" className="underline">Log in now</Link>.
          </Alert>
        )}
        <Field label="Username">
          <input name="username" value={formData.username} onChange={handleChange} required autoComplete="username" className="k-input" placeholder="e.g. wanjiku_k" />
        </Field>
        <Field label="Email">
          <input type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" className="k-input" placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <PasswordInput value={formData.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
        </Field>
        <button type="submit" disabled={loading} className="k-btn-primary w-full py-3">
          {loading && <Spinner />}
          {loading ? "Joining…" : "Join"}
        </button>
      </form>
    </AuthShell>
  );
};

export default UserRegistrationForm;
