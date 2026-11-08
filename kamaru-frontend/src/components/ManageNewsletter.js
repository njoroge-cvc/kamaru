import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaEnvelope, FaPaperPlane, FaPlus, FaTrash, FaFileExcel, FaSearch, FaRedo } from "react-icons/fa";
import { fetchSubscribers, addSubscriber, removeSubscriber, resendConfirmations, fetchNewsletterSends } from "../api";
import { PageHeader, Modal, Field, EmptyState, Spinner, usePaged, Pager } from "./ui";

const STATUS = {
  confirmed: { label: "Confirmed", cls: "k-badge-green" },
  unconfirmed: { label: "Awaiting confirmation", cls: "k-badge-gold" },
  unsubscribed: { label: "Unsubscribed", cls: "k-badge-earth" },
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "–");
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

const ManageNewsletter = () => {
  const [subs, setSubs] = useState(null);
  const [recipients, setRecipients] = useState(0);
  const [sends, setSends] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const load = () => {
    fetchSubscribers()
      .then((r) => {
        setSubs(r.data.subscribers || []);
        setRecipients(r.data.recipients || 0);
      })
      .catch(() => {
        setSubs([]);
        toast.error("Could not load subscribers.");
      });
    fetchNewsletterSends().then((r) => setSends(r.data.sends || [])).catch(() => {});
  };
  useEffect(load, []);

  const counts = useMemo(() => {
    const c = { confirmed: 0, unconfirmed: 0, unsubscribed: 0 };
    (subs || []).forEach((s) => (c[s.status] = (c[s.status] || 0) + 1));
    return c;
  }, [subs]);

  const filtered = useMemo(
    () => (subs || []).filter((s) => (!status || s.status === status) && s.email.toLowerCase().includes(query.trim().toLowerCase())),
    [subs, status, query]
  );
  const paged = usePaged(filtered, 10);

  const resendAll = async () => {
    if (!counts.unconfirmed) return;
    if (!window.confirm(`Send a fresh confirmation link to ${counts.unconfirmed} unconfirmed subscriber(s)?`)) return;
    setBusy(true);
    try {
      const r = await resendConfirmations({ all_unconfirmed: true });
      toast.success(`Confirmation links sent: ${r.data.sent}${r.data.failed ? `, failed: ${r.data.failed}` : ""}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not send the links.");
    } finally {
      setBusy(false);
    }
  };

  const resendOne = async (s) => {
    try {
      const r = await resendConfirmations({ ids: [s.id] });
      r.data.sent ? toast.success(`Confirmation link sent to ${s.email}.`) : toast.error("It couldn't be sent.");
      load();
    } catch {
      toast.error("It couldn't be sent.");
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email} from the list? (To stop emails but keep a record, they can unsubscribe instead.)`)) return;
    try {
      await removeSubscriber(s.id);
      toast.success("Removed.");
      load();
    } catch {
      toast.error("Could not remove them.");
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      await addSubscriber(newEmail);
      toast.success(`${newEmail} added. A confirmation link was sent.`);
      setAdding(false);
      setNewEmail("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not add them.");
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((s) => ({ Email: s.email, Status: STATUS[s.status]?.label, Joined: fmt(s.subscribed_at) })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscribers");
    XLSX.writeFile(wb, "kamaru-newsletter-subscribers.xlsx");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Newsletter"
        description="Everyone who signed up receives newsletters unless they unsubscribe. Send a blog post as a newsletter from Blog → Publish & email."
        actions={
          <>
            <button onClick={exportExcel} className="k-btn-outline k-btn-sm"><FaFileExcel /> Excel</button>
            <button onClick={() => setAdding(true)} className="k-btn-primary"><FaPlus /> Add subscriber</button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="k-card p-5">
          <p className="text-sm text-earth-600">Receive newsletters</p>
          <p className="font-display text-4xl text-earth">{recipients}</p>
        </div>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} className="k-card p-5">
            <span className={`k-badge ${v.cls}`}>{v.label}</span>
            <p className="mt-2 font-display text-3xl text-earth">{counts[k] || 0}</p>
          </div>
        ))}
      </div>

      {counts.unconfirmed > 0 && (
        <div className="k-cut mb-6 flex flex-col gap-3 bg-bead-gold/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-earth">
            <strong>{counts.unconfirmed}</strong> people signed up but never confirmed. They still receive newsletters; a fresh link lets them confirm.
          </p>
          <button onClick={resendAll} disabled={busy} className="k-btn-primary shrink-0">
            {busy ? <Spinner /> : <FaRedo />} Resend confirmation links
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute z-10 left-4 top-1/2 -translate-y-1/2 text-earth-600" />
          <input className="k-input pl-11" placeholder="Search by email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="k-input sm:w-60" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {subs === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FaEnvelope />} title="No subscribers here">Try another search or status.</EmptyState>
      ) : (
        <>
          <div className="k-table-wrap bg-white">
            <table className="k-table">
              <thead>
                <tr><th>Email</th><th>Status</th><th>Joined</th><th>Last link sent</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {paged.slice.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.email}</td>
                    <td><span className={`k-badge ${STATUS[s.status]?.cls}`}>{STATUS[s.status]?.label}</span></td>
                    <td className="text-earth-700">{fmt(s.subscribed_at)}</td>
                    <td className="text-earth-700">{fmt(s.last_confirmation_sent_at)}</td>
                    <td className="whitespace-nowrap text-right">
                      {s.status === "unconfirmed" && (
                        <button className="k-icon-btn" onClick={() => resendOne(s)} aria-label="Resend confirmation link" title="Resend confirmation link"><FaPaperPlane /></button>
                      )}
                      <button className="k-icon-btn hover:!text-bead-red" onClick={() => remove(s)} aria-label="Remove" title="Remove"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager paged={paged} label="subscribers" />
        </>
      )}

      <h3 className="mb-3 mt-10 font-display text-2xl text-earth">Sent newsletters</h3>
      {sends.filter((s) => s.kind !== "test").length === 0 ? (
        <p className="text-sm text-earth-600">Nothing sent yet. Publish a blog post with “Publish & email subscribers”.</p>
      ) : (
        <ul className="space-y-2">
          {sends.filter((s) => s.kind !== "test").map((s) => (
            <li key={s.id} className="k-card flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-earth">{s.subject}</span>
              <span className="text-sm text-earth-600">
                {fmtTime(s.created_at)} · {s.status === "sending" ? `sending… ${s.delivered}/${s.recipients}` : `delivered to ${s.delivered} of ${s.recipients}`}
                {s.failed > 0 && ` · ${s.failed} failed`}
                {s.sent_by && ` · by ${s.sent_by}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a subscriber" size="sm">
        <form onSubmit={add} className="space-y-4">
          <Field label="Email" hint="They'll get a confirmation link. Only add people who asked to hear from you.">
            <input type="email" className="k-input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="k-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" className="k-btn-primary">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageNewsletter;
