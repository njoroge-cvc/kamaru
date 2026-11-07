import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const MOBILE = "(max-width: 767px)";

/**
 * On phones, long text blocks show a preview that fades out with a soft blur and a
 * "Read more" toggle. On larger screens (or when the text is short) it renders as-is.
 */
const ReadMore = ({ children, collapsedHeight = 176, className = "", light = false, align = "center" }) => {
  const ref = useRef(null);
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE).matches);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const on = () => setMobile(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setLong(el.scrollHeight > collapsedHeight + 48);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight]);

  const clamp = mobile && long && !open;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={ref}
          className="overflow-hidden transition-[max-height] duration-500 ease-out"
          style={
            clamp
              ? {
                  maxHeight: collapsedHeight,
                  WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent)",
                  maskImage: "linear-gradient(to bottom, #000 45%, transparent)",
                }
              : { maxHeight: mobile && long ? ref.current?.scrollHeight || "none" : "none" }
          }
        >
          {children}
        </div>
        {clamp && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent,#000)]" />}
      </div>
      {mobile && long && (
        <div className={`mt-4 flex ${align === "center" ? "justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`k-quad inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold ${
              light ? "bg-cream/15 text-cream" : "bg-earth text-cream"
            }`}
          >
            {open ? "Show less" : "Read more"}
            <FaChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadMore;
