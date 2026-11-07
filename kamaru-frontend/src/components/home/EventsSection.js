import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";
import { FaRegBell } from "react-icons/fa";
import EventCard from "../EventCard";
import { Reveal, SectionHeading, Stagger, StaggerItem, EASE } from "../motion";
import { PROGRAMME, EDITION } from "../../content/story";

const Tab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
      active ? "text-cream" : "text-earth hover:text-ochre"
    }`}
  >
    {active && (
      <motion.span layoutId="event-tab" className="absolute inset-0 rounded-full bg-earth" transition={{ type: "spring", duration: 0.5 }} />
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
            eyebrow="Gatherings"
            title="Come sit by the fire"
            intro="Competitions, camps, retreats and healing days — open to the whole community."
          />
          <Reveal className="flex gap-1 rounded-full bg-cream p-1.5 shadow-inner self-start lg:self-end">
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

        {/* A day at the challenge */}
        <div className="mt-24 grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHeading
              align="left"
              eyebrow={`${EDITION.year} programme`}
              title="A day at the Challenge"
              intro="From the first drumbeat at nine to the last photo at sunset — this is how Ndeiya sings."
            />
          </div>
          <Stagger className="relative space-y-3" stagger={0.07}>
            {PROGRAMME.map((p, i) => (
              <StaggerItem
                key={p.time + p.title}
                className="group flex gap-5 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-earth/5 transition hover:bg-white hover:shadow-md"
              >
                <span className="w-16 shrink-0 font-display text-2xl font-black text-kamaru tabular-nums">{p.time}</span>
                <div>
                  <p className="font-semibold text-earth text-lg">{p.title}</p>
                  {p.note && <p className="text-earth-600">{p.note}</p>}
                </div>
                <span
                  className="ml-auto mt-2 h-3 w-3 shrink-0 rounded-full transition-transform group-hover:scale-150"
                  style={{ backgroundColor: ["#D7262E", "#2588C9", "#3E9B4F", "#E8B21E"][i % 4] }}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
