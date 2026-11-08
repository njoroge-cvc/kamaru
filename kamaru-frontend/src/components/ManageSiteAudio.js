import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaMusic, FaTrash, FaUpload } from "react-icons/fa";
import { fetchSiteAudio, uploadSiteAudio, renameSiteAudio, deleteSiteAudio } from "../api";
import { Field, Spinner } from "./ui";

/** Dashboard card: the one track visitors can play while browsing. */
const ManageSiteAudio = () => {
  const [audio, setAudio] = useState(undefined); // undefined = loading, null = none
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSiteAudio()
      .then((r) => {
        setAudio(r.data?.audio || null);
        setTitle(r.data?.audio?.title || "");
      })
      .catch(() => setAudio(null));
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Choose an audio file first.");
    const fd = new FormData();
    fd.append("audio", file);
    fd.append("title", title);
    setBusy(true);
    try {
      const r = await uploadSiteAudio(fd);
      setAudio(r.data.audio);
      setFile(null);
      e.target.reset();
      toast.success("Background music updated. Visitors will see the Listen button.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    try {
      const r = await renameSiteAudio(title);
      setAudio(r.data.audio);
      toast.success("Title saved.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save the title.");
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove the background music? The Listen button will disappear from the site.")) return;
    try {
      await deleteSiteAudio();
      setAudio(null);
      setTitle("");
      toast.success("Background music removed.");
    } catch {
      toast.error("Could not remove the music.");
    }
  };

  return (
    <section className="k-card mb-8 p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center k-quad-shape bg-kamaru/15 text-lg text-kamaru-dark">
          <FaMusic />
        </span>
        <div>
          <h3 className="font-display text-xl text-earth">Background music</h3>
          <p className="mt-1 text-sm text-earth-600">
            One track visitors can play while they browse, using the “Listen while you browse” button. Nothing plays until they press it,
            and it pauses when they watch a video. Use audio you have the rights to, such as an MP3 exported from one of your own
            performance videos (3 to 5 minutes, under 20 MB).
          </p>
        </div>
      </div>

      {audio === undefined ? (
        <div className="mt-5 flex justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="k-label">Now on the site</p>
            {audio ? (
              <div className="k-cut bg-cream p-4">
                <audio controls preload="none" src={audio.url} className="w-full" />
                <div className="mt-3 flex gap-2">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="k-input" placeholder="Title shown to visitors" />
                  <button onClick={rename} className="k-btn-outline shrink-0" disabled={title === (audio.title || "")}>
                    Save title
                  </button>
                </div>
                <button onClick={remove} className="k-btn-ghost k-btn-sm mt-3 hover:!text-bead-red">
                  <FaTrash /> Remove music
                </button>
              </div>
            ) : (
              <p className="k-cut bg-cream p-4 text-sm text-earth-600">No music yet, so the Listen button is hidden on the site.</p>
            )}
          </div>

          <form onSubmit={upload} className="space-y-4">
            <Field label={audio ? "Replace with a new track" : "Upload a track"} hint="MP3, WEBA, M4A, OGG or WAV. Visitors always receive it as MP3, which plays everywhere.">
              <input type="file" accept="audio/*,.mp3,.weba,.webm,.m4a,.ogg,.opus,.wav,.flac" onChange={(e) => setFile(e.target.files?.[0] || null)} className="k-input" />
            </Field>
            {!audio && (
              <Field label="Title" hint="Shown to visitors, e.g. “Mumburo Dancers – Mucungwa (2024)”.">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="k-input" />
              </Field>
            )}
            <button type="submit" className="k-btn-primary" disabled={busy || !file}>
              {busy ? <Spinner /> : <FaUpload />} {busy ? "Uploading…" : audio ? "Replace track" : "Upload track"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default ManageSiteAudio;
