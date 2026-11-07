import React from "react";

/**
 * Kikuyu in Slackey.
 * Slackey has no ī / ū (nor a combining macron), so the browser would borrow those letters
 * from the fallback font and the word looks patched. Instead we keep Slackey's own letter
 * (dotless ı for ī) and draw the macron as a bar above it (see .kk-mac in index.css).
 * Use only where the text is set in Slackey (font-display).
 */
const MACRON = {
  "ī": ["ı", "i"],
  "ū": ["u", "u"],
  "Ī": ["I", "I"],
  "Ū": ["U", "U"],
};
const RE = /([īūĪŪ])/;

const letters = (word, key) =>
  word.split(RE).map((part, i) => {
    const m = MACRON[part];
    if (!m) return part;
    return (
      <span key={`${key}-${i}`} className={`kk-mac kk-${m[1]}`} aria-hidden="true" data-char={part}>
        {m[0]}
      </span>
    );
  });

export const kk = (text) => {
  if (typeof text !== "string" || !RE.test(text)) return text;
  // Words with a drawn macron stay unbroken (inline-blocks would otherwise allow mid-word breaks)
  return text.split(/(\s+)/).map((word, w) =>
    RE.test(word) ? (
      <span key={w} className="whitespace-nowrap">
        {letters(word, w)}
      </span>
    ) : (
      word
    )
  );
};

/** Renders text with drawn macrons, keeping the real spelling for screen readers. */
const Kk = ({ children, as: Tag = "span", className = "" }) => {
  if (typeof children !== "string" || !RE.test(children)) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{kk(children)}</span>
    </Tag>
  );
};

export default Kk;
