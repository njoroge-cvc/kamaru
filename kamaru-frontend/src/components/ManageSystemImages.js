import React, { useState, useEffect } from "react";
import {
  fetchSystemImage,
  uploadSystemImage,
  uploadBanner,
  fetchBanners,
  deleteSystemImage,
  deleteBanner,
} from "../api";
import { FaTrash } from "react-icons/fa"; // Import trash icon

const ManageSystemImages = () => {
  const [images, setImages] = useState({});
  const [banners, setBanners] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [section, setSection] = useState("");

  useEffect(() => {
    const sections = ["logo", "contact", "about"];
    sections.forEach((section) => {
      fetchSystemImage(section)
        .then((response) =>
          setImages((prev) => ({
            ...prev,
            [section]: response.data.image?.image_url || null,
          }))
        )
        .catch(() =>
          setImages((prev) => ({
            ...prev,
            [section]: null,
          }))
        );
    });

    fetchBanners()
      .then((response) => setBanners(response.data.banners))
      .catch((error) => console.error("Error fetching banners:", error));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedImage || !section) return alert("Please select an image and section!");

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("section", section);

    try {
      if (section === "banners") {
        await uploadBanner(formData);
        fetchBanners().then((response) => setBanners(response.data.banners));
      } else {
        await uploadSystemImage(formData);
        fetchSystemImage(section).then((response) =>
          setImages((prev) => ({
            ...prev,
            [section]: response.data.image?.image_url || null,
          }))
        );
      }
      setSelectedImage(null);
      setSection("");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  const handleDeleteSystemImage = async (section) => {
    if (!window.confirm(`Delete the ${section} image?`)) return;

    try {
      await deleteSystemImage(section);
      fetchSystemImage(section).then((response) =>
        setImages((prev) => ({
          ...prev,
          [section]: response.data.image?.image_url || null,
        }))
      );
    } catch (error) {
      alert(`Failed to delete ${section} image.`);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await deleteBanner(bannerId);
      fetchBanners().then((response) => setBanners(response.data.banners));
    } catch (error) {
      alert("Failed to delete banner.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage System Images</h2>

      {/* Upload Form */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-6">
        <form onSubmit={handleUpload} className="grid gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Select Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md focus:ring focus:ring-[#D57500]"
            >
              <option value="">Choose Section</option>
              <option value="logo">Logo</option>
              <option value="contact">Contact</option>
              <option value="about">About</option>
              <option value="banners">Banners</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Upload Image:</label>
            <input
              type="file"
              onChange={(e) => setSelectedImage(e.target.files[0])}
              className="border border-gray-300 p-2 w-full rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-[#D57500] text-white py-2 rounded-md w-full hover:bg-[#b85e00] transition duration-200"
          >
            Upload Image
          </button>
        </form>
      </div>

      {/* System Images */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(images).map(([section, url]) => (
          <div key={section} className="bg-white shadow-md p-4 rounded-lg relative">
            <h3 className="text-lg font-semibold capitalize">{section}</h3>
            {url ? (
              <div className="relative">
                <img src={url} alt={section} className="w-full h-auto rounded-md shadow-sm mt-2" />
                <button
                  onClick={() => handleDeleteSystemImage(section)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            ) : (
              <p className="text-gray-500 mt-2">No image uploaded</p>
            )}
          </div>
        ))}
      </div>

      {/* Banners */}
      <h3 className="text-xl font-bold mt-8 mb-4">Banners</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white shadow-md rounded-lg relative">
            <img src={banner.image_url} alt="Banner" className="w-full h-auto rounded-t-md" />
            <button
              onClick={() => handleDeleteBanner(banner.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageSystemImages;
