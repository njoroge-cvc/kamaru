import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaPlus, FaDoorOpen, FaDoorClosed, FaStar, FaClock } from "react-icons/fa";
import { fetchSeasons, createSeason, updateSeason } from "../api";
import { PageHeader, Modal, Field, EmptyState, Spinner } from "./ui";

const toLocalInput = (iso) => (iso ? String(iso).slice(0, 16) : "");

const StatusBadge = ({ season }) => {
  if (!season.is_active) return <span className="k-badge-earth">Inactive</span>;
  if (season.accepting_registrations) return <span className="k-badge-green">● Registration open</span>;
  if (season.registration_open && !season.accepting_registrations)
    return <span className="k-badge-gold">Auto-closed</span>;
  return <span className="k-badge-red">Registration closed</span>;
};

/** Big, unmissable switch for the participation window. */
const RegistrationSwitch = ({ checked, disabled, onChange, busy }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled || busy}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-10 w-[4.5rem] shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
      checked ? "bg-bead-green" : "bg-earth/25"
    }`}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow ${checked ? "ml-auto mr-1 text-bead-green" : "ml-1 text-earth-600"}`}
    >
      {busy ? <Spinner className="h-4 w-4" /> : checked ? <FaDoorOpen /> : <FaDoorClosed />}
    </motion.span>
  </button>
);

const ManageSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", year: new Date().getFullYear() + 1 });

  const load = useCallback(() => {
    fetchSeasons()
      .then((r) => setSeasons(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Couldn't load seasons."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const patch = async (season, data, successMsg) => {
    setBusyId(season.id);
    try {
      await updateSeason(season.id, data);
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleRegistration = (season, open) => {
    const verb = open ? "OPEN" : "CLOSE";
    if (!window.confirm(`${verb} registration for ${season.name}? ${open ? "Members will be able to sign up immediately." : "The public form will stop accepting entries."}`)) return;
    patch(season, { registration_open: open }, open ? `Registration for ${season.name} is now open.` : `Registration for ${season.name} is now closed.`);
  };

  const activate = (season) => {
    if (!window.confirm(`Make ${season.name} the active season? Any other active season will be deactivated and its registration closed.`)) return;
    patch(season, { is_active: true }, `${season.name} is now the active season.`);
  };

  const setCloseDate = (season, value) =>
    patch(season, { registration_closes_at: value || null }, value ? "Auto-close time saved." : "Auto-close removed.");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSeason(form);
      toast.success(`${form.name} created. Activate it when you're ready.`);
      setCreating(false);
      setForm({ name: "", year: new Date().getFullYear() + 1 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't create season.");
    }
  };

  const active = seasons.find((s) => s.is_active);

  return (
    <div>
      <PageHeader
        eyebrow="Competition"
        title="Seasons & Registration"
        description="Open or close participation for the Kamaru Challenge. Only the active season accepts entries; you can also set a time for registration to close automatically."
        actions={
          <button onClick={() => setCreating(true)} className="k-btn-primary">
            <FaPlus /> New season
          </button>
        }
      />

      {loading ? (
        <div className="k-card animate-pulse h-40" />
      ) : seasons.length === 0 ? (
        <EmptyState icon={<FaStar />} title="No seasons yet">
          Create the first season to start accepting registrations.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {/* Active season hero card */}
          {active && (
            <div className="relative overflow-hidden rounded-3xl bg-earth text-cream swirl-bg">
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kamaru-light">Active season</p>
                  <h3 className="mt-1 font-display text-3xl font-bold">{active.name}</h3>
                  <div className="mt-3"><StatusBadge season={active} /></div>
                  <div className="mt-5 max-w-sm">
                    <span className="k-label text-cream/80 flex items-center gap-2">
                      <FaClock /> Close automatically at (optional)
                    </span>
                    <input
                      type="datetime-local"
                      defaultValue={toLocalInput(active.registration_closes_at)}
                      key={active.registration_closes_at || "none"}
                      onBlur={(e) => {
                        if (e.target.value !== toLocalInput(active.registration_closes_at)) setCloseDate(active, e.target.value);
                      }}
                      className="k-input text-earth"
                    />
                    <p className="k-hint text-cream/60">Leave empty to keep registration open until you close it.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-cream/10 p-5">
                  <div>
                    <p className="font-semibold">Accept registrations</p>
                    <p className="text-sm text-cream/60">{active.registration_open ? "Switch off to close" : "Switch on to open"}</p>
                  </div>
                  <RegistrationSwitch
                    checked={active.registration_open}
                    busy={busyId === active.id}
                    onChange={(v) => toggleRegistration(active, v)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="k-table-wrap bg-white">
            <table className="k-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.name}</td>
                    <td>{s.year}</td>
                    <td><StatusBadge season={s} /></td>
                    <td className="text-right">
                      {s.is_active ? (
                        <span className="k-badge-orange"><FaStar /> Active</span>
                      ) : (
                        <button onClick={() => activate(s)} disabled={busyId === s.id} className="k-btn-outline k-btn-sm">
                          Make active
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New season" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Season name">
            <input className="k-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kamaru Challenge – Ndeiya Edition 2027" required />
          </Field>
          <Field label="Year">
            <input className="k-input" type="number" min="2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          </Field>
          <p className="k-hint">New seasons start inactive with registration closed.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="k-btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button type="submit" className="k-btn-primary">Create season</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSeasons;
