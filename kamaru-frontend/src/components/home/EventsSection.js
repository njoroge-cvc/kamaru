import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";
import { FaRegBell } from "react-icons/fa";
import EventCard from "../EventCard";
import { Reveal, SectionHeading, Stagger, StaggerItem, EASE } from "../motion";
import { ACTIVITIES } from "../../content/story";

const Tab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
      active ? "text-cream" : "text-earth hover:text-ochre"
    }`}
  >
    {active && (
      <motion.span layoutId="event-tab" className="absolute inset-0 k-quad-shape bg-earth" transition={{ type: "spring", duration: 0.5 }} />
    )}
    <span className="relative">
      {children}
      {count > 0 && <span className="ml-2 opacity-60">{count}</span>}
    </span>
  </button>
);

const EventsSection = ({ upcoming = [], past = [] }) => {
  // Data arrives after first render, so default the tab lazily until the visitor picks one
  const [picked, setTab] = useState(null);
  const tab = picked || (upcoming.length || !past.length ? "upcoming" : "past");
  const list = tab === "upcoming" ? upcoming : past.slice(0, 6);

  return (
    <section id="events" className="relative bg-cream-dark">
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeading
            align="left"
            eyebrow="Other activities"
            title="The More, Come sit by the Fire"
            intro="Competitions, camps, retreats and healing days, open to the whole community."
          />
          <Reveal className="flex gap-1 k-quad-shape bg-cream p-1.5 self-center lg:self-end">
            <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")} count={upcoming.length}>
              Upcoming
            </Tab>
            <Tab active={tab === "past"} onClick={() => setTab("past")} count={past.length}>
              Past
            </Tab>
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mt-12"
          >
            {list.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: EASE }}
                  >
                    <EventCard event={e} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-dashed border-earth/15 p-10 md:p-14 text-center">
                <FaRegBell className="mx-auto text-4xl text-kamaru" />
                <p className="mt-4 font-display text-2xl font-bold text-earth">
                  {tab === "upcoming" ? "The next gathering is being planned." : "No past events to show yet."}
                </p>
                <p className="mt-2 text-earth-700">
                  Be the first to hear when dates are announced.
                </p>
                <HashLink
                  smooth
                  to="/#newsletter"
                  className="mt-6 inline-block rounded-full bg-kamaru px-6 py-3 font-semibold text-earth hover:bg-kamaru-light"
                >
                  Notify me
                </HashLink>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Yearly calendar of camps and days */}
        <Reveal className="mt-20 text-center md:text-left">
          <p className="k-eyebrow text-ochre">Every year, free of charge</p>
          <h3 className="mt-3 font-display text-3xl text-earth md:text-4xl">Camps & days in our spaces</h3>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {ACTIVITIES.map((a, i) => (
            <StaggerItem
              key={a.name}
              className="k-cut-strong flex flex-col items-center p-7 text-center text-cream md:items-start md:text-left"
              style={{ backgroundColor: ["#B5441B", "#3F6A5E", "#262C45", "#62293B"][i % 4] }}
            >
              <span className="k-quad-shape bg-cream/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{a.month}</span>
              <p className="mt-6 font-display text-2xl leading-snug">{a.name}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default EventsSection;
