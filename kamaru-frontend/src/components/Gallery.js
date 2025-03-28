import React, { useEffect, useState } from "react";
import { fetchGalleryImages } from "../api";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => {
        if (response.data && Array.isArray(response.data.images)) {
          setImages(response.data.images);
        } else {
          console.error("Invalid response format:", response.data);
          setImages([]); // Fallback to an empty array
        }
      })
      .catch((error) => {
        console.error("Error fetching gallery images:", error);
        setImages([]); // Fallback to an empty array
      })
      .finally(() => setLoading(false)); // Stop loading when request completes
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-3xl font-bold text-center text-[#8F3B1B] mb-6">Gallery</h2>

      {/* Show spinner while loading */}
      {loading && (
        <div className="flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-[#D57500] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="rounded-lg shadow-md overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                loading="lazy" // Lazy loading for performance
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
              <p className="text-center text-[#8F3B1B] font-semibold p-2">{image.title}</p>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-gray-500">No images available.</p>
      )}
    </div>
  );
};

export default Gallery;
