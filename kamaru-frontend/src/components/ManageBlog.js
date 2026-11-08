import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPaperPlane, FaEnvelope, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaArrowLeft, FaFeatherAlt } from "react-icons/fa";
import { fetchAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, sendPostNewsletter, fetchSubscribers } from "../api";
import { useSession } from "./useSession";
import { PERMS } from "../auth";
import { PageHeader, Field, EmptyState, Spinner, usePaged, Pager } from "./ui";
import BlogContent from "./BlogContent";
import { cld } from "../utils/cloudinary";
import { formatDate } from "../pages/BlogPage";

const EMPTY = { title: "", excerpt: "", content: "", published: false, author_name: "", author_title: "", author_org: "" };

const HINT = "## Heading · ### Subheading · - list item · > quote · **bold** · *italic* · [link](https://…) · blank line = new paragraph";

/** Confirm, then email a published post to subscribers. Returns true if sending started. */
export const emailPost = async (post, recipients) => {
  const again = !!post.newsletter && post.newsletter.status !== "failed";
  const msg = again
    ? `“${post.title}” was already emailed on ${new Date(post.newsletter.created_at).toLocaleDateString("en-KE")}. Send it to ${recipients} subscribers again?`
    : `Email “${post.title}” to ${recipients} subscribers now? This can't be undone.`;
  if (!window.confirm(msg)) return false;
  try {
    const r = await sendPostNewsletter(post.id, { force: again });
    toast.success(`${r.data.message}. Delivery is tracked under Newsletter.`);
    return true;
  } catch (err) {
    toast.error(err.response?.data?.error || "The newsletter couldn't be sent.");
    return false;
  }
};

const useRecipients = (enabled) => {
  const [n, setN] = useState(null);
  useEffect(() => {
    if (enabled) fetchSubscribers().then((r) => setN(r.data.recipients)).catch(() => setN(null));
  }, [enabled]);
  return n;
};

