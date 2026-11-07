import React from "react";
import { motion } from "framer-motion";
import VideoPlayer from "./VideoPlayer";

// Grid of click-to-play videos. Expects videos with a `youtube_id` field.
const Videos = ({ videos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {videos.map((video, i) => (
      <motion.article
        key={video.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
        className="group"
      >
        <VideoPlayer video={video} size="sm" rounded="rounded-2xl" className="shadow-lg" />
        <h3 className="mt-3 font-semibold text-earth leading-snug group-hover:text-ochre transition-colors">
          {video.title}
        </h3>
        {video.uploaded_at && (
          <p className="text-sm text-earth-600">
            {new Date(video.uploaded_at.replace(" ", "T")).toLocaleDateString("en-KE", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </motion.article>
    ))}
  </div>
);

export default Videos;
