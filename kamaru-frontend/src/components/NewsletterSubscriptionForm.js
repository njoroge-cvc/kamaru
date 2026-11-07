import React, { useState } from "react";
import { subscribeToNewsletter } from "../api";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeToNewsletter({ email });
      setMessage(res.data?.message || "Verification email sent! Please check your inbox.");
      setStatus(
        "success"
      );
      setEmail(
        ""
      );
    } catch (error) {
      // Surface the API's reason (e.g. "already subscribed") instead of a generic failure
      setMessage(error.response?.data?.error || "Failed to subscribe. Please try again.");
      setStatus(
        "error"
      );
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full flex-1 rounded-full border border-cream/20 bg-cream/10 px-5 py-3 text-cream placeholder-cream/40 focus:outline-none focus:ring-2 focus:ring-kamaru"
        />
        <button
  type="submit"
  className={`shrink-0 rounded-full px-6 py-3 font-semibold transition ${
    loading ? "bg-earth-600 text-cream/60 cursor-not-allowed" : "bg-kamaru text-earth hover:bg-kamaru-light"
  }`}
  disabled={loading}
>
  {loading ? "Subscribing..." : "Subscribe"}
</button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${status === "success" ? "text-[#7BD389]" : "text-[#FF8A80]"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;
