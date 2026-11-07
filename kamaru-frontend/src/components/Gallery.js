import React, { useEffect, useMemo, useState } from "react";
import { cld, cldSrcSet } from "../utils/cloudinary";
import { LayoutGroup, motion } from "framer-motion";
import { FaExpand } from "react-icons/fa";
import { fetchGalleryImages } from "../api";
import Lightbox from "./Lightbox";

const PAGE = 30;

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => setImages(Array.isArray(response.data?.images) ? response.data.images : []))
      .catch((error) => {
        console.error("Error fetching gallery images:", error);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const ys = new Set(images.map((i) => new Date(i.uploaded_at).getFullYear()).filter(Boolean));
    return [...ys].sort((a, b) => b - a);
  }, [images]);

  const filtered = useMemo(
    () => (year === "all" ? images : images.filter((i) => new Date(i.uploaded_at).getFullYear() === year)),
    [images, year]
  );
  const visible = filtered.slice(0, shown);

  const pickYear = (y) => {
    setYear(y);
    setShown(PAGE);
  };

  if (loading) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 animate-pulse rounded-2xl bg-cream-dark"
            style={{ height: 160 + ((i * 53) % 140) }}
          />
        ))}
      </div>
    );
  }

  if (!images.length) {
    return <p className="py-16 text-center text-earth-600">No images available yet.</p>;
  }

  return (
    <div>
      {years.length > 1 && (
        <LayoutGroup>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {["all", ...years].map((y) => (
              <button
                key={y}
                onClick={() => pickYear(y)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  year === y ? "text-cream" : "text-earth hover:text-ochre"
                }`}
              >
                {year === y && (
                  <motion.span layoutId="year-pill" className="absolute inset-0 k-quad-shape bg-earth" />
                )}
                <span className="relative">{y === "all" ? `All · ${images.length}` : y}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      <div key={year} className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {visible.map((image, index) => (
            <motion.button
              key={image.id}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: (index % PAGE) * 0.03 }}
              onClick={() => setOpen(index)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-earth-700 shadow-md"
              aria-label={`Open ${image.title || "photo"}`}
            >
              <img
                src={cld(image.image_url, 640)}
                srcSet={cldSrcSet(image.image_url, [400, 640, 960])}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                alt={image.title || ""}
                loading="lazy"
                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-earth/80 via-transparent to-transparent p-4 text-left text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-sm font-semibold line-clamp-2">
                  {image.title !== "Untitled" ? image.title : ""}
                </span>
                <FaExpand className="shrink-0" />
              </span>
            </motion.button>
          ))}
      </div>

      {shown < filtered.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setShown((s) => s + PAGE)}
            className="rounded-full bg-earth/10 px-8 py-3 font-semibold text-earth transition hover:bg-earth hover:text-cream"
          >
            Load more ({filtered.length - shown} left)
          </button>
        </div>
      )}

      <Lightbox images={filtered} index={open} onChange={setOpen} />
    </div>
  );
};

export default Gallery;
