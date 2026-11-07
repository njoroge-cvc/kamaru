import React, { useEffect, useMemo, useState } from "react";
import { cld } from "../../utils/cloudinary";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FaPlay, FaArrowRight, FaEnvelope } from "react-icons/fa";
import SocialIcons from "../SocialIcons";
import { SplitWords, EASE } from "../motion";
import { SunSpiral, SoundBars } from "./Ornaments";
import { TAGLINE_KIKUYU, TAGLINE_ENGLISH, EDITION, CONTACT } from "../../content/story";

const useCountdown = (target) => {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!target) return setLeft(null);
    const tick = () => {
      const d = new Date(target) - new Date();
      if (d <= 0) return setLeft(null);
      setLeft({
        days: Math.floor(d / 864e5),
        hrs: Math.floor((d / 36e5) % 24),
        min: Math.floor((d / 6e4) % 60),
        sec: Math.floor((d / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
};

// Positions for the floating photo collage (desktop)
const FRAMES = [
  { className: "top-[4%] left-[8%] w-[46%] aspect-[4/5]", rotate: -6, depth: 30 },
  { className: "top-[14%] right-[2%] w-[42%] aspect-square", rotate: 5, depth: 55 },
  { className: "bottom-[2%] left-[22%] w-[48%] aspect-[5/4]", rotate: -2, depth: 80 },
];

const PhotoFrame = ({ images, index, frame, mx, my }) => {
  const x = useTransform(mx, (v) => v * frame.depth);
  const y = useTransform(my, (v) => v * frame.depth);
  const img = images.length ? images[index % images.length] : null;

  return (
    <motion.div
      className={`k-cut absolute ${frame.className} bg-cream p-2 md:p-3 shadow-2xl shadow-black/40`}
      style={{ x, y, rotate: frame.rotate }}
      initial={{ opacity: 0, scale: 0.85, rotate: frame.rotate * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: frame.rotate }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.4 + FRAMES.indexOf(frame) * 0.15 }}
      whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
    >
      <div className="k-cut relative w-full h-full overflow-hidden bg-earth-700">
        {/* Placeholder lives outside AnimatePresence: a plain div there can't report its exit and would linger on top */}
        {!img && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-earth-600 to-earth-800" />}
        <AnimatePresence mode="popLayout" initial={false}>
          {img && (
            <motion.img
              key={img.id ?? img.image_url}
              src={cld(img.image_url, 900)}
              alt={img.title || "Kamaru Challenge moment"}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Hero = ({ gallery = [], upcoming = [], season = null }) => {
  const registrationOpen = !!season?.accepting_registrations;
  // Shuffle once per visit so returning visitors see different faces
  const pool = useMemo(() => [...gallery].sort(() => Math.random() - 0.5).slice(0, 12), [gallery]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (pool.length <= FRAMES.length) return;
    const id = setInterval(() => setStep((s) => s + 1), 4200);
    return () => clearInterval(id);
  }, [pool.length]);

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // Scroll-out effect
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 600], [0, 120]);
  const contentOpacity = useTransform(scrollY, [0, 450], [1, 0]);

  // What's next: nearest upcoming event from the API, else the current edition if still ahead
  const next = upcoming[0];
  const editionAhead = new Date(EDITION.date) > new Date();
  const target = next?.date_time || (editionAhead ? EDITION.date : null);
  const countdown = useCountdown(target);

  return (
    <section
      onMouseMove={onMove}
      className="relative overflow-hidden bg-earth text-cream grain swirl-bg min-h-[92vh] flex flex-col"
    >
      {/* Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-kamaru/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-ochre/30 blur-3xl" />

      <div className="relative flex-1 container mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-28 md:pb-32 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        {/* Copy */}
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="k-quad inline-flex items-center gap-3 bg-cream/10 px-5 py-2 text-xs md:text-sm tracking-[0.2em] uppercase text-kamaru-light"
          >
            <span className="h-2 w-2 rounded-full bg-bead-red animate-pulse" />
            Ndeiya Edition · Since 2024
          </motion.p>

          <h1 className="mt-6 font-display font-black leading-[0.9] tracking-tight">
            <span className="block text-6xl sm:text-7xl md:text-8xl xl:text-9xl">
              <SplitWords text="Kamaru" animateOnMount delay={0.1} />
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-kamaru">
              <SplitWords text="Challenge" animateOnMount delay={0.3} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-6 font-sans font-semibold text-2xl md:text-3xl text-cream/90 text-balance"
          >
            {TAGLINE_KIKUYU}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-2 text-cream/60 md:text-lg"
          >
            {TAGLINE_ENGLISH}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.8, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              to="/register/participant"
              className="group inline-flex items-center gap-2 rounded-full bg-kamaru px-7 py-3.5 font-semibold text-earth shadow-lg shadow-kamaru/30 transition hover:bg-kamaru-light"
            >
              Join the Challenge
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <HashLink
              smooth
              to="/#videos"
              className="group inline-flex items-center gap-3 rounded-full bg-cream/10 px-6 py-3.5 font-semibold transition hover:bg-cream hover:text-earth"
            >
              <span className="grid place-items-center h-7 w-7 k-quad-shape bg-bead-red text-cream text-[10px]">
                <FaPlay className="ml-0.5" />
              </span>
              Watch performances
            </HashLink>
          </motion.div>

          {/* Next-up / countdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.45, duration: 0.8, ease: EASE }}
            className="k-cut mt-10 max-w-lg bg-cream/10 backdrop-blur-sm p-5 md:p-6"
          >
            {registrationOpen ? (
              <div className="flex items-center gap-4">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-bead-green/40" />
                  <span className="relative h-4 w-4 rounded-full bg-bead-green" />
                </span>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/50">Registration is open</p>
                  <p className="font-semibold leading-snug">{season.name}</p>
                  {season.registration_closes_at && (
                    <p className="text-sm text-cream/60">
                      Closes {new Date(season.registration_closes_at).toLocaleDateString("en-KE", { day: "numeric", month: "long" })}
                    </p>
                  )}
                </div>
                <Link to="/register/participant" className="k-btn-primary shrink-0">
                  Enter <FaArrowRight />
                </Link>
              </div>
            ) : countdown ? (
              <>
                <p className="text-xs uppercase tracking-[0.2em] text-cream/50">
                  {next ? "Next up" : "Next edition"}
                </p>
                <p className="mt-1 font-semibold text-lg leading-snug">
                  {next ? (
                    <Link to={`/events/${next.id}`} className="hover:text-kamaru-light">
                      {next.title}
                    </Link>
                  ) : (
                    EDITION.name
                  )}
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {Object.entries(countdown).map(([k, v]) => (
                    <div key={k} className="k-quad bg-earth-800/80 py-2">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={v}
                          initial={{ y: -14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 14, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="block font-display text-2xl md:text-3xl font-bold text-kamaru-light tabular-nums"
                        >
                          {String(v).padStart(2, "0")}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[10px] uppercase tracking-widest text-cream/50">{k}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <SoundBars bars={10} className="h-10 shrink-0" color="#E8B21E" />
                <div>
                  <p className="font-semibold">The {EDITION.year} edition has been sung.</p>
                  <p className="text-sm text-cream/60">
                    Relive it below, and{" "}
                    <HashLink smooth to="/#newsletter" className="text-kamaru-light underline underline-offset-4">
                      get notified
                    </HashLink>{" "}
                    when registration for the next season opens.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Collage */}
        <div className="relative h-[420px] sm:h-[520px] lg:h-[620px]">
          <motion.div
            className="absolute -top-6 -right-10 w-48 md:w-72 opacity-90"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.4, ease: EASE }}
          >
            <SunSpiral className="w-full h-full" />
          </motion.div>
          {FRAMES.map((frame, i) => (
            <PhotoFrame key={i} images={pool} index={step + i * 4} frame={frame} mx={smx} my={smy} />
          ))}
          <SoundBars bars={28} className="absolute -bottom-2 right-2 h-16 md:h-20 opacity-80" color="#E8B21E" />
        </div>
      </div>

      {/* Bottom bar: socials — line — scroll — line — mail */}
      <div className="absolute inset-x-0 bottom-6 hidden md:block">
        <div className="container mx-auto flex items-center gap-5 px-8">
          <SocialIcons itemClassName="h-9 w-9 text-lg text-cream/80 hover:text-kamaru-light" />
          <motion.span
            className="h-px flex-1 origin-right bg-cream/30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 1, ease: EASE }}
          />
          <HashLink smooth to="/#story" className="group flex flex-col items-center font-display text-sm tracking-[0.15em] text-cream/80 hover:text-kamaru-light">
            Scroll down
            <motion.span
              className="mt-1 block h-5 w-px bg-kamaru"
              animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </HashLink>
          <motion.span
            className="h-px flex-1 origin-left bg-cream/30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 1, ease: EASE }}
          />
          <a href={`mailto:${CONTACT.email}`} aria-label="Email us" className="text-xl text-cream/80 hover:text-kamaru-light">
            <FaEnvelope />
          </a>
        </div>
      </div>

    </section>
  );
};

export default Hero;
