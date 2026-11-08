import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaMicrophoneAlt, FaTimes } from "react-icons/fa";
import { fetchMyEntries, withdrawMyEntry } from "../api";
import { categoryLabel } from "../content/story";

/**
 * "Your entries" panel for logged-in members. Shows every entry the account submitted;
 * entries in the current season can be withdrawn while registration is open.
 * `refreshKey` changes after a new registration so the list reloads.
 */
const MyEntries = ({ season, refreshKey = 0 }) => {
  const [entries, setEntries] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    fetchMyEntries()
      .then((r) => setEntries(Array.isArray(r.data) ? r.data : []))
      .catch(() => setEntries([]));
  }, []);

  useEffect(load, [load, refreshKey]);

  if (!entries || entries.length === 0) return null;

  const canWithdraw = (e) => season && e.season_id === season.id && season.accepting_registrations;

  const withdraw = async (e) => {
    if (!window.confirm(`Withdraw "${e.name}" (${categoryLabel(e.category)}) from ${e.season}?`)) return;
    setBusy(e.id);
    try {
      await withdrawMyEntry(e.id);
      toast.success("Entry withdrawn.");
      setEntries((list) => list.filter((x) => x.id !== e.id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't withdraw the entry.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="k-cut-strong mb-8 bg-cream p-6 shadow-xl">
      <h2 className="font-display text-2xl font-bold text-earth">Your entries</h2>
      <p className="mt-1 text-sm text-earth-600">Entries submitted from this account. You can add more, for example for a group.</p>
      <ul className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 k-quad-shape bg-white px-4 py-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-kamaru/15 text-kamaru-dark">
                <FaMicrophoneAlt />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-earth">{e.name}</p>
                <p className="text-sm text-earth-600">
                  {categoryLabel(e.category)} · {e.season}
                </p>
              </div>
              {canWithdraw(e) ? (
                <button onClick={() => withdraw(e)} disabled={busy === e.id} className="k-btn-ghost k-btn-sm hover:!text-bead-red">
                  <FaTimes /> Withdraw
                </button>
              ) : (
                <span className="k-badge-earth">{season && e.season_id === season.id ? "Registered" : "Past season"}</span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default MyEntries;
