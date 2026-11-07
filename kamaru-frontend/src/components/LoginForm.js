import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../api";
import { saveSession, PERMS } from "../auth";
import { AuthShell, Field, PasswordInput, Alert, Spinner, useBanner } from "./ui";
import { useSeo } from "../utils/seo";

const LoginForm = () => {
  useSeo({ title: "Log in", path: "/login", noindex: true });
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const banner = useBanner();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get("expired") === "1";
  const idle = params.get("idle") === "1";
  // Only allow in-app paths as redirect targets
  const rawNext = params.get("next") || "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser(credentials);
      saveSession({ ...data, remember });
      const staff = (data.permissions || []).includes(PERMS.DASHBOARD) || data.is_admin;
      toast.success(`Welcome back${data.user?.username ? `, ${data.user.username}` : ""}!`);
      navigate(next || (staff ? "/admin" : "/"));
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      banner={banner}
      title="Welcome back"
      subtitle="Log in to register for the Challenge or manage the site."
      footer={
        <>
          New here?{" "}
          <Link to="/join" className="font-semibold text-ochre hover:text-earth">
            Join the community
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {expired && !error && <Alert tone="info">Your session expired. Please log in again to continue.</Alert>}
        {idle && !expired && !error && <Alert tone="info">You were signed out after 30 minutes of inactivity. Log in again to continue.</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Email">
          <input type="email" name="email" value={credentials.email} onChange={handleChange} required autoComplete="email" className="k-input" placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <PasswordInput value={credentials.password} onChange={handleChange} required />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-earth-700">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-kamaru" />
            Keep me signed in on this device
          </label>
          <Link to="/forgot_password" className="text-sm font-semibold text-ochre hover:text-earth">
            Forgot your password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="k-btn-primary w-full py-3">
          {loading && <Spinner />}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginForm;
