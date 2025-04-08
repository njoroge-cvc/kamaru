import React, { useEffect, useState } from "react";
import Videos from "../components/Videos";
import { fetchVideos } from "../api"; // Assuming you have this API function

const VideosPage = () => {
  const [videos, setVideos] = useState([]); // State to store the list of videos

  useEffect(() => {
    // Fetch videos from the API
    fetchVideos()
      .then((response) => {
        if (response.data?.videos) {
          setVideos(response.data.videos); // Set the videos in state
        }
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 py-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-[#8F3B1B] mb-3">
        Event Videos
      </h1>

      {/* Short Description */}
      <p className="text-center text-gray-700 max-w-2xl mb-6">
        Explore inspiring performances, musical talent, and cultural showcases 
        from past <strong>KAMARU CHALLENGE – NDEIYA EDITION</strong> events. Watch and relive 
        the most exciting moments!
      </p>

      {/* Video Content */}
      <div className="w-full max-w-5xl">
        {videos.length > 0 ? (
          <Videos videos={videos} /> // Pass the videos to the Videos component
        ) : (
          <p className="text-center text-gray-500">No videos available.</p>
        )}
      </div>
    </div>
  );
};

export default VideosPage;