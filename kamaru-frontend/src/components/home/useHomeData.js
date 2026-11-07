import { useEffect, useState } from "react";
import { fetchGalleryImages, fetchEvents, fetchVideos, fetchSystemImage, fetchStats, fetchActiveSeason } from "../../api";
import { extractYouTubeID } from "../../utils/youtube";

const INITIAL = {
  gallery: [],
  upcoming: [],
  past: [],
  videos: [],
  aboutImage: "",
  contactImage: "",
  stats: null,
  season: null,
};

// Loads everything the landing page needs in parallel. Each request updates the page
// as soon as it lands and fails independently, so one slow or broken endpoint
// (e.g. a cold Render instance) never holds back or blanks the rest.
const useHomeData = () => {
  const [data, setData] = useState(INITIAL);
  const [pending, setPending] = useState(8);

  useEffect(() => {
    let alive = true;
    const load = (promise, pick) =>
      promise
        .then((r) => {
          if (alive) setData((d) => ({ ...d, ...pick(r.data) }));
        })
        .catch((err) => console.error("Home data request failed:", err?.config?.url, err?.message))
        .finally(() => alive && setPending((n) => n - 1));

    load(fetchGalleryImages(), (d) => ({ gallery: Array.isArray(d?.images) ? d.images : [] }));
    load(fetchEvents(), (d) => ({ upcoming: Array.isArray(d) ? d : [] }));
    load(fetchEvents("past"), (d) => ({
      // Filter client-side too, so an older backend that ignores ?scope still behaves
      past: (Array.isArray(d) ? d : []).filter((e) => new Date(e.date_time) < new Date()),
    }));
    load(fetchVideos(), (d) => ({
      videos: (Array.isArray(d?.videos) ? d.videos : [])
        .map((v) => ({ ...v, youtube_id: extractYouTubeID(v.youtube_url) }))
        .filter((v) => v.youtube_id),
    }));
    load(fetchSystemImage("about"), (d) => ({ aboutImage: d?.image?.image_url || "" }));
    load(fetchSystemImage("contact"), (d) => ({ contactImage: d?.image?.image_url || "" }));
    load(fetchStats(), (d) => ({ stats: d && !d.error ? d : null }));
    load(fetchActiveSeason(), (d) => ({ season: d && d.id ? d : null }));

    return () => {
      alive = false;
    };
  }, []);

  return { ...data, loading: pending > 0 };
};

export default useHomeData;
