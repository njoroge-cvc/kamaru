import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaImages } from "react-icons/fa";
import { RiVideoOnAiFill, RiMicAiFill } from "react-icons/ri";
import { MdGroupAdd } from "react-icons/md";
import { fetchStats } from "../api";
import { CountUp } from "./motion";

// Dashboard KPI tiles
const Stats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats()
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  const tiles = stats
    ? [
        { icon: <FaCalendarAlt />, label: "Events", value: stats.total_events, tone: "bg-ochre" },
        { icon: <RiMicAiFill />, label: "Contestants", value: stats.total_participants, tone: "bg-kamaru" },
        { icon: <MdGroupAdd />, label: "Members", value: stats.total_users, tone: "bg-bead-blue" },
        { icon: <RiVideoOnAiFill />, label: "Videos", value: stats.total_videos, tone: "bg-bead-red" },
        { icon: <FaImages />, label: "Gallery items", value: stats.total_gallery_items, tone: "bg-bead-green" },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {stats
        ? tiles.map((t) => (
            <div key={t.label} className="k-card flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-cream ${t.tone}`}>{t.icon}</span>
              <div>
                <p className="font-display text-3xl font-black leading-none text-earth">
                  <CountUp to={t.value || 0} />
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-earth-600">{t.label}</p>
              </div>
            </div>
          ))
        : Array.from({ length: 5 }).map((_, i) => <div key={i} className="k-card h-24 animate-pulse" />)}
    </div>
  );
};

export default Stats;
