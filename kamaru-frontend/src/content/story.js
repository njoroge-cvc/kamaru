// Narrative content for the landing page.
// Source: "Fanning the Flame of Values" concept paper and the 2026 event programme.
// Keep copy here so it can be edited without touching layout code.

export const TAGLINE_KIKUYU = "Nyīmbo ciitū, Mīgambo ya Kīhooto na Mītugo";
export const TAGLINE_ENGLISH = "Songs of the Land, Voices for Values and Justice.";

// The most recent / current edition. Update each season.
export const EDITION = {
  name: "Kamaru Challenge 2026",
  year: 2026,
  date: "2026-08-15T09:00:00", // local (EAT) time
  venue: "Rediscovery Garden, Karera, Nguirubi, Ndeiya",
};

export const CONTACT = {
  phones: ["0722 705773", "0724 721870"],
  email: "info@kamaruchallenge.africa",
  site: "kamaruchallenge.africa",
};

export const QUOTE = {
  text: "Violence is not necessary to destroy a civilization. A civilization dies from indifference towards the unique values that created it.",
  author: "Nicolás Gómez Dávila",
  role: "Colombian philosopher",
};

export const VALUES = [
  { name: "Communality", line: "We rise together, no one thrives alone.", color: "#D7262E" },
  { name: "Reverence", line: "Honouring elders, the land and the sacred.", color: "#D57500" },
  { name: "Justice", line: "Kīhooto, fairness that holds the community.", color: "#2588C9" },
  { name: "Courage", line: "Speaking truth, calling out vice.", color: "#B5441B" },
  { name: "Diligence", line: "Work of the hands that feeds generations.", color: "#3E9B4F" },
  { name: "Introspection", line: "Looking inward before pointing outward.", color: "#E8B21E" },
  { name: "Self-control", line: "Mastery of self is the root of dignity.", color: "#62293B" },
];

export const SPACES = [
  {
    name: "Irīma-inī kwa Wanjiku",
    blurb:
      "A gathering place in Nguirubi for community healing, where authentic knowledge and lived experience are shared openly.",
  },
  {
    name: "Rediscovery Garden",
    blurb:
      "A living classroom for nature conservation, tree planting and reconnecting with the land that raised us.",
  },
];

// "Itemi Riitū, Our Part" (homepage section 3)
export const OUR_PART = [
  "We hold the Kamaru Challenge annually, every August. We invite everyone to prepare and choose their song items: Marebeta (poetry, spoken word), Nyīmbo cīa Gūītungira (original songs) and Nyīmbo cīa Ūndūire cīa Mūgīkūyū (folk songs and dances).",
  "We encourage the pieces to be performed in the Kikuyu language and to either call out the moral vices in society, praise good morals, or both.",
  "Together as a community we then enjoy the day and experience the Challenge, with the hope of nurturing raw talent, promoting communality and the other values through music, and promoting, protecting, preserving and enjoying our tradition.",
  "We do this for free, and award 3 winners in each category.",
];
export const SEASONS_HELD = 3;

// Yearly camps and days held in our spaces (homepage "Other activities" and About page)
export const ACTIVITIES = [
  { month: "March", name: "The Woman Across Generations Camp" },
  { month: "April", name: "The Father and Son Camp" },
  { month: "August", name: "The African Medicine Day Camp" },
  { month: "October", name: "Mazingira Day by KCERA" },
];

// `value` is what entries store (and the backend validates); the labels are free to change.
export const CATEGORIES = [
  {
    kikuyu: "Marebeta",
    value: "Poetry", // stored value; must match the backend list
    name: "Poetry and spoken word",
    desc: "Words that sting and soothe: verse in Kikuyu that names virtue and vice.",
    details: ["Recited poetry, spoken word or performance poetry", "Solo or group entries"],
    icon: "feather",
  },
  {
    kikuyu: "Nyīmbo cīa Gūītungira",
    value: "Original Songs", // stored value; must match the backend list
    name: "Original songs",
    desc: "New music, old values: your own composition, your own voice.",
    details: ["Your own composition, written in Kikuyu", "Solo, duet, group or band"],
    icon: "mic",
  },
  {
    kikuyu: "Nyīmbo cīa Ūndūire cīa Mūgīkūyū",
    value: "Folk Songs and Dances", // stored value; must match the backend list
    name: "Folk songs and dances",
    desc: "The rhythms our grandparents moved to, carried forward by new feet.",
    details: ["Traditional Kikuyu folk songs and dances", "Group performances in traditional style"],
    icon: "drum",
  },
];

