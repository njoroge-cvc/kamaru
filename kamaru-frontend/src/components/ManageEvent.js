import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaCopy, FaStar, FaRegCalendarAlt, FaMapMarkerAlt, FaExclamationTriangle, FaExternalLinkAlt } from "react-icons/fa";
import { fetchEvents, createEvent, updateEvent, deleteEvent, fetchSeasons } from "../api";
import { PageHeader, Modal, Field, EmptyState, Spinner } from "./ui";
import { cld } from "../utils/cloudinary";
import { timingOf, statusOf } from "../utils/events";

export const KIND_OPTIONS = [
  { kind: "challenge", label: "Kamaru Challenge", hint: "The competition day itself, or its auditions and finals" },
  { kind: "camp", label: "Camp / retreat", hint: "Woman Across Generations, Father and Son, Medicine Day…" },
  { kind: "community", label: "Community event", hint: "Gatherings, tree planting, Mazingira Day…" },
  { kind: "partner", label: "Partner event", hint: "Events by others that share our values" },
];
const KIND_BADGE = { challenge: "k-badge-red", camp: "k-badge-gold", community: "k-badge-blue", partner: "k-badge-earth" };
const STATUS_BADGE = { scheduled: "k-badge-green", postponed: "k-badge-gold", cancelled: "k-badge-red" };

const EMPTY = {
  title: "", kind: "community", season_id: "", theme: "", details: "", date_time: "", location: "",
  status: "scheduled", featured: false, cost: "Free", registration_required: false, registration_link: "", map_link: "",
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Same day and a shared meaningful word in the title -> probably the same event entered twice
const words = (t) => new Set(String(t).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !["kamaru", "challenge", "season", "edition"].includes(w)));
const findDuplicate = (event, all) =>
  all.find((o) => {
    if (o.id === event.id || o.date_time.slice(0, 10) !== event.date_time.slice(0, 10)) return false;
    const a = words(event.title), b = words(o.title);
    return a.size === 0 || b.size === 0 ? event.kind === o.kind : [...a].some((w) => b.has(w));
  });

