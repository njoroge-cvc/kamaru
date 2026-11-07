import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SocialIcons from "./SocialIcons";

// Irregular four-sided shapes the tab slowly morphs between (hand-cut, not a rectangle)
const QUADS = [
  "polygon(0% 2%, 100% 8%, 88% 97%, 4% 100%)",
  "polygon(3% 0%, 96% 5%, 100% 93%, 0% 98%)",
  "polygon(0% 5%, 92% 0%, 96% 100%, 6% 95%)",
  "polygon(0% 2%, 100% 8%, 88% 97%, 4% 100%)",
];

const LABEL = "Support us ✦ ";

/**
 * Floating "Support us" tab. Lives in the left margin outside the page content, so it only
 * renders on screens wide enough to have that margin (≥1360px).
 */
const SupportTab = () => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="fixed left-3 top-[22%] z-40 hidden min-[1360px]:block"
      initial={{ x: -90, opacity: 0 }}
      animate={reduce ? { x: 0, opacity: 1 } : { x: 0, opacity: 1, y: [0, -10, 0], rotate: [-3, -1, -3] }}
      transition={{
        x: { delay: 1.2, type: "spring", stiffness: 110 },
        opacity: { delay: 1.2 },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Link to="/support" aria-label="Support us" className="group block">
        <motion.span
          className="relative block w-14 bg-bead-gold py-4 text-earth shadow-xl shadow-black/20 transition-colors group-hover:bg-kamaru"
          animate={reduce ? undefined : { clipPath: QUADS }}
          style={{ clipPath: QUADS[0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
        >
          {/* Scrolling vertical label */}
          <span className="relative mx-auto block h-44 w-full overflow-hidden" aria-hidden="true">
            <motion.span
              className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center"
              animate={reduce ? undefined : { y: ["0%", "-50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              {[0, 1].map((k) => (
                <span
                  key={k}
                  className="whitespace-nowrap text-sm font-black uppercase tracking-[0.25em] [writing-mode:vertical-rl] rotate-180"
                >
                  {LABEL.repeat(3)}
                </span>
              ))}
            </motion.span>
            {/* soft fade at both ends of the window */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-bead-gold to-transparent group-hover:from-kamaru" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-bead-gold to-transparent group-hover:from-kamaru" />
          </span>
        </motion.span>
      </Link>
    </motion.div>
  );
};

// Work out what the rail is sitting on: "dark" (earth/photos), "accent" (brand orange) or "light" (cream/white).
const toneAt = (x, y, ignore) => {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (ignore && ignore.contains(el)) continue;
    if (["IMG", "VIDEO", "IFRAME", "CANVAS"].includes(el.tagName)) return "dark";
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = 1] = m.map(Number);
    if (a < 0.5) continue;
    if (r > 170 && g > 70 && g < 170 && b < 90) return "accent";
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.45 ? "dark" : "light";
  }
  return "light";
};

// Rail colours per background — always the opposite of what's behind it
const RAIL_TONES = {
  light: { label: "text-ochre", line: "bg-ochre/40", icon: "bg-earth text-cream hover:bg-kamaru hover:text-earth" },
  dark: { label: "text-kamaru-light", line: "bg-cream/30", icon: "bg-cream text-earth hover:bg-kamaru hover:text-earth" },
  accent: { label: "text-earth", line: "bg-earth/40", icon: "bg-earth text-kamaru hover:bg-cream hover:text-earth" },
};

/** Tracks the background tone under `ref` as the page scrolls. */
const useBackdropTone = (ref, active) => {
  const [tone, setTone] = useState("light");
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      setTone(toneAt(r.left + r.width / 2, r.top + r.height / 2, el));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const t = setTimeout(update, 400); // after the entrance animation
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, active]);
  return tone;
};

/**
 * Edge furniture for the public site (desktop):
 *  - a floating "Support us" tab in the left margin (quadrilateral, scrolling label)
 *  - a vertical "Follow us on" social rail, as on the printed event programme
 * Both stay out of the admin area; the tab hides on the support page itself.
 */
const SideRails = () => {
  const { pathname } = useLocation();
  const [pastHero, setPastHero] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const isAdmin = pathname.startsWith("/admin");
  const showTab = pathname !== "/support";
  // On the home page the hero has its own social bar, so the rail appears after it
  const showRail = !isAdmin && (pathname !== "/" || pastHero);
  const tone = useBackdropTone(railRef, showRail);
  const t = RAIL_TONES[tone];

  if (isAdmin) return null;

  return (
    <>
      {showTab && <SupportTab />}

      <AnimatePresence>
        {showRail && (
          <motion.aside
            ref={railRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-8 left-4 z-40 hidden xl:flex [@media(max-height:760px)]:!hidden flex-col items-center gap-3"
            aria-label="Follow us"
            data-tone={tone}
          >
            <span className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-colors duration-500 [writing-mode:vertical-rl] rotate-180 ${t.label}`}>
              Follow us on
            </span>
            <span className={`h-8 w-px transition-colors duration-500 ${t.line}`} />
            <SocialIcons vertical className="flex flex-col gap-2" itemClassName={`h-9 w-9 ${t.icon}`} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideRails;
