import React, { useState, useEffect, useRef } from "react";
import { cld } from "../utils/cloudinary";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { fetchSystemImage } from "../api";
import SocialIcons from "./SocialIcons";
import { useSession } from "./useSession";
import { useBackdropTone } from "../utils/backdropTone";
import { clearSession, PERMS } from "../auth";
import { CONTACT, TAGLINE_KIKUYU } from "../content/story";

// Visible in the brush-stroke band on desktop
const QUICK_LINKS = [
  { to: "/", text: "Home", end: true },
  { to: "/#events", text: "Events", hash: true },
  { to: "/gallery", text: "Gallery" },
  { to: "/videos", text: "Videos" },
  { to: "/register/participant", text: "Participate" },
];

// Full-screen "More" menu — one flat list, no nested dropdowns
const MENU = [
  { to: "/", text: "Home" },
  { to: "/about_us", text: "Our Story" },
  { to: "/#events", text: "Events", hash: true },
  { to: "/register/participant", text: "Join the Challenge" },
  { to: "/support", text: "Support Us" },
  { to: "/gallery", text: "Gallery" },
  { to: "/videos", text: "Videos" },
  { to: "/#contact", text: "Get in touch", hash: true },
];

const AnyLink = ({ item, className, onClick, children, ...rest }) =>
  item.hash ? (
    <HashLink smooth to={item.to} className={className} onClick={onClick} {...rest}>
      {children}
    </HashLink>
  ) : (
    <Link to={item.to} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );

/** Three bead dots — the "MORE ●●●" affordance. */
const Beads = ({ open }) => (
  <span className="flex gap-1.5" aria-hidden="true">
    {["#D7262E", "#E8B21E", "#2588C9"].map((c, i) => (
      <motion.span
        key={c}
        className="block h-3 w-3 rounded-full"
        style={{ backgroundColor: c }}
        animate={open ? { scale: 0 } : { y: [0, -4, 0] }}
        transition={open ? { duration: 0.2 } : { duration: 1.2, repeat: Infinity, repeatDelay: 2.4, delay: i * 0.12 }}
      />
    ))}
  </span>
);

