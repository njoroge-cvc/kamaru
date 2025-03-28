import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";
import { FaCalendarAlt, FaUsers, FaImages, FaVideo, FaUser } from "react-icons/fa";

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
    { icon: <FaCalendarAlt />, label: "Total Events", value: stats.total_events, bg: "bg-[#D57500]" },
    { icon: <FaUsers />, label: "Total Participants", value: stats.total_participants, bg: "bg-[#8F3B1B]" },
    { icon: <FaUser />, label: "Total Users", value: stats.total_users, bg: "bg-[#F4A261]" },
    { icon: <FaVideo />, label: "Total Videos", value: stats.total_videos, bg: "bg-[#D57500]" },
    { icon: <FaImages />, label: "Total Gallery Items", value: stats.total_gallery_items, bg: "bg-[#8F3B1B]" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#8F3B1B] text-center mb-4">Platform Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <div key={index} className={`p-4 ${stat.bg} text-white rounded-lg flex items-center`}>
            <div className="text-2xl mr-3">{stat.icon}</div>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