const EventForm = ({ initial, seasons, onClose, onSaved }) => {
  const editing = !!initial?.id;
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...EMPTY,
          ...initial,
          status: statusOf(initial),
          kind: initial.kind || "community",
          season_id: initial.season_id ? String(initial.season_id) : "",
          date_time: initial.date_time ? initial.date_time.slice(0, 16) : "",
          cost: initial.cost || "Free",
          registration_link: initial.registration_link || "",
          map_link: initial.map_link || "",
        }
      : EMPTY
  );
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const preview = image ? URL.createObjectURL(image) : !removeImage && initial?.image_url ? cld(initial.image_url, 600) : null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const fd = new FormData();
    ["title", "kind", "season_id", "theme", "details", "date_time", "location", "status", "cost", "registration_link", "map_link"].forEach((k) =>
      fd.append(k, form[k] ?? "")
    );
    fd.append("featured", String(!!form.featured));
    fd.append("registration_required", String(!!form.registration_required));
    if (image) fd.append("image", image);
    else if (!editing && initial?.image_url) fd.append("image_url", initial.image_url); // duplicating keeps the photo
    if (removeImage) fd.append("remove_image", "true");
    setSaving(true);
    try {
      if (editing) await updateEvent(initial.id, fd);
      else await createEvent(fd);
      toast.success(editing ? "Event updated." : "Event created.");
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const kindHint = KIND_OPTIONS.find((k) => k.kind === form.kind)?.hint;

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Title">
        <input value={form.title} onChange={set("title")} className="k-input" required placeholder="Kamaru Challenge 2027" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" hint={kindHint}>
          <select value={form.kind} onChange={set("kind")} className="k-input">
            {KIND_OPTIONS.map((k) => (
              <option key={k.kind} value={k.kind}>{k.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Season" hint="Which Kamaru Challenge season it belongs to (optional).">
          <select value={form.season_id} onChange={set("season_id")} className="k-input">
            <option value="">Not tied to a season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
            ))}
          </select>
        </Field>
        <Field label="Date & time" hint="Kenyan time.">
          <input type="datetime-local" value={form.date_time} onChange={set("date_time")} className="k-input" required />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set("status")} className="k-input">
            <option value="scheduled">Scheduled</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled (hidden from the site)</option>
          </select>
        </Field>
      </div>
      <Field label="Location">
        <input value={form.location} onChange={set("location")} className="k-input" required placeholder="Rediscovery Garden, Karera, Nguirubi" />
      </Field>
      <Field label="Theme / tagline" hint="One line shown above the title, e.g. “Fanning the flame of values”.">
        <input value={form.theme} onChange={set("theme")} className="k-input" />
      </Field>
      <Field label="About this event">
        <textarea value={form.details} onChange={set("details")} rows={6} className="k-input resize-y" placeholder="What happens, who it's for, what to bring…" />
      </Field>
      <label className="k-cut flex cursor-pointer items-start gap-3 bg-kamaru/10 p-4">
        <input type="checkbox" checked={!!form.featured} onChange={set("featured")} className="mt-1 h-4 w-4 accent-kamaru" />
        <span>
          <span className="flex items-center gap-2 font-semibold text-earth"><FaStar className="text-kamaru" /> Feature on the homepage</span>
          <span className="block text-sm text-earth-600">The homepage hero counts down to this event. Only one event can be featured; choosing this un-features any other.</span>
        </span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cost">
          <input value={form.cost} onChange={set("cost")} className="k-input" placeholder="Free, KES 500, Donation-based…" />
        </Field>
        <Field label="Map link (optional)">
          <input value={form.map_link} onChange={set("map_link")} className="k-input" placeholder="https://maps.google.com/…" />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-earth">
        <input type="checkbox" checked={!!form.registration_required} onChange={set("registration_required")} className="h-4 w-4 accent-kamaru" />
        Attendees must register
      </label>
      {form.registration_required && (
        <Field label="Registration link">
          <input value={form.registration_link} onChange={set("registration_link")} className="k-input" placeholder="https://…" />
        </Field>
      )}
      <Field label="Photo or poster (optional)" hint="Without one, the site shows the Kamaru Challenge image.">
        <div className="flex items-center gap-4">
          {preview && <img src={preview} alt="" className="k-quad-shape h-20 w-28 shrink-0 object-cover" />}
          <input type="file" accept="image/*" onChange={(e) => { setImage(e.target.files?.[0] || null); setRemoveImage(false); }} className="k-input" />
        </div>
        {preview && editing && !image && (
          <button type="button" onClick={() => setRemoveImage(true)} className="k-btn-ghost k-btn-sm mt-2">Remove photo</button>
        )}
      </Field>
      {error && <p className="k-cut bg-bead-red/10 p-3 text-sm font-semibold text-bead-red">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="k-btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="k-btn-primary">{saving && <Spinner />} {editing ? "Save changes" : "Create event"}</button>
      </div>
    </form>
  );
};

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

