import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaMusic, FaVolumeMute } from "react-icons/fa";
import { fetchSiteAudio } from "../api";

const VOLUME = 0.5;

/** Small animated bars shown while the music plays. */
const Bars = () => {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-earth"
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
  const audioRef = useRef(null);
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
      fadeTo(VOLUME);
    } catch {
      setPlaying(false); // e.g. the file couldn't load
    }
  };

  const mute = () => fadeTo(0, () => audioRef.current && audioRef.current.pause());

  // Pause when a performance video starts
  useEffect(() => {
    const onMedia = () => audioRef.current && !audioRef.current.paused && mute();
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

  return (
    <div className="fixed bottom-[5.25rem] right-6 z-50">
      <AnimatePresence mode="wait" initial={false}>
        {playing ? (
          <motion.div
            key="on"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="k-quad-shape flex items-center gap-3 bg-kamaru py-2 pl-4 pr-2 text-earth shadow-xl shadow-earth/30"
          >
            <Bars />
            <span className="hidden max-w-[14rem] flex-col leading-tight sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-earth/70">Now playing</span>
              <span className="truncate text-sm font-semibold">{track.title || "Kamaru Challenge"}</span>
            </span>
            <button
              onClick={mute}
              className="k-quad grid h-10 w-10 place-items-center bg-earth text-lg text-cream hover:bg-earth-700"
              aria-label="Mute the music"
              title="Mute"
            >
              <FaVolumeMute />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="off"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={play}
            className="k-quad flex items-center gap-2 bg-kamaru px-4 py-3 font-semibold text-earth shadow-xl hover:bg-kamaru-light"
            aria-label={`Play music while you browse${track.title ? `: ${track.title}` : ""}`}
            title={track.title ? `Play: ${track.title}` : "Play music"}
          >
            <FaMusic />
            <span className="hidden text-sm sm:inline">Listen while you browse</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientAudio;
