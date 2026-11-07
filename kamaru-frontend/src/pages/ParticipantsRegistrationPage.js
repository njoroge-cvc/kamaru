import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion } from "framer-motion";
import { FaBullseye, FaTrophy, FaLock, FaDoorOpen, FaRegBell } from "react-icons/fa";
import PageHero from "../components/PageHero";
import ParticipantsRegistrationForm from "../components/ParticipantsRegistrationForm";
import MyEntries from "../components/MyEntries";
import { Reveal, Stagger, StaggerItem, CountUp, SectionHeading } from "../components/motion";
import { kk } from "../components/Kikuyu";
import { fetchActiveSeason } from "../api";
import { useSession } from "../components/useSession";
import { EDITION, CATEGORIES, PRIZES, OBJECTIVES } from "../content/story";
import { CATEGORY_ICONS } from "../components/home/StoryChallenge";
import { useSeo } from "../utils/seo";

const useCountdown = (target) => {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!target) return setLeft(null);
    const tick = () => {
      const d = new Date(target) - new Date();
      if (d <= 0) return setLeft(null);
      setLeft({
        days: Math.floor(d / 864e5),
        hours: Math.floor((d / 36e5) % 24),
        minutes: Math.floor((d / 6e4) % 60),
        seconds: Math.floor((d / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
};

const ParticipantsRegistrationPage = () => {
  useSeo({ title: "The Challenge: Categories, Prizes & Registration", description: "Enter the Kamaru Challenge: Marebeta (poetry), Nyīmbo cīa Gūītungira (original songs) and Nyīmbo cīa Ūndūire cīa Mūgīkūyū (Kikuyu folk songs and dances). Free to enter, three winners per category.", path: "/register/participant" });
  const { token } = useSession();
  const [season, setSeason] = useState(undefined); // undefined = loading, null = none
  const [entriesKey, setEntriesKey] = useState(0);

  useEffect(() => {
    fetchActiveSeason()
      .then((r) => setSeason(r.data))
      .catch(() => setSeason(null));
  }, []);

  const open = !!season?.accepting_registrations;
  const eventDate = new Date(EDITION.date);
  const eventCountdown = useCountdown(eventDate > new Date() ? EDITION.date : null);
  const closesCountdown = useCountdown(open ? season?.registration_closes_at : null);

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="The Challenge"
        eyebrow={season?.name || "Kamaru Challenge – Ndeiya Edition"}
        title="Take the Kamaru stage"
        intro="An annual competition for the Ndeiya community to showcase its talent in the Kikuyu language, promoting timeless values and joyful, positive living."
      />

      {/* Registration status banner */}
      <div className="container mx-auto -mt-6 px-5 md:px-8 relative z-10">
        {season === undefined ? (
          <div className="h-24 animate-pulse k-cut-strong bg-cream-dark" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`k-cut-strong flex flex-col gap-4 p-6 shadow-xl md:flex-row md:items-center md:justify-between ${
              open ? "bg-bead-green text-cream" : "bg-earth text-cream"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center k-quad-shape bg-cream/15 text-2xl">
                {open ? <FaDoorOpen /> : <FaLock />}
              </span>
              <div>
                <p className="font-display text-2xl font-bold">
                  {open ? "Registration is open!" : "Registration is currently closed"}
                </p>
                <p className="text-cream/80">
                  {open
                    ? closesCountdown
                      ? `Closes in ${closesCountdown.days}d ${closesCountdown.hours}h ${closesCountdown.minutes}m, don't wait.`
                      : "Register below to secure your spot."
                    : "Entries open ahead of each August edition. Subscribe to be the first to know."}
                </p>
              </div>
            </div>
            {open ? (
              <a href="#register" className="k-btn bg-cream text-earth hover:bg-bead-gold">
                Register now
              </a>
            ) : (
              <HashLink smooth to="/#newsletter" className="k-btn bg-kamaru text-earth hover:bg-kamaru-light">
                <FaRegBell /> Notify me
              </HashLink>
            )}
          </motion.div>
        )}
      </div>

      {/* Categories, requirements, prizes */}
      <section className="container mx-auto space-y-28 px-5 py-24 md:px-8 md:py-28">
        {/* 1. Categories */}
        <div>
          <SectionHeading
            align="left"
            eyebrow="Nyīmbo Ciitū"
            title="Three categories"
            intro="Choose the category that fits your piece. Every category is performed in Kikuyu and has three winners."
          />
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.icon];
              return (
                <StaggerItem key={c.value} className={`k-cut-strong flex flex-col p-8 md:p-10 text-cream ${["bg-ochre", "bg-forest", "bg-night"][i]}`}>
                  <span className="grid h-14 w-14 place-items-center k-quad-shape bg-cream/15 text-2xl">
                    <Icon />
                  </span>
                  <h3 lang="ki" className="mt-8 font-display text-[1.7rem] leading-[1.15] md:text-3xl">{kk(c.kikuyu)}</h3>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream/70">{c.name}</p>
                  <p className="mt-6 text-lg leading-relaxed text-cream/90">{c.desc}</p>
                  <ul className="mt-6 space-y-3 border-t border-cream/15 pt-6 text-[15px]">
                    {[...c.details, "Performed in the Kikuyu language", "Calls out vice, praises good morals, or both"].map((d) => (
                      <li key={d} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 k-quad-shape bg-bead-gold" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-8">
                    <span className="inline-block k-quad-shape bg-cream/15 px-4 py-2 text-sm font-semibold">
                      3 winners · Ksh {PRIZES.map((p) => p.amount.toLocaleString()).join(" / ")}
                    </span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* 2. Requirements and prizes */}
        <Stagger className="grid gap-6 lg:grid-cols-2">
          <StaggerItem className="k-cut-strong bg-white p-8 shadow-sm md:p-12">
            <FaBullseye className="text-4xl text-ochre" />
            <p className="k-eyebrow mt-6 text-ochre">Before you enter</p>
            <h2 className="mt-3 font-display text-3xl text-earth md:text-4xl">Your piece must…</h2>
            <ul className="mt-8 space-y-5">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="flex items-center gap-4 text-lg text-earth-700">
                  <span className="grid h-10 w-10 shrink-0 place-items-center k-quad-shape bg-kamaru font-display text-earth">{i + 1}</span>
                  {o}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="k-cut-strong relative bg-earth p-8 text-cream swirl-bg md:p-12">
            <FaTrophy className="relative text-4xl text-bead-gold" />
            <p className="k-eyebrow relative mt-6 text-bead-gold">In every category</p>
            <h2 className="relative mt-3 font-display text-3xl md:text-4xl">Prizes</h2>
            <ul className="relative mt-8 space-y-4">
              {PRIZES.map((p, i) => (
                <li key={p.place} className={`k-quad-shape flex items-center justify-between px-6 py-4 ${i === 0 ? "bg-bead-gold text-earth" : "bg-cream/10"}`}>
                  <span className="text-sm font-semibold uppercase tracking-[0.15em]">{p.place}</span>
                  <span className="font-display text-2xl">
                    <CountUp to={p.amount} prefix="Ksh " />
                  </span>
                </li>
              ))}
            </ul>
            <p className="relative mt-8 text-cream/70">Three winners in every category. Taking part is free.</p>
          </StaggerItem>
        </Stagger>

        {/* 3. Please note */}
        <Reveal className="k-cut-strong mx-auto max-w-3xl bg-bead-gold/25 p-8 text-earth-700 md:p-10">
          <h2 className="font-display text-2xl text-earth">Please note</h2>
          <ul className="mt-6 space-y-4">
            {[
              "Categories with fewer than 4 entrants are grouped together and judged irrespective of category.",
              "An item that previously won any Kamaru Challenge cannot win again when performed by the same participant(s).",
            ].map((n, i) => (
              <li key={n} className="flex gap-4 text-lg">
                <span className="grid h-8 w-8 shrink-0 place-items-center k-quad-shape bg-earth font-display text-sm text-cream">{i + 1}</span>
                {n}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Event countdown */}
      {eventCountdown && (
        <section className="bg-kamaru py-14">
          <div className="container mx-auto px-5 text-center md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth/70">Event day</p>
            <p className="mt-1 font-display text-3xl font-bold text-earth">
              {eventDate.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-4 gap-3">
              {Object.entries(eventCountdown).map(([k, v]) => (
                <div key={k} className="k-quad-shape bg-earth py-3 text-cream">
                  <p className="font-display text-3xl font-black tabular-nums">{String(v).padStart(2, "0")}</p>
                  <p className="text-[10px] uppercase tracking-widest text-cream/60">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="scroll-mt-24 relative overflow-hidden bg-ochre py-20 swirl-bg">
        <div className="relative mx-auto max-w-xl px-5">
          <div className="mb-8 text-center text-cream">
            <p className="k-eyebrow text-bead-gold">Take the stage</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Register your entry</h2>
          </div>
          {token && season !== undefined && <MyEntries season={season} refreshKey={entriesKey} />}
          {season === undefined ? null : !open ? (
            <div className="k-cut-strong bg-cream p-10 text-center shadow-2xl">
              <FaLock className="mx-auto text-4xl text-earth-600" />
              <h2 className="mt-4 font-display text-3xl font-bold text-earth">Entries are closed</h2>
              <p className="mt-2 text-earth-600">
                {season ? `Registration for ${season.name} isn't open right now.` : "There's no active season at the moment."} Check back
                soon, or subscribe and we'll tell you the moment it opens.
              </p>
              <HashLink smooth to="/#newsletter" className="k-btn-primary mt-6">
                <FaRegBell /> Get notified
              </HashLink>
            </div>
          ) : !token ? (
            <div className="k-cut-strong bg-cream p-10 text-center shadow-2xl">
              <h2 className="font-display text-3xl font-bold text-earth">Log in to register</h2>
              <p className="mt-2 text-earth-600">You need a free account so we can reach you about your performance slot.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/login?next=/register/participant" className="k-btn-primary">Log in</Link>
                <Link to="/join" className="k-btn-outline">Join us</Link>
              </div>
            </div>
          ) : (
            <ParticipantsRegistrationForm season={season} onRegistered={() => setEntriesKey((k) => k + 1)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default ParticipantsRegistrationPage;
