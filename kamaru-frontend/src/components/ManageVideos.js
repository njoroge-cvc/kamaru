import React, { useEffect, useState } from "react";
import { fetchVideos, addVideo, deleteVideo } from "../api";

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ title: "", youtube_url: "" });

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
        fetchVideos().then((response) => setVideos(response.data.videos));
      })
      .catch((error) => console.error("Error adding video:", error));
  };

  const handleDeleteVideo = (videoId) => {
    deleteVideo(videoId)
      .then(() => {
        alert("Video deleted successfully!");
        setVideos(videos.filter((video) => video.id !== videoId));
      })
      .catch((error) => console.error("Error deleting video:", error));
  };

  return (
    <div>
      <h2>Manage Videos</h2>
      <form onSubmit={handleAddVideo}>
        <input
          type="text"
          placeholder="Video Title"
          value={newVideo.title}
          onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="YouTube URL"
          value={newVideo.youtube_url}
          onChange={(e) => setNewVideo({ ...newVideo, youtube_url: e.target.value })}
          required
        />
        <button type="submit">Add Video</button>
      </form>
      <h3>Existing Videos</h3>
      <ul>
        {videos.map((video) => (
          <li key={video.id}>
            <strong>{video.title}</strong>
            <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
              Watch
            </a>
            <button onClick={() => handleDeleteVideo(video.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageVideos;