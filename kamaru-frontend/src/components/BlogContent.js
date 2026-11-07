import React from "react";
import { kk } from "./Kikuyu";

/**
 * Renders blog text with light formatting, building React elements (never raw HTML):
 *   ## Heading   ### Subheading   - list item   > quote
 *   **bold**   *italic*   [link text](https://…)
 * Blank lines separate paragraphs.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

export const renderInline = (text, display = false) =>
  text.split(INLINE).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="font-semibold text-ochre underline underline-offset-4 hover:text-earth">
          {link[1]}
        </a>
      );
    return display ? <React.Fragment key={i}>{kk(part)}</React.Fragment> : part;
  });

const toBlocks = (text = "") => {
  const blocks = [];
  let para = [];
  let list = null;
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    if (list) blocks.push({ type: "ul", items: list });
    para = [];
    list = null;
  };
  text.replace(/\r\n/g, "\n").split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return flush();
    if (line.startsWith("### ")) { flush(); return blocks.push({ type: "h3", text: line.slice(4) }); }
    if (line.startsWith("## ")) { flush(); return blocks.push({ type: "h2", text: line.slice(3) }); }
    if (line.startsWith("> ")) { flush(); return blocks.push({ type: "quote", text: line.slice(2) }); }
    if (/^[-*] /.test(line)) {
      if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; }
      (list = list || []).push(line.slice(2));
      return;
    }
    if (list) flush();
    para.push(line);
  });
  flush();
  return blocks;
};

const BlogContent = ({ text, className = "" }) => (
  <div className={`space-y-5 text-lg leading-relaxed text-earth-700 ${className}`}>
    {toBlocks(text).map((b, i) => {
      if (b.type === "h2") return <h2 key={i} className="pt-4 font-display text-3xl text-earth">{renderInline(b.text, true)}</h2>;
      if (b.type === "h3") return <h3 key={i} className="pt-2 font-display text-2xl text-earth">{renderInline(b.text, true)}</h3>;
      if (b.type === "quote")
        return (
          <blockquote key={i} className="k-cut-strong bg-kamaru/15 px-6 py-5 font-sans text-xl font-semibold italic text-earth">
            {renderInline(b.text)}
          </blockquote>
        );
      if (b.type === "ul")
        return (
          <ul key={i} className="space-y-2">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-2.5 h-2.5 w-2.5 shrink-0 k-quad-shape bg-kamaru" />
                <span>{renderInline(it)}</span>
              </li>
            ))}
          </ul>
        );
      return <p key={i}>{renderInline(b.text)}</p>;
    })}
  </div>
);

export default BlogContent;
