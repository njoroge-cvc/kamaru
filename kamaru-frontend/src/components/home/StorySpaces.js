import React, { useRef } from "react";
import { cld } from "../../utils/cloudinary";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLeaf, FaFire, FaArrowRight } from "react-icons/fa";
import { CountUp, Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { SPACES, OUR_PART, SEASONS_HELD } from "../../content/story";
import { SunSpiral } from "./Ornaments";
import { kk } from "../Kikuyu";
import ReadMore from "../ReadMore";

// "Itemi Riitū, Our Part": what we do each August, where, and why
const StorySpaces = ({ aboutImage }) => {
  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" className="relative bg-cream overflow-hidden">
      <SunSpiral className="pointer-events-none absolute -right-24 top-24 w-72 opacity-10" />
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
        <SectionHeading eyebrow="The annual Kamaru Challenge" title="Itemi Riitū, Our Part" />

        <div className="mt-16 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          {/* Patron portrait with parallax */}
          <Reveal className="relative lg:sticky lg:top-32">
            <div ref={imgRef} className="relative mx-auto max-w-md aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-earth-700 shadow-2xl">
              {aboutImage ? (
                <motion.img
                  src={cld(aboutImage, 1000)}
                  alt="Paul Ndung'u Kioi, Patron of the Kamaru Challenge"
                  style={{ y: imgY, scale: 1.18 }}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-earth-600 to-earth-800" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth/90 to-transparent p-6 pt-20 text-cream">
                <p className="font-display text-2xl font-semibold">Paul Ndung'u Kioi</p>
                <p className="text-sm text-cream/70">Patron, Kamaru Challenge</p>
              </div>
            </div>
          </Reveal>

          <div>
            <ReadMore collapsedHeight={260}>
            <Stagger className="space-y-5 text-center md:text-left" stagger={0.1}>
              {OUR_PART.map((para, i) => (
                <StaggerItem key={i}>
                  <p className={`leading-relaxed text-earth ${i === 0 ? "text-xl md:text-2xl" : "text-lg md:text-xl text-earth-700"}`}>{para}</p>
                </StaggerItem>
              ))}
            </Stagger>
            </ReadMore>

            {/* Our spaces */}
            <Reveal delay={0.1}>
              <p className="mt-12 text-center font-display text-2xl text-ochre md:text-left">Our spaces</p>
            </Reveal>
            <Stagger className="mt-5 grid sm:grid-cols-2 gap-5">
              {SPACES.map((s, i) => (
                <StaggerItem key={s.name} className={`k-cut-strong flex flex-col items-center p-6 text-center text-cream md:items-start md:text-left ${i === 0 ? "bg-ochre" : "bg-forest"}`}>
                  <span className="grid h-12 w-12 place-items-center k-quad-shape bg-cream/15 text-xl">
                    {i === 0 ? <FaFire /> : <FaLeaf />}
                  </span>
                  <h3 className="mt-6 font-display text-2xl leading-snug">{kk(s.name)}</h3>
                  <p className="mt-3 leading-relaxed text-cream/85">{s.blurb}</p>
                </StaggerItem>
              ))}
            </Stagger>

            {/* Seasons so far */}
            <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 md:justify-start">
              <div className="k-cut-strong flex items-center gap-4 bg-earth px-6 py-4 text-cream">
                <span className="font-display text-6xl text-kamaru leading-none">
                  <CountUp to={SEASONS_HELD} />
                </span>
                <span className="font-display text-xl leading-tight">
                  Seasons and counting,
                  <br />
                  <span className="text-kamaru-light">and more…</span>
                </span>
              </div>
              <Link to="/about_us" className="k-btn-primary group px-7 py-4 text-base">
                Read Our Full Story
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySpaces;
