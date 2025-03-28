import React from "react";
import Gallery from "../components/Gallery";

const GalleryPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Event Gallery
      </h1>
      <div className="w-full max-w-5xl">
        <Gallery />
      </div>
    </div>
  );
};

export default GalleryPage;

