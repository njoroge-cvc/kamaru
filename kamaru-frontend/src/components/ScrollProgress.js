import React from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";

/** Reading progress: one thin orange line running down the right edge of the screen. */
const ScrollProgress = () => {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[60] h-screen w-[3px] bg-earth/10" aria-hidden="true">
      <motion.div style={{ scaleY }} className="h-full w-full origin-top bg-kamaru" />
    </div>
  );
};

export default ScrollProgress;
