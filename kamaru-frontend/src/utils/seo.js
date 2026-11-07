import { useEffect } from "react";

// Per-page SEO for the single-page app. Google renders JavaScript and reads these updates;
// link previews (WhatsApp/Facebook) only see the defaults in public/index.html.
export const SITE = "https://kamaruchallenge.africa";
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;
const BRAND = "Kamaru Challenge";

const setMeta = (attr, key, value) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/**
 * useSeo({ title, description, path, image, noindex, jsonLd })
 * - title: page name; " | Kamaru Challenge" is appended unless it already mentions the brand
 * - path: canonical path, e.g. "/gallery"
 * - jsonLd: optional structured-data object for this page (e.g. a blog Article)
 */
export const useSeo = ({ title, description, path = "/", image, noindex = false, jsonLd } = {}) => {
  const json = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    if (!title) return;
    const full = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
    const url = `${SITE}${path}`;
    const img = image || DEFAULT_IMAGE;
    document.title = full;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    setMeta("property", "og:title", full);
    setMeta("name", "twitter:title", full);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:image", img);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setCanonical(url);

    let script;
    if (json) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.page = "1";
      script.textContent = json;
      document.head.appendChild(script);
    }
    return () => script && script.remove();
  }, [title, description, path, image, noindex, json]);
};
