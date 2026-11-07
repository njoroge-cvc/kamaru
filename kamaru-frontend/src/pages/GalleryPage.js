import React from "react";
import Gallery from "../components/Gallery";
import PageHero from "../components/PageHero";
import { useSeo } from "../utils/seo";

const GalleryPage = () => {
  useSeo({ title: "Gallery: Nī Rūgendo Rwega, Our Journey", description: "Photos from the Kamaru Challenge in Ndeiya: Kikuyu folk dancers, poets, singers, families and the whole community celebrating Gĩkũyũ culture.", path: "/gallery" });
  return (
  <div className="min-h-screen bg-cream">
    <PageHero
      crumb="Gallery"
      eyebrow="Our journey"
      title="Every moment in a thousand words"
      intro="The unforgettable moments captured at Kamaru Challenge events. Tap any photo to open it, swipe or use your arrow keys to move through."
    />
    <div className="container mx-auto px-5 md:px-8 py-14">
      <Gallery />
    </div>
  </div>
);
};

export default GalleryPage;