const Editor = ({ post, onDone }) => {
  const { permissions } = useSession();
  const canEmail = permissions.includes(PERMS.NEWSLETTER);
  const recipients = useRecipients(canEmail);
  const alreadyEmailed = !!post?.newsletter && post.newsletter.status !== "failed";
  const [emailToo, setEmailToo] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState(post ? { title: post.title, excerpt: post.excerpt, content: post.content, published: post.published, author_name: post.author_name || "", author_title: post.author_title || "", author_org: post.author_org || "" } : EMPTY);
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [tab, setTab] = useState("write");
  const [saving, setSaving] = useState(false);
  const preview = image ? URL.createObjectURL(image) : !removeImage && post?.cover_image_url ? cld(post.cover_image_url, 800) : null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (publish) => {
    if (!form.title.trim() || !form.content.trim()) return toast.error("Add a title and some content first.");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("excerpt", form.excerpt);
    ["author_name", "author_title", "author_org"].forEach((k) => fd.append(k, form[k] || ""));
    fd.append("content", form.content);
    fd.append("published", String(publish));
    if (image) fd.append("image", image);
    if (removeImage) fd.append("remove_image", "true");
    setSaving(true);
    try {
      const r = post ? await updateBlogPost(post.id, fd) : await createBlogPost(fd);
      const saved = r.data?.post || post;
      toast.success(publish ? "Published!" : "Draft saved.");
      if (publish && emailToo && saved?.id) await emailPost({ ...saved, newsletter: post?.newsletter }, recipients ?? "all");
      onDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save the post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button onClick={() => onDone(false)} className="k-btn-ghost k-btn-sm mb-4">
        <FaArrowLeft /> Back to posts
      </button>
      <PageHeader eyebrow="Blog" title={post ? "Edit post" : "New post"} description="Write about Kikuyu culture: songs, sayings, values, history." />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="k-card space-y-5 p-6">
          <Field label="Title">
            <input value={form.title} onChange={set("title")} className="k-input text-base" placeholder="Kīhooto: the fairness that holds a community" />
          </Field>
          <fieldset className="k-cut bg-cream p-4">
            <legend className="sr-only">About the author</legend>
            <p className="k-label">About the author</p>
            <p className="k-hint -mt-1 mb-3">Shown as the byline on the post. Leave empty to use your account name.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Name">
                <input value={form.author_name} onChange={set("author_name")} className="k-input" placeholder="Wanjiku Kamau" maxLength={120} />
              </Field>
              <Field label="Profession / niche">
                <input value={form.author_title} onChange={set("author_title")} className="k-input" placeholder="Historian, poet, elder…" maxLength={120} />
              </Field>
              <Field label="Organisation">
                <input value={form.author_org} onChange={set("author_org")} className="k-input" placeholder="Optional" maxLength={160} />
              </Field>
            </div>
          </fieldset>
          <Field label="Summary" hint="One or two sentences shown on the blog list.">
            <textarea value={form.excerpt} onChange={set("excerpt")} rows={2} className="k-input resize-y" />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="k-label mb-0">Article</span>
              <div className="flex gap-1">
                {["write", "preview"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`k-quad px-4 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-earth text-cream" : "bg-cream-dark text-earth"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {tab === "write" ? (
              <textarea
                value={form.content}
                onChange={set("content")}
                rows={18}
                className="k-input resize-y font-mono text-[13px] leading-relaxed"
                placeholder={"## Where the song came from\n\nStart writing here…"}
              />
            ) : (
              <div className="k-cut-strong min-h-[20rem] bg-cream p-6">
                {form.content.trim() ? <BlogContent text={form.content} /> : <p className="text-earth-600">Nothing to preview yet.</p>}
              </div>
            )}
            <p className="k-hint">{HINT}</p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="k-card p-5">
            <span className="k-label">Cover image</span>
            {preview ? (
              <img src={preview} alt="" className="k-cut-strong aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="k-cut-strong grid aspect-[16/10] place-items-center bg-cream-dark text-4xl text-earth-600/40">
                <FaFeatherAlt />
              </div>
            )}
            <label className="k-btn-outline k-btn-sm mt-3 w-full cursor-pointer justify-center">
              {preview ? "Change image" : "Choose image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  setImage(e.target.files?.[0] || null);
                  setRemoveImage(false);
                }}
              />
            </label>
            {preview && (
              <button
                type="button"
                className="k-btn-ghost k-btn-sm mt-2 w-full justify-center"
                onClick={() => {
                  setImage(null);
                  setRemoveImage(true);
                }}
              >
                Remove image
              </button>
            )}
          </div>

          <div className="k-card space-y-3 p-5">
            <p className="text-sm text-earth-600">
              Status:{" "}
              <span className={`k-quad-shape px-2 py-0.5 text-xs font-semibold ${post?.published ? "bg-bead-green text-cream" : "bg-cream-dark text-earth"}`}>
                {post?.published ? "Published" : "Draft"}
              </span>
            </p>
            <button disabled={saving} onClick={() => save(true)} className="k-btn-primary w-full justify-center py-3">
              {saving && <Spinner />} {post?.published ? "Update post" : "Publish"}{emailToo && !alreadyEmailed ? " & email" : ""}
            </button>
            <button disabled={saving} onClick={() => save(false)} className="k-btn-outline w-full justify-center py-3">
              {post?.published ? "Unpublish (save as draft)" : "Save draft"}
            </button>
            {canEmail && (
              <div className="border-t border-earth/10 pt-3">
                {alreadyEmailed ? (
                  <p className="flex items-start gap-2 text-sm text-earth-600">
                    <FaEnvelope className="mt-0.5 shrink-0 text-bead-green" />
                    Emailed to {post.newsletter.delivered} subscribers on {new Date(post.newsletter.created_at).toLocaleDateString("en-KE")}.
                  </p>
                ) : (
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-earth">
                    <input type="checkbox" checked={emailToo} onChange={(e) => setEmailToo(e.target.checked)} className="mt-0.5 h-4 w-4 accent-kamaru" />
                    <span>
                      <span className="font-semibold">Also email it to subscribers</span>
                      <span className="block text-earth-600">
                        {recipients != null ? `${recipients} people` : "Everyone on the list"} get the cover, title, summary and a “Read the full story” button. You'll confirm before it sends.
                      </span>
                    </span>
                  </label>
                )}
                <button
                  type="button"
                  disabled={!post?.id || testing}
                  onClick={async () => {
                    setTesting(true);
                    try {
                      const r = await sendPostNewsletter(post.id, { test: true });
                      toast.success(r.data.message);
                    } catch (err) {
                      toast.error(err.response?.data?.error || "The test couldn't be sent.");
                    } finally {
                      setTesting(false);
                    }
                  }}
                  className="k-btn-ghost k-btn-sm mt-2 w-full justify-center"
                  title={post?.id ? "Email a preview to yourself" : "Save a draft first"}
                >
                  {testing ? <Spinner /> : <FaPaperPlane />} Send a test to me
                </button>
                {!post?.id && <p className="k-hint text-center">Save a draft first to send yourself a test.</p>}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const ManageBlog = () => {
  const [posts, setPosts] = useState(null);
  const { permissions } = useSession();
  const canEmail = permissions.includes(PERMS.NEWSLETTER);
  const recipients = useRecipients(canEmail);
  const [editing, setEditing] = useState(undefined); // undefined = list, null = new, object = edit

  const paged = usePaged(posts || [], 10);

  const load = () =>
    fetchAllBlogPosts()
      .then((r) => setPosts(r.data?.posts || []))
      .catch(() => {
        setPosts([]);
        toast.error("Could not load posts.");
      });

  useEffect(() => {
    load();
  }, []);

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    try {
      await deleteBlogPost(p.id);
      toast.success("Post deleted.");
      setPosts(posts.filter((x) => x.id !== p.id));
    } catch {
      toast.error("Could not delete the post.");
    }
  };

  if (editing !== undefined) {
    return (
      <Editor
        post={editing}
        onDone={(changed) => {
          setEditing(undefined);
          if (changed) load();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Articles about Kikuyu culture, shown at /blog once published."
        actions={
          <button onClick={() => setEditing(null)} className="k-btn-primary">
            <FaPlus /> New post
          </button>
        }
      />
      {posts === null ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<FaFeatherAlt />} title="No posts yet">
          Write the first story about Kikuyu culture.
        </EmptyState>
      ) : (
        <>
        <ul className="space-y-3">
          {paged.slice.map((p) => (
            <li key={p.id} className="k-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="k-quad-shape h-20 w-32 shrink-0 overflow-hidden bg-cream-dark">
                {p.cover_image_url && <img src={cld(p.cover_image_url, 300)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`k-quad-shape px-2 py-0.5 text-xs font-semibold ${p.published ? "bg-bead-green text-cream" : "bg-cream-dark text-earth"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                  {p.published_at && <span className="text-xs text-earth-600">{formatDate(p.published_at)}</span>}
                  {p.newsletter && p.newsletter.status !== "failed" && (
                    <span className="k-quad-shape bg-bead-blue/15 px-2 py-0.5 text-xs font-semibold text-bead-blue">
                      Emailed to {p.newsletter.status === "sending" ? "…" : p.newsletter.delivered} · {formatDate(p.newsletter.created_at)}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-semibold text-earth">{p.title}</p>
                {p.excerpt && <p className="truncate text-sm text-earth-600">{p.excerpt}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                {p.published && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="k-icon-btn" aria-label="View on site">
                    <FaExternalLinkAlt />
                  </a>
                )}
                {canEmail && p.published && !(p.newsletter && p.newsletter.status !== "failed") && (
                  <button onClick={async () => (await emailPost(p, recipients ?? "all")) && load()} className="k-icon-btn" aria-label="Email to subscribers" title="Email to subscribers">
                    <FaPaperPlane />
                  </button>
                )}
                <button onClick={() => setEditing(p)} className="k-icon-btn" aria-label="Edit">
                  <FaEdit />
                </button>
                <button onClick={() => remove(p)} className="k-icon-btn hover:!text-bead-red" aria-label="Delete">
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Pager paged={paged} label="posts" />
        </>
      )}
    </div>
  );
};

export default ManageBlog;
