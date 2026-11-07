// Ask Cloudinary for a right-sized, auto-format/quality rendition of an uploaded image.
// Non-Cloudinary URLs are returned untouched.
//   cld(url, 800)  ->  …/upload/f_auto,q_auto,c_limit,w_800/v123/abc.webp
export const cld = (url, width) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const [head, tail] = url.split("/upload/");
  // Already transformed? leave it alone
  if (/^[a-z]{1,3}_[^/]*[,/]/.test(tail) && !/^v\d+\//.test(tail)) return url;
  const t = ["f_auto", "q_auto", "c_limit", width ? `w_${Math.round(width)}` : null].filter(Boolean).join(",");
  return `${head}/upload/${t}/${tail}`;
};

/** srcSet for responsive images: cldSrcSet(url, [400, 800, 1200]) */
export const cldSrcSet = (url, widths) =>
  url && url.includes("res.cloudinary.com") ? widths.map((w) => `${cld(url, w)} ${w}w`).join(", ") : undefined;
