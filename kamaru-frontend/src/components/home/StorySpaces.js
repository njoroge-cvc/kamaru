import React, { useRef } from "react";
import { cld } from "../../utils/cloudinary";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLeaf, FaFire, FaArrowRight } from "react-icons/fa";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { SPACES, ACTIVITIES } from "../../content/story";
import { SunSpiral } from "./Ornaments";

const StorySpaces = ({ aboutImage }) => {
  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const lineScale = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <section id="about" className="relative bg-cream overflow-hidden">
      <SunSpiral className="pointer-events-none absolute -right-24 top-24 w-72 opacity-10" />
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
        <SectionHeading
          eyebrow="Fanning the flame"
          title="We chose to do our part"
          intro="To help our community rediscover and reconnect with its identity, we opened two spaces in Nguirubi, Ndeiya — free and open for community healing through authentic knowledge and shared experience."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Patron portrait with parallax */}
          <Reveal className="relative">
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
            <div className="absolute -z-0 -bottom-6 -left-2 md:left-6 h-24 w-24 rounded-full bg-kamaru opacity-90" />
          </Reveal>

          <div>
            <Stagger className="grid sm:grid-cols-2 gap-5">
              {SPACES.map((s, i) => (
                <StaggerItem
                  key={s.name}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-earth/5 hover:shadow-lg transition-shadow"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-cream text-xl ${
                      i === 0 ? "bg-ochre" : "bg-bead-green"
                    }`}
                  >
                    {i === 0 ? <FaFire /> : <FaLeaf />}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-earth">{s.name}</h3>
                  <p className="mt-2 text-earth-700">{s.blurb}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1}>
              <h3 className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-ochre">
                Gatherings held since 2022 — all free of charge
              </h3>
            </Reveal>
            <div className="relative mt-6 pl-8">
              <motion.span
                style={{ scaleY: lineScale }}
                className="absolute left-2.5 top-1 bottom-1 w-0.5 origin-top bg-gradient-to-b from-kamaru via-ochre to-bead-green"
              />
              <Stagger className="space-y-5" stagger={0.12}>
                {ACTIVITIES.map((a) => (
                  <StaggerItem key={a} className="relative">
                    <span className="absolute -left-[1.85rem] top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-cream bg-kamaru shadow" />
                    <p className="text-lg text-earth">{a}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <Reveal delay={0.2}>
              <Link
                to="/about_us"
                className="group mt-10 inline-flex items-center gap-2 font-semibold text-ochre hover:text-earth"
              >
                Read our full story
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
