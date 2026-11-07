import React, { useCallback, useEffect, useRef } from "react";
import { cld } from "../utils/cloudinary";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.96 }),
};

/**
 * Full-screen image viewer. Controlled: pass `index` (null = closed) and `onChange`.
 * Supports arrow keys, Escape, swipe/drag and a thumbnail strip.
 */
const Lightbox = ({ images, index, onChange }) => {
  const open = index !== null && index !== undefined && images[index];
  const dirRef = useRef(1);
  const thumbsRef = useRef(null);

  const go = useCallback(
    (delta) => {
      if (!images.length) return;
      dirRef.current = delta;
      onChange((index + delta + images.length) % images.length);
    },
    [images.length, index, onChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") onChange(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go, onChange]);

  // Keep active thumbnail in view
  useEffect(() => {
    if (!open || !thumbsRef.current) return;
    const el = thumbsRef.current.querySelector(`[data-i="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index, open]);

  const img = open ? images[index] : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-earth/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={img?.title || "Image viewer"}
        >
          <div className="flex items-center justify-between px-4 md:px-8 py-4 text-cream">
            <p className="text-sm text-cream/60 tabular-nums">
              {index + 1} / {images.length}
            </p>
            <button
              onClick={() => onChange(null)}
              className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 hover:bg-bead-red transition"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden" onClick={() => onChange(null)}>
            <AnimatePresence initial={false} custom={dirRef.current} mode="popLayout">
              <motion.figure
                key={img.id ?? img.image_url}
                custom={dirRef.current}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 m-auto flex h-full w-full flex-col items-center justify-center px-4 md:px-24 cursor-grab active:cursor-grabbing"
              >
                <img
                  src={cld(img.image_url, 1800)}
                  alt={img.title || ""}
                  draggable={false}
                  className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl select-none"
                />
                {img.title && img.title !== "Untitled" && (
                  <figcaption className="mt-4 text-center font-display text-xl text-cream">{img.title}</figcaption>
                )}
              </motion.figure>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 grid h-12 w-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-kamaru transition"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 grid h-12 w-12 place-items-center rounded-full bg-cream/10 text-cream hover:bg-kamaru transition"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
              {images.map((t, i) => (
                <button
                  key={t.id ?? i}
                  data-i={i}
                  onClick={() => {
                    dirRef.current = i > index ? 1 : -1;
                    onChange(i);
                  }}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                    i === index ? "ring-2 ring-kamaru opacity-100" : "opacity-40 hover:opacity-80"
                  }`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={cld(t.image_url, 200)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
