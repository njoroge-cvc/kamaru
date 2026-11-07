import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { QUOTE } from "../../content/story";
import { Shield } from "./Ornaments";

// A single word whose opacity is driven by scroll progress through the quote
const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, ["#6B4A33", "#2B1A10"]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity, color }}>{children}</motion.span>
    </span>
  );
};

const FAULT_LINES = ["Broken families", "Alcoholism", "Youth — especially men — disengaged from family and community"];

const StoryOrigin = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = QUOTE.text.split(" ");

  return (
    <section id="story" className="relative bg-cream overflow-hidden">
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-36">
        <Reveal>
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-ochre">
            Chapter one · The flame was dimming
          </p>
        </Reveal>

        <blockquote ref={ref} className="mt-8 max-w-5xl">
          <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15]">
            <span className="text-kamaru">“</span>
            {words.map((w, i) => {
              const start = i / words.length;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                  {w}
                </Word>
              );
            })}
            <span className="text-kamaru">”</span>
          </p>
          <Reveal delay={0.1}>
            <footer className="mt-6 text-earth-600">
              — {QUOTE.author}, <span className="italic">{QUOTE.role}</span>
            </footer>
          </Reveal>
        </blockquote>

        <div className="mt-20 md:mt-28 grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-start">
          <Reveal className="hidden md:block" x={-30} y={0}>
            <Shield className="w-24 lg:w-32" />
          </Reveal>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            <Reveal>
              <p className="text-lg md:text-xl leading-relaxed text-earth-700">
                We believe Africans have grown <strong className="text-earth">indifferent</strong> towards the
                unique values that established them as a dignified and happy community — an indifference hastened
                by colonial ideologies that taught many to see their own culture as something to be ashamed of.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl leading-relaxed text-earth-700">
                After independence, material wealth and borrowed education became the marks of a good leader —
                rather than the timeless values our communities had always taught. The cost is visible in the
                fault lines around us:
              </p>
            </Reveal>
            <Stagger className="lg:col-span-2 flex flex-wrap gap-3">
              {FAULT_LINES.map((f) => (
                <StaggerItem
                  key={f}
                  className="rounded-full border-2 border-dashed border-ochre/40 px-5 py-2.5 text-ochre-dark font-medium"
                >
                  {f}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryOrigin;
