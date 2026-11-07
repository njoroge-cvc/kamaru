import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion } from "framer-motion";
import { FaBullseye, FaMicrophoneAlt, FaTrophy, FaLock, FaDoorOpen, FaRegBell } from "react-icons/fa";
import PageHero from "../components/PageHero";
import ParticipantsRegistrationForm from "../components/ParticipantsRegistrationForm";
import MyEntries from "../components/MyEntries";
import { Reveal, Stagger, StaggerItem, CountUp } from "../components/motion";
import { fetchActiveSeason } from "../api";
import { useSession } from "../components/useSession";
import { EDITION, CATEGORIES, PRIZES, OBJECTIVES } from "../content/story";

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
        crumb="Participate"
        eyebrow={season?.name || "Kamaru Challenge – Ndeiya Edition"}
        title="Take the Kamaru stage"
        intro="An annual competition for the Ndeiya community to showcase its talent in the Kikuyu language — promoting timeless values and joyful, positive living."
      />

      {/* Registration status banner */}
      <div className="container mx-auto -mt-6 px-5 md:px-8 relative z-10">
        {season === undefined ? (
          <div className="h-24 animate-pulse rounded-3xl bg-cream-dark" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-4 rounded-3xl p-6 shadow-xl md:flex-row md:items-center md:justify-between ${
              open ? "bg-bead-green text-cream" : "bg-earth text-cream"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cream/15 text-2xl">
                {open ? <FaDoorOpen /> : <FaLock />}
              </span>
              <div>
                <p className="font-display text-2xl font-bold">
                  {open ? "Registration is open!" : "Registration is currently closed"}
                </p>
                <p className="text-cream/80">
                  {open
                    ? closesCountdown
                      ? `Closes in ${closesCountdown.days}d ${closesCountdown.hours}h ${closesCountdown.minutes}m — don't wait.`
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

      {/* Objectives / categories / prizes */}
      <section className="container mx-auto px-5 md:px-8 py-20">
        <Stagger className="grid gap-6 lg:grid-cols-3">
          <StaggerItem className="k-card p-8">
            <FaBullseye className="text-4xl text-ochre" />
            <h2 className="mt-4 font-display text-2xl font-bold text-earth">Your piece must…</h2>
            <ul className="mt-4 space-y-3">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="flex gap-3 text-earth-700">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-kamaru text-xs font-bold text-earth">{i + 1}</span>
                  {o}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="k-card p-8">
            <FaMicrophoneAlt className="text-4xl text-ochre" />
            <h2 className="mt-4 font-display text-2xl font-bold text-earth">Categories</h2>
            <ul className="mt-4 space-y-4">
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <p className="font-semibold text-earth">{c.name}</p>
                  <p className="text-sm text-earth-600">{c.desc}</p>
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem className="rounded-3xl bg-earth p-8 text-cream weave">
            <FaTrophy className="text-4xl text-bead-gold" />
            <h2 className="mt-4 font-display text-2xl font-bold">Prizes per category</h2>
            <ul className="mt-4 space-y-3">
              {PRIZES.map((p, i) => (
                <li key={p.place} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${i === 0 ? "bg-bead-gold text-earth" : "bg-cream/10"}`}>
                  <span className="text-sm font-semibold">{p.place}</span>
                  <span className="font-display text-xl font-black">
                    <CountUp to={p.amount} prefix="Ksh " />
                  </span>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>

        <Reveal className="mx-auto mt-10 max-w-3xl rounded-3xl border-2 border-dashed border-earth/15 p-6 text-earth-700">
          <p className="font-semibold text-earth">Please note</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Categories with fewer than 4 entrants are grouped together and judged irrespective of category.</li>
            <li>An item that previously won any Kamaru Challenge cannot win again when performed by the same participant(s).</li>
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
                <div key={k} className="rounded-2xl bg-earth py-3 text-cream">
                  <p className="font-display text-3xl font-black tabular-nums">{String(v).padStart(2, "0")}</p>
                  <p className="text-[10px] uppercase tracking-widest text-cream/60">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="scroll-mt-24 container mx-auto px-5 py-20 md:px-8">
        <div className="mx-auto max-w-xl">
          {token && season !== undefined && <MyEntries season={season} refreshKey={entriesKey} />}
          {season === undefined ? null : !open ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-earth/5">
              <FaLock className="mx-auto text-4xl text-earth-600" />
              <h2 className="mt-4 font-display text-3xl font-bold text-earth">Entries are closed</h2>
              <p className="mt-2 text-earth-600">
                {season ? `Registration for ${season.name} isn't open right now.` : "There's no active season at the moment."} Check back
                soon — or subscribe and we'll tell you the moment it opens.
              </p>
              <HashLink smooth to="/#newsletter" className="k-btn-primary mt-6">
                <FaRegBell /> Get notified
              </HashLink>
            </div>
          ) : !token ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-earth/5">
              <h2 className="font-display text-3xl font-bold text-earth">Log in to register</h2>
              <p className="mt-2 text-earth-600">You need a free account so we can reach you about your performance slot.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/login?next=/register/participant" className="k-btn-primary">Log in</Link>
                <Link to="/join" className="k-btn-outline">Join</Link>
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
