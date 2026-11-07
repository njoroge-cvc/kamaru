import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useHomeData from "../components/home/useHomeData";
import Hero from "../components/home/Hero";
import StoryOrigin from "../components/home/StoryOrigin";
import StoryValues from "../components/home/StoryValues";
import StorySpaces from "../components/home/StorySpaces";
import StoryChallenge from "../components/home/StoryChallenge";
import EventsSection from "../components/home/EventsSection";
import GallerySection from "../components/home/GallerySection";
import VideosSection from "../components/home/VideosSection";
import { PartnerSection, ContactSection } from "../components/home/PartnerContact";

// The landing page reads as a story, in chapters:
//   Hero → 1. why (the indifference) → 2. the seven values → 3. the spaces we opened
//   → 4. the Challenge → gatherings → moments (gallery) → voices (videos) → partner → contact
const HomePage = () => {
  const { gallery, upcoming, past, videos, aboutImage, contactImage, stats, season, loading } = useHomeData();


  return (
    <div className="bg-cream">
      <Hero gallery={gallery} upcoming={upcoming} season={season} />
      <StoryOrigin />
      <StoryValues />
      <StorySpaces aboutImage={aboutImage} />
      <StoryChallenge stats={stats} />
      <EventsSection upcoming={upcoming} past={past} />
      {(loading || gallery.length > 0) && <GallerySection gallery={gallery} />}
      {(loading || videos.length > 0) && <VideosSection videos={videos} />}
      <PartnerSection />
      <ContactSection contactImage={contactImage} />

      <FloatingRegisterButton />
    </div>
  );
};

const FloatingRegisterButton = () => (
  <motion.div
    className="fixed bottom-6 left-6 z-50 md:hidden"
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 2, type: "spring" }}
  >
    <Link
      to="/register/participant"
      className="inline-block rounded-full bg-kamaru px-6 py-3 font-semibold text-earth shadow-xl shadow-earth/30 ring-4 ring-cream/40"
    >
      Register Now
    </Link>
  </motion.div>
);

export default HomePage;
