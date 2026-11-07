import React, { useEffect, useState } from "react";
import Videos from "../components/Videos";
import VideoPlayer from "../components/VideoPlayer";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/motion";
import { fetchVideos } from "../api";
import { extractYouTubeID } from "../utils/youtube";
import { useSeo } from "../utils/seo";

const VideosPage = () => {
  useSeo({ title: "Videos: Kikuyu Folk Songs, Dances & Performances", description: "Watch Kikuyu folk songs, traditional dances, poetry and original music performed in Gĩkũyũ at the Kamaru Challenge in Ndeiya, Kiambu.", path: "/videos" });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos()
      .then((response) => {
        const list = Array.isArray(response.data?.videos) ? response.data.videos : [];
        setVideos(
          list.map((v) => ({ ...v, youtube_id: extractYouTubeID(v.youtube_url) })).filter((v) => v.youtube_id)
        );
      })
      .catch((error) => console.error("Error fetching videos:", error))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = videos;

  return (
    <div className="min-h-screen bg-cream">
      <PageHero
        crumb="Videos"
        eyebrow="On stage"
        title="Hear the voices of Nyīmbo Ciitū"
        intro="Inspiring performances, musical talent and cultural showcases from past Kamaru Challenge – Ndeiya Edition events."
      />

      <div className="container mx-auto px-5 md:px-8 py-14">
        {loading ? (
          <div className="aspect-video max-w-5xl mx-auto animate-pulse rounded-[2rem] bg-cream-dark" />
        ) : featured ? (
          <>
            <Reveal className="max-w-5xl mx-auto">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ochre">Latest</p>
              <VideoPlayer video={featured} />
            </Reveal>
            {rest.length > 0 && (
              <div className="mt-16">
                <h2 className="mb-8 font-display text-3xl font-bold text-earth">More performances</h2>
                <Videos videos={rest} />
              </div>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-earth-600">No videos available yet.</p>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
