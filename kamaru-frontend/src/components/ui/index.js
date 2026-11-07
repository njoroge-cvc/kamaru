// Shared, branded UI primitives. Pair with the `.k-*` classes in index.css.
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchBanners } from "../../api";

/** Title row for each admin screen: eyebrow, heading, description and actions. */
export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ochre">{eyebrow}</p>
      )}
      <h2 className="k-h2 mt-1">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-earth-600">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

/** Label + control + optional hint. */
export const Field = ({ label, hint, children, className = "" }) => (
  <label className={`block ${className}`}>
    {label && <span className="k-label">{label}</span>}
    {children}
    {hint && <span className="k-hint block">{hint}</span>}
  </label>
);

/** Animated, accessible modal with a tilted brand header strip. */
export const Modal = ({ open, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const width = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl" }[size];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-3xl bg-cream shadow-2xl`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-earth px-6 py-4 text-cream">
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 hover:bg-kamaru hover:text-earth" aria-label="Close">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const EmptyState = ({ icon, title, children }) => (
  <div className="rounded-3xl border-2 border-dashed border-earth/15 p-10 text-center">
    {icon && <div className="mx-auto mb-3 text-4xl text-kamaru">{icon}</div>}
    <p className="font-display text-xl font-bold text-earth">{title}</p>
    {children && <div className="mt-2 text-earth-600">{children}</div>}
  </div>
);

export const Spinner = ({ className = "h-5 w-5" }) => (
  <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
);

/** Centered card layout for login / register / password screens. */
export const AuthShell = ({ title, subtitle, children, footer, banner }) => (
  <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-14">
    <div className="absolute inset-0 bg-earth swirl-bg" aria-hidden="true" />
    {banner && (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${banner})` }}
        aria-hidden="true"
      />
    )}
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-cream shadow-2xl"
    >
      <div className="p-8">
        <h1 className="font-display text-3xl font-black text-earth">{title}</h1>
        {subtitle && <p className="mt-2 text-earth-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t border-earth/10 pt-5 text-center text-sm text-earth-700">{footer}</div>}
      </div>
    </motion.div>
  </div>
);

export const Alert = ({ tone = "error", children }) => {
  const tones = {
    error: "bg-bead-red/10 text-bead-red",
    success: "bg-bead-green/15 text-bead-green",
    info: "bg-bead-gold/20 text-earth",
  };
  return <p className={`rounded-xl px-4 py-3 text-sm font-medium ${tones[tone]}`}>{children}</p>;
};

/** Password input with show/hide toggle. */
export const PasswordInput = ({ value, onChange, name = "password", placeholder = "••••••••", autoComplete = "current-password", ...rest }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="k-input pr-12"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 k-icon-btn h-8 w-8"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

/** First uploaded banner, used as a faint backdrop on auth screens. */
export const useBanner = () => {
  const [banner, setBanner] = React.useState("");
  React.useEffect(() => {
    fetchBanners()
      .then((res) => {
        const list = res.data?.banners || [];
        if (list.length) setBanner(list[0].image_url);
      })
      .catch(() => {});
  }, []);
  return banner;
};
