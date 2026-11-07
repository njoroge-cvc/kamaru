import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaMicrophone,
  FaTrophy,
  FaGift,
  FaCameraRetro,
  FaBookOpen,
  FaSeedling,
  FaCheck,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import PageHero from "../components/PageHero";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../components/motion";
import { Field, Alert, Spinner } from "../components/ui";
import { SunSpiral } from "../components/home/Ornaments";
import { sendContactMessage } from "../api";
import { SUPPORT_WAYS, NON_NEGOTIABLES, SUPPORT_STEPS, CONTACT, VALUES } from "../content/story";

const ICONS = { mic: FaMicrophone, trophy: FaTrophy, gift: FaGift, camera: FaCameraRetro, book: FaBookOpen, seed: FaSeedling };

const SupportForm = ({ selected, onSelect }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", organisation: "", message: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!selected.length) {
      setStatus({ tone: "error", text: "Pick at least one way you’d like to support." });
      return;
    }
    setBusy(true);
    const ways = SUPPORT_WAYS.filter((w) => selected.includes(w.key)).map((w) => w.title);
    // Reuses the contact endpoint; the team receives a clearly labelled support enquiry
    const message = [
      "SUPPORT / COLLABORATION ENQUIRY",
      `Ways to support: ${ways.join(", ")}`,
      form.organisation && `Organisation: ${form.organisation}`,
      form.phone && `Phone: ${form.phone}`,
      "Agrees to uphold the Kamaru mission and values: yes",
      "",
      form.message,
    ]
      .filter((l) => l !== false && l !== "")
      .join("\n");
    try {
      await sendContactMessage({ name: form.name, email: form.email, message });
      setStatus({ tone: "success", text: "Asante! Your message is on its way — we’ll get back to you soon." });
      setForm({ name: "", email: "", phone: "", organisation: "", message: "" });
      setAgree(false);
    } catch (err) {
      setStatus({ tone: "error", text: err.response?.data?.error || "Couldn’t send your message. Please try again or call us." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="k-label">How would you like to support?</legend>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_WAYS.map((w) => {
            const on = selected.includes(w.key);
            return (
              <button
                type="button"
                key={w.key}
                onClick={() => onSelect(w.key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  on ? "bg-kamaru text-earth" : "bg-earth/5 text-earth-700 hover:bg-kamaru/20"
                }`}
              >
                {on && <FaCheck className="text-xs" />}
                {w.title}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" value={form.name} onChange={set} required autoComplete="name" className="k-input" />
        </Field>
        <Field label="Organisation (optional)">
          <input name="organisation" value={form.organisation} onChange={set} autoComplete="organization" className="k-input" />
        </Field>
        <Field label="Email">
          <input type="email" name="email" value={form.email} onChange={set} required autoComplete="email" className="k-input" />
        </Field>
        <Field label="Phone (optional)">
          <input type="tel" name="phone" value={form.phone} onChange={set} autoComplete="tel" className="k-input" placeholder="07XX XXX XXX" />
        </Field>
      </div>

      <Field label="Tell us about your idea">
        <textarea name="message" rows={5} value={form.message} onChange={set} required className="k-input resize-y" placeholder="What would you like to offer, and when?" />
      </Field>

      <label className="flex items-start gap-3 rounded-2xl bg-cream-dark p-4 text-sm text-earth">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required className="mt-0.5 h-5 w-5 accent-kamaru" />
        <span>I understand that my support will uphold the Kamaru Challenge mission and its values, and won’t change them.</span>
      </label>

      {status && <Alert tone={status.tone}>{status.text}</Alert>}

      <button type="submit" disabled={busy} className="k-btn-primary w-full py-3">
        {busy && <Spinner />}
        {busy ? "Sending…" : "Send my offer of support"}
      </button>
    </form>
  );
};

const SupportPage = () => {
  const [selected, setSelected] = useState([]);
  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const pickAndScroll = (key) => {
    setSelected((s) => (s.includes(key) ? s : [...s, key]));
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="Support us"
        eyebrow="Walk with us"
        title="A fire is kept alive by many hands"
        intro="We welcome collaboration in any form — time, talent, resources or ideas — so long as it carries our mission and values forward rather than changing them."
      />

      {/* Ways to support */}
      <section className="container mx-auto px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow="Ways to support"
          title="Bring what you have"
          intro="Our initiatives are free for the community. Every contribution, big or small, keeps it that way."
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_WAYS.map((w, i) => {
            const Icon = ICONS[w.icon];
            return (
              <StaggerItem key={w.key}>
                <motion.button
                  type="button"
                  onClick={() => pickAndScroll(w.key)}
                  whileHover={{ y: -8, rotate: i % 2 ? 0.8 : -0.8 }}
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white p-7 text-left shadow-sm ring-1 ring-earth/5 transition-shadow hover:shadow-xl"
                >
                  <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: w.color }} />
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl text-2xl text-cream" style={{ backgroundColor: w.color }}>
                    <Icon />
                  </span>
                  <h3 className="relative mt-5 font-display text-2xl font-bold text-earth">{w.title}</h3>
                  <p className="relative mt-2 flex-1 text-earth-700">{w.text}</p>
                  <span className="relative mt-5 font-semibold text-ochre group-hover:underline underline-offset-4">I can help with this →</span>
                </motion.button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Non-negotiables */}
      <section className="relative overflow-hidden bg-earth text-cream grain weave">
        <div className="bead-band h-2" aria-hidden="true" />
        <SunSpiral className="pointer-events-none absolute -right-20 bottom-0 w-80 opacity-15" />
        <div className="container relative mx-auto grid gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading
              light
              align="left"
              eyebrow="What stays the same"
              title="Our mission is not for sale"
              intro="We’re grateful for every partner. We also protect what makes this work matter — so these hold for every collaboration."
            />
            <Reveal className="mt-8 flex flex-wrap gap-2">
              {VALUES.map((v) => (
                <span key={v.name} className="rounded-full px-3 py-1 text-sm font-semibold text-cream" style={{ backgroundColor: v.color }}>
                  {v.name}
                </span>
              ))}
            </Reveal>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {NON_NEGOTIABLES.map((n, i) => (
              <StaggerItem key={n.title} className="rounded-3xl bg-cream/10 p-6">
                <span className="font-display text-4xl font-black text-kamaru">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl font-bold">{n.title}</h3>
                <p className="mt-2 text-cream/75">{n.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Steps + form */}
      <section id="offer" className="scroll-mt-24 container mx-auto grid gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading align="left" eyebrow="How it works" title="Three simple steps" />
          <ol className="relative mt-10 space-y-8 border-l-2 border-dashed border-kamaru/40 pl-8">
            {SUPPORT_STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.1} className="relative">
                <span className="absolute -left-[3.05rem] grid h-9 w-9 place-items-center rounded-full bg-kamaru font-bold text-earth">{i + 1}</span>
                <h3 className="font-display text-xl font-bold text-earth">{s.title}</h3>
                <p className="text-earth-700">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-10 space-y-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-earth/5">
            <p className="font-semibold text-earth">Prefer to talk?</p>
            {CONTACT.phones.map((ph) => (
              <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} className="flex items-center gap-3 text-earth-700 hover:text-ochre">
                <FaPhoneAlt className="text-kamaru" /> {ph}
              </a>
            ))}
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 text-earth-700 hover:text-ochre">
              <FaEnvelope className="text-kamaru" /> {CONTACT.email}
            </a>
          </Reveal>
        </div>

        <Reveal className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-earth/5">
          <div className="bead-band h-2" aria-hidden="true" />
          <div className="p-6 md:p-8">
            <h2 className="font-display text-3xl font-bold text-earth">Offer your support</h2>
            <p className="mb-6 mt-1 text-earth-600">Every offer is read by the team.</p>
            <SupportForm selected={selected} onSelect={toggle} />
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default SupportPage;
