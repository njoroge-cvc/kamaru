import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";
import {
  FaCalendarAlt,
  FaUsers,
  FaImages,
  FaVideo,
  FaUser,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../index.css";

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
      icon: <FaCalendarAlt />,
      label: "Total Events",
      value: stats.total_events,
      bg: "bg-[#333]",
    },
    {
      icon: <FaUsers />,
      label: "Total Participants",
      value: stats.total_participants,
      bg: "bg-[#333]",
    },
    {
      icon: <FaUser />,
      label: "Total Users",
      value: stats.total_users,
      bg: "bg-[#333]",
    },
    {
      icon: <FaVideo />,
      label: "Total Videos",
      value: stats.total_videos,
      bg: "bg-[#333]",
    },
    {
      icon: <FaImages />,
      label: "Total Gallery Items",
      value: stats.total_gallery_items,
      bg: "bg-[#333]",
    },
  ];

  return (
    <div className="relative pt-10 bg-gradient-to-br from-[#fff7ec] via-[#ffe8cc] to-[#fff]">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#333] mb-8">
        Our Impact
      </h2>
      <p className="text-center text-[#D57500] mb-4">
        Discover the numbers that tell our story. From events to participants,
        explore the impact we've made together.
      </p>
      <hr className="border-t border-gray-300 mt-6 mb-6 w-1/2 mx-auto" />

      {/* Custom Nav Arrows Positioned Outside */}
      <div className="absolute mt-24 left-32 right-32 z-10 hidden md:flex items-center justify-between pointer-events-none">
        <button
          aria-label="Previous slide"
          className="custom-swiper-button-prev pointer-events-auto bg-[#D57500] hover:bg-[#333] text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          aria-label="Next slide"
          className="custom-swiper-button-next pointer-events-auto bg-[#D57500] hover:bg-[#333] text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Swiper Wrapper */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            navigation={{
              nextEl: ".custom-swiper-button-next",
              prevEl: ".custom-swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            speed={700}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {statsData.map((stat, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`p-6 ${stat.bg} mb-10 mt-5 text-[#D57500] rounded-2xl flex flex-col items-center justify-center h-40 md:h-48 transition-all duration-500 hover:scale-105 hover:shadow-xl`}
                >
                  <div className="text-5xl mb-2 drop-shadow-md">{stat.icon}</div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm">{stat.label}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Stats;
