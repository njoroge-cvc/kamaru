import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa"; // Import appropriate icons
import { ChevronRightIcon } from "@heroicons/react/24/solid";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 overflow-hidden">
      <img
        src={event.image_url}
        alt={event.title}
        className="w-full h-56 object-cover rounded-t-2xl"
      />
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 truncate">{event.title}</h3>

        {/* Date */}
        <p className="text-sm text-gray-500 mt-2 flex items-center">
          <FaCalendarAlt className="mr-2 text-[#333]" />
          {new Date(event.date_time).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* Time */}
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <FaClock className="mr-2 text-[#333]" />
          {new Date(event.date_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Location */}
        <p className="text-sm text-gray-600 mt-2 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-[#333]" />
          {event.location}
        </p>

        {/* Read More Link */}
        <Link
          to={`/events/${event.id}`}
          className="mt-4 inline-flex items-center text-[#D57500] font-semibold hover:text-[#333] transition-colors duration-300"
        >
          <span className="mr-1 transition-transform duration-300 group-hover:translate-x-1">
            Read More
          </span>
          <ChevronRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;