// Category names used on past entries
export const CATEGORY_ALIASES = { "Folk Songs": "Folk Songs and Dances" }; // renamed after Season 2
export const DISCONTINUED_CATEGORIES = { Rendition: "Rendition (until Season 2)" };
/** Display label for any stored category, old or current. */
export const categoryLabel = (value, { kikuyu = false } = {}) => {
  const v = CATEGORY_ALIASES[value] || value;
  const c = CATEGORIES.find((x) => x.value === v);
  if (c) return kikuyu ? `${c.kikuyu} (${c.name})` : c.name;
  return DISCONTINUED_CATEGORIES[v] || v;
};

export const PRIZES = [
  { place: "Winner", amount: 50000 },
  { place: "1st Runner-up", amount: 25000 },
  { place: "2nd Runner-up", amount: 15000 },
];

export const OBJECTIVES = [
  "Praise, enhance, and promote moral values.",
  "Identify and call out moral vices in the community.",
  "Encourage joyful and positive living in the community.",
  "Be performed in the Kikuyu language.",
];

// A day at the challenge — from the 2026 programme
export const PROGRAMME = [
  { time: "9:00", title: "Arrival & light entertainment", note: "Kamaru background music, MC warm-up" },
  { time: "10:00", title: "National Anthem (Kikuyu) & opening prayers" },
  { time: "10:05", title: "The history of Kikuyu music", note: "Keynote, Mr. Karoki" },
  { time: "10:30", title: "Contestants take the stage", note: "Four quarters of performances" },
  { time: "11:22", title: "Special mentor presentations", note: "Ricarda · Wangui Kimoney · Sam Wakiambo · FlowFlani" },
  { time: "3:00", title: "Live band & DJ" },
  { time: "4:00", title: "Awards & acknowledgements" },
  { time: "5:00", title: "Celebration, networking & photos" },
];

export const PARTNERSHIPS = [
  {
    title: "Lend your voice",
    text: "Talented individuals who share our values, serve as Masters of Ceremony or performance judges.",
  },
  {
    title: "Amplify the flame",
    text: "Companies, groups and individuals who can help us reach more people in the community.",
  },
  {
    title: "Light a new fire",
    text: "Want to start a similar initiative in another community or county? We'll share our knowledge and experience.",
  },
];

// Social channels — shown in footer, side rail, hero bar and full-screen menu.
// `icon` keys map to react-icons in the components.
export const SOCIALS = [
  { href: "https://www.facebook.com/Kamaruchallenge/", icon: "facebook", label: "Facebook" },
  { href: "https://www.youtube.com/@KAMARUCHALLENGE-2024", icon: "youtube", label: "YouTube" },
  { href: "https://www.instagram.com/kamaru_challenge/", icon: "instagram", label: "Instagram" },
];

// ---------------------------------------------------------------------------
// Support page (/support)
// ---------------------------------------------------------------------------

// Ways to support — any form is welcome as long as it serves the mission and values
export const SUPPORT_WAYS = [
  { key: "voice", title: "Lend your voice", text: "Serve as a Master of Ceremony or a performance judge, or mentor contestants before the big day.", icon: "mic", color: "#D7262E" },
  { key: "sponsor", title: "Sponsor a prize or the stage", text: "Fund prize money for a category, or cover sound, tents, transport and refreshments for performers.", icon: "trophy", color: "#E8B21E" },
  { key: "inkind", title: "Give in kind", text: "Equipment, printing, costumes, seedlings for the Rediscovery Garden, practical gifts go a long way.", icon: "gift", color: "#3E9B4F" },
  { key: "story", title: "Tell the story", text: "Photographers, videographers, journalists and creators: help us carry Ndeiya’s voices further.", icon: "camera", color: "#2588C9" },
  { key: "knowledge", title: "Share knowledge", text: "Elders, historians, healers and teachers, bring authentic knowledge to our camps and retreats.", icon: "book", color: "#B5441B" },
  { key: "edition", title: "Start an edition", text: "Want a Kamaru Challenge in your community or county? We’ll share everything we’ve learned.", icon: "seed", color: "#62293B" },
];

// What every collaboration must respect
export const NON_NEGOTIABLES = [
  { title: "Our mission leads", text: "Support strengthens what we do, fanning the flame of our cultural values. It doesn’t redirect it." },
  { title: "The seven values", text: "Communality, Reverence, Justice, Courage, Diligence, Introspection and Self-control shape every activity." },
  { title: "Kikuyu language on stage", text: "Performances are in Kikuyu. That is the heart of the Challenge." },
  { title: "Free for the community", text: "Our initiatives remain free for participants, seeds sown for generations to come." },
];

export const SUPPORT_STEPS = [
  { title: "Reach out", text: "Tell us who you are and how you’d like to help." },
  { title: "Let’s talk", text: "We’ll call you to understand your idea and share where help is needed most." },
  { title: "Walk together", text: "We agree on the details, and you become part of the Kamaru story." },
];
