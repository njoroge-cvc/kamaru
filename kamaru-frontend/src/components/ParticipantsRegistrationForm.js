import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFeatherAlt, FaDrum, FaMicrophoneAlt, FaCheckCircle } from "react-icons/fa";
import { registerParticipant } from "../api";
import { CATEGORIES } from "../content/story";
import { Field, Alert, Spinner } from "./ui";

const ICONS = { feather: FaFeatherAlt, drum: FaDrum, mic: FaMicrophoneAlt };

const ParticipantsRegistrationForm = ({ season, onRegistered }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError("Please choose a category.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await registerParticipant(formData);
      setDone(true);
      onRegistered?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-earth/5"
      >
        <FaCheckCircle className="mx-auto text-5xl text-bead-green" />
        <h2 className="mt-4 font-display text-3xl font-bold text-earth">You’re in!</h2>
        <p className="mt-2 text-earth-600">
          You’re registered for {season?.name || "the Kamaru Challenge"} in <strong>{formData.category}</strong>. We’ll be in touch
          with details about your performance.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setFormData({ name: "", email: "", phone: "", category: "" });
          }}
          className="k-btn-outline mt-6"
        >
          Register another entry
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-earth/5">
      <div className="space-y-5 p-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-earth">Register to compete</h2>
          <p className="mt-1 text-earth-600">Entering {season?.name || "the Kamaru Challenge"}.</p>
        </div>

        {error && <Alert>{error}</Alert>}

        <Field label="Full name">
          <input name="name" value={formData.name} onChange={handleChange} required autoComplete="name" className="k-input" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email">
            <input type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" className="k-input" />
          </Field>
          <Field label="Phone">
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required autoComplete="tel" className="k-input" placeholder="07XX XXX XXX" />
          </Field>
        </div>

        <fieldset>
          <legend className="k-label">Category</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => {
              const Icon = ICONS[c.icon];
              const active = formData.category === c.name;
              return (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setFormData({ ...formData, category: c.name })}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center text-sm font-semibold transition ${
                    active ? "border-kamaru bg-kamaru/10 text-earth" : "border-earth/10 text-earth-700 hover:border-kamaru/50"
                  }`}
                >
                  <Icon className={`text-2xl ${active ? "text-kamaru" : "text-earth-600"}`} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" disabled={loading} className="k-btn-primary w-full py-3">
          {loading && <Spinner />}
          {loading ? "Submitting…" : "Register"}
        </button>
      </div>
    </form>
  );
};

export default ParticipantsRegistrationForm;
