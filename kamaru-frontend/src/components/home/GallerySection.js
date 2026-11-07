import React, { useMemo, useState } from "react";
import { cld } from "../../utils/cloudinary";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaExpand } from "react-icons/fa";
import { Marquee, Reveal, SectionHeading } from "../motion";
import Lightbox from "../Lightbox";

// Repeating rhythm of tile shapes so the marquee feels hand-arranged, not uniform
const SHAPES = ["w-56 md:w-72 aspect-[3/4]", "w-72 md:w-96 aspect-[4/3]", "w-60 md:w-80 aspect-square", "w-64 md:w-[22rem] aspect-[5/4]"];
const TILTS = [-2, 1.5, -1, 2];

const Tile = ({ img, i, onOpen }) => (
  <motion.button
    onClick={onOpen}
    whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
    style={{ rotate: TILTS[i % TILTS.length] }}
    className={`group relative mx-3 shrink-0 overflow-hidden rounded-3xl bg-earth-700 shadow-lg ${SHAPES[i % SHAPES.length]}`}
    aria-label={`Open ${img.title || "photo"}`}
  >
    <img src={cld(img.image_url, 720)} alt={img.title || ""} loading="lazy" className="h-full w-full object-cover" />
    <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-earth/80 via-transparent to-transparent p-4 text-left text-cream opacity-0 transition-opacity group-hover:opacity-100">
      <span className="font-semibold line-clamp-2">{img.title !== "Untitled" ? img.title : ""}</span>
      <FaExpand className="shrink-0" />
    </span>
  </motion.button>
);

const GallerySection = ({ gallery = [] }) => {
  const [open, setOpen] = useState(null);
  const images = useMemo(() => gallery.slice(0, 24), [gallery]);
  const half = Math.ceil(images.length / 2);
  const rowA = images.slice(0, half);
  const rowB = images.slice(half);

  return (
    <section id="gallery" className="relative overflow-hidden bg-cream py-24 md:py-32">
      <div className="container mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Nī Rūgendo Rwega, Our Journey"
            title="Captured moments, a thousand words each"
            intro="Since 2024, the faces, the costumes, the dancing feet and the proud families of Ndeiya."
          />
        </div>
      </div>

      {images.length > 0 ? (
        <div className="mt-14 space-y-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <Marquee trackClassName="py-3">
            {rowA.map((img, i) => (
              <Tile key={img.id ?? i} img={img} i={i} onOpen={() => setOpen(i)} />
            ))}
          </Marquee>
          {rowB.length > 2 && (
            <Marquee reverse trackClassName="py-3">
              {rowB.map((img, i) => (
                <Tile key={img.id ?? i} img={img} i={i + 1} onOpen={() => setOpen(half + i)} />
              ))}
            </Marquee>
          )}
        </div>
      ) : (
        <div className="container mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 px-5 md:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-cream-dark" />
          ))}
        </div>
      )}

      {/* Full gallery: bottom right (centred on phones) */}
      <div className="container mx-auto mt-12 flex justify-center px-5 md:justify-end md:px-8">
        <Reveal>
          <Link
            to="/gallery"
            className="k-btn group bg-earth px-7 py-3.5 text-base text-cream hover:bg-earth-700"
          >
            Full gallery
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
      <Lightbox images={images} index={open} onChange={setOpen} />
    </section>
  );
};

export default GallerySection;
