import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaDownload, FaEdit, FaTrash, FaUpload, FaSearch, FaFolderOpen, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFileAlt } from "react-icons/fa";
import { fetchDocuments, getDocumentDownload, uploadDocument, updateDocument, deleteDocument, fetchSeasons } from "../api";
import { PageHeader, Modal, Field, EmptyState, Spinner, usePaged, Pager } from "./ui";
import { useSession } from "./useSession";
import { PERMS } from "../auth";

export const DOC_CATEGORIES = [
  { key: "consent", label: "Consent forms" },
  { key: "judging", label: "Judging sheets" },
  { key: "rules", label: "Rules & guidelines" },
  { key: "programme", label: "Programmes & schedules" },
  { key: "other", label: "Other documents" },
];
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.jpg,.jpeg,.png";

const ICON = { pdf: [FaFilePdf, "text-bead-red"], doc: [FaFileWord, "text-bead-blue"], docx: [FaFileWord, "text-bead-blue"], odt: [FaFileWord, "text-bead-blue"],
  xls: [FaFileExcel, "text-bead-green"], xlsx: [FaFileExcel, "text-bead-green"], csv: [FaFileExcel, "text-bead-green"], ods: [FaFileExcel, "text-bead-green"],
  ppt: [FaFilePowerpoint, "text-ochre"], pptx: [FaFilePowerpoint, "text-ochre"], odp: [FaFilePowerpoint, "text-ochre"],
  jpg: [FaFileImage, "text-forest"], jpeg: [FaFileImage, "text-forest"], png: [FaFileImage, "text-forest"] };

const size = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "");

const DocForm = ({ initial, seasons, onClose, onSaved }) => {
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || "other",
    season_id: initial?.season_id ? String(initial.season_id) : "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!editing && !file) return setError("Choose a file to upload.");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (!form.title.trim() && file) fd.set("title", file.name.replace(/\.[^.]+$/, ""));
    if (file) fd.append("file", file);
    setSaving(true);
    setError("");
    try {
      if (editing) await updateDocument(initial.id, fd);
      else await uploadDocument(fd);
      toast.success(editing ? "Document updated." : "Document uploaded.");
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={editing ? "Replace the file (optional)" : "File"} hint="PDF, Word, Excel, PowerPoint, text, or a photo/scan (JPG, PNG). Up to 15 MB.">
        <input type="file" accept={ACCEPT} onChange={(e) => setFile(e.target.files?.[0] || null)} className="k-input" />
      </Field>
      {editing && !file && <p className="k-hint -mt-2">Current file: {initial.file_name}</p>}
      <Field label="Title" hint={editing ? undefined : "Leave empty to use the file's name."}>
        <input value={form.title} onChange={set("title")} className="k-input" placeholder="Judging sheet, Season 4" maxLength={200} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select value={form.category} onChange={set("category")} className="k-input">
            {DOC_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Season (optional)">
          <select value={form.season_id} onChange={set("season_id")} className="k-input">
            <option value="">Any season</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.year})</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes (optional)" hint="e.g. how to fill it in, or who it's for.">
        <textarea value={form.description} onChange={set("description")} rows={3} className="k-input resize-y" />
      </Field>
      {error && <p className="k-cut bg-bead-red/10 p-3 text-sm font-semibold text-bead-red">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="k-btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="k-btn-primary">{saving ? <Spinner /> : <FaUpload />} {editing ? "Save changes" : "Upload"}</button>
      </div>
    </form>
  );
};

