import React from "react";
import { Link } from "react-router-dom";
import Gallery from "../components/Gallery";

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto mb-6">
        <nav className="text-sm text-gray-600">
          <Link to="/" className="text-[#D57500] hover:underline hover:text-[#333] transition">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Gallery</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="w-full max-w-7xl mx-auto text-center mb-6">
        <h1 className="text-4xl font-bold text-[#8F3B1B]">Every Moment in a Thousand Words...</h1>
        <p className="text-gray-700 mt-2 text-lg">
          Explore the unforgettable moments captured during our Kamaru Challenge events. 
          Click on an image to view it in full size.
        </p>
      </div>

      {/* Horizontal Line (Divider) */}
      <hr className="w-full max-w-4xl border-t-2 border-[#D57500] mx-auto mt-8 mb-8" />

      {/* Gallery Component */}
      <div className="w-full max-w-7xl mx-auto">
        <Gallery />
      </div>
    </div>
  );
};

export default GalleryPage;
