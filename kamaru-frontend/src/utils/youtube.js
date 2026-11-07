// Shared YouTube helpers (used by the homepage, Videos page and the admin Videos manager).

// A YouTube video ID is exactly 11 characters from [A-Za-z0-9_-].
const ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Pulls the video ID out of any common YouTube link, or "" when the link has no video:
 *   youtube.com/watch?v=ID (+ &list=…, &t=…)   m./music./www. variants
 *   youtu.be/ID?si=…   youtube.com/shorts/ID   /live/ID   /embed/ID   /v/ID   youtube-nocookie.com/embed/ID
 * Channel (@name) and playlist-only links return "".
 */
export const extractYouTubeID = (input = "") => {
  const raw = String(input).trim();
  if (ID.test(raw)) return raw; // a bare ID
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return "";
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return ID.test(parts[0] || "") ? parts[0] : "";
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && ID.test(v)) return v;
    if (["shorts", "live", "embed", "v", "e"].includes(parts[0]) && ID.test(parts[1] || "")) return parts[1];
  }
  return "";
};

/** Canonical watch link for an ID (what we store). */
export const youTubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

export const youTubeThumb = (id, quality = "hqdefault") =>
  id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : "";

export const youTubeEmbed = (id, { autoplay = false } = {}) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
