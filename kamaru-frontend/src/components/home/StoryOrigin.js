import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { QUOTE } from "../../content/story";
import flame from "../../assets/flame.svg";
import ReadMore from "../ReadMore";

// One word whose opacity/colour is driven by scroll progress
const Word = ({ children, progress, range, dim, bright, strong }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, [dim, bright]);
  return (
    <span className={`relative mr-[0.25em] inline-block ${strong ? "font-bold" : ""}`}>
      <motion.span style={{ opacity, color }}>{children}</motion.span>
    </span>
  );
};

/**
 * Text that lights up word by word as it scrolls through the viewport.
 * `parts`: array of strings or { text, strong } segments.
 */
const ScrollLit = ({ parts, as: Tag = "p", className = "", dim = "#6B4A33", bright = "#2B1A10", offset = ["start 0.9", "end 0.55"] }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const words = parts.flatMap((p) => {
    const seg = typeof p === "string" ? { text: p } : p;
    return seg.text.split(" ").filter(Boolean).map((w) => ({ w, strong: seg.strong }));
  });
  return (
    <Tag ref={ref} className={className}>
      {words.map(({ w, strong }, i) => {
        const start = i / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} dim={dim} bright={bright} strong={strong}>
            {w}
          </Word>
        );
      })}
    </Tag>
  );
};

/** Any block that fades/rises in step with scroll (used for the flame and fault lines). */
const ScrollFade = ({ children, className = "", offset = ["start 0.95", "start 0.6"] }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.12, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};

const FAULT_LINES = [
  { text: "Broken families", bg: "#D7262E" },
  { text: "Alcoholism", bg: "#2588C9" },
  { text: "Youth, especially men, disengaged from family and community", bg: "#3E9B4F" },
];

const StoryOrigin = () => (
  <section id="story" className="relative overflow-hidden bg-cream">
    <div className="container mx-auto flex max-w-4xl flex-col items-center px-5 py-24 text-center md:px-8 md:py-36">
      <ScrollFade offset={["start 0.95", "start 0.75"]}>
        <p className="k-eyebrow text-ochre">Kūhurutira Mwaki na Nyīmbo. Fanning the Flame with music</p>
      </ScrollFade>

      {/* The quote */}
      <blockquote className="mt-10">
        <ScrollLit
          parts={[`“${QUOTE.text}”`]}
          className="font-display text-3xl leading-[1.2] sm:text-4xl md:text-5xl"
          offset={["start 0.85", "end 0.5"]}
        />
        <ScrollLit
          as="footer"
          parts={[`${QUOTE.author}, ${QUOTE.role}`]}
          className="mt-6 font-semibold"
          dim="#9CCBA5"
          bright="#3E9B4F"
          offset={["start 0.9", "end 0.75"]}
        />
      </blockquote>

      {/* Flame anchor */}
      <ScrollFade className="mt-20 md:mt-28">
        <img src={flame} alt="" aria-hidden="true" className="mx-auto w-40 md:w-56" />
      </ScrollFade>

      {/* The two paragraphs, one after the other (Read more on phones) */}
      <ReadMore className="w-full" collapsedHeight={230}>
        <ScrollLit
          className="mt-12 text-xl leading-relaxed md:text-2xl"
          parts={[
            "We believe Africans have grown",
            { text: "indifferent", strong: true },
            "towards the unique values that established them as a dignified and happy community, an indifference hastened by colonial ideologies that taught many to see their own culture as something to be ashamed of.",
          ]}
        />
        <ScrollLit
          className="mt-10 text-xl leading-relaxed md:text-2xl"
          parts={[
            "After independence, material wealth and borrowed education became the marks of a good leader, rather than the timeless values our communities had always taught. The cost is visible in the fault lines around us:",
          ]}
        />
      </ReadMore>

      {/* Fault lines, revealed one by one in a single column */}
      <div className="mt-12 flex w-full flex-col items-center gap-4">
        {FAULT_LINES.map((f) => (
          <ScrollFade key={f.text} offset={["start 0.95", "start 0.7"]}>
            <span className="k-quad inline-block px-6 py-3 font-semibold text-cream md:text-lg" style={{ backgroundColor: f.bg }}>
              {f.text}
            </span>
          </ScrollFade>
        ))}
      </div>
    </div>
  </section>
);

export default StoryOrigin;
