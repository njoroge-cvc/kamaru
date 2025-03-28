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
    if (!imageFile) return alert("Please select an image!");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);

    try {
      await uploadImage(formData);
      alert("Image uploaded successfully!");
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
          alert("Image deleted successfully!");
          setImages(images.filter((image) => image.id !== imageId));
        })
        .catch((error) => console.error("Error deleting image:", error));
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-[#8F3B1B] mb-4">Manage Gallery</h2>

      {/* Upload Image Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-[#D57500] text-white px-4 py-2 rounded-md flex items-center space-x-2 mb-4 hover:bg-[#8F3B1B] transition"
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
              className="relative bg-gray-100 p-2 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <p className="text-center text-[#8F3B1B] mt-2">{image.title}</p>
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-2 right-2 bg-[#F4A261] text-white px-2 py-1 text-xs rounded-lg hover:bg-[#D57500] transition"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-4">No images available.</p>
      )}

      {/* Upload Image Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#8F3B1B]">Upload New Image</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleUploadImage} className="space-y-3">
              <input
                type="text"
                placeholder="Image Title"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="file"
                className="w-full border border-gray-300 p-2 rounded-md bg-white"
                onChange={(e) => setImageFile(e.target.files[0])}
                required
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D57500] text-white px-4 py-2 rounded-md"
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
