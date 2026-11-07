import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SplitWords, Reveal } from "./motion";
import { SunSpiral } from "./home/Ornaments";
import { kk } from "./Kikuyu";

// Dark, patterned page header shared by Gallery, Videos and About pages
const PageHero = ({ crumb, eyebrow, title, intro }) => (
  <header className="relative overflow-hidden bg-earth text-cream grain swirl-bg">
    <SunSpiral className="pointer-events-none absolute -right-16 -top-16 w-64 md:w-80 opacity-25" />
    <div className="relative container mx-auto px-5 md:px-8 pt-10 pb-16 md:pt-14 md:pb-20 text-center md:text-left">
      <nav className="text-sm text-cream/60">
        <Link to="/" className="hover:text-kamaru-light">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-cream">{crumb}</span>
      </nav>
      <p className="k-eyebrow mt-8 text-kamaru-light">{kk(eyebrow)}</p>
      <motion.div
        className="mt-4 inline-block max-w-4xl bg-kamaru px-6 py-5 md:px-10 md:py-7 text-earth shadow-2xl"
        style={{ clipPath: "polygon(1.5% 8%, 100% 0, 98.5% 100%, 0 94%)" }}
        initial={{ opacity: 0, rotate: -3, y: 30 }}
        animate={{ opacity: 1, rotate: -1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05]">
          <SplitWords text={title} animateOnMount delay={0.2} />
        </h1>
      </motion.div>
      {intro && (
        <Reveal delay={0.3}>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-cream/70 md:mx-0">{intro}</p>
        </Reveal>
      )}
    </div>
  </header>
);

export default PageHero;
