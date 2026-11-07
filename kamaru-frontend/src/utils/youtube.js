// Shared YouTube helpers (previously duplicated in HomePage, Videos and ManageVideos)

export const extractYouTubeID = (url = "") => {
  const match = String(url).match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/
  );
  return match ? match[1] : "";
};

export const youTubeThumb = (id, quality = "hqdefault") =>
  id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : "";

export const youTubeEmbed = (id, { autoplay = false } = {}) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
