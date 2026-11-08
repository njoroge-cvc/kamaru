import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useBackdropTone } from "../utils/backdropTone";
import { fetchSiteAudio } from "../api";

const VOLUME = 0.5;

/** Small animated bars shown while the music plays. */
const Bars = ({ className = "bg-earth" }) => {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className={`w-[3px] ${className}`}
          initial={{ height: "40%" }}
          animate={reduce ? { height: "60%" } : { height: ["30%", "100%", "50%", "80%", "30%"] }}
          transition={reduce ? undefined : { duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
};

/**
 * "Listen while you browse": one background track (uploaded in Dashboard → Site Media).
 * Nothing plays until the visitor presses play (browsers block sound before that anyway).
 * Keeps playing across pages, pauses when a video starts, and hides on the dashboard.
 */
const AmbientAudio = () => {
  const { pathname } = useLocation();
  const [track, setTrack] = useState(null); // { url, title }
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false); // pressed play at least once
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const boxRef = useRef(null);
  // Switch to dark colours when sitting over orange sections, so the control never blends in
  const tone = useBackdropTone(boxRef, true);
  const onOrange = tone === "accent";
  const fadeRef = useRef(null);

  useEffect(() => {
    fetchSiteAudio()
      .then((r) => setTrack(r.data?.audio || null))
      .catch(() => setTrack(null));
  }, []);

  // Create the audio element once a track exists; nothing downloads until play
  useEffect(() => {
    if (!track?.url) return;
    const a = new Audio();
    a.src = track.url;
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    audioRef.current = a;
    return () => {
      a.pause();
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
      audioRef.current = null;
    };
  }, [track?.url]);

  const fadeTo = (target, then) => {
    const a = audioRef.current;
    if (!a) return;
    clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      const next = a.volume + (target > a.volume ? 0.05 : -0.08);
      if ((target > a.volume && next >= target) || (target <= a.volume && next <= target)) {
        a.volume = Math.max(0, Math.min(1, target));
        clearInterval(fadeRef.current);
        then && then();
      } else {
        a.volume = Math.max(0, Math.min(1, next));
      }
    }, 60);
  };

  const play = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.volume = 0;
      await a.play();
      setStarted(true);
      fadeTo(a.muted ? 0 : VOLUME);
    } catch {
      setPlaying(false); // e.g. the file couldn't load
    }
  };

  const pause = () => fadeTo(0, () => audioRef.current && audioRef.current.pause());
  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    if (!a.muted) a.volume = VOLUME;
    setMuted(a.muted);
  };

  // Pause when a performance video starts
  useEffect(() => {
    const onMedia = () => audioRef.current && !audioRef.current.paused && pause();
    window.addEventListener("kamaru:media-play", onMedia);
    return () => window.removeEventListener("kamaru:media-play", onMedia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Not on the dashboard: stop and hide there
  const hidden = !track?.url || pathname.startsWith("/admin");
  useEffect(() => {
    if (hidden && audioRef.current && !audioRef.current.paused) audioRef.current.pause();
  }, [hidden]);

  if (hidden) return null;

  // Orange normally; dark when the section behind is orange
  const skin = onOrange
    ? { box: "bg-earth text-cream shadow-black/30", sub: "text-kamaru-light", bars: "bg-kamaru", btn: "bg-kamaru text-earth hover:bg-kamaru-light" }
    : { box: "bg-kamaru text-earth shadow-earth/30", sub: "text-earth/70", bars: "bg-earth", btn: "bg-earth text-cream hover:bg-earth-700" };
  const title = track.title || "Kamaru Challenge";

  return (
    <div ref={boxRef} className="fixed bottom-[5.25rem] right-6 z-50">
      {/* Thin cream edge keeps the control visible over orange, dark and photo backgrounds alike */}
      <div className="k-quad-shape bg-cream p-[3px] shadow-xl shadow-black/25">
      <AnimatePresence mode="wait" initial={false}>
        {playing ? (
          <motion.div
            key="on"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`k-quad-shape flex items-center gap-3 p-2 transition-colors duration-500 ${skin.box}`}
          >
            <button onClick={pause} className={`k-quad grid h-10 w-10 shrink-0 place-items-center ${skin.btn}`} aria-label="Pause the music" title="Pause">
              <FaPause />
            </button>
            <Bars className={skin.bars} />
            <span className="hidden max-w-[13rem] flex-col leading-tight sm:flex">
              <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${skin.sub}`}>{muted ? "Muted" : "Now playing"}</span>
              <span className="truncate text-sm font-semibold">{title}</span>
            </span>
            <button
              onClick={toggleMute}
              className={`k-quad grid h-10 w-10 shrink-0 place-items-center ${skin.btn}`}
              aria-label={muted ? "Unmute the music" : "Mute the music"}
              aria-pressed={muted}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="off"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={play}
            className={`k-quad flex items-center gap-3 p-2 pr-4 font-semibold transition-colors duration-500 ${skin.box}`}
            aria-label={`${started ? "Resume" : "Play"} music while you browse: ${title}`}
            title={`${started ? "Resume" : "Play"}: ${title}`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center k-quad-shape ${skin.btn}`}>
              <FaPlay className="translate-x-[1px]" />
            </span>
            <span className="hidden max-w-[13rem] flex-col text-left leading-tight sm:flex">
              <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${skin.sub}`}>{started ? "Paused" : "Listen while you browse"}</span>
              <span className="truncate text-sm font-semibold">{title}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default AmbientAudio;
