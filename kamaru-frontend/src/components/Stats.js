import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";
import {FaCalendarAlt} from "react-icons/fa";
import { 
  RiVideoOnAiFill,
  RiMicAiFill
 } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { MdGroupAdd } from "react-icons/md";


const Stats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats()
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  if (!stats) {
    return (
      <div className="text-center text-gray-600 py-6">
        <p className="animate-pulse">Fetching stats...</p>
      </div>
    );
  }

  const statsData = [
    {
      icon: <FaCalendarAlt className="text-xl" />,
      label: "Coming Up Events",
      value: stats.total_events,
    },
    {
      icon: <RiMicAiFill className="text-xl" />,
      label: "Contestants",
      value: stats.total_participants,
    },
    {
      icon: <MdGroupAdd className="text-xl" />,
      label: "Members",
      value: stats.total_users,
    },
    {
      icon: <RiVideoOnAiFill className="text-xl" />,
      label: "Talent Recap Videos",
      value: stats.total_videos,
    },
    {
      icon: <FaImages className="text-xl" />,
      label: "Gallery Items since 2024",
      value: stats.total_gallery_items,
    },
  ];

  return (
    <section className="bg-gradient-to-br from-[#fff7ec] via-[#ffe8cc] to-[#fff] py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#333] mb-4">
          Discover the numbers that tell our story.
        </h2>
        <p className="text-[#D57500] mb-8">
          From events to participants, explore the impact we've made together.
        </p>
        <hr className="border-t border-[#333] w-64 border-2 mx-auto mb-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#333] rounded-lg p-4 shadow hover:shadow-lg transition duration-300 flex items-center justify-between"
          >
            <div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-300">{stat.label}</p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#D57500] shadow-md">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
