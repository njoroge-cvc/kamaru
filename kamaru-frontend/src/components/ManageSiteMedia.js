import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaUpload, FaImage } from "react-icons/fa";
import { fetchSystemImage, uploadSystemImage, deleteSystemImage } from "../api";
import { PageHeader, Spinner } from "./ui";
import ManageSiteAudio from "./ManageSiteAudio";
import { cld } from "../utils/cloudinary";

// The image slots the public site actually uses, and where each one appears
const SLOTS = [
  {
    key: "logo",
    title: "Logo",
    where: "Navbar and the full-screen menu. Use a transparent PNG or SVG; the site darkens it automatically on light backgrounds.",
    preview: "contain",
  },
  {
    key: "about",
    title: "Patron photo",
    where: "Homepage “Itemi Riitū, Our Part” section and the About Us page. A portrait (taller than wide) works best.",
    preview: "cover",
  },
];

const ImageSlot = ({ slot }) => {
  const [image, setImage] = useState(undefined); // undefined = loading, null = none
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSystemImage(slot.key)
      .then((r) => setImage(r.data?.image || null))
      .catch(() => setImage(null));
  }, [slot.key]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Choose an image first.");
    const fd = new FormData();
    fd.append("image", file);
    fd.append("section", slot.key);
    setBusy(true);
    try {
      const r = await uploadSystemImage(fd);
      setImage(r.data?.image || { image_url: r.data?.image_url });
      setFile(null);
      e.target.reset();
      toast.success(`${slot.title} updated.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!image?.id || !window.confirm(`Remove the ${slot.title.toLowerCase()}? The site will fall back to its default.`)) return;
    try {
      await deleteSystemImage(image.id);
      setImage(null);
      toast.success(`${slot.title} removed.`);
    } catch {
      toast.error("Could not remove it.");
    }
  };

  return (
    <section className="k-card flex flex-col p-6">
      <h3 className="font-display text-xl text-earth">{slot.title}</h3>
      <p className="mt-1 text-sm text-earth-600">{slot.where}</p>

      <div className={`k-cut mt-4 grid place-items-center overflow-hidden ${slot.preview === "contain" ? "h-40 bg-earth p-6" : "aspect-[4/5] max-h-80 bg-cream-dark"}`}>
        {image === undefined ? (
          <Spinner className="h-6 w-6" />
        ) : image ? (
          <img
            src={cld(image.image_url, 600)}
            alt={slot.title}
            className={slot.preview === "contain" ? "max-h-full w-auto object-contain" : "h-full w-full object-cover"}
          />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-earth-600">
            <FaImage className="text-3xl opacity-40" /> Not set, so the site uses its default
          </span>
        )}
      </div>

      <form onSubmit={upload} className="mt-4 flex flex-wrap items-center gap-2">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="k-input min-w-0 flex-1" />
        <button type="submit" className="k-btn-primary" disabled={busy || !file}>
          {busy ? <Spinner /> : <FaUpload />} {image ? "Replace" : "Upload"}
        </button>
      </form>
      {image && (
        <button onClick={remove} className="k-btn-ghost k-btn-sm mt-2 self-start hover:!text-bead-red">
          <FaTrash /> Remove
        </button>
      )}
    </section>
  );
};

/** Dashboard → Site Media: the logo, patron photo and background music used across the site. */
const ManageSiteMedia = () => (
  <div>
    <PageHeader
      eyebrow="Media"
      title="Site Media"
      description="The logo, patron photo and background music used across the public site. Gallery photos and videos have their own sections."
    />
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      {SLOTS.map((slot) => (
        <ImageSlot key={slot.key} slot={slot} />
      ))}
    </div>
    <ManageSiteAudio />
  </div>
);

export default ManageSiteMedia;
