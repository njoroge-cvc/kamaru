import React, { useEffect, useState } from "react";
import { fetchVideos } from "../api";

const Videos = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos()
      .then((response) => {
        if (response.data && Array.isArray(response.data.videos)) {
          setVideos(response.data.videos);
        } else {
          console.error("Invalid response format:", response.data);
          setVideos([]); // Fallback to an empty array
        }
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        setVideos([]); // Fallback to an empty array
      });
  }, []);

  return (
    <div>
      <h1>Videos</h1>
      {videos.length > 0 ? (
        <ul>
          {videos.map((video) => (
            <li key={video.id}>
              <h3>{video.title}</h3>
              <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                Watch Video
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No videos available.</p>
      )}
    </div>
  );
};

export default Videos;