import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";
import { youTubeEmbed, youTubeThumb } from "../utils/youtube";

/**
 * Click-to-play YouTube player. Shows a lightweight poster first, so pages with many
 * videos don't load dozens of heavy iframes up front.
 */
const VideoPlayer = ({ video, className = "", rounded = "rounded-[2rem]", size = "lg" }) => {
  const [playing, setPlaying] = useState(false);

  // Reset when a different video is selected
  useEffect(() => setPlaying(false), [video?.youtube_id]);

  if (!video?.youtube_id) return null;

  return (
    <div className={`relative aspect-video overflow-hidden bg-earth shadow-2xl ${rounded} ${className}`}>
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.iframe
            key="frame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={youTubeEmbed(video.youtube_id, { autoplay: true })}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <motion.button
            key={`poster-${video.youtube_id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              // Let the background music know a video is starting, so it pauses
              window.dispatchEvent(new Event("kamaru:media-play"));
              setPlaying(true);
            }}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={youTubeThumb(video.youtube_id, size === "lg" ? "maxresdefault" : "hqdefault")}
              onError={(e) => {
                // maxres doesn't exist for every upload
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = "1";
                  e.currentTarget.src = youTubeThumb(video.youtube_id, "hqdefault");
                }
              }}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-earth/85 via-earth/20 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="relative grid place-items-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-kamaru/40" />
                <span
                  className={`relative grid place-items-center rounded-full bg-kamaru text-earth shadow-xl transition-transform group-hover:scale-110 ${
                    size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-base"
                  }`}
                >
                  <FaPlay className="ml-1" />
                </span>
              </span>
            </span>
            {size === "lg" && (
              <span className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-left">
                <span className="font-display text-xl md:text-3xl font-bold text-cream line-clamp-2">{video.title}</span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
