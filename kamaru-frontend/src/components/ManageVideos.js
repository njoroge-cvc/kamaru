import { toast } from "react-toastify";
import React, { useEffect, useMemo, useState } from "react";
import { fetchVideos, addVideo, deleteVideo } from "../api";
import { FaTrash, FaPlay, FaPlus, FaExclamationTriangle, FaYoutube, FaCheckCircle } from "react-icons/fa";
import { extractYouTubeID, youTubeThumb } from "../utils/youtube";
import { PageHeader, Modal, Field, EmptyState, Spinner } from "./ui";
import VideoPlayer from "./VideoPlayer";

const EMPTY = { title: "", youtube_url: "" };

const ManageVideos = () => {
  const [videos, setVideos] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetchVideos()
      .then((r) => setVideos((r.data?.videos || []).map((v) => ({ ...v, youtube_id: extractYouTubeID(v.youtube_url) }))))
      .catch(() => {
        setVideos([]);
        toast.error("Could not load videos.");
      });

  useEffect(() => {
    load();
  }, []);

  // Live check of the pasted link
  const previewId = useMemo(() => extractYouTubeID(form.youtube_url), [form.youtube_url]);
  const linkTyped = form.youtube_url.trim().length > 0;
  const duplicate = previewId && videos?.find((v) => v.youtube_id === previewId);

  const close = () => {
    setShowForm(false);
    setForm(EMPTY);
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!previewId) return setError("That isn't a YouTube video link. Open the video on YouTube, tap Share and copy the link.");
    if (duplicate) return setError(`This video is already added as “${duplicate.title}”.`);
    setSaving(true);
    try {
      await addVideo({ title: form.title.trim(), youtube_url: form.youtube_url.trim() });
      toast.success("Video added. It's now on the homepage and Videos page.");
      close();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not add the video. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete “${video.title}”? It will disappear from the site.`)) return;
    try {
      await deleteVideo(video.id);
      toast.success("Video deleted.");
      setVideos((list) => list.filter((v) => v.id !== video.id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete the video.");
    }
  };

  const broken = (videos || []).filter((v) => !v.youtube_id);

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Videos"
        description="YouTube performances shown on the homepage and the Videos page, newest first."
        actions={
          <button onClick={() => setShowForm(true)} className="k-btn-primary">
            <FaPlus /> Add video
          </button>
        }
      />

      {broken.length > 0 && (
        <div className="k-cut mb-6 flex items-start gap-3 bg-bead-red/10 p-4 text-sm text-earth">
          <FaExclamationTriangle className="mt-0.5 shrink-0 text-bead-red" />
          <p>
            {broken.length === 1 ? "One video has" : `${broken.length} videos have`} a link that isn't a playable YouTube video, so{" "}
            {broken.length === 1 ? "it is" : "they are"} hidden on the site. Delete and add again with the video's Share link.
          </p>
        </div>
      )}

      {videos === null ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : videos.length === 0 ? (
        <EmptyState icon={<FaYoutube />} title="No videos yet">
          Add the first performance from YouTube.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="k-card flex flex-col p-4">
              {video.youtube_id ? (
                <VideoPlayer video={video} />
              ) : (
                <div className="k-cut grid aspect-video place-items-center bg-bead-red/10 p-4 text-center text-sm text-earth">
                  <span>
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl text-bead-red" />
                    Not a playable YouTube link
                    <span className="mt-1 block break-all text-xs text-earth-600">{video.youtube_url}</span>
                  </span>
                </div>
              )}
              <h4 className="mt-3 font-semibold leading-snug text-earth">{video.title}</h4>
              <div className="mt-auto flex items-center justify-between pt-3">
                <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="k-btn-ghost k-btn-sm">
                  <FaPlay /> YouTube
                </a>
                <button onClick={() => handleDelete(video)} className="k-btn-ghost k-btn-sm hover:!text-bead-red">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={close} title="Add a video">
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="YouTube link" hint="On YouTube: Share → Copy link. Channel and playlist links won't work.">
            <input
              value={form.youtube_url}
              onChange={(e) => {
                setForm({ ...form, youtube_url: e.target.value });
                setError("");
              }}
              placeholder="https://youtu.be/…"
              className="k-input"
              autoFocus
              required
            />
          </Field>

          {linkTyped && (
            <div className="k-cut bg-white p-3">
              {previewId ? (
                <div className="flex items-center gap-3">
                  <img src={youTubeThumb(previewId)} alt="" className="k-quad-shape aspect-video w-28 shrink-0 object-cover" />
                  <p className={`flex items-center gap-2 text-sm font-semibold ${duplicate ? "text-bead-red" : "text-bead-green"}`}>
                    {duplicate ? <FaExclamationTriangle /> : <FaCheckCircle />}
                    {duplicate ? `Already added as “${duplicate.title}”` : "Video found"}
                  </p>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm font-semibold text-bead-red">
                  <FaExclamationTriangle /> Not a YouTube video link yet
                </p>
              )}
            </div>
          )}

          <Field label="Title" hint="Shown under the video, e.g. “Mumburo Dancers | Folk song | 2024”.">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="k-input" required />
          </Field>

          {error && <p className="k-cut bg-bead-red/10 p-3 text-sm font-semibold text-bead-red">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="k-btn-ghost" onClick={close}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !previewId || !!duplicate} className="k-btn-primary">
              {saving && <Spinner />} Add video
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageVideos;
