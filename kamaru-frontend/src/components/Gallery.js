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
  const [tab, setTab] = useState("all"); // "all" | season id | "none"
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

  // Season tabs, built from the photos themselves (newest season first); unsorted photos last
  const tabs = useMemo(() => {
    const seasons = new Map();
    let unsorted = 0;
    images.forEach((i) => {
      if (!i.season_id) return void unsorted++;
      const t = seasons.get(i.season_id) || { key: i.season_id, label: i.season, year: i.season_year || 0, count: 0 };
      t.count++;
      seasons.set(i.season_id, t);
    });
    const list = [...seasons.values()].sort((a, b) => b.year - a.year || String(b.label).localeCompare(String(a.label)));
    if (!list.length) return [];
    return [
      { key: "all", label: "All", count: images.length },
      ...list,
      ...(unsorted ? [{ key: "none", label: "More moments", count: unsorted }] : []),
    ];
  }, [images]);

  const filtered = useMemo(() => {
    if (tab === "all") return images;
    if (tab === "none") return images.filter((i) => !i.season_id);
    return images.filter((i) => i.season_id === tab);
  }, [images, tab]);
  const visible = filtered.slice(0, shown);

  const pickTab = (key) => {
    setTab(key);
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
      {tabs.length > 1 && (
        <LayoutGroup>
          <div className="mb-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter photos by season">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => pickTab(t.key)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  tab === t.key ? "text-cream" : "text-earth hover:text-ochre"
                }`}
              >
                {tab === t.key && (
                  <motion.span layoutId="season-pill" className="absolute inset-0 k-quad-shape bg-earth" />
                )}
                <span className="relative">
                  {t.label} <span className="opacity-60">· {t.count}</span>
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      <div key={tab} className="columns-2 sm:columns-3 lg:columns-4 gap-4">
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
                  {image.season && tab === "all" && <span className="block text-xs font-medium text-cream/70">{image.season}</span>}
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
