import React from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { SOCIALS } from "../content/story";

const ICONS = { facebook: FaFacebookF, youtube: FaYoutube, instagram: FaInstagram };

/** Row/column of social links. `itemClassName` styles each round button. */
const SocialIcons = ({ className = "flex gap-3", itemClassName = "", vertical = false }) => (
  <div className={className}>
    {SOCIALS.filter((s) => s.href).map(({ href, icon, label }) => {
      const Icon = ICONS[icon];
      return (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          whileHover={vertical ? { x: 4, rotate: -8 } : { y: -4, rotate: -8 }}
          className={`grid place-items-center rounded-full transition-colors ${itemClassName}`}
        >
          <Icon />
        </motion.a>
      );
    })}
  </div>
);

export default SocialIcons;
