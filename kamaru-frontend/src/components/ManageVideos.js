import React, { useEffect, useState } from "react";
import { fetchVideos, addVideo, deleteVideo } from "../api";
import { FaTrash, FaPlay, FaPlus, FaTimes } from "react-icons/fa";

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ title: "", youtube_url: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchVideos()
      .then((response) => setVideos(response.data.videos))
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  const handleAddVideo = (e) => {
    e.preventDefault();
    addVideo(newVideo)
      .then(() => {
        alert("Video added successfully!");
        setNewVideo({ title: "", youtube_url: "" });
        setShowForm(false);
        fetchVideos().then((response) => setVideos(response.data.videos));
      })
      .catch((error) => console.error("Error adding video:", error));
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      deleteVideo(videoId)
        .then(() => {
          alert("Video deleted successfully!");
          setVideos(videos.filter((video) => video.id !== videoId));
        })
        .catch((error) => console.error("Error deleting video:", error));
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-[#8F3B1B] mb-4">Manage Videos</h2>

      {/* Add Video Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-[#D57500] text-white px-4 py-2 rounded-md flex items-center space-x-2 mb-4 hover:bg-[#8F3B1B] transition"
      >
        <FaPlus />
        <span>Add Video</span>
      </button>

      {/* Video List */}
      <h3 className="text-lg font-semibold text-[#8F3B1B] mb-3">Existing Videos</h3>
      {videos.length === 0 ? (
        <p className="text-gray-600">No videos added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-[#8F3B1B] mb-2">{video.title}</h4>
              <div className="aspect-w-16 aspect-h-9 mb-3">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeID(video.youtube_url)}`}
                  title={video.title}
                  className="w-full h-40 rounded-md"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="flex justify-between items-center">
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 flex items-center space-x-1 hover:text-blue-800"
                >
                  <FaPlay />
                  <span>Watch</span>
                </a>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#8F3B1B]">Add New Video</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-3">
              <input
                type="text"
                placeholder="Video Title"
                value={newVideo.title}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, title: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="YouTube URL"
                value={newVideo.youtube_url}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, youtube_url: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded-md"
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
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to extract YouTube video ID
const extractYouTubeID = (url) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/
  );
  return match ? match[1] : "";
};

export default ManageVideos;