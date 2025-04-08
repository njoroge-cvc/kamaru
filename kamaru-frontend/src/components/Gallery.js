import React, { useEffect, useState, Fragment, useCallback } from "react";
import { fetchGalleryImages } from "../api";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => {
        if (response.data && Array.isArray(response.data.images)) {
          setImages(response.data.images);
        } else {
          console.error("Invalid response format:", response.data);
          setImages([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching gallery images:", error);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openModal = (index) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images]);

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedImageIndex !== null) {
        if (event.key === "ArrowRight") nextImage();
        if (event.key === "ArrowLeft") prevImage();
        if (event.key === "Escape") closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);

  return (
    <div className="bg-white px-4 py-8 h-auto">

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-12 h-12 border-4 border-[#D57500] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Masonry Layout */}
      {!loading && images.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => openModal(index)}
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-auto object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <p className="text-white font-semibold text-lg">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-gray-500">No images available.</p>
      )}

      {/* Modal for Enlarged Image */}
      <Transition appear show={selectedImageIndex !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-lg">
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
                  onClick={closeModal}
                >
                  ✕
                </button>

                {/* Image Display */}
                <img
                  src={images[selectedImageIndex]?.image_url}
                  alt={images[selectedImageIndex]?.title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-t-lg"
                />

                {/* Image Title */}
                <p className="text-center text-[#8F3B1B] font-semibold p-3">
                  {images[selectedImageIndex]?.title}
                </p>

                {/* Navigation Buttons */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2">
                  <button
                    onClick={prevImage}
                    className="p-2 bg-[#8F3B1B] text-white rounded-full shadow-md hover:bg-[#D57500] transition"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                  <button
                    onClick={nextImage}
                    className="p-2 bg-[#8F3B1B] text-white rounded-full shadow-md hover:bg-[#D57500] transition"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Gallery;