const ManageDocuments = () => {
  const { permissions } = useSession();
  const canManage = permissions.includes(PERMS.DOCUMENTS_MANAGE);
  const [docs, setDocs] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined closed, null new, object edit
  const [busy, setBusy] = useState(null);

  const load = () =>
    fetchDocuments()
      .then((r) => setDocs(r.data.documents || []))
      .catch(() => {
        setDocs([]);
        toast.error("Could not load documents.");
      });

  useEffect(() => {
    load();
    if (canManage) fetchSeasons().then((r) => setSeasons(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [canManage]);

  const counts = useMemo(() => {
    const c = { all: docs?.length || 0 };
    (docs || []).forEach((d) => (c[d.category] = (c[d.category] || 0) + 1));
    return c;
  }, [docs]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (docs || []).filter((d) => (cat === "all" || d.category === cat) && (!q || `${d.title} ${d.description} ${d.file_name}`.toLowerCase().includes(q)));
  }, [docs, cat, query]);
  const paged = usePaged(shown, 10);

  const download = async (d) => {
    setBusy(d.id);
    try {
      const r = await getDocumentDownload(d.id);
      window.location.assign(r.data.url); // short-lived private link; the browser downloads it
    } catch (err) {
      toast.error(err.response?.data?.error || "The download couldn't start.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete “${d.title}”? Staff won't be able to download it any more.`)) return;
    try {
      await deleteDocument(d.id);
      toast.success("Document deleted.");
      setDocs((list) => list.filter((x) => x.id !== d.id));
    } catch {
      toast.error("Could not delete the document.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Staff & officials"
        title="Documents"
        description={canManage ? "Consent forms, judging sheets, rules and programmes. Every staff member can download them; only administrators upload, edit or delete." : "Consent forms, judging sheets, rules and programmes for staff and officials. Click Download to save a copy."}
        actions={canManage && <button onClick={() => setEditing(null)} className="k-btn-primary"><FaUpload /> Upload document</button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[{ key: "all", label: "All" }, ...DOC_CATEGORIES].map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)} className={`k-quad px-4 py-2 text-sm font-semibold ${cat === c.key ? "bg-earth text-cream" : "bg-white text-earth hover:bg-cream-dark"}`}>
            {c.label} <span className="opacity-60">· {counts[c.key] || 0}</span>
          </button>
        ))}
      </div>
      <div className="relative mb-5">
        <FaSearch className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-earth-600" />
        <input className="k-input pl-11" placeholder="Search documents" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {docs === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<FaFolderOpen />} title={docs.length ? "No documents here" : "No documents yet"}>
          {docs.length ? "Try another category or search." : canManage ? "Upload the first consent form or judging sheet." : "Documents will appear here once an administrator uploads them."}
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-3">
            {paged.slice.map((d) => {
              const [Icon, tone] = ICON[d.file_ext] || [FaFileAlt, "text-earth-600"];
              return (
                <li key={d.id} className="k-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center k-quad-shape bg-cream text-3xl ${tone}`}><Icon /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="k-badge k-badge-earth">{d.category_label}</span>
                      {d.season && <span className="k-badge k-badge-gold">{d.season}</span>}
                    </div>
                    <p className="mt-1.5 font-semibold text-earth">{d.title}</p>
                    {d.description && <p className="text-sm text-earth-700">{d.description}</p>}
                    <p className="mt-1 text-xs text-earth-600">{d.file_ext.toUpperCase()} · {size(d.size_bytes)} · added {fmt(d.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => download(d)} disabled={busy === d.id} className="k-btn-primary k-btn-sm">
                      {busy === d.id ? <Spinner /> : <FaDownload />} Download
                    </button>
                    {canManage && (
                      <>
                        <button onClick={() => setEditing(d)} className="k-icon-btn" aria-label={`Edit ${d.title}`} title="Edit"><FaEdit /></button>
                        <button onClick={() => remove(d)} className="k-icon-btn hover:!text-bead-red" aria-label={`Delete ${d.title}`} title="Delete"><FaTrash /></button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <Pager paged={paged} label="documents" />
        </>
      )}

      {canManage && (
        <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? "Edit document" : "Upload a document"}>
          {editing !== undefined && (
            <DocForm key={editing?.id || "new"} initial={editing} seasons={seasons} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />
          )}
        </Modal>
      )}
    </div>
  );
};

export default ManageDocuments;