const ManageEvent = () => {
  const [events, setEvents] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [kind, setKind] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined = closed; object = edit/duplicate; null = new

  const load = () =>
    fetchEvents("all")
      .then((r) => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        setEvents([]);
        toast.error("Could not load events.");
      });

  useEffect(() => {
    load();
    fetchSeasons().then((r) => setSeasons(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const inTab = (e, t) =>
    t === "all" ? true : t === "cancelled" ? statusOf(e) === "cancelled" : statusOf(e) !== "cancelled" && timingOf(e) === t;

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, (events || []).filter((e) => inTab(e, t.key)).length])), [events]);

  const shown = useMemo(() => {
    const list = (events || []).filter((e) => inTab(e, tab) && (!kind || e.kind === kind));
    return tab === "upcoming" ? [...list].sort((a, b) => a.date_time.localeCompare(b.date_time)) : list;
  }, [events, tab, kind]);

  const duplicate = (e) =>
    setEditing({ ...e, id: undefined, title: `${e.title} (copy)`, featured: false, status: "scheduled" });

  const remove = async (e) => {
    if (!window.confirm(`Delete “${e.title}”? This can't be undone.`)) return;
    try {
      await deleteEvent(e.id);
      toast.success("Event deleted.");
      setEvents((list) => list.filter((x) => x.id !== e.id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete the event.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Programme"
        title="Events"
        description="The Kamaru Challenge itself, camps and retreats, community days and partner events. Upcoming and past are worked out from each event's date."
        actions={
          <button onClick={() => setEditing(null)} className="k-btn-primary">
            <FaPlus /> New event
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`k-quad px-4 py-2 text-sm font-semibold ${tab === t.key ? "bg-earth text-cream" : "bg-white text-earth hover:bg-cream-dark"}`}
          >
            {t.label} <span className="opacity-60">· {counts[t.key] || 0}</span>
          </button>
        ))}
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="k-input ml-auto !w-auto !py-2 text-sm" aria-label="Filter by type">
          <option value="">All types</option>
          {KIND_OPTIONS.map((k) => (
            <option key={k.kind} value={k.kind}>{k.label}</option>
          ))}
        </select>
      </div>

      {events === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<FaRegCalendarAlt />} title={tab === "upcoming" ? "Nothing coming up" : "No events here"}>
          {tab === "upcoming" ? "Add the next Kamaru Challenge, camp or community day." : "Try another tab or type."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((e) => {
            const dup = findDuplicate(e, events);
            return (
              <li key={e.id} className="k-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="k-quad-shape h-24 w-full shrink-0 overflow-hidden bg-earth sm:w-36">
                  <img src={e.image_url ? cld(e.image_url, 320) : "/og-image.jpg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {e.kind_label && <span className={`k-badge ${KIND_BADGE[e.kind] || "k-badge-earth"}`}>{e.kind_label}</span>}
                    {e.season && <span className="k-badge k-badge-earth">{e.season}</span>}
                    {statusOf(e) !== "scheduled" && <span className={`k-badge ${STATUS_BADGE[statusOf(e)]}`}>{statusOf(e)}</span>}
                    {e.featured && <span className="k-badge k-badge-gold"><FaStar /> Featured</span>}
                    <span className="k-badge k-badge-earth">{timingOf(e) === "upcoming" ? "Upcoming" : "Past"}</span>
                  </div>
                  <p className="mt-2 truncate font-display text-lg text-earth">{e.title}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-earth-600">
                    <span className="inline-flex items-center gap-1.5"><FaRegCalendarAlt /> {fmtDate(e.date_time)}</span>
                    <span className="inline-flex items-center gap-1.5"><FaMapMarkerAlt /> {e.location}</span>
                  </p>
                  {dup && (
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-bead-red">
                      <FaExclamationTriangle /> Possible duplicate of “{dup.title}” on the same day
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <a href={`/events/${e.id}`} target="_blank" rel="noopener noreferrer" className="k-icon-btn" aria-label="View on site" title="View on site"><FaExternalLinkAlt /></a>
                  <button onClick={() => setEditing(e)} className="k-icon-btn" aria-label="Edit" title="Edit"><FaEdit /></button>
                  <button onClick={() => duplicate(e)} className="k-icon-btn" aria-label="Duplicate" title="Duplicate (e.g. for next year)"><FaCopy /></button>
                  <button onClick={() => remove(e)} className="k-icon-btn hover:!text-bead-red" aria-label="Delete" title="Delete"><FaTrash /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing?.id ? "Edit event" : editing ? "Duplicate event" : "New event"} size="lg">
        {editing !== undefined && (
          <EventForm
            key={editing?.id || editing?.title || "new"}
            initial={editing}
            seasons={seasons}
            onClose={() => setEditing(undefined)}
            onSaved={() => {
              setEditing(undefined);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageEvent;
