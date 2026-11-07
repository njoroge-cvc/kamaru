import React, { useState } from "react";
import { sendContactMessage } from "../api";
import { Field, Alert, Spinner } from "./ui";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // { tone, text }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      const { data } = await sendContactMessage(formData);
      setStatus({ tone: "success", text: data?.message || "Message sent successfully!" });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({ tone: "error", text: error.response?.data?.error || "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name">
          <input name="name" value={formData.name} onChange={handleChange} required autoComplete="name" className="k-input" placeholder="Wanjiku Kamau" />
        </Field>
        <Field label="Your email">
          <input type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" className="k-input" placeholder="you@example.com" />
        </Field>
      </div>
      <Field label="Your message">
        <textarea name="message" rows={5} value={formData.message} onChange={handleChange} required className="k-input resize-y" placeholder="How can we help?" />
      </Field>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <button type="submit" disabled={isSubmitting} className="k-btn-primary w-full py-3">
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};

export default ContactForm;
