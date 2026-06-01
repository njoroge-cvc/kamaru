import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEvent } from "../api";

import { useNavigate } from "react-router-dom";

const EventPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent(id)
      .then((response) => {
        setEvent(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8F3B1B] border-opacity-75"></div>
      </div>
    );
  }

  if (!event) return <p className="text-center text-red-500">Event not found.</p>;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.date_time));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/#events" className="hover:underline">
          Events
        </Link>{" "}
        / <span className="text-gray-800">{event.title}</span>
      </nav>

      {/* Event Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
              event.status === "upcoming"
                ? "bg-green-100 text-green-800"
                : event.status === "past"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
          <h1 className="text-3xl font-bold text-[#333]">{event.title}</h1>
          <p className="text-gray-600 text-sm mb-4">{formattedDate}</p>

          <p className="text-lg text-gray-700">
            <strong>Theme:</strong> {event.theme}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Details:</strong> {event.details}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Location:</strong> {event.location}
          </p>
          {event.map_link && (
            <a
              href={event.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D57500] hover:underline"
            >
              View on Map
            </a>
          )}

          {event.cost && (
            <p className="text-lg text-gray-700">
              <strong>Cost:</strong> {event.cost}
            </p>
          )}

          {event.registration_required && event.registration_link && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-[#D57500] text-white py-2 px-4 rounded-md hover:bg-[#333] transition-colors duration-300"
            >
              Register Now
            </a>
          )}  
          
          {/* Back to Events Button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-block bg-[#333] text-white py-2 px-4 rounded-md hover:bg-opacity-80 transition"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
