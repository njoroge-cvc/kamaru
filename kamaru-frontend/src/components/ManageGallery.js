import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { fetchGalleryImages, uploadImage, deleteImage } from "../api";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => setImages(response.data.images))
      .catch((error) => console.error("Error fetching gallery images:", error));
  }, []);

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please select an image!");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);

    try {
      await uploadImage(formData);
      toast.success("Image uploaded successfully!");
      setTitle("");
      setImageFile(null);
      setShowForm(false);

      const response = await fetchGalleryImages();
      setImages(response.data.images);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteImage(imageId)
        .then(() => {
          toast.success("Image deleted successfully!");
          setImages(images.filter((image) => image.id !== imageId));
        })
        .catch((error) => console.error("Error deleting image:", error));
    }
  };

  return (
    <div >
      <h2 className="k-h2 mb-6">Manage Gallery</h2>

      {/* Upload Image Button */}
      <button
        onClick={() => setShowForm(true)}
        className="k-btn-primary mb-6"
      >
        <FaPlus />
        <span>Upload Image</span>
      </button>

      {/* Gallery Display */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-earth/5 transition hover:shadow-lg"
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <p className="px-1 pt-2 text-sm font-semibold text-earth line-clamp-1">{image.title}</p>
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-earth/80 text-cream backdrop-blur hover:bg-bead-red transition"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-earth-600 mt-4">No images available.</p>
      )}

      {/* Upload Image Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-earth">Upload New Image</h3>
              <button onClick={() => setShowForm(false)} className="k-icon-btn">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleUploadImage} className="space-y-3">
              <input
                type="text"
                placeholder="Image Title"
                className="k-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="file"
                className="k-input"
                onChange={(e) => setImageFile(e.target.files[0])}
                required
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  className="k-btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="k-btn-primary"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;
