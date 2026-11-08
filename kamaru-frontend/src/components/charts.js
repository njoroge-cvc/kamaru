import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Validated against #FFFFFF (lightness band, chroma, CVD and contrast all pass).
export const SERIES = { primary: "#D57500", secondary: "#2588C9" };
const INK = { muted: "#6B4A33", grid: "rgba(43,26,16,0.08)" };

/** Measures a container so SVGs draw in real pixels (text stays the same size at any width). */
const useWidth = (fallback = 600) => {
  const ref = useRef(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
};

const fmtMonth = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-KE", { month: "short" });
};
const fmtMonthLong = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
};

/** Card wrapper for one chart: title names the series, so single-series charts need no legend. */
export const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <section className={`k-card p-6 ${className}`}>
    <h3 className="font-display text-lg text-earth">{title}</h3>
    {subtitle && <p className="mt-0.5 text-sm text-earth-600">{subtitle}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

/** Screen-reader table for any chart. */
// Wrapped in a div: tables ignore the 1px sr-only box and would still take up height
const SrTable = ({ caption, rows }) => (
  <div className="sr-only">
  <table>
    <caption>{caption}</caption>
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k}>
          <th scope="row">{k}</th>
          <td>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
);

const Tooltip = ({ x, y, title, value }) => (
  <div
    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full k-quad-shape bg-earth px-3 py-2 text-xs text-cream shadow-lg"
    style={{ left: x, top: y - 10 }}
  >
    <p className="font-semibold">{title}</p>
    <p className="text-cream/80">{value}</p>
  </div>
);

/** Horizontal bars with labels and values: for comparing a handful of named groups. */
export const BarList = ({ data, label = "label", value = "count", color = SERIES.primary, caption, unit = "" }) => {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d[value]));
  if (!data.length) return <p className="text-sm text-earth-600">No data yet.</p>;
  return (
    <>
      <ul className="space-y-3" aria-hidden="true">
        {data.map((d, i) => (
          <li
            key={d[label]}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`transition-opacity ${hover !== null && hover !== i ? "opacity-50" : ""}`}
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-earth">{d[label]}</span>
              <span className="font-semibold tabular-nums text-earth">
                {d[value].toLocaleString()}
                {unit}
              </span>
            </div>
            <div className="mt-1.5 h-3 w-full bg-cream-dark/60">
              <motion.div
                className="h-full"
                style={{ backgroundColor: color, borderRadius: "0 4px 4px 0" }}
                initial={{ width: 0 }}
                animate={{ width: `${(d[value] / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
      <SrTable caption={caption} rows={data.map((d) => [d[label], d[value]])} />
    </>
  );
};

/** Vertical columns: for a short ordered series (e.g. entries per season). */
export const ColumnChart = ({ data, label = "label", value = "count", color = SERIES.primary, caption, mark }) => {
  const [hover, setHover] = useState(null);
  const [ref, W] = useWidth(520);
  const H = 220, padB = 28, padT = 22;
  const max = Math.max(1, ...data.map((d) => d[value]));
  const n = Math.max(1, data.length);
  const slot = W / n;
  const bw = Math.min(64, slot * 0.6);
  if (!data.length) return <p className="text-sm text-earth-600">No data yet.</p>;
  return (
    <div ref={ref} className="relative">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block overflow-visible" role="img" aria-label={caption}>
        <line x1="0" x2={W} y1={H - padB} y2={H - padB} stroke={INK.grid} strokeWidth="1" />
        {data.map((d, i) => {
          const h = ((H - padB - padT) * d[value]) / max;
          const x = i * slot + (slot - bw) / 2;
          const y = H - padB - h;
          const r = Math.min(4, h / 2);
          return (
            <g key={d[label]} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* generous hit target */}
              <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" />
              <motion.path
                d={`M${x},${H - padB} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${H - padB} Z`}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.5}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ transformOrigin: `${x}px ${H - padB}px` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
              <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2B1A10">
                {d[value]}
              </text>
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={INK.muted}>
                {d[label]}
                {mark && mark(d) ? " ●" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <Tooltip
          x={hover * slot + slot / 2}
          y={H - padB - ((H - padB - padT) * data[hover][value]) / max - 18}
          title={data[hover][label]}
          value={`${data[hover][value].toLocaleString()} entries`}
        />
      )}
      <SrTable caption={caption} rows={data.map((d) => [d[label], d[value]])} />
    </div>
  );
};

/** Area line over months with a crosshair tooltip. `data`: [{ month: "YYYY-MM", count }]. */
export const MonthlyLine = ({ data, color = SERIES.primary, caption, unit = "" }) => {
  const [hover, setHover] = useState(null);
  const [ref, W] = useWidth(600);
  const H = Math.round(Math.min(260, Math.max(170, W * 0.3))), padL = 32, padR = 10, padT = 16, padB = 28;
  const max = Math.max(1, ...data.map((d) => d.count));
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const x = (i) => padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1);
  const y = (v) => H - padB - ((H - padB - padT) * v) / max;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.count)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - padB} L${x(0)},${H - padB} Z`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  // Thin out month labels on narrow charts
  const every = W < 420 ? 3 : W < 700 ? 2 : 1;

  return (
    <div ref={ref} className="relative">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="block overflow-visible"
        role="img"
        aria-label={caption}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={INK.grid} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={INK.muted}>
              {t}
            </text>
          </g>
        ))}
        <motion.path d={area} fill={color} initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 0.8 }} />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {data.map((d, i) =>
          (data.length - 1 - i) % every ? null : (
            <text key={d.month} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={INK.muted}>
              {fmtMonth(d.month)}
            </text>
          )
        )}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="#2B1A10" strokeOpacity="0.3" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].count)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
      </svg>
      {hover !== null && (
        <Tooltip
          x={Math.min(W - 60, Math.max(60, x(hover)))}
          y={y(data[hover].count)}
          title={fmtMonthLong(data[hover].month)}
          value={`${data[hover].count.toLocaleString()}${unit}`}
        />
      )}
      <SrTable caption={caption} rows={data.map((d) => [fmtMonthLong(d.month), d.count])} />
    </div>
  );
};

/** Two-part meter (e.g. verified vs pending subscribers) with a legend. */
export const SplitMeter = ({ parts, caption }) => {
  const total = Math.max(1, parts.reduce((t, p) => t + p.value, 0));
  return (
    <div>
      <div className="flex h-4 w-full gap-[2px]" role="img" aria-label={caption}>
        {parts.map((p, i) => (
          <motion.div
            key={p.label}
            className="h-full"
            style={{
              backgroundColor: p.color,
              borderRadius: i === 0 ? "4px 0 0 4px" : i === parts.length - 1 ? "0 4px 4px 0" : 0,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(p.value / total) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-earth">
            <span className="h-3 w-3 k-quad-shape" style={{ backgroundColor: p.color }} />
            {p.label}
            <span className="font-semibold tabular-nums">{p.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
