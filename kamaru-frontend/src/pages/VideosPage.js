import React, { useEffect, useState } from "react";
import Videos from "../components/Videos";
import { fetchVideos } from "../api"; // Assuming you have this API function

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [mostPopular, setMostPopular] = useState(null);

  useEffect(() => {
    fetchVideos()
      .then((response) => {
        const videoList = response.data.videos;
        setVideos(videoList);

        // Find most popular video (assuming there is a "views" field)
        if (videoList.length > 0) {
          const mostWatched = videoList.reduce((prev, current) =>
            prev.views > current.views ? prev : current
          );
          setMostPopular(mostWatched);
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
        from past **KAMARU CHALLENGE – NDEIYA EDITION** events. Watch and relive 
        the most exciting moments!
      </p>

      {/* Video Stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <div className="bg-[#F4A261] text-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-lg font-semibold">{videos.length}</p>
          <p className="text-sm">Total Videos</p>
        </div>

        {mostPopular && (
          <div className="bg-[#D57500] text-white px-4 py-2 rounded-lg shadow-md">
            <p className="text-lg font-semibold">{mostPopular.title}</p>
            <p className="text-sm">Most Watched Video</p>
          </div>
        )}
      </div>

      {/* Video Content */}
      <div className="w-full max-w-5xl">
        <Videos />
      </div>
    </div>
  );
};

export default VideosPage;
