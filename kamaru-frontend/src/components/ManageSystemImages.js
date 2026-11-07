import { toast } from "react-toastify";
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
            [section]: response.data.image || null,
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
    if (!selectedImage || !section) return toast.error("Please select an image and section!");

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
            [section]: response.data.image || null,
          }))
        );
      }
      setSelectedImage(null);
      setSection("");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    }
  };

  const handleDeleteSystemImage = async (section) => {
    if (!window.confirm(`Delete the ${section} image?`)) return;
    const image = images[section];
    if (!image?.id) return;

    try {
      // The API deletes by numeric image id, not by section name
      await deleteSystemImage(image.id);
      setImages((prev) => ({ ...prev, [section]: null }));
    } catch (error) {
      toast.error(`Failed to delete ${section} image.`);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await deleteBanner(bannerId);
      fetchBanners().then((response) => setBanners(response.data.banners));
    } catch (error) {
      toast.error("Failed to delete banner.");
    }
  };

  return (
    <div >
      <h2 className="k-h2 mb-6">Manage System Images</h2>

      {/* Upload Form */}
      <div className="k-card mb-6">
        <form onSubmit={handleUpload} className="grid gap-4">
          <div>
            <label className="k-label">Select Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="k-input"
            >
              <option value="">Choose Section</option>
              <option value="logo">Logo</option>
              <option value="contact">Contact</option>
              <option value="about">About</option>
              <option value="banners">Banners</option>
            </select>
          </div>
          <div>
            <label className="k-label">Upload Image:</label>
            <input
              type="file"
              onChange={(e) => setSelectedImage(e.target.files[0])}
              className="k-input"
            />
          </div>
          <button
            type="submit"
            className="k-btn-primary w-full"
          >
            Upload Image
          </button>
        </form>
      </div>

      {/* System Images */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(images).map(([section, image]) => {
          const url = image?.image_url;
          return (
          <div key={section} className="k-card p-4 relative">
            <h3 className="font-display text-lg font-bold text-earth capitalize">{section}</h3>
            {url ? (
              <div className="relative">
                <img src={url} alt={section} className="w-full h-auto rounded-md shadow-sm mt-2" />
                <button
                  onClick={() => handleDeleteSystemImage(section)}
                  className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-earth/80 text-cream backdrop-blur hover:bg-bead-red transition"
                >
                  <FaTrash />
                </button>
              </div>
            ) : (
              <p className="text-earth-600 mt-2">No image uploaded</p>
            )}
          </div>
          );
        })}
      </div>

      {/* Banners */}
      <h3 className="font-display text-2xl font-bold text-earth mt-10 mb-4">Banners</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-earth/5">
            <img src={banner.image_url} alt="Banner" className="w-full h-auto rounded-t-md" />
            <button
              onClick={() => handleDeleteBanner(banner.id)}
              className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-earth/80 text-cream backdrop-blur hover:bg-bead-red transition"
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
