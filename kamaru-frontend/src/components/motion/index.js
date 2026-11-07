// Reusable Framer Motion primitives for the public site.
// All of them respect the user's reduced-motion setting via <MotionConfig reducedMotion="user"> in App.js.
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

/** Fade + rise into view once. */
export const Reveal = ({
  children,
  delay = 0,
  y = 32,
  x = 0,
  className = "",
  as = "div",
  once = true,
  amount = 0.25,
}) => {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
};

/** Parent that staggers its <StaggerItem> children. */
export const Stagger = ({ children, className = "", stagger = 0.08, delay = 0, amount = 0.2 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: stagger, delayChildren: delay } },
    }}
  >
    {children}
  </motion.div>
);

export const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const StaggerItem = ({ children, className = "", ...rest }) => (
  <motion.div className={className} variants={staggerItem} {...rest}>
    {children}
  </motion.div>
);

/** Splits text into words that rise up in sequence. */
export const SplitWords = ({ text, className = "", wordClassName = "", delay = 0, stagger = 0.06, animateOnMount = false }) => {
  const words = text.split(" ");
  const trigger = animateOnMount
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.5 } };
  return (
    <motion.span
      className={className}
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]" aria-hidden="true">
          <motion.span
            className={`inline-block ${wordClassName}`}
            variants={{
              hidden: { y: "110%", rotate: 4 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

/** Number that counts up when scrolled into view. */
export const CountUp = ({ to = 0, duration = 1.6, prefix = "", suffix = "", className = "", format = true }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(to);
      return;
    }
    mv.set(to);
  }, [inView, to, mv, reduce]);

  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  const shown = format ? Number(display).toLocaleString("en-KE") : display;
  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
};

/** Infinite horizontal marquee. Children are duplicated for a seamless loop. */
export const Marquee = ({ children, reverse = false, className = "", trackClassName = "" }) => (
  <div className={`overflow-hidden ${className}`}>
    <div
      className={`marquee-track flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} ${trackClassName}`}
    >
      <div className="flex shrink-0">{children}</div>
      <div className="flex shrink-0" aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);

/** Section eyebrow + heading combo used across the story. */
export const SectionHeading = ({ eyebrow, title, intro, light = false, align = "center", className = "" }) => (
  <div className={`${align === "center" ? "text-center mx-auto" : ""} max-w-3xl ${className}`}>
    {eyebrow && (
      <Reveal>
        <p className={`k-eyebrow ${light ? "text-kamaru-light" : "text-ochre"}`}>{eyebrow}</p>
      </Reveal>
    )}
    <h2
      className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mt-4 text-balance ${
        light ? "text-cream" : "text-earth"
      }`}
    >
      <SplitWords text={title} />
    </h2>
    {intro && (
      <Reveal delay={0.15}>
        <p className={`mt-5 text-lg md:text-xl leading-relaxed ${light ? "text-cream/75" : "text-earth-700"}`}>
          {intro}
        </p>
      </Reveal>
    )}
  </div>
);
