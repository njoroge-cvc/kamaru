import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFeatherAlt, FaDrum, FaMicrophoneAlt, FaArrowRight, FaTrophy } from "react-icons/fa";
import { CountUp, Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { CATEGORIES, PRIZES } from "../../content/story";
import { SoundBars } from "./Ornaments";

export const CATEGORY_ICONS = { feather: FaFeatherAlt, drum: FaDrum, mic: FaMicrophoneAlt };
const CARD_BG = ["bg-ochre", "bg-forest", "bg-night"];

const StoryChallenge = () => (
  <section id="challenge" className="relative bg-kamaru overflow-hidden">
    <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Nyīmbo Ciitū"
          title="The Kamaru Challenge"
          intro="An annual competition where Ndeiya discovers and showcases its talent, creatively, in the Kikuyu language, and always in service of the timeless values."
          className="[&_p]:!text-earth"
        />
        <Reveal className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <p className="font-display text-xl text-earth">How to enter the competition</p>
          <Link
            to="/register/participant"
            className="k-btn group bg-earth px-8 py-4 text-base text-cream shadow-xl hover:bg-earth-700"
          >
            Rules, dates & registration
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      {/* Categories */}
      <Stagger className="mt-16 grid md:grid-cols-3 gap-5">
        {CATEGORIES.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.icon];
          return (
            <StaggerItem key={c.value} className="h-full">
              <motion.div
                whileHover={{ y: -8 }}
                className={`k-cut-strong group relative h-full overflow-hidden ${CARD_BG[i]} p-8 text-cream shadow-xl`}
              >
                <motion.span
                  className="absolute -right-6 -bottom-6 text-[8rem] text-cream/10"
                  whileHover={{ rotate: -12, scale: 1.1 }}
                >
                  <Icon />
                </motion.span>
                <span className="grid h-14 w-14 place-items-center k-quad-shape bg-cream/15 text-2xl">
                  <Icon />
                </span>
                <h3 className="mt-6 font-sans text-3xl font-bold leading-tight">{c.kikuyu}</h3>
                <p className="mt-1 font-display text-lg text-cream/80">{c.name}</p>
                <p className="relative mt-4 text-cream/85 text-lg">{c.desc}</p>
                <p className="relative mt-5 k-quad-shape inline-block bg-cream/15 px-3 py-1.5 text-sm font-semibold">
                  3 winners · Ksh {PRIZES.reduce((t, p) => t + p.amount, 0).toLocaleString()} in prizes
                </p>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Prizes */}
      <div className="k-cut-strong mt-16 bg-earth p-8 md:p-12 text-cream grain relative overflow-hidden">
        <SoundBars bars={40} className="absolute right-6 bottom-0 h-24 opacity-20" color="#E8B21E" />
        <div className="relative grid lg:grid-cols-[1fr_2fr] gap-10 items-center">
          <Reveal>
            <FaTrophy className="text-4xl text-bead-gold" />
            <h3 className="mt-4 font-display text-3xl md:text-4xl font-bold">Prizes in every category</h3>
            <p className="mt-3 text-cream/70">
              Categories with fewer than 4 entrants are grouped together and judged irrespective of category.
            </p>
          </Reveal>
          <Stagger className="grid sm:grid-cols-3 gap-4">
            {PRIZES.map((p, i) => (
              <StaggerItem
                key={p.place}
                className={`k-cut-strong p-6 text-center ${i === 0 ? "bg-bead-gold text-earth sm:-translate-y-4" : "bg-cream/10"}`}
              >
                <p className={`text-xs uppercase tracking-[0.2em] ${i === 0 ? "text-earth/70" : "text-cream/60"}`}>{p.place}</p>
                <p className="mt-2 whitespace-nowrap font-display text-2xl lg:text-3xl font-black">
                  <CountUp to={p.amount} prefix="Ksh " />
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  </section>
);

/** Live numbers: shown on the homepage below the videos. */
export const StatsBand = ({ stats }) => {
  const items = stats
    ? [
        { label: "Contestants", value: stats.total_participants },
        { label: "Community members", value: stats.total_users },
        { label: "Moments captured", value: stats.total_gallery_items },
        { label: "Performance videos", value: stats.total_videos },
      ].filter((s) => s.value > 0)
    : [];
  if (!items.length) return null;
  return (
    <section className="bg-kamaru">
      <Stagger className="container mx-auto grid grid-cols-2 gap-6 px-5 py-16 md:grid-cols-4 md:px-8">
        {items.map((s, i) => (
          <StaggerItem key={s.label} className={`k-cut-strong p-6 ${i % 2 ? "bg-earth text-cream" : "bg-cream text-earth"}`}>
            <p className="font-display text-5xl md:text-6xl font-black">
              <CountUp to={s.value || 0} suffix="+" />
            </p>
            <p className="mt-1 font-medium opacity-80">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default StoryChallenge;
