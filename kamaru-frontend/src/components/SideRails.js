import React, { useEffect, useState } from "react";
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

/**
 * Edge furniture for the public site (desktop):
 *  - a floating "Support us" tab in the left margin (quadrilateral, scrolling label)
 *  - a vertical "Follow us on" social rail, as on the printed event programme
 * Both stay out of the admin area; the tab hides on the support page itself.
 */
const SideRails = () => {
  const { pathname } = useLocation();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;
  const showTab = pathname !== "/support";
  // On the home page the hero has its own social bar, so the rail appears after it
  const showRail = pathname !== "/" || pastHero;

  return (
    <>
      {showTab && <SupportTab />}

      <AnimatePresence>
        {showRail && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-8 left-4 z-40 hidden xl:flex [@media(max-height:760px)]:!hidden flex-col items-center gap-3"
            aria-label="Follow us"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-kamaru [writing-mode:vertical-rl] rotate-180">
              Follow us on
            </span>
            <span className="h-8 w-px bg-kamaru/50" />
            <SocialIcons
              vertical
              className="flex flex-col gap-2"
              itemClassName="h-9 w-9 bg-cream/90 text-kamaru backdrop-blur hover:bg-kamaru hover:text-cream"
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideRails;
