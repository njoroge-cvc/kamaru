import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowUp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import BrandBadge from "./BrandBadge";
import cvcLove from "../assets/cvc-love.svg";
import SocialIcons from "./SocialIcons";
import NewsletterForm from "./NewsletterSubscriptionForm";
import { TAGLINE_KIKUYU, CONTACT, EDITION } from "../content/story";

const EXPLORE = [
  ["/", "Home"],
  ["/about_us", "About us"],
  ["/blog", "Blog"],
  ["/gallery", "Gallery"],
  ["/videos", "Videos"],
];
const TAKE_PART = [
  ["/register/participant", "The Challenge"],
  ["/support", "Support us"],
  ["/join", "Join us"],
  ["/login", "Log in"],
];

const LinkList = ({ title, items }) => (
  <div>
    <h3 className="text-base font-bold uppercase tracking-[0.2em] text-kamaru-light md:text-lg">{title}</h3>
    <ul className="mt-4 space-y-2.5">
      {items.map(([to, label]) => (
        <li key={to}>
          <Link to={to} className="group inline-flex items-center gap-2 text-cream/80 transition-colors hover:text-cream">
            <span className="hidden h-px w-0 bg-kamaru transition-all duration-300 group-hover:w-4 sm:inline-block" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="relative overflow-hidden bg-earth text-cream swirl-bg">
      <div className="container relative mx-auto px-5 py-14 md:px-8">
        <div className="grid gap-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center gap-5 sm:justify-start">
              <motion.div
                className="w-28 shrink-0 md:w-32"
                initial={{ rotate: -40, scale: 0.6, opacity: 0 }}
                whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
              >
                <BrandBadge className="h-full w-full drop-shadow-xl" ringColor="#D57500" textColor="#FBF3E8" emblemColor="#D57500" />
              </motion.div>
            </div>
            <p lang="ki" className="mt-6 font-sans text-lg font-semibold text-kamaru-light">{TAGLINE_KIKUYU}</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-cream/60 sm:mx-0">Fanning the flame of values through music & culture.</p>
          </div>

          <LinkList title="Explore" items={EXPLORE} />
          <LinkList title="Take part" items={TAKE_PART} />

          {/* Contact + newsletter */}
          <div id="newsletter" className="scroll-mt-24">
            <h3 className="text-base font-bold uppercase tracking-[0.2em] text-kamaru-light md:text-lg">Stay connected</h3>
            <p className="mt-4 text-sm text-cream/60">Be first to know when registration opens.</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-cream/80">
              <li className="flex items-start justify-center gap-3 sm:justify-start">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-kamaru" />
                {EDITION.venue}
              </li>
              <li className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
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
                <a href={`mailto:${CONTACT.email}`} className="flex items-center justify-center gap-3 hover:text-kamaru-light sm:justify-start">
                  <FaEnvelope className="text-kamaru" />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-cream/10 pb-20 pt-6 text-center text-sm text-cream/50 md:pb-0">
          {/* Social links for screens without the vertical "Follow us on" rail */}
          <SocialIcons className="mb-4 flex gap-2 md:mb-0 xl:hidden" itemClassName="h-10 w-10 bg-cream/10 text-lg text-cream hover:bg-kamaru hover:text-earth" />
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-cream/50 md:flex-row md:gap-6">
            <p>© {new Date().getFullYear()} Kamaru Challenge</p>
            <Link to="/terms" className="hover:text-kamaru-light">
              Terms & Conditions
            </Link>
            {/* Developer credit: a normal (followed) link, so it also counts for the studio's SEO */}
            <p className="flex items-center justify-center gap-1.5">
              Crafted with{" "}
              <img src={cvcLove} alt="love" className="inline-block h-8 w-auto" />{" "}
              by{" "}
              {/* Referrer kept on purpose so the studio's analytics can see visits from this site */}
              {/* eslint-disable-next-line react/jsx-no-target-blank */}
              <a
                href="https://colourfulvisualcommunication.com/"
                target="_blank"
                rel="noopener"
                className="font-semibold text-cream/70 underline-offset-4 hover:text-kamaru-light hover:underline"
              >
                Colourful Visual Communication
              </a>
            </p>
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
