import React from "react";
import { cld } from "../utils/cloudinary";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClock, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { timingOf, statusOf } from "../utils/events";

const STATUS_STYLES = {
  upcoming: "bg-bead-green text-cream",
  past: "bg-earth-600 text-cream",
  postponed: "bg-bead-gold text-earth",
  cancelled: "bg-bead-red text-cream",
};
const KIND_STYLES = {
  challenge: "bg-kamaru text-earth",
  camp: "bg-forest text-cream",
  community: "bg-bead-blue text-cream",
  partner: "bg-cream text-earth",
  webinar: "bg-bead-green text-cream",
  podcast: "bg-maroon text-cream",
};

const EventCard = ({ event, compact = false }) => {
  const date = new Date(event.date_time);
  // Upcoming/past comes from the server (Kenyan time); postponed/cancelled override it
  const isPast = timingOf(event) === "past";
  const status = statusOf(event) !== "scheduled" ? statusOf(event) : isPast ? "past" : "upcoming";

  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-md ring-1 ring-earth/5 ${
        isPast ? "opacity-95" : ""
      }`}
    >
      <Link to={`/events/${event.id}`} className="absolute inset-0 z-10" aria-label={event.title} />

      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-60"}`}>
        <motion.img
          src={event.image_url ? cld(event.image_url, 800) : "/og-image.jpg"}
          alt={event.title}
          loading="lazy"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
          transition={{ duration: 0.6 }}
          className={`h-full w-full object-cover ${isPast ? "grayscale-[40%]" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth/60 via-transparent to-transparent" />

        {/* Calendar tab */}
        <div className="absolute left-4 top-4 overflow-hidden k-quad-shape bg-cream text-center shadow-lg">
          <p className="bg-ochre px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-cream">
            {date.toLocaleDateString("en-KE", { month: "short" })}
          </p>
          <p className="px-4 pt-1 font-display text-3xl font-black leading-none text-earth">{date.getDate()}</p>
          <p className="pb-1.5 text-[11px] text-earth-600">{date.getFullYear()}</p>
        </div>

        <span className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
          <span className={`k-quad-shape px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.upcoming}`}>
            {status}
          </span>
          {event.kind_label && (
            <span className={`k-quad-shape px-3 py-1 text-xs font-semibold ${KIND_STYLES[event.kind] || KIND_STYLES.community}`}>
              {event.kind_label}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {event.theme && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre line-clamp-1">{event.theme}</p>
        )}
        <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-earth line-clamp-2">{event.title}</h3>

        <div className="mt-4 space-y-1.5 text-sm text-earth-700">
          <p className="flex items-center gap-2">
            <FaClock className="text-kamaru" />
            {date.toLocaleDateString("en-KE", { weekday: "long" })} ·{" "}
            {date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-kamaru" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="k-quad-shape bg-cream px-3 py-1 text-sm font-semibold text-earth">
            {event.cost || "Free"}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-ochre">
            {isPast ? "Look back" : "Details"}
            <motion.span variants={{ rest: { x: 0 }, hover: { x: 6 } }}>
              <FaArrowRight />
            </motion.span>
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
