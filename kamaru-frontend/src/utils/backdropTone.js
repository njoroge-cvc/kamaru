import { useEffect, useState } from "react";

// Work out what the rail is sitting on: "dark" (earth/photos), "accent" (brand orange) or "light" (cream/white).
export const toneAt = (x, y, ignore) => {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (ignore && ignore.contains(el)) continue;
    if (["IMG", "VIDEO", "IFRAME", "CANVAS"].includes(el.tagName)) return "dark";
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = 1] = m.map(Number);
    if (a < 0.5) continue;
    if (r > 170 && g > 70 && g < 170 && b < 90) return "accent";
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.45 ? "dark" : "light";
  }
  return "light";
};


/**
 * Tracks the background tone ("light" | "dark" | "accent") behind an element as the page scrolls.
 * `point(rect)` picks where to sample (defaults to the element's centre).
 */
export const useBackdropTone = (ref, active = true, point) => {
  const [tone, setTone] = useState("light");
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const [x, y] = point ? point(r) : [r.left + r.width / 2, r.top + r.height / 2];
      setTone(toneAt(x, y, el));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const t = setTimeout(update, 400);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, active]);
  return tone;
};
