import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaPlay } from "react-icons/fa";
import { Reveal, SectionHeading } from "../motion";
import VideoPlayer from "../VideoPlayer";
import { youTubeThumb } from "../../utils/youtube";
import { SoundBars } from "./Ornaments";

const VideosSection = ({ videos = [] }) => {
  const [active, setActive] = useState(0);
  const playlist = videos.slice(0, 6);
  const current = playlist[active];

  return (
    <section id="videos" className="relative bg-earth text-cream grain swirl-bg overflow-hidden">
      <div className="container mx-auto px-5 md:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            light
            align="left"
            eyebrow="Mīgambo ya Mītugo na Kīhoto"
            title="Listen to the Voices"
            intro="Poetry, folk songs and original music, performed in Kikuyu, straight from the Kamaru stage."
          />
          <SoundBars bars={32} className="hidden md:flex h-20" color="#D57500" />
        </div>

        {current ? (
          <div className="mt-14 grid lg:grid-cols-[2fr_1fr] gap-6">
            <Reveal>
              <VideoPlayer video={current} />
            </Reveal>

            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 [scrollbar-width:none]">
              {playlist.map((v, i) => (
                <motion.button
                  key={v.id}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`k-quad group flex w-64 lg:w-auto shrink-0 gap-3 p-2.5 text-left ${
                    i === active ? "bg-kamaru text-earth" : "bg-cream/5 hover:bg-cream/15"
                  }`}
                >
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden k-quad-shape">
                    <img src={youTubeThumb(v.youtube_id)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-earth/30 opacity-0 group-hover:opacity-100 transition">
                      <FaPlay className="text-cream" />
                    </span>
                  </span>
                  <span className="self-center text-sm font-medium leading-snug line-clamp-3">{v.title}</span>
                </motion.button>
              ))}
              <Link
                to="/videos"
                className="k-quad group flex w-48 lg:w-auto shrink-0 items-center justify-center gap-2 bg-cream/10 p-4 font-semibold text-kamaru-light hover:bg-cream hover:text-earth"
              >
                All videos
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-14 aspect-video max-w-4xl animate-pulse rounded-[2rem] bg-earth-700" />
        )}
      </div>
    </section>
  );
};

export default VideosSection;
