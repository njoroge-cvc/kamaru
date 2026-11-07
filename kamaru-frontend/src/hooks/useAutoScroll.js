import { useEffect, useState } from "react";

/**
 * Auto-advances a horizontal scroll-snap row, one child at a time, looping.
 * Pauses while the visitor touches/hovers it, resumes a few seconds later;
 * runs only while the row is on screen and never for reduced-motion users.
 * Returns the index of the child currently closest to the centre (for dots).
 */
export default function useAutoScroll(ref, { interval = 3500 } = {}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let pausedUntil = 0;
    const items = () => Array.from(row.children);

    const current = () => {
      const mid = row.scrollLeft + row.clientWidth / 2;
      let best = 0, dist = Infinity;
      items().forEach((el, i) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };
    const go = (i) => {
      const el = items()[i];
      if (el) row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
    };

    const onScroll = () => setActive(current());
    const pause = () => { pausedUntil = Date.now() + 6000; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(row);
    row.addEventListener("scroll", onScroll, { passive: true });
    ["touchstart", "pointerdown", "wheel", "mouseenter"].forEach((ev) => row.addEventListener(ev, pause, { passive: true }));

    const id = reduce
      ? null
      : setInterval(() => {
          if (!visible || Date.now() < pausedUntil || row.scrollWidth <= row.clientWidth + 4) return;
          const n = items().length;
          go((current() + 1) % n);
        }, interval);

    return () => {
      if (id) clearInterval(id);
      io.disconnect();
      row.removeEventListener("scroll", onScroll);
      ["touchstart", "pointerdown", "wheel", "mouseenter"].forEach((ev) => row.removeEventListener(ev, pause));
    };
  }, [ref, interval]);

  return active;
}
