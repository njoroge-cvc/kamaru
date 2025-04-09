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
      await subscribeToNewsletter({ email });
      setMessage("Subscribed successfully!");
      setStatus("success");
      setEmail("");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-lg bg-opacity-25">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#D57500] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F4A261]"
        />
        <button
  type="submit"
  className={`w-full py-2 rounded-md text-sm transition duration-300 ${
    loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#D57500] hover:bg-[#333] text-white"
  }`}
  disabled={loading}
>
  {loading ? "Subscribing..." : "Subscribe"}
</button>
      </form>
      {message && (
        <p className={`text-center mt-4 ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;