const FullMenu = ({ open, onClose, logo, token, isAdmin, onLogout }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const item = { hidden: { opacity: 0, y: 40, rotate: 2 }, show: { opacity: 1, y: 0, rotate: 0 } };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          className="fixed inset-0 z-[90] overflow-y-auto bg-kamaru text-earth"
          initial={{ clipPath: "circle(0% at 92% 4%)" }}
          animate={{ clipPath: "circle(150% at 92% 4%)" }}
          exit={{ clipPath: "circle(0% at 92% 4%)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="chevron-band pointer-events-none absolute inset-x-0 bottom-0 h-8 opacity-20" style={{ "--c1": "#2B1A10" }} />

          <div className="container relative mx-auto flex min-h-full flex-col px-5 md:px-8 py-5">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={onClose}>
                {logo ? (
                  <img src={cld(logo, 400)} alt="Kamaru Challenge" className="h-12 w-auto brightness-0 opacity-80" />
                ) : (
                  <span className="font-display text-2xl font-black">Kamaru.</span>
                )}
              </Link>
              <button
                onClick={onClose}
                className="group flex items-center gap-3 font-bold uppercase tracking-[0.2em] text-sm"
                aria-label="Close menu"
              >
                Less
                <span className="grid h-12 w-12 place-items-center rounded-full bg-earth text-kamaru text-xl transition-transform group-hover:rotate-90">
                  <FaTimes />
                </span>
              </button>
            </div>

            <motion.nav
              className="my-auto py-10 text-center"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
            >
              <ul className="space-y-1 md:space-y-2">
                {MENU.map((m) => (
                  <motion.li key={m.to} variants={item} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                      <AnyLink
                        item={m}
                        onClick={onClose}
                        className="relative inline-block font-display text-4xl md:text-5xl font-black leading-tight hover:text-cream transition-colors"
                      >
                        {m.text}
                      </AnyLink>
                  </motion.li>
                ))}
                {isAdmin && (
                  <motion.li variants={item}>
                    <Link to="/admin" onClick={onClose} className="font-display text-3xl md:text-4xl font-black text-earth/70 hover:text-cream">
                      Dashboard
                    </Link>
                  </motion.li>
                )}
              </ul>

              <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-3">
                {!token ? (
                  <>
                    <Link to="/login" onClick={onClose} className="rounded-full bg-earth/15 px-7 py-3 font-bold hover:bg-earth hover:text-kamaru transition">
                      Login
                    </Link>
                    <Link to="/join" onClick={onClose} className="rounded-full bg-earth px-7 py-3 font-bold text-kamaru hover:bg-earth-700 transition">
                      Join
                    </Link>
                  </>
                ) : (
                  <button onClick={onLogout} className="rounded-full bg-earth/15 px-7 py-3 font-bold hover:bg-earth hover:text-kamaru transition">
                    Logout
                  </button>
                )}
              </motion.div>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              className="flex flex-col items-center gap-4 border-t border-earth/15 pt-5 pb-8 text-sm md:flex-row md:justify-between"
            >
              <p className="font-sans font-semibold text-base">{TAGLINE_KIKUYU}</p>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold">
                <a href={`tel:${CONTACT.phones[0].replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-cream">
                  <FaPhoneAlt /> {CONTACT.phones[0]}
                </a>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-cream">
                  <FaEnvelope /> {CONTACT.email}
                </a>
              </div>
              <SocialIcons itemClassName="h-10 w-10 bg-earth text-kamaru hover:bg-cream hover:text-earth" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navbar colours follow the section beneath it, always contrasting with it
const NAV_TONES = {
  // At the very top of the page the bar is white; the brand's black wordmark variant keeps the logo legible
  top: { bg: "#FFFFFF", stripe: "#D57500", text: "text-earth", link: "text-earth/80 hover:text-earth hover:bg-earth/5", active: "bg-earth text-cream", join: "bg-kamaru text-earth hover:bg-kamaru-light", more: "text-ochre", logo: "brightness-0" },
  light: { bg: "#2B1A10", stripe: "#D57500", text: "text-cream", link: "text-cream/85 hover:text-cream hover:bg-cream/10", active: "bg-kamaru text-earth", join: "bg-kamaru text-earth hover:bg-kamaru-light", more: "text-bead-gold", logo: "" },
  dark: { bg: "#D57500", stripe: "#2B1A10", text: "text-earth", link: "text-earth/85 hover:text-earth hover:bg-earth/10", active: "bg-earth text-kamaru", join: "bg-earth text-kamaru hover:bg-earth-700", more: "text-earth", logo: "brightness-0" },
  accent: { bg: "#FBF3E8", stripe: "#2B1A10", text: "text-earth", link: "text-earth/80 hover:text-earth hover:bg-earth/10", active: "bg-earth text-cream", join: "bg-kamaru text-earth hover:bg-kamaru-light", more: "text-ochre", logo: "" },
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navRef = useRef(null);
  // Sample just below the bar, across the middle of the page
  const tone = useBackdropTone(navRef, true, (r) => [window.innerWidth / 2, r.bottom + 12]);
  const T = NAV_TONES[scrolled ? tone : "top"];

  const { token, permissions } = useSession();
  const isAdmin = permissions.includes(PERMS.DASHBOARD); // any staff role sees the dashboard link

  useEffect(() => {
    fetchSystemImage("logo")
      .then((response) => {
        if (response.data.image) setLogo(response.data.image.image_url);
      })
      .catch((error) => console.error("Error fetching logo:", error));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on any navigation
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  const handleLogout = () => {
    clearSession();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav ref={navRef} className={`sticky top-0 z-50 transition-colors duration-500 ${T.text}`} data-tone={scrolled ? tone : "top"}>
        {/* Contrasting stripe that shows under the hand-cut bottom edge */}
        <motion.div aria-hidden="true" className="absolute inset-0" animate={{ backgroundColor: T.stripe }} transition={{ duration: 0.5 }} />
        {/* Hand-cut slab */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 shadow-xl shadow-black/20"
          initial={false}
          animate={{
            backgroundColor: T.bg,
            clipPath: scrolled
              ? "polygon(0% 0%, 100% 0%, 99.6% 90%, 0.4% 100%)"
              : "polygon(0% 0%, 100% 0%, 99.4% 80%, 0.6% 100%)",
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <div
          className={`relative container mx-auto flex items-center justify-between gap-6 px-5 md:px-8 transition-all duration-300 ${
            scrolled ? "pt-3 pb-4" : "pt-5 pb-8"
          }`}
        >
          <Link to="/" className="shrink-0" aria-label="Kamaru Challenge home">
            {logo ? (
              <motion.img
                src={cld(logo, 480)}
                alt="Kamaru Challenge Logo"
                animate={{ height: scrolled ? 56 : 76 }}
                style={{ height: 76 }}
                className={`w-auto transition-[filter] duration-500 ${T.logo}`}
              />
            ) : (
              <span className="font-display text-3xl tracking-tight">
                Kamaru<span className="text-kamaru">.</span>
              </span>
            )}
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {QUICK_LINKS.map((l) => (
              <li key={l.text}>
                {l.hash ? (
                  <HashLink smooth to={l.to} className={`k-quad block px-4 py-2.5 text-base font-bold ${T.link}`}>
                    {l.text}
                  </HashLink>
                ) : (
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) => `k-quad block px-4 py-2.5 text-base font-bold ${isActive ? T.active : T.link}`}
                  >
                    {l.text}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {!token && (
              <>
                <Link to="/login" className="k-quad hidden xl:inline px-3 py-2 text-sm font-semibold uppercase tracking-[0.15em] opacity-80 hover:opacity-100">
                  Login
                </Link>
                <Link to="/join" className={`k-quad hidden md:inline-flex items-center px-6 py-2.5 text-sm font-bold uppercase tracking-[0.15em] ${T.join}`}>
                  Join
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="k-quad hidden xl:inline px-3 py-2 text-sm font-semibold uppercase tracking-[0.15em] opacity-80 hover:opacity-100">
                Dashboard
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className={`k-quad group flex items-center gap-3 py-2 pl-3 pr-2 text-sm font-bold uppercase tracking-[0.2em] ${T.more}`}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              More
              <Beads open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>

      <FullMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        logo={logo}
        token={token}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
