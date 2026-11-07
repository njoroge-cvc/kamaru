// Compiled by react-scripts' bundled Tailwind v3 (arbitrary values, `content`, JIT all available).
//
// Palette: drawn from the Kamaru Challenge brand sheet and traditional Kikuyu
// materials — red ochre, earth/hide browns, white chalk, and the
// red / white / blue / green / yellow beadwork colours.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        kamaru: {
          DEFAULT: "#D57500", // brand orange
          light: "#F4A261",
          dark: "#A85A00",
        },
        ochre: {
          DEFAULT: "#B5441B", // red ochre
          light: "#D9673A",
          dark: "#8F3B1B",
        },
        earth: {
          DEFAULT: "#2B1A10", // hide / soil
          800: "#3B2416",
          700: "#4E3221",
          600: "#6B4A33",
        },
        clay: "#A07A45",
        cream: {
          DEFAULT: "#FBF3E8",
          dark: "#F3E2CC",
        },
        bead: {
          red: "#D7262E",
          gold: "#E8B21E",
          green: "#3E9B4F",
          blue: "#2588C9",
          white: "#FFFDF8",
        },
        maroon: "#62293B",
        forest: "#3F6A5E",
        night: "#262C45",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"], // Fraunces mis-positions ī/ū macrons; Playfair renders Kikuyu correctly
        sans: ['"Outfit"', "Helvetica", "Arial", "sans-serif"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        "marquee-reverse": "marquee-reverse 45s linear infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};
