import React, { useEffect, useState } from "react";
import { fetchGalleryImages } from "../api";

const Gallery = () => {
  const [images, setImages] = useState([]);

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
      });
  }, []);

  return (
    <div>
      <h1>Gallery</h1>
      {images.length > 0 ? (
        <div>
          {images.map((image) => (
            <div key={image.id}>
              <img src={image.image_url} alt={image.title} />
              <p>{image.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No images available.</p>
      )}
    </div>
  );
};

export default Gallery;