import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFeatherAlt, FaDrum, FaMicrophoneAlt, FaArrowRight, FaTrophy } from "react-icons/fa";
import { CountUp, Reveal, SectionHeading, Stagger, StaggerItem } from "../motion";
import { CATEGORIES, PRIZES, OBJECTIVES } from "../../content/story";
import { SoundBars } from "./Ornaments";

const ICONS = { feather: FaFeatherAlt, drum: FaDrum, mic: FaMicrophoneAlt };
const CARD_BG = ["bg-ochre", "bg-forest", "bg-night"];

const StoryChallenge = ({ stats }) => {
  const statItems = stats
    ? [
        { label: "Contestants", value: stats.total_participants },
        { label: "Community members", value: stats.total_users },
        { label: "Moments captured", value: stats.total_gallery_items },
        { label: "Performance videos", value: stats.total_videos },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <section id="challenge" className="relative bg-kamaru overflow-hidden">
      <div className="chevron-band h-6 opacity-40" style={{ "--c1": "#2B1A10" }} aria-hidden="true" />
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-end">
          <SectionHeading
            align="left"
            eyebrow="Chapter four · The stage"
            title="Kamaru Challenge"
            intro="An annual competition where Ndeiya discovers and showcases its talent — creatively, in the Kikuyu language, and always in service of the timeless values."
            className="[&_p]:!text-earth [&_span.h-px]:!bg-earth"
          />
          <Reveal>
            <ul className="space-y-3">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="flex gap-3 text-earth">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-earth text-xs font-bold text-kamaru">
                    {i + 1}
                  </span>
                  <span className="text-lg">{o}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Categories */}
        <Stagger className="mt-16 grid md:grid-cols-3 gap-5">
          {CATEGORIES.map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <StaggerItem key={c.name}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`group relative h-full overflow-hidden rounded-[2rem] ${CARD_BG[i]} p-8 text-cream shadow-xl`}
                >
                  <motion.span
                    className="absolute -right-6 -bottom-6 text-[8rem] text-cream/10"
                    whileHover={{ rotate: -12, scale: 1.1 }}
                  >
                    <Icon />
                  </motion.span>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream/15 text-2xl">
                    <Icon />
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold">{c.name}</h3>
                  <p className="mt-3 text-cream/80 text-lg">{c.desc}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Prizes */}
        <div className="mt-16 rounded-[2.5rem] bg-earth p-8 md:p-12 text-cream grain relative overflow-hidden">
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
                  className={`rounded-3xl p-6 text-center ${
                    i === 0 ? "bg-bead-gold text-earth sm:-translate-y-4" : "bg-cream/10"
                  }`}
                >
                  <p className={`text-xs uppercase tracking-[0.2em] ${i === 0 ? "text-earth/70" : "text-cream/60"}`}>
                    {p.place}
                  </p>
                  <p className="mt-2 font-display text-3xl md:text-4xl font-black">
                    <CountUp to={p.amount} prefix="Ksh " />
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        {/* Live numbers */}
        {statItems.length > 0 && (
          <Stagger className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((s) => (
              <StaggerItem key={s.label} className="border-l-4 border-earth pl-4">
                <p className="font-display text-5xl md:text-6xl font-black text-earth">
                  <CountUp to={s.value || 0} suffix="+" />
                </p>
                <p className="mt-1 text-earth/80 font-medium">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        <Reveal className="mt-16 flex flex-wrap gap-4">
          <Link
            to="/register/participant"
            className="group inline-flex items-center gap-2 rounded-full bg-earth px-8 py-4 font-semibold text-cream shadow-xl transition hover:bg-earth-700"
          >
            Rules, dates & registration
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default StoryChallenge;
