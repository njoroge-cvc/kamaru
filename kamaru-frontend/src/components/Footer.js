import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowUp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { cld } from "../utils/cloudinary";
import SocialIcons from "./SocialIcons";
import BrandBadge from "./BrandBadge";
import NewsletterForm from "./NewsletterSubscriptionForm";
import { fetchSystemImage } from "../api";
import { TAGLINE_KIKUYU, TAGLINE_ENGLISH, CONTACT, EDITION } from "../content/story";

const EXPLORE = [
  ["/", "Home"],
  ["/about_us", "Our story"],
  ["/gallery", "Gallery"],
  ["/videos", "Videos"],
];
const TAKE_PART = [
  ["/register/participant", "Join the Challenge"],
  ["/support", "Support us"],
  ["/join", "Create an account"],
  ["/login", "Log in"],
];

const LinkList = ({ title, items }) => (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-kamaru-light">{title}</h3>
    <ul className="mt-4 space-y-2.5">
      {items.map(([to, label]) => (
        <li key={to}>
          <Link to={to} className="group inline-flex items-center gap-2 text-cream/80 transition-colors hover:text-cream">
            <span className="h-px w-0 bg-kamaru transition-all duration-300 group-hover:w-4" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchSystemImage("logo")
      .then((response) => {
        if (response.data.image) setLogo(response.data.image.image_url);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="relative overflow-hidden bg-earth text-cream">
      {/* Brand swirl pattern (from the Kamaru artwork), tinted orange */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-kamaru opacity-[0.12]"
        style={{
          WebkitMaskImage: "url(/brand/swirl-pattern.svg)",
          maskImage: "url(/brand/swirl-pattern.svg)",
          // One stretched copy: the artwork isn't designed to tile, so repeating shows seams
          WebkitMaskSize: "cover",
          maskSize: "cover",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      <div className="bead-band relative h-2.5" aria-hidden="true" />

      {/* Call-to-action band */}
      <div className="relative border-b border-cream/10">
        <div className="container mx-auto flex flex-col items-start gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="font-display text-3xl font-black leading-tight md:text-4xl">
              Keep the flame <span className="text-kamaru">burning.</span>
            </p>
            <p className="mt-2 text-cream/60">{TAGLINE_ENGLISH}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register/participant" className="k-btn-primary px-6 py-3">
              Join the Challenge
            </Link>
            <Link to="/support" className="k-btn bg-cream/10 px-6 py-3 text-cream hover:bg-cream hover:text-earth">
              Support us
            </Link>
          </div>
        </div>
      </div>

      <div className="container relative mx-auto px-5 py-14 md:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-5">
              <motion.div
                className="w-28 shrink-0 md:w-32"
                initial={{ rotate: -40, scale: 0.6, opacity: 0 }}
                whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
              >
                <BrandBadge className="h-full w-full drop-shadow-xl" ringColor="#D57500" textColor="#FBF3E8" emblemColor="#D57500" />
              </motion.div>
              {logo && <img src={cld(logo, 400)} alt="Kamaru Challenge" className="h-14 w-auto sm:hidden xl:block" />}
            </div>
            <p className="mt-6 font-sans text-lg font-semibold text-kamaru-light">{TAGLINE_KIKUYU}</p>
            <p className="mt-2 max-w-xs text-sm text-cream/60">Fanning the flame of values through music & culture.</p>
          </div>

          <LinkList title="Explore" items={EXPLORE} />
          <LinkList title="Take part" items={TAKE_PART} />

          {/* Contact + newsletter */}
          <div id="newsletter" className="scroll-mt-24">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-kamaru-light">Stay connected</h3>
            <p className="mt-4 text-sm text-cream/60">Be first to know when registration opens.</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-cream/80">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-kamaru" />
                {EDITION.venue}
              </li>
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <FaPhoneAlt className="text-kamaru" />
                {CONTACT.phones.map((ph, i) => (
                  <React.Fragment key={ph}>
                    {i > 0 && <span className="text-cream/30">|</span>}
                    <a href={`tel:${ph.replace(/\s/g, "")}`} className="hover:text-kamaru-light">
                      {ph}
                    </a>
                  </React.Fragment>
                ))}
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-kamaru-light">
                  <FaEnvelope className="text-kamaru" />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-cream/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cream/50">Follow us on</span>
            <SocialIcons className="flex gap-2" itemClassName="h-10 w-10 bg-cream/10 text-lg hover:bg-kamaru hover:text-earth" />
          </div>
          <div className="flex flex-col gap-1 text-sm text-cream/50 md:flex-row md:gap-6">
            <p>© {new Date().getFullYear()} Kamaru Challenge – Ndeiya Edition</p>
            <Link to="/terms" className="hover:text-kamaru-light">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ y: -4 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-kamaru text-earth shadow-xl"
            aria-label="Back to top"
          >
            <FaArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
