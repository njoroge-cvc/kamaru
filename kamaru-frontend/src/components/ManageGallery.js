import { toast } from "react-toastify";
import React, { useEffect, useMemo, useState } from "react";
import { FaTrash, FaPlus, FaCheck, FaImages } from "react-icons/fa";
import { fetchGalleryImages, uploadImage, deleteImage, updateImage, bulkAssignSeason, fetchSeasons } from "../api";
import { PageHeader, Modal, Field, EmptyState, Spinner } from "./ui";
import { cld } from "../utils/cloudinary";

const NONE = "none";

// "IMG_2041-mumburo-dancers.jpg" -> "Mumburo dancers"-ish fallback title
const titleFromFile = (name) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\b(img|dsc|photo)\s?\d+\b/gi, "").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Untitled";
};

const SeasonSelect = ({ seasons, value, onChange, className = "", disabled, includeAll }) => (
  <select value={value ?? NONE} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`k-input ${className}`}>
    {includeAll && <option value="all">All seasons</option>}
    {seasons.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name} ({s.year})
      </option>
    ))}
    <option value={NONE}>Unsorted (no season)</option>
  </select>
);

const UploadModal = ({ open, onClose, seasons, onDone }) => {
  const active = seasons.find((s) => s.is_active);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState(active ? String(active.id) : NONE);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      setTitle("");
      setSeason(active ? String(active.id) : NONE);
      setProgress(null);
    }
  }, [open, active]);

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length) return toast.error("Choose at least one photo.");
    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      setProgress(`${i + 1} of ${files.length}`);
      const fd = new FormData();
      fd.append("image", files[i]);
      fd.append("title", title.trim() || titleFromFile(files[i].name));
      if (season !== NONE) fd.append("season_id", season);
      try {
        await uploadImage(fd);
        ok++;
      } catch (err) {
        toast.error(`${files[i].name}: ${err.response?.data?.error || "upload failed"}`);
      }
    }
    setProgress(null);
    if (ok) toast.success(`${ok} photo${ok > 1 ? "s" : ""} uploaded.`);
    onDone();
  };

  return (
    <Modal open={open} onClose={progress ? () => {} : onClose} title="Upload photos">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Photos" hint="You can choose several at once.">
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} className="k-input" required />
        </Field>
        {files.length > 0 && <p className="text-sm text-earth-600">{files.length} photo{files.length > 1 ? "s" : ""} selected</p>}
        <Field label="Season" hint="Which edition these photos are from.">
          <SeasonSelect seasons={seasons} value={season} onChange={setSeason} />
        </Field>
        <Field label="Title" hint="Describe what's happening, e.g. “Nyakinyua dancers perform a Kikuyu folk dance”. Leave empty to use each file's name.">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="k-input" />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="k-btn-ghost" onClick={onClose} disabled={!!progress}>
            Cancel
          </button>
          <button type="submit" className="k-btn-primary" disabled={!!progress}>
            {progress ? (
              <>
                <Spinner /> Uploading {progress}
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ManageGallery = () => {
  const [images, setImages] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(() => new Set());
  const [moveTo, setMoveTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    fetchGalleryImages()
      .then((r) => setImages(r.data?.images || []))
      .catch(() => {
        setImages([]);
        toast.error("Could not load the gallery.");
      });

  useEffect(() => {
    load();
    fetchSeasons()
      .then((r) => setSeasons(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSeasons([]));
  }, []);

  const counts = useMemo(() => {
    const c = { all: images?.length || 0, [NONE]: 0 };
    (images || []).forEach((i) => {
      const k = i.season_id || NONE;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [images]);

  const shown = useMemo(() => {
    if (!images) return [];
    if (filter === "all") return images;
    if (filter === NONE) return images.filter((i) => !i.season_id);
    return images.filter((i) => String(i.season_id) === String(filter));
  }, [images, filter]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allShownSelected = shown.length > 0 && shown.every((i) => selected.has(i.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      shown.forEach((i) => (allShownSelected ? next.delete(i.id) : next.add(i.id)));
      return next;
    });

  const seasonName = (id) => seasons.find((s) => String(s.id) === String(id))?.name || "Unsorted";

  const changeOne = async (image, value) => {
    const seasonId = value === NONE ? null : Number(value);
    try {
      const r = await updateImage(image.id, { season_id: seasonId });
      setImages((list) => list.map((i) => (i.id === image.id ? r.data.image : i)));
      toast.success(`Moved to ${seasonName(value)}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update the photo.");
    }
  };

  const moveSelected = async () => {
    if (!moveTo || !selected.size) return;
    setBusy(true);
    try {
      const r = await bulkAssignSeason([...selected], moveTo === NONE ? null : Number(moveTo));
      toast.success(`${r.data.updated} photo${r.data.updated === 1 ? "" : "s"} moved to ${seasonName(moveTo)}.`);
      setSelected(new Set());
      setMoveTo("");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not move the photos.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (image) => {
    if (!window.confirm(`Delete “${image.title}”? It will be removed from the site.`)) return;
    try {
      await deleteImage(image.id);
      toast.success("Photo deleted.");
      setImages((list) => list.filter((i) => i.id !== image.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    } catch {
      toast.error("Could not delete the photo.");
    }
  };

  const chips = [
    { key: "all", label: "All" },
    ...seasons.map((s) => ({ key: String(s.id), label: s.name })),
    { key: NONE, label: "Unsorted" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Gallery"
        description="Photos are grouped by season on the public Gallery page. Sort each photo into the edition it's from."
        actions={
          <button onClick={() => setUploading(true)} className="k-btn-primary">
            <FaPlus /> Upload photos
          </button>
        }
      />

      {/* Season filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`k-quad px-4 py-2 text-sm font-semibold ${filter === c.key ? "bg-earth text-cream" : "bg-white text-earth hover:bg-cream-dark"}`}
          >
            {c.label} <span className="opacity-60">· {counts[c.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {images?.length > 0 && (
        <div className="k-cut sticky top-[4.5rem] z-20 mb-5 flex flex-wrap items-center gap-3 bg-earth p-3 text-cream shadow-lg">
          <button onClick={toggleAll} className="k-quad bg-cream/10 px-3 py-2 text-sm font-semibold hover:bg-cream/20">
            {allShownSelected ? "Clear selection" : `Select all ${shown.length}`}
          </button>
          <span className="text-sm text-cream/80">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SeasonSelect
              seasons={seasons}
              value={moveTo || ""}
              onChange={setMoveTo}
              className="!w-auto !py-2 text-earth"
              disabled={!selected.size || busy}
            />
            <button onClick={moveSelected} disabled={!selected.size || !moveTo || busy} className="k-btn-primary !py-2">
              {busy && <Spinner />} Move to season
            </button>
          </div>
        </div>
      )}

      {images === null ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<FaImages />} title={images.length ? "No photos here" : "No photos yet"}>
          {images.length ? "Pick another season, or move photos into this one." : "Upload the first photos from a Kamaru Challenge."}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((image) => {
            const isSel = selected.has(image.id);
            return (
              <div key={image.id} className={`k-card relative flex flex-col p-2 transition ${isSel ? "!bg-kamaru/15 ring-2 ring-kamaru" : ""}`}>
                <button
                  type="button"
                  onClick={() => toggle(image.id)}
                  className="relative block overflow-hidden"
                  aria-pressed={isSel}
                  aria-label={`${isSel ? "Unselect" : "Select"} ${image.title}`}
                >
                  <img src={cld(image.image_url, 400)} alt={image.title} loading="lazy" className="k-quad-shape h-40 w-full object-cover" />
                  <span
                    className={`absolute left-2 top-2 grid h-7 w-7 place-items-center k-quad-shape text-sm ${
                      isSel ? "bg-kamaru text-earth" : "bg-cream/85 text-transparent"
                    }`}
                  >
                    <FaCheck />
                  </span>
                </button>
                <p className="mt-2 px-1 text-sm font-semibold text-earth line-clamp-1" title={image.title}>
                  {image.title}
                </p>
                <div className="mt-2 flex items-center gap-2 px-1 pb-1">
                  <SeasonSelect seasons={seasons} value={image.season_id ? String(image.season_id) : NONE} onChange={(v) => changeOne(image, v)} className="!py-1.5 text-xs" />
                  <button onClick={() => remove(image)} className="k-icon-btn shrink-0 hover:!text-bead-red" aria-label={`Delete ${image.title}`}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadModal
        open={uploading}
        onClose={() => setUploading(false)}
        seasons={seasons}
        onDone={() => {
          setUploading(false);
          load();
        }}
      />
    </div>
  );
};

export default ManageGallery;
