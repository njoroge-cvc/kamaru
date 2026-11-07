import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem } from "../motion";
import { VALUES } from "../../content/story";

const ValueCard = ({ value, index }) => (
  <motion.article
    whileHover={{ y: -10, rotate: index % 2 ? 1.5 : -1.5 }}
    transition={{ type: "spring", stiffness: 260, damping: 18 }}
    className="relative h-full w-[78vw] sm:w-[22rem] shrink-0 overflow-hidden rounded-[2rem] p-8 text-cream shadow-xl"
    style={{ backgroundColor: value.color }}
  >
    <span className="absolute -right-4 -top-8 font-display text-[9rem] font-black leading-none text-black/10 select-none">
      {String(index + 1).padStart(2, "0")}
    </span>
    <div className="relative flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
      <div className="mb-6 flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: index + 1 }).map((_, i) => (
          <span key={i} className="h-3 w-3 rounded-full bg-cream/80 ring-2 ring-black/10" />
        ))}
      </div>
      <h3 className="font-display text-4xl font-bold">{value.name}</h3>
      <p className="mt-3 text-lg text-cream/85">{value.line}</p>
    </div>
  </motion.article>
);

const StoryValues = () => {
  const ref = useRef(null);
  // Pinned horizontal scroll on large screens
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setDistance(Math.max(0, el.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);

  return (
    <section className="relative bg-earth text-cream grain swirl-bg">

      {/* Desktop: sticky horizontal ride */}
      <div ref={ref} className="relative hidden lg:block h-[260vh]">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="container mx-auto px-8 mb-12">
            <SectionHeading
              light
              align="left"
              eyebrow="Mītugo īītū, What We Stand For"
              title="Our Timeless Values"
              intro="Communality, Reverence, Justice, Courage, Diligence, Introspection and Self-control, the values that once made us a dignified, happy community. Every performance on the Kamaru stage carries one of them forward."
            />
          </div>
          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 pl-8">
            {VALUES.map((v, i) => (
              <ValueCard key={v.name} value={v} index={i} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile / tablet: swipeable row */}
      <div className="lg:hidden py-20">
        <div className="px-5 md:px-8">
          <SectionHeading
            light
            align="left"
            eyebrow="Mītugo īītū, What We Stand For"
            title="Our Timeless Values"
            intro="The values that once made us a dignified, happy community, carried forward by every performance."
          />
        </div>
        <Stagger className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 md:scroll-px-8 px-5 md:px-8 pb-4 [scrollbar-width:none]">
          {VALUES.map((v, i) => (
            <StaggerItem key={v.name} className="snap-start">
              <ValueCard value={v} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default StoryValues;
