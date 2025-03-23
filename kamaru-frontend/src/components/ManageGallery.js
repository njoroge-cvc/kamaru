import React, { useEffect, useState } from "react";
import { fetchGalleryImages, uploadImage, deleteImage } from "../api";

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => setImages(response.data.images))
      .catch((error) => console.error("Error fetching gallery images:", error));
  }, []);

  const handleUploadImage = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);

    uploadImage(formData)
      .then(() => {
        alert("Image uploaded successfully!");
        setTitle("");
        setImageFile(null);
        fetchGalleryImages().then((response) => setImages(response.data.images));
      })
      .catch((error) => console.error("Error uploading image:", error));
  };

  const handleDeleteImage = (imageId) => {
    deleteImage(imageId)
      .then(() => {
        alert("Image deleted successfully!");
        setImages(images.filter((image) => image.id !== imageId));
      })
      .catch((error) => console.error("Error deleting image:", error));
  };

  return (
    <div>
      <h2>Manage Gallery</h2>
      <form onSubmit={handleUploadImage}>
        <input
          type="text"
          placeholder="Image Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload Image</button>
      </form>
      <h3>Gallery Images</h3>
      <ul>
        {images.map((image) => (
          <li key={image.id}>
            <img src={image.image_url} alt={image.title} width="100" />
            <p>{image.title}</p>
            <button onClick={() => handleDeleteImage(image.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageGallery;