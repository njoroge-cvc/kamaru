import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFeatherAlt, FaDrum, FaMicrophoneAlt, FaArrowRight, FaTrophy } from "react-icons/fa";
import { CountUp, Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { CATEGORIES, PRIZES, SEASONS_HELD } from "../../content/story";
import { SoundBars } from "./Ornaments";
import { kk } from "../Kikuyu";

export const CATEGORY_ICONS = { feather: FaFeatherAlt, drum: FaDrum, mic: FaMicrophoneAlt };
const CARD_BG = ["bg-ochre", "bg-forest", "bg-night"];

const StoryChallenge = () => (
  <section id="challenge" className="relative bg-kamaru overflow-hidden">
    <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
      <div>
        <SectionHeading
          align="left"
          eyebrow="Nyīmbo Ciitū"
          title="The Kamaru Challenge"
          intro="An annual competition where Ndeiya discovers and showcases its talent, creatively, in the Kikuyu language, and always in service of the timeless values."
          className="[&_p]:!text-earth"
        />
      </div>

      {/* Categories */}
      <Stagger className="mt-20 grid md:grid-cols-3 gap-6">
        {CATEGORIES.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.icon];
          return (
            <StaggerItem key={c.value} className="h-full">
              <motion.div
                whileHover={{ y: -8 }}
                className={`k-cut-strong group relative flex h-full flex-col items-center overflow-hidden text-center md:items-start md:text-left ${CARD_BG[i]} p-8 md:p-10 text-cream shadow-xl`}
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
                {/* 1. Kikuyu name  2. English name  3. description  4. prizes */}
                <h3 lang="ki" className="mt-8 font-display text-[1.7rem] leading-[1.15] md:text-3xl">{kk(c.kikuyu)}</h3>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream/70">{c.name}</p>
                <p className="relative mt-6 text-lg leading-relaxed text-cream/90">{c.desc}</p>
                <p className="relative mt-auto pt-8">
                  <span className="k-quad-shape inline-block bg-cream/15 px-4 py-2 text-sm font-semibold">
                    3 winners · Ksh {PRIZES.reduce((t, p) => t + p.amount, 0).toLocaleString()} in prizes
                  </span>
                </p>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Prizes */}
      <div className="k-cut-strong mt-20 bg-earth p-8 md:p-14 text-cream grain relative overflow-hidden">
        <SoundBars bars={40} className="absolute right-6 bottom-0 h-24 opacity-20" color="#E8B21E" />
        <div className="relative grid lg:grid-cols-[1fr_2fr] gap-10 items-center">
          <Reveal className="text-center lg:text-left">
            <FaTrophy className="mx-auto text-4xl text-bead-gold lg:mx-0" />
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

      {/* How to enter: bottom right, after categories and prizes */}
      <Reveal className="mt-20 flex flex-col items-center gap-4 text-center md:items-end md:text-right">
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
  </section>
);

/** Live numbers, with a plain-language line for each: shown on the homepage below the videos. */
export const StatsBand = ({ stats }) => {
  const items = stats
    ? [
        { label: "Contestants", note: "performers who have entered the Challenge", value: stats.total_participants, to: "/register/participant" },
        { label: "Community members", note: "people who have joined this site", value: stats.total_users, to: "/join" },
        { label: "Moments captured", note: "photos in our gallery", value: stats.total_gallery_items, to: "/gallery" },
        { label: "Performance videos", note: "performances you can watch", value: stats.total_videos, to: "/videos" },
      ].filter((s) => s.value > 0)
    : [];
  if (!items.length) return null;
  return (
    <section className="bg-kamaru">
      <div className="container mx-auto px-5 py-20 md:px-8">
        <SectionHeading
          align="left"
          eyebrow="Kamaru in numbers"
          title="The Challenge so far"
          intro={`Since 2024, across ${SEASONS_HELD} seasons in Ndeiya. These numbers update as new contestants, members, photos and videos arrive.`}
          className="[&_p]:!text-earth"
        />
        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <StaggerItem key={s.label} className="h-full">
              <Link
                to={s.to}
                className={`k-cut-strong group flex h-full flex-col p-7 text-center transition-transform hover:-translate-y-1 sm:text-left ${
                  i % 2 ? "bg-earth text-cream" : "bg-cream text-earth"
                }`}
              >
                <span className="font-display text-5xl md:text-6xl">
                  <CountUp to={s.value || 0} suffix="+" />
                </span>
                <span className="mt-3 font-display text-xl">{s.label}</span>
                <span className="mt-1 opacity-75">{s.note}</span>
                <span className="mt-auto inline-flex items-center justify-center gap-2 pt-5 text-sm font-semibold opacity-80 group-hover:opacity-100 sm:justify-start">
                  {s.to === "/register/participant" ? "Enter the Challenge" : s.to === "/join" ? "Join us" : "Have a look"}
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default StoryChallenge;
