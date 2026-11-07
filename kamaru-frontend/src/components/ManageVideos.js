import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { fetchVideos, addVideo, deleteVideo } from "../api";
import { FaTrash, FaPlay, FaPlus, FaTimes } from "react-icons/fa";
import { extractYouTubeID } from "../utils/youtube";

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
        toast.success("Video added successfully!");
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
          toast.success("Video deleted successfully!");
          setVideos(videos.filter((video) => video.id !== videoId));
        })
        .catch((error) => console.error("Error deleting video:", error));
    }
  };

  return (
    <div >
      <h2 className="k-h2 mb-6">Manage Videos</h2>

      {/* Add Video Button */}
      <button
        onClick={() => setShowForm(true)}
        className="k-btn-primary mb-6"
      >
        <FaPlus />
        <span>Add Video</span>
      </button>

      {/* Video List */}
      <h3 className="font-display text-xl font-bold text-earth mb-3">Existing Videos</h3>
      {videos.length === 0 ? (
        <p className="text-earth-600">No videos added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="k-card p-4">
              <h4 className="font-semibold text-earth mb-2">{video.title}</h4>
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
                  className="k-btn-ghost k-btn-sm"
                >
                  <FaPlay />
                  <span>Watch</span>
                </a>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="k-btn-ghost k-btn-sm hover:!text-bead-red"
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-earth">Add New Video</h3>
              <button onClick={() => setShowForm(false)} className="k-icon-btn">
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
                className="k-input"
                required
              />
              <input
                type="text"
                placeholder="YouTube URL"
                value={newVideo.youtube_url}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, youtube_url: e.target.value })
                }
                className="k-input"
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

export default ManageVideos;